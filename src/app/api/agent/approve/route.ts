import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ApprovalRequestBody {
  approvalRequestId: string;
  approved: boolean;
  response?: Record<string, any>;
}

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
    const body: ApprovalRequestBody = await req.json();
    const { approvalRequestId, approved, response } = body;

    // Validate input
    if (!approvalRequestId || typeof approvalRequestId !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'approvalRequestId is required' } },
        { status: 400 }
      );
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'approved must be a boolean' } },
        { status: 400 }
      );
    }

    // Fetch the approval request
    const approvalRequest = await prisma.approvalRequest.findUnique({
      where: { id: approvalRequestId },
      include: {
        contentSession: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!approvalRequest) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Approval request not found' } },
        { status: 404 }
      );
    }

    // Verify user owns the content session
    if (approvalRequest.contentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have permission to approve this request' } },
        { status: 403 }
      );
    }

    // Check if already resolved
    if (approvalRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: { code: 'ALREADY_RESOLVED', message: 'This approval request has already been resolved' } },
        { status: 400 }
      );
    }

    // Update approval request status
    const updatedApprovalRequest = await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        response: (response || null) as any,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      approvalRequest: {
        id: updatedApprovalRequest.id,
        status: updatedApprovalRequest.status,
        resolvedAt: updatedApprovalRequest.resolvedAt,
      },
    });
  } catch (error) {
    console.error('Approve endpoint error:', error);
    
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
