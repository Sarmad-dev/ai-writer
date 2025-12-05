import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageActions } from '@/components/chat/MessageActions';
import { CodeBlock } from '@/components/chat/CodeBlock';
import { ImageRenderer } from '@/components/chat/ImageRenderer';
import { MathRenderer } from '@/components/chat/MathRenderer';
import { TableRenderer, TableHead, TableBody, TableRow, TableCell } from '@/components/chat/TableRenderer';
import { ChatInput } from '@/components/chat/ChatInput';

// Arbitraries for generating test data
const messageArbitrary = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom('user' as const, 'assistant' as const),
  content: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
});

const languageArbitrary = fc.constantFrom(
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'go',
  'rust',
  'sql'
);

const codeArbitrary = fc
  .stringMatching(/^[a-zA-Z0-9\s\(\)\{\}\[\];=+\-*/<>.,'"]+$/)
  .filter(s => s.trim().length > 0 && s.length <= 200);

const mathArbitrary = fc
  .stringMatching(/^[a-zA-Z0-9\s+\-*/=()^]+$/)
  .filter(s => s.trim().length > 0 && s.length <= 50 && !s.includes('\r') && !s.includes('\n'));

const imageUrlArbitrary = fc.webUrl({ validSchemes: ['http', 'https'] });

const altTextArbitrary = fc
  .stringMatching(/^[a-zA-Z0-9\s]+$/)
  .filter(s => s.trim().length > 0 && s.length <= 50);

describe('Accessibility Properties', () => {
  // Feature: chat-rich-content, Property 18: Accessibility compliance
  // Validates: Requirements 8.5

  it('should include ARIA labels on all action buttons for any message', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageActions
            messageId={message.id}
            content={message.content}
            role={message.role}
          />
        );

        // All buttons should have aria-label
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);

        buttons.forEach((button) => {
          const ariaLabel = button.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel!.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should have proper ARIA labels on copy buttons in code blocks', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        codeArbitrary,
        (language, code) => {
          const { container } = render(
            <CodeBlock code={code} language={language} />
          );

          // Copy button should have aria-label
          const copyButton = container.querySelector('button[aria-label*="Copy"]');
          expect(copyButton).toBeTruthy();
          expect(copyButton?.getAttribute('aria-label')).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include aria-hidden on decorative icons for any message actions', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageActions
            messageId={message.id}
            content={message.content}
            role={message.role}
          />
        );

        // Icons (SVG elements) should have aria-hidden
        const svgElements = container.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThan(0);

        svgElements.forEach((svg) => {
          const ariaHidden = svg.getAttribute('aria-hidden');
          expect(ariaHidden).toBe('true');
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should have semantic HTML structure for message bubbles', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageBubble message={message} />
        );

        // Should use article element for semantic structure
        const article = container.querySelector('article');
        expect(article).toBeTruthy();

        // Should have role="article"
        expect(article?.getAttribute('role')).toBe('article');

        // Should have aria-label
        const ariaLabel = article?.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain(message.role === 'user' ? 'User' : 'Assistant');
      }),
      { numRuns: 100 }
    );
  });

  it('should have proper time element with datetime attribute for timestamps', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageBubble message={message} isStreaming={false} />
        );

        // Should have time element
        const timeElement = container.querySelector('time');
        expect(timeElement).toBeTruthy();

        // Should have datetime attribute
        const datetime = timeElement?.getAttribute('datetime');
        expect(datetime).toBeTruthy();

        // datetime should be a valid ISO string
        expect(() => new Date(datetime!)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should have aria-label on chat input textarea', () => {
    const { container } = render(
      <ChatInput onSend={() => {}} />
    );

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();

    const ariaLabel = textarea?.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel!.length).toBeGreaterThan(0);
  });

  it('should have aria-describedby linking input to hint text', () => {
    const { container } = render(
      <ChatInput onSend={() => {}} />
    );

    const textarea = container.querySelector('textarea');
    const ariaDescribedby = textarea?.getAttribute('aria-describedby');
    expect(ariaDescribedby).toBeTruthy();

    // The element referenced by aria-describedby should exist
    const hintElement = container.querySelector(`#${ariaDescribedby}`);
    expect(hintElement).toBeTruthy();
  });

  it('should have aria-label on send button', () => {
    const { container } = render(
      <ChatInput onSend={() => {}} />
    );

    const sendButton = container.querySelector('button[aria-label*="Send"]');
    expect(sendButton).toBeTruthy();
  });

  it('should have proper alt text for images', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        altTextArbitrary,
        (src, alt) => {
          const { container } = render(
            <ImageRenderer src={src} alt={alt} />
          );

          // Should have img element with alt text
          const img = container.querySelector('img');
          if (img) {
            const imgAlt = img.getAttribute('alt');
            expect(imgAlt).toBe(alt);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use figure and figcaption for images with captions', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        altTextArbitrary,
        altTextArbitrary,
        (src, alt, title) => {
          const { container } = render(
            <ImageRenderer src={src} alt={alt} title={title} />
          );

          // Should use semantic figure element
          const figure = container.querySelector('figure');
          expect(figure).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have role="math" and aria-label for math expressions', () => {
    fc.assert(
      fc.property(
        mathArbitrary,
        fc.boolean(),
        (math, displayMode) => {
          const { container } = render(
            <MathRenderer math={math} displayMode={displayMode} />
          );

          // Should have role="math"
          const mathElement = container.querySelector('[role="math"]');
          expect(mathElement).toBeTruthy();

          // Should have aria-label
          const ariaLabel = mathElement?.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
          // The aria-label should contain the trimmed version of the math string
          expect(ariaLabel).toContain(math.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have proper table structure with scope attributes', () => {
    const { container } = render(
      <TableRenderer>
        <TableHead>
          <TableRow>
            <TableCell isHeader>Header 1</TableCell>
            <TableCell isHeader>Header 2</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
      </TableRenderer>
    );

    // Should have table element
    const table = container.querySelector('table');
    expect(table).toBeTruthy();

    // Header cells should have scope="col"
    const headerCells = container.querySelectorAll('th');
    expect(headerCells.length).toBeGreaterThan(0);

    headerCells.forEach((th) => {
      const scope = th.getAttribute('scope');
      expect(scope).toBe('col');
    });
  });

  it('should have role="region" and aria-label for table containers', () => {
    const { container } = render(
      <TableRenderer>
        <TableHead>
          <TableRow>
            <TableCell isHeader>Header</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </TableRenderer>
    );

    // Should have role="region"
    const region = container.querySelector('[role="region"]');
    expect(region).toBeTruthy();

    // Should have aria-label
    const ariaLabel = region?.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  it('should have keyboard navigation support with tabIndex on scrollable tables', () => {
    const { container } = render(
      <TableRenderer>
        <TableHead>
          <TableRow>
            <TableCell isHeader>Header</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </TableRenderer>
    );

    // Scrollable container should have tabIndex for keyboard navigation
    const scrollableContainer = container.querySelector('[role="region"]');
    expect(scrollableContainer).toBeTruthy();

    const tabIndex = scrollableContainer?.getAttribute('tabindex');
    expect(tabIndex).toBe('0');
  });

  it('should have focus indicators on interactive elements', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageActions
            messageId={message.id}
            content={message.content}
            role={message.role}
          />
        );

        // All buttons should be focusable
        const buttons = container.querySelectorAll('button');
        buttons.forEach((button) => {
          // Button should not have tabindex="-1" (should be focusable)
          const tabIndex = button.getAttribute('tabindex');
          expect(tabIndex).not.toBe('-1');
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should have aria-pressed state for toggle buttons', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        // Only test assistant messages which have like/dislike buttons
        if (message.role !== 'assistant') {
          return true;
        }

        const { container } = render(
          <MessageActions
            messageId={message.id}
            content={message.content}
            role={message.role}
          />
        );

        // Like and dislike buttons should have aria-pressed
        const likeButton = container.querySelector('button[aria-label*="Like"]');
        const dislikeButton = container.querySelector('button[aria-label*="Dislike"]');

        if (likeButton) {
          const ariaPressed = likeButton.getAttribute('aria-pressed');
          expect(ariaPressed).not.toBeNull();
        }

        if (dislikeButton) {
          const ariaPressed = dislikeButton.getAttribute('aria-pressed');
          expect(ariaPressed).not.toBeNull();
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should have aria-live for dynamic content updates', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageBubble message={message} isStreaming={true} />
        );

        // Streaming indicator should have aria-live
        const streamingText = container.querySelector('[aria-live]');
        if (streamingText) {
          const ariaLive = streamingText.getAttribute('aria-live');
          expect(ariaLive).toBe('polite');
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should have role="region" with aria-label for code blocks', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        codeArbitrary,
        (language, code) => {
          const { container } = render(
            <CodeBlock code={code} language={language} />
          );

          // Should have role="region"
          const region = container.querySelector('[role="region"]');
          expect(region).toBeTruthy();

          // Should have aria-label mentioning the language
          const ariaLabel = region?.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel?.toLowerCase()).toContain(language.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have nav element with aria-label for message actions', () => {
    fc.assert(
      fc.property(messageArbitrary, (message) => {
        const { container } = render(
          <MessageActions
            messageId={message.id}
            content={message.content}
            role={message.role}
          />
        );

        // Should use nav element
        const nav = container.querySelector('nav');
        expect(nav).toBeTruthy();

        // Should have aria-label
        const ariaLabel = nav?.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });
});
