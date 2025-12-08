import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * API endpoint to apply a suggestion
 * This marks a suggestion as applied and can optionally update the content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, suggestionId } = body;

    if (!sessionId || !suggestionId) {
      return NextResponse.json(
        { error: 'Missing sessionId or suggestionId' },
        { status: 400 }
      );
    }

    // Get the current session
    const session = await prisma.contentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get current suggestions
    const suggestions = (session.suggestions as any[]) || [];
    
    // Mark the suggestion as applied by removing it from the list
    // In a more sophisticated implementation, you might want to keep a history
    const updatedSuggestions = suggestions.filter((s: any) => s.id !== suggestionId);

    // Update the session
    await prisma.contentSession.update({
      where: { id: sessionId },
      data: {
        suggestions: updatedSuggestions,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Suggestion applied successfully',
    });
  } catch (error) {
    console.error('Error applying suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to apply suggestion' },
      { status: 500 }
    );
  }
}
