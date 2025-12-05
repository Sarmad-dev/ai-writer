/**
 * Integration tests for complete message rendering
 * Tests the full rendering pipeline including MessageBubble, MarkdownRenderer,
 * and all custom components with streaming and message actions
 * 
 * Requirements: All requirements from chat-rich-content spec
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock fetch for message actions API
global.fetch = vi.fn();

describe('Complete Message Rendering Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful feedback API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe('MarkdownRenderer - Basic Elements', () => {
    it('should render code blocks with Mermaid diagrams', async () => {
      const mermaidContent = `
\`\`\`mermaid
graph TD
  A[Start] --> B[Process]
  B --> C[End]
\`\`\`
      `;

      render(<MarkdownRenderer content={mermaidContent} />);

      // Wait for Mermaid to render (it's async)
      await waitFor(
        () => {
          // Check if the Mermaid container is present
          const container = document.querySelector('.my-4');
          expect(container).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it('should render inline math with KaTeX', () => {
      const mathContent = 'The equation $E = mc^2$ is famous.';

      render(<MarkdownRenderer content={mathContent} />);

      // KaTeX adds specific classes to rendered math
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('should render block math with KaTeX', () => {
      const blockMathContent = `
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
      `;

      render(<MarkdownRenderer content={blockMathContent} />);

      // KaTeX adds specific classes to rendered math
      const mathElements = document.querySelectorAll('.katex-display');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('should render images with ImageRenderer', async () => {
      const imageContent = '![Test Image](https://example.com/image.jpg "Test Title")';

      render(<MarkdownRenderer content={imageContent} />);

      // Wait for lazy-loaded ImageRenderer
      await waitFor(() => {
        const img = screen.getByAltText('Test Image');
        expect(img).toBeTruthy();
      });
    });

    it('should render tables with TableRenderer', () => {
      const tableContent = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
      `;

      render(<MarkdownRenderer content={tableContent} />);

      const table = document.querySelector('table');
      expect(table).toBeTruthy();
      
      const headers = document.querySelectorAll('th');
      expect(headers.length).toBe(2);
    });

    it('should render code blocks with CodeBlock component', async () => {
      const codeContent = `
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`
      `;

      render(<MarkdownRenderer content={codeContent} />);

      // Wait for lazy-loaded CodeBlock
      await waitFor(() => {
        const languageLabel = screen.getByText('javascript');
        expect(languageLabel).toBeTruthy();
      });
      
      // Check for copy button
      const copyButton = screen.getByLabelText('Copy code to clipboard');
      expect(copyButton).toBeTruthy();
    });
  });

  describe('Full Message Rendering with Mixed Content', () => {
    it('should handle mixed content with all renderers', async () => {
      const mixedContent = `
# Heading

This is a paragraph with **bold** and *italic* text.

## Code Example

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

## Math

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

## Table

| Name | Age |
|------|-----|
| John | 30  |
| Jane | 25  |

## Image

![Sample](https://example.com/sample.jpg)
      `;

      render(<MarkdownRenderer content={mixedContent} />);

      // Check for heading
      const heading = screen.getByText('Heading');
      expect(heading).toBeTruthy();

      // Check for bold text
      const boldText = screen.getByText('bold');
      expect(boldText.tagName).toBe('STRONG');

      // Wait for lazy-loaded code block
      await waitFor(() => {
        const pythonLabel = screen.getByText('python');
        expect(pythonLabel).toBeTruthy();
      });

      // Check for math
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);

      // Check for table
      const table = document.querySelector('table');
      expect(table).toBeTruthy();

      // Wait for lazy-loaded image
      await waitFor(() => {
        const img = screen.getByAltText('Sample');
        expect(img).toBeTruthy();
      });
    });

    it('should render complex nested content in tables', () => {
      const tableWithCode = `
| Feature | Code Example |
|---------|--------------|
| Function | \`const fn = () => {}\` |
| Bold | **Important** |
      `;

      render(<MarkdownRenderer content={tableWithCode} />);

      const table = document.querySelector('table');
      expect(table).toBeTruthy();

      // Check for inline code in table
      const codeElement = document.querySelector('td code');
      expect(codeElement).toBeTruthy();

      // Check for bold in table
      const boldElement = document.querySelector('td strong');
      expect(boldElement).toBeTruthy();
    });

    it('should render multiple code blocks with different languages', async () => {
      const multiCodeContent = `
\`\`\`javascript
console.log("JS");
\`\`\`

\`\`\`python
print("Python")
\`\`\`

\`\`\`typescript
const x: number = 5;
\`\`\`
      `;

      render(<MarkdownRenderer content={multiCodeContent} />);

      // Wait for lazy-loaded code blocks
      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeTruthy();
        expect(screen.getByText('python')).toBeTruthy();
        expect(screen.getByText('typescript')).toBeTruthy();
      });

      // Check all copy buttons are present
      const copyButtons = screen.getAllByLabelText('Copy code to clipboard');
      expect(copyButtons.length).toBe(3);
    });
  });

  describe('MessageBubble Integration', () => {
    const mockMessage = {
      id: 'msg-1',
      role: 'assistant' as const,
      content: '# Hello\n\nThis is a **test** message with `code`.',
      timestamp: new Date('2024-01-01T12:00:00Z'),
    };

    it('should render complete message with actions', () => {
      render(
        <TooltipProvider>
          <MessageBubble message={mockMessage} showActions={true} />
        </TooltipProvider>
      );

      // Check message content is rendered
      expect(screen.getByText('Hello')).toBeTruthy();
      expect(screen.getByText('test')).toBeTruthy();

      // Check message actions are present
      expect(screen.getByLabelText('Copy message')).toBeTruthy();
      expect(screen.getByLabelText('Like message')).toBeTruthy();
      expect(screen.getByLabelText('Dislike message')).toBeTruthy();
      expect(screen.getByLabelText('Share message')).toBeTruthy();
    });

    it('should render user messages without markdown', () => {
      const userMessage = {
        ...mockMessage,
        role: 'user' as const,
        content: '# This should not be a heading',
      };

      render(
        <TooltipProvider>
          <MessageBubble message={userMessage} />
        </TooltipProvider>
      );

      // User messages should render as plain text
      const content = screen.getByText('# This should not be a heading');
      expect(content).toBeTruthy();
      
      // Should not have heading element
      const heading = document.querySelector('h1');
      expect(heading).toBeFalsy();
    });

    it('should not show like/dislike for user messages', () => {
      const userMessage = {
        ...mockMessage,
        role: 'user' as const,
      };

      render(
        <TooltipProvider>
          <MessageBubble message={userMessage} showActions={true} />
        </TooltipProvider>
      );

      // Should have copy and share buttons
      expect(screen.getByLabelText('Copy message')).toBeTruthy();
      expect(screen.getByLabelText('Share message')).toBeTruthy();

      // Should not have like/dislike buttons
      expect(screen.queryByLabelText('Like message')).toBeFalsy();
      expect(screen.queryByLabelText('Dislike message')).toBeFalsy();
    });
  });

  describe('Streaming Content Integration', () => {
    const mockMessage = {
      id: 'msg-streaming',
      role: 'assistant' as const,
      content: '',
      timestamp: new Date(),
    };

    it('should render streaming content progressively', () => {
      const { rerender } = render(
        <TooltipProvider>
          <MessageBubble
            message={mockMessage}
            isStreaming={true}
            streamingContent="# Streaming"
          />
        </TooltipProvider>
      );

      // Check streaming indicator
      expect(screen.getByText('Generating...')).toBeTruthy();

      // Check partial content is rendered
      expect(screen.getByText('Streaming')).toBeTruthy();

      // Update with more content
      rerender(
        <TooltipProvider>
          <MessageBubble
            message={mockMessage}
            isStreaming={true}
            streamingContent="# Streaming\n\nMore **content**"
          />
        </TooltipProvider>
      );

      // Check updated content
      expect(screen.getByText('content')).toBeTruthy();
    });

    it('should complete streaming and show actions', () => {
      const { rerender } = render(
        <TooltipProvider>
          <MessageBubble
            message={mockMessage}
            isStreaming={true}
            streamingContent="# Complete"
          />
        </TooltipProvider>
      );

      // Initially streaming
      expect(screen.getByText('Generating...')).toBeTruthy();
      expect(screen.queryByLabelText('Copy message')).toBeFalsy();

      // Complete streaming
      const completedMessage = {
        ...mockMessage,
        content: '# Complete',
      };

      rerender(
        <TooltipProvider>
          <MessageBubble
            message={completedMessage}
            isStreaming={false}
            showActions={true}
          />
        </TooltipProvider>
      );

      // Should show timestamp instead of generating
      expect(screen.queryByText('Generating...')).toBeFalsy();

      // Should show actions
      expect(screen.getByLabelText('Copy message')).toBeTruthy();
    });

    it('should handle streaming with code blocks', async () => {
      const streamingCode = `
\`\`\`javascript
function test() {
  console.log("streaming");
}
\`\`\`
      `;

      render(
        <TooltipProvider>
          <MessageBubble
            message={mockMessage}
            isStreaming={true}
            streamingContent={streamingCode}
          />
        </TooltipProvider>
      );

      // Wait for lazy-loaded code block during streaming
      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeTruthy();
      });
    });
  });

  describe('Message Actions Integration', () => {
    const mockMessage = {
      id: 'msg-actions',
      role: 'assistant' as const,
      content: 'Test message for actions',
      timestamp: new Date(),
    };

    it('should handle like action with API integration', async () => {
      const onLike = vi.fn();

      render(
        <TooltipProvider>
          <MessageBubble
            message={mockMessage}
            showActions={true}
            onLike={onLike}
          />
        </TooltipProvider>
      );

      const likeButton = screen.getByLabelText('Like message');
      fireEvent.click(likeButton);

      // Wait for API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat/messages/msg-actions/feedback',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ feedbackType: 'LIKE' }),
          })
        );
      });

      // Check callback was called
      await waitFor(() => {
        expect(onLike).toHaveBeenCalledWith('msg-actions');
      });
    });

    it('should handle dislike action with API integration', async () => {
      const onDislike = vi.fn();

      render(
        <TooltipProvider>
          <MessageBubble
            message={mockMessage}
            showActions={true}
            onDislike={onDislike}
          />
        </TooltipProvider>
      );

      const dislikeButton = screen.getByLabelText('Dislike message');
      fireEvent.click(dislikeButton);

      // Wait for API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/chat/messages/msg-actions/feedback',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ feedbackType: 'DISLIKE' }),
          })
        );
      });

      // Check callback was called
      await waitFor(() => {
        expect(onDislike).toHaveBeenCalledWith('msg-actions');
      });
    });

    it('should handle API errors with rollback', async () => {
      // Mock failed API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(
        <TooltipProvider>
          <MessageBubble message={mockMessage} showActions={true} />
        </TooltipProvider>
      );

      const likeButton = screen.getByLabelText('Like message');
      
      // Button should not be pressed initially
      expect(likeButton.getAttribute('aria-pressed')).toBe('false');
      
      fireEvent.click(likeButton);

      // Wait for API call to fail and rollback
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Button should still not be pressed after rollback
      await waitFor(() => {
        expect(likeButton.getAttribute('aria-pressed')).toBe('false');
      });
    });

    it('should copy message content to clipboard', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(
        <TooltipProvider>
          <MessageBubble message={mockMessage} showActions={true} />
        </TooltipProvider>
      );

      const copyButton = screen.getByLabelText('Copy message');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Test message for actions');
      });

      // Check for copied feedback
      await waitFor(() => {
        expect(screen.getByLabelText('Copied')).toBeTruthy();
      });
    });
  });

  describe('Complex Real-World Scenarios', () => {
    it('should render a complete technical response with all content types', async () => {
      const complexContent = `
# API Documentation

Here's how to use our REST API:

## Authentication

First, obtain an API key from the dashboard. Then include it in your requests:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/data
\`\`\`

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/users\` | List all users |
| POST | \`/users\` | Create a user |
| GET | \`/users/:id\` | Get user details |

## Example Response

\`\`\`json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}
\`\`\`

## Rate Limiting

The API uses the token bucket algorithm. The rate limit is calculated as:

$
R = \\frac{N}{T}
$

Where $R$ is the rate, $N$ is the number of requests, and $T$ is the time window.

## Architecture

\`\`\`mermaid
graph LR
  Client --> API
  API --> Database
  API --> Cache
\`\`\`

For more information, visit our [documentation](https://docs.example.com).
      `;

      const message = {
        id: 'complex-msg',
        role: 'assistant' as const,
        content: complexContent,
        timestamp: new Date(),
      };

      render(
        <TooltipProvider>
          <MessageBubble message={message} showActions={true} />
        </TooltipProvider>
      );

      // Check heading
      expect(screen.getByText('API Documentation')).toBeTruthy();

      // Check code blocks
      expect(screen.getByText('bash')).toBeTruthy();
      expect(screen.getByText('json')).toBeTruthy();

      // Check table
      const table = document.querySelector('table');
      expect(table).toBeTruthy();

      // Check math
      await waitFor(() => {
        const mathElements = document.querySelectorAll('.katex');
        expect(mathElements.length).toBeGreaterThan(0);
      });

      // Check link
      const link = screen.getByText('documentation');
      expect(link.tagName).toBe('A');

      // Check message actions
      expect(screen.getByLabelText('Copy message')).toBeTruthy();
      expect(screen.getByLabelText('Like message')).toBeTruthy();
    });

    it('should handle mathematical paper with multiple equations', () => {
      const mathPaper = `
# Quadratic Equations

The general form is $ax^2 + bx + c = 0$.

The solutions are given by:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

For the discriminant $\\Delta = b^2 - 4ac$:

- If $\\Delta > 0$: two real solutions
- If $\\Delta = 0$: one real solution
- If $\\Delta < 0$: two complex solutions
      `;

      render(<MarkdownRenderer content={mathPaper} />);

      // Check multiple math elements
      const inlineMath = document.querySelectorAll('.katex:not(.katex-display)');
      expect(inlineMath.length).toBeGreaterThan(3);

      const blockMath = document.querySelectorAll('.katex-display');
      expect(blockMath.length).toBeGreaterThan(0);
    });

    it('should render code tutorial with multiple languages', () => {
      const tutorial = `
# Full Stack Example

## Frontend (React)

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return <div>{user.name}</div>;
};
\`\`\`

## Backend (Python)

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id, "name": "John"}
\`\`\`

## Database (SQL)

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
\`\`\`
      `;

      render(<MarkdownRenderer content={tutorial} />);

      // Check all languages are rendered
      expect(screen.getByText('typescript')).toBeTruthy();
      expect(screen.getByText('python')).toBeTruthy();
      expect(screen.getByText('sql')).toBeTruthy();

      // Check all have copy buttons
      const copyButtons = screen.getAllByLabelText('Copy code to clipboard');
      expect(copyButtons.length).toBe(3);
    });

    it('should render streaming message with progressive updates', () => {
      const { rerender } = render(
        <TooltipProvider>
          <MessageBubble
            message={{
              id: 'stream-msg',
              role: 'assistant' as const,
              content: '',
              timestamp: new Date(),
            }}
            isStreaming={true}
            streamingContent="# Starting"
          />
        </TooltipProvider>
      );

      expect(screen.getByText('Starting')).toBeTruthy();

      // Add code block
      rerender(
        <TooltipProvider>
          <MessageBubble
            message={{
              id: 'stream-msg',
              role: 'assistant' as const,
              content: '',
              timestamp: new Date(),
            }}
            isStreaming={true}
            streamingContent={`# Starting\n\n\`\`\`javascript\nconst x = 1;\n\`\`\``}
          />
        </TooltipProvider>
      );

      expect(screen.getByText('javascript')).toBeTruthy();

      // Add math
      rerender(
        <TooltipProvider>
          <MessageBubble
            message={{
              id: 'stream-msg',
              role: 'assistant' as const,
              content: '',
              timestamp: new Date(),
            }}
            isStreaming={true}
            streamingContent={`# Starting\n\n\`\`\`javascript\nconst x = 1;\n\`\`\`\n\nMath: $E = mc^2$`}
          />
        </TooltipProvider>
      );

      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('should handle base64 images in messages', async () => {
      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const imageContent = `![Base64 Image](${base64Image})`;

      render(<MarkdownRenderer content={imageContent} />);

      // Wait for lazy-loaded image component to render
      await waitFor(() => {
        const img = screen.getByAltText('Base64 Image');
        expect(img).toBeTruthy();
        // Image may still be loading, so just check it exists
      }, { timeout: 2000 });
    });

    it('should render tables with inline code and formatting', () => {
      const tableContent = `
| Command | Description | Example |
|---------|-------------|---------|
| \`git commit\` | Save changes | \`git commit -m "message"\` |
| **Important** | Critical step | Use with *caution* |
      `;

      render(<MarkdownRenderer content={tableContent} />);

      const table = document.querySelector('table');
      expect(table).toBeTruthy();

      // Check inline code in table
      const codeElements = document.querySelectorAll('td code');
      expect(codeElements.length).toBeGreaterThan(0);

      // Check bold in table
      const boldElement = document.querySelector('td strong');
      expect(boldElement).toBeTruthy();

      // Check italic in table
      const italicElement = document.querySelector('td em');
      expect(italicElement).toBeTruthy();
    });

    it('should handle chemical formulas in math mode', () => {
      const chemContent = `
Chemical formula for water: $H_2O$

Sulfuric acid: $H_2SO_4$
      `;

      render(<MarkdownRenderer content={chemContent} />);

      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBe(2);
    });
  });
});
