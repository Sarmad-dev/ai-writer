import { NextRequest, NextResponse } from 'next/server';
import { openai, type ChatMessage } from '@/lib/ai';

export interface AIGenerateRequest {
  prompt: string;
  context?: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AIGenerateRequest = await request.json();
    const { prompt, context, options = {} } = body;

    console.log('🚀 API Route - /api/ai/generate called:', {
      prompt: prompt?.substring(0, 200) + (prompt?.length > 200 ? '...' : ''),
      promptLength: prompt?.length,
      context: context,
      options: options
    });

    if (!prompt) {
      console.error('🚀 API Route - Missing prompt');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are a helpful writing assistant. Provide clear, well-written responses that match the user's request. Do not include any explanations or meta-commentary, just return the requested content."
      }
    ];

    if (context) {
      messages.push({
        role: "user",
        content: `Context: ${context}\n\nRequest: ${prompt}`
      });
    } else {
      messages.push({
        role: "user",
        content: prompt
      });
    }

    console.log('🚀 API Route - Calling OpenAI with messages:', messages);

    const response = await openai.createChatCompletion(messages, {
      model: options.model || "gpt-4o",
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
    });

    console.log('🚀 API Route - OpenAI response:', {
      responseLength: response?.length,
      responsePreview: response?.substring(0, 100) + (response?.length > 100 ? '...' : '')
    });

    return NextResponse.json({ 
      content: response.trim(),
      success: true 
    });

  } catch (error) {
    console.error('🚀 API Route - AI generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI content. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}