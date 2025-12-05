import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import type { CreateSessionRequest } from '@/lib/api/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/content/sessions
 * Fetch all content sessions for the authenticated user with pagination
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid pagination parameters' } },
        { status: 400 }
      );
    }

    const skip = (page - 1) * pageSize;

    // Fetch content sessions with pagination
    const [contentSessions, total] = await Promise.all([
      prisma.contentSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.contentSession.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      data: contentSessions,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Get content sessions error:', error);
    
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
 * POST /api/content/sessions
 * Create a new content session
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
    const body: CreateSessionRequest = await req.json();
    const { title, prompt, metadata } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Title is required and must be a non-empty string' } },
        { status: 400 }
      );
    }

    // if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    //   return NextResponse.json(
    //     { error: { code: 'INVALID_INPUT', message: 'Prompt is required and must be a non-empty string' } },
    //     { status: 400 }
    //   );
    // }

    // Create content session
    const contentSession = await prisma.contentSession.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        prompt: prompt.trim(),
        status: 'PENDING',
        metadata: metadata as any,
      },
    });

    return NextResponse.json(contentSession, { status: 201 });
  } catch (error) {
    console.error('Create content session error:', error);
    
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
