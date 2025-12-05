import type { WorkflowState, ApprovalRequestData } from '../types';
import { prisma } from '../../db/prisma';

/**
 * Approval Node
 * Creates approval request in database and waits for user response
 * 
 * This node:
 * 1. Creates an approval request in the database
 * 2. Pauses workflow execution
 * 3. Waits for user response (handled externally via API)
 * 4. Resumes workflow based on approval/rejection
 * 
 * Note: This is a simplified implementation. In production, you would:
 * - Use a polling mechanism or webhooks to wait for approval
 * - Implement timeout handling
 * - Store workflow state for resumption
 */
export async function approvalNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { sessionId, searchResults } = state;

    // Create approval request for web search usage
    const approvalRequest = await createApprovalRequest(
      sessionId,
      'use_search_results',
      {
        searchResultsCount: searchResults.length,
        sources: searchResults.map(r => r.source),
        message: 'The AI wants to use web search results to enhance the content. Do you approve?',
      }
    );

    // In a real implementation, we would pause here and wait for user response
    // For now, we'll just set the pending approval and let the workflow handle it
    return {
      pendingApproval: approvalRequest,
      status: 'waiting_approval',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'approval'],
        approvalRequestId: approvalRequest.id,
      },
    };
  } catch (error) {
    console.error('Error in approval node:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to create approval request',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'approval'],
      },
    };
  }
}

/**
 * Creates an approval request in the database
 */
async function createApprovalRequest(
  sessionId: string,
  action: string,
  details: Record<string, any>
): Promise<ApprovalRequestData> {
  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      contentSessionId: sessionId,
      action,
      details,
      status: 'PENDING',
    },
  });

  return {
    id: approvalRequest.id,
    action: approvalRequest.action,
    details: approvalRequest.details as Record<string, any>,
    status: approvalRequest.status,
  };
}

/**
 * Checks the status of an approval request
 * This would be called by the workflow to check if approval has been granted
 */
export async function checkApprovalStatus(
  approvalRequestId: string
): Promise<ApprovalRequestData | null> {
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!approvalRequest) {
    return null;
  }

  return {
    id: approvalRequest.id,
    action: approvalRequest.action,
    details: approvalRequest.details as Record<string, any>,
    status: approvalRequest.status,
  };
}

/**
 * Updates an approval request with user response
 * This would be called by the API endpoint when user approves/rejects
 */
export async function updateApprovalRequest(
  approvalRequestId: string,
  status: 'APPROVED' | 'REJECTED',
  response?: Record<string, any>
): Promise<void> {
  await prisma.approvalRequest.update({
    where: { id: approvalRequestId },
    data: {
      status,
      response,
      resolvedAt: new Date(),
    },
  });
}
