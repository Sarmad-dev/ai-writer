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

    console.log("Generated Content: ", generatedContent)

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
  // const hasImages = userInputs.some(input => input.type === 'image');

  // Prepare messages for OpenAI
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert content writer with exceptional command of language and grammar. Generate high-quality, well-structured content based on the user's request.

**Writing Style & Quality:**
- Use advanced vocabulary appropriate to the content type and audience
- Employ sophisticated sentence structures with varied rhythm and flow
- Maintain impeccable grammar, punctuation, and syntax throughout
- Choose precise, powerful words over generic alternatives
- Adapt your vocabulary and tone to match the content type (technical, academic, creative, business, etc.)
- Avoid repetitive words and phrases; use synonyms and varied expressions
- Use active voice predominantly, passive voice only when strategically appropriate
- Ensure subject-verb agreement, proper tense consistency, and correct pronoun usage

**Content Structure:**
If web search results are provided, incorporate them naturally into the content and cite sources using markdown links like [Source Name](URL).

Format your response in HTML with appropriate headings, paragraphs, lists, and emphasis tags.

**Code Blocks:**
For code blocks, use the following format:
<pre><code class="language-{languageName}">your code here</code></pre>

Supported languages include: javascript, typescript, python, java, cpp, csharp, php, ruby, go, rust, sql, bash, json, xml, html, css, scss, yaml, markdown, swift, kotlin

Examples:
- For JavaScript: <pre><code class="language-javascript">console.log('Hello');</code></pre>
- For Python: <pre><code class="language-python">print('Hello')</code></pre>
- For TypeScript: <pre><code class="language-typescript">const x: string = 'Hello';</code></pre>

**Data Visualization:**
If the content would benefit from data visualization (statistics, comparisons, trends, etc.), embed charts directly using this exact format:

<div data-type="graph" data-id="unique-id" data-graph-data='[{"label":"A","value":10},{"label":"B","value":20}]' data-config='{"title":"Chart Title","xLabel":"X Axis","yLabel":"Y Axis"}'></div>

Chart types available: bar, line, pie, area, scatter
- Use "bar" for comparisons and categorical data
- Use "line" for trends over time
- Use "pie" for proportions and percentages
- Use "area" for cumulative data over time
- Use "scatter" for correlations between variables

Data format examples:
- Bar/Line/Area: [{"label":"Jan","value":100},{"label":"Feb","value":150}]
- Pie: [{"label":"Category A","value":30},{"label":"Category B","value":70}]
- Scatter: [{"x":1,"y":2},{"x":2,"y":4},{"x":3,"y":3}]

Place charts immediately after the relevant paragraph or section. Always include a brief explanation before the chart.

Be informative, engaging, and accurate. If you use information from search results, always cite the source.`,
    },
    {
      role: 'user',
      content: context
    }
  ];

  // Add user message with context
  // if (hasImages) {
  //   // For multimodal input, we need to use vision-capable model
  //   const imageInputs = userInputs.filter(input => input.type === 'image');
  //   const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
  //     {
  //       type: 'text',
  //       text: context,
  //     },
  //   ];

  //   // Add images
  //   imageInputs.forEach(input => {
  //     content.push({
  //       type: 'image_url',
  //       image_url: {
  //         url: input.content,
  //       },
  //     });
  //   });

  //   messages.push({
  //     role: 'user',
  //     content,
  //   });
  // } else {
  //   messages.push({
  //     role: 'user',
  //     content: context,
  //   });
  // }

  // Call OpenAI API using the client
  const generatedContent = await openai.createChatCompletion(messages, {
    model: 'gpt-5.1',
    temperature: 0.7,
    useWebSearch: true
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
