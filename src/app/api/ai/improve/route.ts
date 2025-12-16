import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai';

export interface AIImproveRequest {
  text: string;
  tone?: string;
  style?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIImproveRequest = await request.json();
    const { text, tone = "professional", style = "clear" } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const prompt = `Improve the following text to be more ${tone} and ${style}. Keep the same meaning but enhance clarity, flow, and impact:\n\n${text}`;

    const response = await openai.createChatCompletion([
      {
        role: "system",
        content: "You are a helpful writing assistant. Provide clear, well-written responses that match the user's request. Do not include any explanations or meta-commentary, just return the requested content."
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({ 
      content: response.trim(),
      success: true 
    });

  } catch (error) {
    console.error('AI improve error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to improve text. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}