import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { streamEnhancedWorkflow } from '@/lib/agent';
import type { MultimodalInput } from '@/lib/agent/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GenerateRequestBody {
  prompt: string;
  title?: string;
  userInputs?: MultimodalInput[];
}

/**
 * GET handler for SSE connection to existing session
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get sessionId from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'sessionId is required' } },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to user
    const contentSession = await prisma.contentSession.findUnique({
      where: { id: sessionId },
    });

    if (!contentSession) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    if (contentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Validate prompt exists
    if (!contentSession.prompt) {
      return NextResponse.json(
        { error: { code: 'INVALID_STATE', message: 'Session has no prompt' } },
        { status: 400 }
      );
    }

    // Get user inputs from metadata
    const userInputs = (contentSession.metadata as any)?.userInputs || [];

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection confirmation
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId: contentSession.id })}\n\n`)
          );

          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', status: 'analyzing' })}\n\n`)
          );

          let stateCount = 0;
          
          // Stream enhanced workflow execution
          for await (const state of streamEnhancedWorkflow(
            contentSession.id,
            contentSession.prompt!,
            userInputs
          )) {
            stateCount++;
            console.log(`[SSE] Streaming state ${stateCount}:`, {
              status: state.status,
              hasContent: !!state.generatedContent,
              contentLength: state.generatedContent?.length || 0,
              chartCount: state.charts?.length || 0,
              nodeHistory: state.metadata?.nodeHistory || [],
            });
            
            // Send state update as SSE
            const data = JSON.stringify({
              type: 'state',
              sessionId: contentSession.id,
              status: state.status || 'processing',
              generatedContent: state.generatedContent || '',
              charts: state.charts || [],
              error: state.error,
              metadata: state.metadata || {},
            });
            
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          console.log(`[SSE] Workflow completed. Total states: ${stateCount}`);

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', sessionId: contentSession.id })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('[SSE] Workflow streaming error:', error);
          
          // Update session status to FAILED
          await prisma.contentSession.update({
            where: { id: contentSession.id },
            data: { status: 'FAILED' },
          }).catch(err => console.error('[SSE] Failed to update session status:', err));

          // Send error event
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Generate GET endpoint error:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating new session and streaming
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GenerateRequestBody = await req.json();
    const { prompt, title, userInputs = [] } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Prompt is required and must be a non-empty string' } },
        { status: 400 }
      );
    }

    // Create Content Session in database
    const contentSession = await prisma.contentSession.create({
      data: {
        userId: session.user.id,
        title: title || `Content: ${prompt.substring(0, 50)}...`,
        prompt,
        status: 'GENERATING',
        metadata: {
          userInputs: userInputs as any,
          startTime: Date.now(),
        } as any,
      },
    });

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection confirmation
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId: contentSession.id })}\n\n`)
          );

          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', status: 'analyzing' })}\n\n`)
          );

          let stateCount = 0;
          
          // Stream enhanced workflow execution
          for await (const state of streamEnhancedWorkflow(
            contentSession.id,
            prompt,
            userInputs
          )) {
            stateCount++;
            console.log(`[SSE POST] Streaming state ${stateCount}:`, {
              status: state.status,
              hasContent: !!state.generatedContent,
              contentLength: state.generatedContent?.length || 0,
              chartCount: state.charts?.length || 0,
              nodeHistory: state.metadata?.nodeHistory || [],
            });
            
            // Send state update as SSE
            const data = JSON.stringify({
              type: 'state',
              sessionId: contentSession.id,
              status: state.status || 'processing',
              generatedContent: state.generatedContent || '',
              charts: state.charts || [],
              error: state.error,
              metadata: state.metadata || {},
            });
            
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          console.log(`[SSE POST] Workflow completed. Total states: ${stateCount}`);

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', sessionId: contentSession.id })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('[SSE POST] Workflow streaming error:', error);
          
          // Update session status to FAILED
          await prisma.contentSession.update({
            where: { id: contentSession.id },
            data: { status: 'FAILED' },
          }).catch(err => console.error('[SSE POST] Failed to update session status:', err));

          // Send error event
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Generate endpoint error:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
