import type { WorkflowState } from '../types';
import { prisma } from '../../db/prisma';

/**
 * Save Node
 * Persists content to database and updates session status
 * 
 * This node:
 * 1. Saves generated content to the database
 * 2. Updates content session status to COMPLETED
 * 3. Saves graph data to the database
 * 4. Triggers React Query cache invalidation (handled by API)
 */
export async function saveNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { sessionId, generatedContent, formattedContent, graphs } = state;

    // Update content session with generated content
    await prisma.contentSession.update({
      where: { id: sessionId },
      data: {
        content: generatedContent,
        status: 'COMPLETED',
        metadata: {
          formattedContent,
          generatedAt: new Date().toISOString(),
          nodeHistory: state.metadata.nodeHistory,
        },
      },
    });

    // Save graphs to database
    if (graphs.length > 0) {
      await saveGraphs(sessionId, graphs);
    }

    return {
      status: 'completed',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'save'],
        endTime: Date.now(),
        savedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in save node:', error);
    
    // Try to update session status to FAILED
    try {
      await prisma.contentSession.update({
        where: { id: state.sessionId },
        data: {
          status: 'FAILED',
          metadata: {
            error: error instanceof Error ? error.message : 'Failed to save content',
            failedAt: new Date().toISOString(),
          },
        },
      });
    } catch (updateError) {
      console.error('Failed to update session status:', updateError);
    }

    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to save content',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'save'],
        endTime: Date.now(),
      },
    };
  }
}

/**
 * Saves graphs to the database
 */
async function saveGraphs(
  sessionId: string,
  graphs: WorkflowState['graphs']
): Promise<void> {
  // Delete existing graphs for this session
  await prisma.graph.deleteMany({
    where: { contentSessionId: sessionId },
  });

  // Create new graphs
  for (let i = 0; i < graphs.length; i++) {
    const graph = graphs[i];
    await prisma.graph.create({
      data: {
        contentSessionId: sessionId,
        type: graph.type,
        data: graph.data,
        config: graph.config,
        position: i,
      },
    });
  }
}

/**
 * Helper function to get content session with graphs
 */
export async function getContentSessionWithGraphs(sessionId: string) {
  return await prisma.contentSession.findUnique({
    where: { id: sessionId },
    include: {
      graphs: {
        orderBy: { position: 'asc' },
      },
      approvalRequests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
