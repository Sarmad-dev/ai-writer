import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { FeedbackType } from "@/generated/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = (await params).id;
    const body = await request.json();
    const { feedbackType } = body;

    // Validate feedback type
    if (!feedbackType || !["LIKE", "DISLIKE"].includes(feedbackType)) {
      return NextResponse.json(
        { error: "Invalid feedback type. Must be LIKE or DISLIKE" },
        { status: 400 }
      );
    }

    // Verify message exists
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user already has feedback for this message
    const existingFeedback = await prisma.messageFeedback.findFirst({
      where: {
        messageId: messageId,
        userId: session.user.id,
      },
    });

    let feedback;

    if (existingFeedback) {
      // If same feedback type, delete it (toggle off)
      if (existingFeedback.feedbackType === feedbackType) {
        await prisma.messageFeedback.delete({
          where: { id: existingFeedback.id },
        });

        return NextResponse.json({
          success: true,
          feedback: null,
        });
      } else {
        // Update to new feedback type
        feedback = await prisma.messageFeedback.update({
          where: { id: existingFeedback.id },
          data: { feedbackType: feedbackType as FeedbackType },
        });
      }
    } else {
      // Create new feedback
      feedback = await prisma.messageFeedback.create({
        data: {
          messageId,
          userId: session.user.id,
          feedbackType: feedbackType as FeedbackType,
        },
      });
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        feedbackType: feedback.feedbackType,
      },
    });
  } catch (error) {
    console.error("Error recording message feedback:", error);
    return NextResponse.json(
      { error: "Failed to record feedback" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = (await params).id;

    // Get user's feedback for this message
    const feedback = await prisma.messageFeedback.findFirst({
      where: {
        messageId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      feedback: feedback
        ? {
            id: feedback.id,
            feedbackType: feedback.feedbackType,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching message feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
