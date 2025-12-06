import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { renderHook, waitFor } from '@testing-library/react';
import { useTipTapEditor } from '@/components/editor/useTipTapEditor';
import { useAutoSave } from '@/components/editor/useAutoSave';

// Arbitraries for generating test data
const htmlContentArbitrary = fc.oneof(
  fc.constant(''),
  fc.constant('<p>Hello World</p>'),
  fc.constant('<h1>Title</h1><p>Content</p>'),
  fc.constant('<p><strong>Bold</strong> and <em>italic</em> text</p>'),
  fc.constant('<ul><li>Item 1</li><li>Item 2</li></ul>'),
  fc.constant('<ol><li>First</li><li>Second</li></ol>'),
  fc.constant('<blockquote><p>Quote</p></blockquote>'),
  fc.string({ minLength: 0, maxLength: 100 }).map(text => `<p>${text}</p>`)
);

const formattingArbitrary = fc.record({
  bold: fc.boolean(),
  italic: fc.boolean(),
  strike: fc.boolean(),
  code: fc.boolean(),
});

describe('Editor Properties', () => {
  // Feature: ai-content-writer, Property 24: Content display in editor
  it('should display any generated content in the TipTap editor with proper formatting', async () => {
    await fc.assert(
      fc.asyncProperty(htmlContentArbitrary, async (content) => {
        const { result } = renderHook(() =>
          useTipTapEditor({
            content,
            editable: true,
          })
        );

        // Wait for editor to be initialized
        await waitFor(() => {
          expect(result.current).not.toBeNull();
        });

        const editor = result.current;
        if (!editor) {
          throw new Error('Editor not initialized');
        }

        // Verify content is loaded in editor
        const editorContent = editor.getHTML();
        expect(editorContent).toBeDefined();
        
        // For non-empty content, verify it's present in the editor
        if (content && content.trim() !== '') {
          expect(editorContent.length).toBeGreaterThan(0);
        }

        // Cleanup
        editor.destroy();
      }),
      { numRuns: 20 }
    );
  });

  // Feature: ai-content-writer, Property 25: Real-time content updates
  it('should update content state immediately for any text modification in the editor', async () => {
    await fc.assert(
      fc.asyncProperty(
        htmlContentArbitrary,
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s)),
        async (initialContent, newText) => {
          let capturedContent = '';
          const onUpdate = vi.fn((content: string) => {
            capturedContent = content;
          });

          const { result } = renderHook(() =>
            useTipTapEditor({
              content: initialContent,
              onUpdate,
              editable: true,
            })
          );

          // Wait for editor to be initialized
          await waitFor(() => {
            expect(result.current).not.toBeNull();
          });

          const editor = result.current;
          if (!editor) {
            throw new Error('Editor not initialized');
          }

          // Insert new text
          editor.commands.insertContent(newText);

          // Wait for update callback
          await waitFor(() => {
            expect(onUpdate).toHaveBeenCalled();
          });

          // Verify content was updated - check the text content, not HTML
          const editorText = editor.getText();
          expect(editorText).toContain(newText);

          // Cleanup
          editor.destroy();
        }
      ),
      { numRuns: 20 }
    );
  });

  // Feature: ai-content-writer, Property 26: Content save and load round-trip
  it('should preserve all formatting when saving and loading content with any formatting combination', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0),
        formattingArbitrary,
        async (text, formatting) => {
          // Create initial editor with text
          const { result: result1 } = renderHook(() =>
            useTipTapEditor({
              content: `<p>${text}</p>`,
              editable: true,
            })
          );

          await waitFor(() => {
            expect(result1.current).not.toBeNull();
          });

          const editor1 = result1.current;
          if (!editor1) {
            throw new Error('Editor not initialized');
          }

          // Select all text
          editor1.commands.selectAll();

          // Apply formatting
          if (formatting.bold) {
            editor1.commands.toggleBold();
          }
          if (formatting.italic) {
            editor1.commands.toggleItalic();
          }
          if (formatting.strike) {
            editor1.commands.toggleStrike();
          }
          if (formatting.code) {
            editor1.commands.toggleCode();
          }

          // Get the formatted HTML
          const savedContent = editor1.getHTML();

          // Cleanup first editor
          editor1.destroy();

          // Create new editor with saved content
          const { result: result2 } = renderHook(() =>
            useTipTapEditor({
              content: savedContent,
              editable: true,
            })
          );

          await waitFor(() => {
            expect(result2.current).not.toBeNull();
          });

          const editor2 = result2.current;
          if (!editor2) {
            throw new Error('Second editor not initialized');
          }

          // Verify formatting is preserved by comparing HTML
          const loadedContent = editor2.getHTML();
          expect(loadedContent).toBe(savedContent);

          // Cleanup
          editor2.destroy();
        }
      ),
      { numRuns: 20 }
    );
  });

  // Additional test for auto-save functionality
  it('should trigger auto-save after debounce delay for any non-empty content change', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).map(text => `<p>${text}</p>`),
        fc.integer({ min: 100, max: 300 }),
        async (content, delay) => {
          const onSave = vi.fn(async () => {});

          const { result, rerender } = renderHook(
            ({ content }) => useAutoSave({
              content,
              onSave,
              delay,
              enabled: true,
            }),
            { initialProps: { content: '' } }
          );

          // Update content to trigger auto-save
          rerender({ content });

          // Wait for debounce delay plus buffer
          await new Promise(resolve => setTimeout(resolve, delay + 200));

          // Verify save was called
          await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(content);
          }, { timeout: delay + 500 });

          // Verify save status
          expect(result.current.saveStatus).toBe('saved');
        }
      ),
      { numRuns: 10 }
    );
  });
});
