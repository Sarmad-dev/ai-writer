import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for graph updates
const GraphUpdateSchema = z.object({
  type: z.enum(['BAR', 'LINE', 'PIE', 'AREA', 'SCATTER']),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  config: z.object({
    title: z.string().optional(),
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    colors: z.array(z.string()).optional(),
    legend: z.boolean().optional(),
    dataKey: z.string().optional(),
    xKey: z.string().optional(),
    yKey: z.string().optional(),
  }).optional(),
  position: z.number().int().min(0).optional(),
});

/**
 * GET /api/content/graphs/[id]
 * Fetch a specific graph by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authenticate the user
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Fetch the graph with content session to verify ownership
    const graph = await prisma.graph.findUnique({
      where: { id },
      include: {
        contentSession: {
          select: { userId: true },
        },
      },
    });

    if (!graph) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Graph not found' } },
        { status: 404 }
      );
    }

    // Verify user owns the content session
    if (graph.contentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json(graph);
  } catch (error) {
    console.error('Get graph error:', error);
    
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
 * PUT /api/content/graphs/[id]
 * Update a graph's data and configuration
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authenticate the user
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = GraphUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid graph data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { type, data, config, position } = validationResult.data;

    // Fetch the graph with content session to verify ownership
    const existingGraph = await prisma.graph.findUnique({
      where: { id },
      include: {
        contentSession: {
          select: { userId: true },
        },
      },
    });

    if (!existingGraph) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Graph not found' } },
        { status: 404 }
      );
    }

    // Verify user owns the content session
    if (existingGraph.contentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Update the graph
    const updatedGraph = await prisma.graph.update({
      where: { id },
      data: {
        type,
        data: data as any,
        config: config as any,
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(updatedGraph);
  } catch (error) {
    console.error('Update graph error:', error);
    
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
 * DELETE /api/content/graphs/[id]
 * Delete a graph
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authenticate the user
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Fetch the graph with content session to verify ownership
    const graph = await prisma.graph.findUnique({
      where: { id },
      include: {
        contentSession: {
          select: { userId: true },
        },
      },
    });

    if (!graph) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Graph not found' } },
        { status: 404 }
      );
    }

    // Verify user owns the content session
    if (graph.contentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Delete the graph
    await prisma.graph.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete graph error:', error);
    
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
