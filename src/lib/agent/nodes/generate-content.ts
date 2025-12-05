import type { WorkflowState } from '../types';
import { openai, type ChatMessage } from '../../ai';

/**
 * Generate Content Node
 * Calls LLM API (OpenAI) to generate content with context
 * 
 * This node:
 * 1. Prepares the context from prompt, search results, and multimodal inputs
 * 2. Calls OpenAI API to generate content
 * 3. Handles multimodal inputs (text + images)
 * 4. Incorporates search results with citations
 * 5. Streams generated content (in production)
 */
export async function generateContentNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { prompt, searchResults, userInputs, pendingApproval } = state;

    // Build the context for content generation
    const context = buildContext(prompt, searchResults, userInputs, pendingApproval);

    // Generate content using OpenAI
    const generatedContent = await generateWithOpenAI(context, userInputs);

    return {
      generatedContent,
      status: 'generating',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'generate'],
        contentLength: generatedContent.length,
      },
    };
  } catch (error) {
    console.error('Error in generate content node:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to generate content',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'generate'],
      },
    };
  }
}

/**
 * Builds context for content generation
 */
function buildContext(
  prompt: string,
  searchResults: WorkflowState['searchResults'],
  userInputs: WorkflowState['userInputs'],
  pendingApproval?: WorkflowState['pendingApproval']
): string {
  let context = `User Request: ${prompt}\n\n`;

  // Add search results if available and approved
  if (searchResults.length > 0 && (!pendingApproval || pendingApproval.status === 'APPROVED')) {
    context += 'Web Search Results:\n';
    searchResults.forEach((result, index) => {
      context += `\n[${index + 1}] ${result.title}\n`;
      context += `Source: ${result.url}\n`;
      context += `${result.snippet}\n`;
    });
    context += '\n';
  }

  // Add information about multimodal inputs
  const imageInputs = userInputs.filter(input => input.type === 'image');
  if (imageInputs.length > 0) {
    context += `\nThe user has provided ${imageInputs.length} image(s) as additional context.\n`;
  }

  return context;
}

/**
 * Generates content using OpenAI API
 */
async function generateWithOpenAI(
  context: string,
  userInputs: WorkflowState['userInputs']
): Promise<string> {
  const hasImages = userInputs.some(input => input.type === 'image');

  // Prepare messages for OpenAI
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert content writer. Generate high-quality, well-structured content based on the user's request. 
      
If web search results are provided, incorporate them naturally into the content and cite sources using markdown links like [Source Name](URL).

Format your response in markdown with appropriate headings, paragraphs, lists, and emphasis.

Be informative, engaging, and accurate. If you use information from search results, always cite the source.`,
    },
  ];

  // Add user message with context
  if (hasImages) {
    // For multimodal input, we need to use vision-capable model
    const imageInputs = userInputs.filter(input => input.type === 'image');
    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
      {
        type: 'text',
        text: context,
      },
    ];

    // Add images
    imageInputs.forEach(input => {
      content.push({
        type: 'image_url',
        image_url: {
          url: input.content,
        },
      });
    });

    messages.push({
      role: 'user',
      content,
    });
  } else {
    messages.push({
      role: 'user',
      content: context,
    });
  }

  // Call OpenAI API using the client
  const generatedContent = await openai.createChatCompletion(messages, {
    model: hasImages ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000,
  });

  return generatedContent;
}

/**
 * Streams content generation (for real-time updates)
 * This would be used in the API endpoint for streaming responses
 */
export async function* streamGenerateContent(
  context: string,
  userInputs: WorkflowState['userInputs']
): AsyncGenerator<string> {
  const hasImages = userInputs.some(input => input.type === 'image');

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert content writer. Generate high-quality, well-structured content based on the user's request.`,
    },
  ];

  if (hasImages) {
    const imageInputs = userInputs.filter(input => input.type === 'image');
    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: context }
    ];
    imageInputs.forEach(input => {
      content.push({
        type: 'image_url',
        image_url: { url: input.content },
      });
    });
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: context });
  }

  // Use the OpenAI client's streaming method
  for await (const chunk of openai.streamChatCompletion(messages, {
    model: hasImages ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000,
  })) {
    yield chunk;
  }
}
