import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, title } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Fetch the original session
    const originalSession = await prisma.contentSession.findUnique({
      where: { id: sessionId },
    });

    if (!originalSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Create duplicate with new title
    const duplicateTitle = title || `${originalSession.title} (Copy)`;
    const content = originalSession.content || "";
    
    const newSession = await prisma.contentSession.create({
      data: {
        userId: originalSession.userId,
        title: duplicateTitle,
        content,
        prompt: originalSession.prompt,
        contentType: originalSession.contentType,
        status: originalSession.status,
        ...(originalSession.metadata && { metadata: originalSession.metadata }),
      },
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error("Error duplicating session:", error);
    return NextResponse.json(
      { error: "Failed to duplicate session" },
      { status: 500 }
    );
  }
}
