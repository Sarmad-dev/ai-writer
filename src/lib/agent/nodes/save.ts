import type { WorkflowState, EnhancedWorkflowState } from '../types';
import { prisma } from '../../db/prisma';

/**
 * Save Node (Enhanced)
 * Persists content to database with inline images and charts
 * 
 * This node:
 * 1. Saves generated content with inline images and charts to the database
 * 2. Does NOT create separate Graph or Image records
 * 3. Updates content session status to COMPLETED
 * 4. Triggers React Query cache invalidation (handled by API)
 */
export async function saveNode(state: WorkflowState | EnhancedWorkflowState): Promise<Partial<WorkflowState | EnhancedWorkflowState>> {
  try {
    const { sessionId, generatedContent } = state;

    // Check if this is an enhanced workflow state
    const isEnhanced = 'suggestions' in state;

    // Prepare update data
    const updateData: any = {
      content: generatedContent, // Store HTML content directly (not JSON stringified)
      status: 'COMPLETED',
      metadata: {
        generatedAt: new Date().toISOString(),
        nodeHistory: state.metadata.nodeHistory,
      },
    };

    // Add enhanced workflow fields if present
    if (isEnhanced) {
      const enhancedState = state as EnhancedWorkflowState;
      
      // Convert contentType to uppercase for Prisma enum
      const contentType = enhancedState.contentType || 'general';
      updateData.contentType = contentType.toUpperCase();
    }

    // Update content session with inline content
    await prisma.contentSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    // Note: We do NOT create separate Graph or Image records
    // All images and charts are stored inline in the content JSON

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
 * Helper function to get content session with inline content
 * Note: Graphs and images are now stored inline in the content HTML
 */
export async function getContentSession(sessionId: string) {
  const session = await prisma.contentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return null;
  }

  // Content is stored as HTML string, no parsing needed
  return {
    ...session,
    parsedContent: session.content,
  };
}
