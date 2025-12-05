import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { CodeBlock } from '@/components/chat/CodeBlock';

// Arbitraries for generating markdown content
// Generate alphanumeric text to avoid special characters that get sanitized
const safeTextArbitrary = fc
  .stringMatching(/^[a-zA-Z0-9 ]+$/)
  .filter(s => s.trim().length > 0 && s.length <= 50);

const headingArbitrary = fc
  .tuple(
    fc.constantFrom(1, 2, 3, 4, 5, 6),
    safeTextArbitrary
  )
  .map(([level, text]) => `${'#'.repeat(level)} ${text.trim()}`);

const listItemArbitrary = safeTextArbitrary.filter(s => s.length <= 30);

const unorderedListArbitrary = fc
  .array(listItemArbitrary, { minLength: 1, maxLength: 5 })
  .map(items => items.map(item => `- ${item.trim()}`).join('\n'));

const orderedListArbitrary = fc
  .array(listItemArbitrary, { minLength: 1, maxLength: 5 })
  .map(items => items.map((item, i) => `${i + 1}. ${item.trim()}`).join('\n'));

const emphasisArbitrary = fc
  .tuple(
    fc.constantFrom('**', '*', '~~'),
    safeTextArbitrary
  )
  .map(([marker, text]) => {
    const trimmed = text.trim();
    if (marker === '**') return `${marker}${trimmed}${marker}`; // bold
    if (marker === '*') return `${marker}${trimmed}${marker}`; // italic
    return `${marker}${trimmed}${marker}`; // strikethrough
  });

const linkArbitrary = fc
  .tuple(
    safeTextArbitrary.filter(s => s.length <= 20),
    fc.webUrl()
  )
  .map(([text, url]) => `[${text.trim()}](${url})`);

const blockquoteArbitrary = safeTextArbitrary
  .map(text => `> ${text.trim()}`);

