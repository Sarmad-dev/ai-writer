import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { openai } from '@/lib/ai';
import { tavily } from '@/lib/search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Determines if web search is needed based on the message content
 */
async function determineSearchNeed(message: string): Promise<boolean> {
  // Keywords that indicate need for real-time or factual data
  const searchIndicators = [
    'latest',
    'current',
    'recent',
    'today',
    'yesterday',
    'this week',
    'this month',
    'this year',
    '2024',
    '2025',
    'statistics',
    'data',
    'research',
    'study',
    'report',
    'news',
    'trends',
    'market',
    'price',
    'cost',
    'rate',
    'compare',
    'comparison',
    'versus',
    'vs',
    'what is',
    'who is',
    'when did',
    'where is',
    'how many',
    'how much',
    'tell me about',
    'information about',
    'facts about',
  ];

  const lowerMessage = message.toLowerCase();
  
  // Check if any search indicators are present
  const hasSearchIndicator = searchIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );

  // Additional heuristic: if message asks a question, it might need search
  const hasQuestion = /\?/.test(message) || 
    /^(what|who|when|where|why|how|which|can|could|should|would|is|are|do|does|did|will|have|has)/i.test(message.trim());

  return hasSearchIndicator || hasQuestion;
}

/**
 * POST /api/chat/stream
 * Simple streaming chat endpoint (ChatGPT-like, no workflow)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId && conversationId !== 'new') {
      conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50),
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        
        try {
          // Check if web search is needed
          const needsSearch = await determineSearchNeed(message);
          let searchContext = '';

          if (needsSearch) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'status', status: 'Searching the web...' })}\n\n`)
            );

            try {
              const searchResults = await tavily.search(message, {
                searchDepth: 'advanced',
                maxResults: 5,
              });

              if (searchResults.length > 0) {
                searchContext = '\n\nWeb Search Results:\n';
                searchResults.forEach((result, index) => {
                  searchContext += `\n[${index + 1}] ${result.title}\n`;
                  searchContext += `Source: ${result.url}\n`;
                  searchContext += `${result.snippet}\n`;
                });
                searchContext += '\n';

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'status', status: 'Generating response...' })}\n\n`)
                );
              }
            } catch (searchError) {
              console.error('Search error:', searchError);
              // Continue without search results
            }
          }

          // Get recent conversation history for context
          const recentMessages = await prisma.chatMessage.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
          });

          // Build messages array for OpenAI
          const historyMessages = recentMessages.reverse().map(msg => ({
            role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content,
          }));

          const systemPrompt = searchContext
            ? `You are a helpful AI assistant with access to web search results. Provide clear, concise, and accurate responses based on the search results when available. Always cite sources using markdown links like [Source Name](URL) when using information from search results. 

Format your responses in markdown when appropriate.

**For Mathematical Equations:**
When including mathematical equations or formulas, use standard LaTeX delimiters:
- Inline math: $E = mc^2$ (single dollar signs)
- Block math: $$\\int_{0}^{\\infty} e^{-x} dx = 1$$ (double dollar signs on separate lines)

Use proper LaTeX syntax with backslashes for Greek letters (\\alpha, \\beta, \\Sigma), fractions (\\frac{a}{b}), integrals (\\int), summations (\\sum), etc.

**For Data Visualizations (Charts and Graphs):**
When creating charts, graphs, or data visualizations, use Python code blocks. The system will automatically detect and execute chart-generating code, providing both interactive and static versions:

\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

# Sample data
products = ['Product A', 'Product B', 'Product C']
sales = [45, 30, 25]
colors = ['#3b82f6', '#10b981', '#f59e0b']

# Create bar chart
plt.figure(figsize=(10, 6))
plt.bar(products, sales, color=colors)
plt.title('Sales Distribution')
plt.xlabel('Products')
plt.ylabel('Sales')
plt.show()
\`\`\`

Charts are rendered with interactive capabilities (zoom, hover, pan) and users can toggle between interactive and static views.

**CRITICAL**: Each Python code block is executed independently in a separate sandbox. Always include ALL necessary imports (matplotlib.pyplot, numpy, pandas, seaborn, etc.) at the beginning of EVERY code block, even if you used them in previous blocks in the same response.

**For Regular Python Code:**
Use standard Python code blocks for non-visualization code:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

The system automatically detects chart-generating code (matplotlib, seaborn, plotly) and executes it in a sandbox. Regular Python code is displayed as syntax-highlighted code blocks.

**For Diagrams and Flowcharts:**
Use Mermaid for flowcharts, sequence diagrams, and process flows:

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\`

Use Python for data visualization and Mermaid for process/workflow diagrams.`
            : `You are a helpful AI assistant. Provide clear, concise, and accurate responses. 

Format your responses in markdown when appropriate.

**For Mathematical Equations:**
When including mathematical equations or formulas, use standard LaTeX delimiters:
- Inline math: $E = mc^2$ (single dollar signs)
- Block math: $$\\int_{0}^{\\infty} e^{-x} dx = 1$$ (double dollar signs on separate lines)

Use proper LaTeX syntax with backslashes for Greek letters (\\alpha, \\beta, \\Sigma), fractions (\\frac{a}{b}), integrals (\\int), summations (\\sum), etc.

**For Data Visualizations (Charts and Graphs):**
When creating charts, graphs, or data visualizations, use Python code blocks. The system will automatically detect and execute chart-generating code, providing both interactive and static versions:

\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

# Sample data
products = ['Product A', 'Product B', 'Product C']
sales = [45, 30, 25]
colors = ['#3b82f6', '#10b981', '#f59e0b']

# Create bar chart
plt.figure(figsize=(10, 6))
plt.bar(products, sales, color=colors)
plt.title('Sales Distribution')
plt.xlabel('Products')
plt.ylabel('Sales')
plt.show()
\`\`\`

Charts are rendered with interactive capabilities (zoom, hover, pan) and users can toggle between interactive and static views.

**CRITICAL**: Each Python code block is executed independently in a separate sandbox. Always include ALL necessary imports (matplotlib.pyplot, numpy, pandas, seaborn, etc.) at the beginning of EVERY code block, even if you used them in previous blocks in the same response.

**For Regular Python Code:**
Use standard Python code blocks for non-visualization code:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

The system automatically detects chart-generating code (matplotlib, seaborn, plotly) and executes it in a sandbox. Regular Python code is displayed as syntax-highlighted code blocks.

**For Diagrams and Flowcharts:**
Use Mermaid for flowcharts, sequence diagrams, and process flows:

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\`

Use Python for data visualization and Mermaid for process/workflow diagrams.`;

          const userMessage = searchContext
            ? `${message}${searchContext}`
            : message;

          const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
              role: 'system',
              content: systemPrompt,
            },
            // Add recent conversation history (in chronological order)
            ...historyMessages,
            // Add current message with search context
            {
              role: 'user',
              content: userMessage,
            },
          ];

          // Stream response from OpenAI
          for await (const chunk of openai.streamChatCompletion(messages)) {
            fullResponse += chunk;
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
            );
          }

          // Save assistant message
          await prisma.chatMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'ASSISTANT',
              content: fullResponse,
            },
          });

          // Update conversation timestamp
          await prisma.chatConversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'done', 
              conversationId: conversation.id 
            })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}