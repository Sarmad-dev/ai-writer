// Load environment variables first
if (typeof window === 'undefined') {
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('dotenv not available');
  }
}
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  useWebSearch?: boolean;
}

/**
 * OpenAI API client for chat completions
 */
export class OpenAIClient {
  private apiKey: string;
  private baseUrl: string;
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    
    // Debug: Check if API key is available
    if (!this.apiKey) {
      console.error('❌ OpenAI API Key is missing!');
      console.error('process.env.OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');
      throw new Error('OpenAI API key is required but not found in environment variables');
    }
    
    console.log('✅ OpenAI client initialized with API key');
    
    // Initialize OpenAI client with API key
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 16000,
      useWebSearch = false,
    } = options;

    // If web search is enabled, use responses.create API
    if (useWebSearch) {
      return this.createResponseWithWebSearch(messages, { model, temperature, maxTokens });
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: messages as ChatCompletionMessageParam[],
      temperature,
      max_completion_tokens: maxTokens,
    });
    
    const content = response.choices?.[0]?.message?.content || '';

    if (!content) {
      console.error('No content in response. Full response:', response);
      throw new Error(`No content generated from OpenAI. Response: ${JSON.stringify(response)}`);
    }

    return content;
  }

  /**
   * Create a response using the responses.create API with web search capability
   */
  private async createResponseWithWebSearch(
    messages: ChatMessage[],
    options: { model: string; temperature: number; maxTokens: number }
  ): Promise<string> {
    const { model, temperature, maxTokens } = options;

    // Convert messages to the input format expected by responses.create
    // The responses API uses a different format with 'input' instead of 'messages'
    const inputMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      type: 'message' as const,
    }));

    const response = await this.client.responses.create({
      model,
      input: inputMessages,
      tools: [
        { type: 'web_search' as const },
      ],
      max_output_tokens: maxTokens,
    });

    // Extract text content from the response
    const content = response.output_text || '';

    if (!content) {
      console.error('No content in response. Full response:', response);
      throw new Error(`No content generated from OpenAI. Response: ${JSON.stringify(response)}`);
    }

    return content;
  }

  /**
   * Stream a chat completion
   */
  async *streamChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): AsyncGenerator<string> {
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 16000,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_completion_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

// Default OpenAI client instance (server-side only)
export const openai = typeof window === 'undefined' ? new OpenAIClient() : null as any;