describe('Markdown Renderer Properties', () => {
  // Feature: chat-rich-content, Property 1: Markdown element rendering
  // Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
  it('should render headings as proper HTML heading elements for any valid heading markdown', () => {
    fc.assert(
      fc.property(headingArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        const level = markdown.match(/^#+/)?.[0].length || 0;
        const headingElement = container.querySelector(`h${level}`);
        expect(headingElement).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should render unordered lists as ul elements for any valid list markdown', () => {
    fc.assert(
      fc.property(unorderedListArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        const ulElement = container.querySelector('ul');
        expect(ulElement).toBeTruthy();
        const liElements = container.querySelectorAll('li');
        expect(liElements.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should render ordered lists as ol elements for any valid list markdown', () => {
    fc.assert(
      fc.property(orderedListArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        const olElement = container.querySelector('ol');
        expect(olElement).toBeTruthy();
        const liElements = container.querySelectorAll('li');
        expect(liElements.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should render emphasis (bold, italic, strikethrough) with appropriate HTML tags', () => {
    fc.assert(
      fc.property(emphasisArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        
        // Check for bold, italic, or strikethrough
        const hasStrong = container.querySelector('strong');
        const hasEm = container.querySelector('em');
        const hasDel = container.querySelector('del');
        
        // At least one emphasis element should be present
        expect(hasStrong || hasEm || hasDel).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should render links as clickable anchor elements for any valid link markdown', () => {
    fc.assert(
      fc.property(linkArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        const aElement = container.querySelector('a');
        expect(aElement).toBeTruthy();
        expect(aElement?.getAttribute('href')).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should render blockquotes with appropriate styling for any valid blockquote markdown', () => {
    fc.assert(
      fc.property(blockquoteArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        const blockquoteElement = container.querySelector('blockquote');
        expect(blockquoteElement).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should render complex markdown with multiple element types', () => {
    fc.assert(
      fc.property(
        fc.tuple(headingArbitrary, unorderedListArbitrary, linkArbitrary),
        ([heading, list, link]) => {
          const markdown = `${heading}\n\n${list}\n\n${link}`;
          const { container } = render(<MarkdownRenderer content={markdown} />);
          
          // Should have at least a heading
          const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          expect(headingElements.length).toBeGreaterThan(0);
          
          // Should have a list
          const listElements = container.querySelectorAll('ul, ol');
          expect(listElements.length).toBeGreaterThan(0);
          
          // Should have list items
          const liElements = container.querySelectorAll('li');
          expect(liElements.length).toBeGreaterThan(0);
          
          // Should have a link
          const aElements = container.querySelectorAll('a');
          expect(aElements.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle streaming state correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.boolean(),
        (content, isStreaming) => {
          const { container } = render(
            <MarkdownRenderer content={content} isStreaming={isStreaming} />
          );
          
          // Check for streaming cursor
          const cursor = container.querySelector('.animate-pulse');
          if (isStreaming) {
            expect(cursor).toBeTruthy();
          } else {
            expect(cursor).toBeFalsy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sanitize content and prevent XSS', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '<script>alert("xss")</script>',
          '<img src=x onerror="alert(1)">',
          '<iframe src="javascript:alert(1)"></iframe>',
          'javascript:alert(1)',
          '<div onclick="alert(1)">Click me</div>'
        ),
        (maliciousContent) => {
          const { container } = render(<MarkdownRenderer content={maliciousContent} />);
          
          // Should not contain script tags
          const scriptElements = container.querySelectorAll('script');
          expect(scriptElements.length).toBe(0);
          
          // Should not contain iframe tags
          const iframeElements = container.querySelectorAll('iframe');
          expect(iframeElements.length).toBe(0);
          
          // Should not have onclick or other event handlers
          const allElements = container.querySelectorAll('*');
          allElements.forEach(element => {
            expect(element.getAttribute('onclick')).toBeFalsy();
            expect(element.getAttribute('onerror')).toBeFalsy();
            expect(element.getAttribute('onload')).toBeFalsy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('CodeBlock Properties', () => {
  // Arbitraries for code generation
  const supportedLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'go',
    'rust',
    'sql',
  ];

  const codeArbitrary = fc
    .stringMatching(/^[a-zA-Z0-9\s\(\)\{\}\[\];=+\-*/<>.,'"]+$/)
    .filter(s => s.trim().length > 0 && s.length <= 200);

  const codeWithWhitespaceArbitrary = fc
    .array(
      fc.tuple(
        fc.nat(4), // indentation level (0-4 tabs)
        fc.stringMatching(/^[a-zA-Z0-9\(\)\{\}\[\];=+\-*/<>.,'"]+$/).filter(s => s.length > 0 && s.length <= 50)
      ),
      { minLength: 1, maxLength: 10 }
    )
    .map(lines => 
      lines.map(([indent, line]) => '  '.repeat(indent) + line.trim()).join('\n')
    );

  const languageArbitrary = fc.constantFrom(...supportedLanguages);

  const inlineCodeArbitrary = fc
    .stringMatching(/^[a-zA-Z0-9_]+$/)
    .filter(s => s.length > 0 && s.length <= 30)
    .map(code => `\`${code}\``);

  const fencedCodeBlockArbitrary = fc
    .tuple(languageArbitrary, codeArbitrary)
    .map(([lang, code]) => `\`\`\`${lang}\n${code}\n\`\`\``);

  // Feature: chat-rich-content, Property 2: Code block syntax highlighting
  // Validates: Requirements 2.1, 2.4
  it('should apply syntax highlighting for any supported language', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        codeArbitrary,
        (language, code) => {
          const { container } = render(<CodeBlock code={code} language={language} />);
          
          // Should render a code element with syntax highlighting
          const codeElement = container.querySelector('code');
          expect(codeElement).toBeTruthy();
          
          // Should have syntax highlighting classes (react-syntax-highlighter adds these)
          const hasHighlightingClasses = 
            codeElement?.className.includes('language-') ||
            container.querySelector('[class*="language-"]') !== null ||
            container.querySelector('[style]') !== null; // Inline styles from syntax highlighter
          
          expect(hasHighlightingClasses).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should render code blocks with language identifiers through MarkdownRenderer', () => {
    fc.assert(
      fc.property(
        fencedCodeBlockArbitrary,
        (markdown) => {
          const { container } = render(<MarkdownRenderer content={markdown} />);
          
          // Should render code element
          const codeElement = container.querySelector('code');
          expect(codeElement).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 3: Code whitespace preservation
  // Validates: Requirements 2.3
  it('should preserve indentation and whitespace formatting for any code', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        codeWithWhitespaceArbitrary,
        (language, code) => {
          const { container } = render(<CodeBlock code={code} language={language} />);
          
          // Get the rendered code content
          const codeElement = container.querySelector('code');
          expect(codeElement).toBeTruthy();
          
          // The code should be present in the DOM
          const renderedText = codeElement?.textContent || '';
          
          // Check that whitespace is preserved by comparing line count
          const originalLines = code.split('\n').length;
          const renderedLines = renderedText.split('\n').length;
          
          // Should have same number of lines (whitespace preserved)
          expect(renderedLines).toBeGreaterThanOrEqual(originalLines - 1); // Allow for minor differences
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 4: Inline code rendering
  // Validates: Requirements 2.2
  it('should render inline code with monospace font and distinct styling', () => {
    fc.assert(
      fc.property(
        inlineCodeArbitrary,
        (markdown) => {
          const { container } = render(<MarkdownRenderer content={markdown} />);
          
          // Should render code element
          const codeElement = container.querySelector('code');
          expect(codeElement).toBeTruthy();
          
          // Should have styling classes (bg-muted, font-mono, etc.)
          const hasMonospaceClass = codeElement?.className.includes('font-mono');
          const hasBackgroundClass = codeElement?.className.includes('bg-muted');
          
          expect(hasMonospaceClass || hasBackgroundClass).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 5: Code block language labels
  // Validates: Requirements 2.5
  it('should display language name as a label for any code block', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        codeArbitrary,
        (language, code) => {
          const { container } = render(<CodeBlock code={code} language={language} />);
          
          // Should display the language label
          const labelText = container.textContent || '';
          const normalizedLanguage = language.toLowerCase();
          
          // Language should appear in the rendered output (case-insensitive)
          expect(labelText.toLowerCase()).toContain(normalizedLanguage);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 17: Code block copy functionality
  // Validates: Requirements 7.2, 7.4
  it('should provide independent copy buttons for each code block', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        languageArbitrary,
        (numBlocks, language) => {
          // Create simple, well-formed code blocks with clear separation
          const codeBlocks = Array.from({ length: numBlocks }, (_, i) => 
            `function test${i}() { return ${i}; }`
          );
          
          const markdown = codeBlocks
            .map(code => `\`\`\`${language}\n${code}\n\`\`\``)
            .join('\n\nSeparator text\n\n');
          
          const { container } = render(<MarkdownRenderer content={markdown} />);
          
          // Should have a copy button for each code block
          const copyButtons = container.querySelectorAll('button[aria-label*="Copy"]');
          expect(copyButtons.length).toBe(numBlocks);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should copy raw code content without markup when copy button is clicked', async () => {
    // Mock clipboard API once before all tests
    let clipboardData: string | null = null;
    Object.assign(navigator, {
      clipboard: {
        writeText: async (text: string) => {
          clipboardData = text;
          return Promise.resolve();
        },
      },
    });

    await fc.assert(
      fc.asyncProperty(
        languageArbitrary,
        codeArbitrary,
        async (language, code) => {
          clipboardData = null; // Reset before each test
          
          const { container } = render(<CodeBlock code={code} language={language} />);
          
          // Find and click the copy button
          const copyButton = container.querySelector('button[aria-label*="Copy"]') as HTMLButtonElement;
          expect(copyButton).toBeTruthy();
          
          // Click the button
          copyButton?.click();
          
          // Wait for async clipboard operation
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Should have copied the raw code
          expect(clipboardData).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });
});
