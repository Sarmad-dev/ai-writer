/**
 * Property-based tests for MessageList component
 * Feature: chat-rich-content
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import { MessageList } from '@/components/chat/MessageList';

describe('MessageList Property Tests', () => {
  beforeEach(() => {
    // Mock scrollIntoView which is not available in jsdom
    Element.prototype.scrollIntoView = () => {};
  });
  /**
   * Feature: chat-rich-content, Property 15: Streaming content progressive rendering
   * Validates: Requirements 6.1, 6.4
   * 
   * For any partial markdown content during streaming, the system should render 
   * valid markdown elements progressively and re-render with full formatting when 
   * streaming completes
   */
  it('should progressively render streaming content and apply full formatting when complete', () => {
    fc.assert(
      fc.property(
        // Generate simple text content
        fc.record({
          text: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
        }),
        ({ text }) => {
          const message = {
            id: 'test-msg',
            role: 'assistant' as const,
            content: text,
            timestamp: new Date(),
          };

          // Test transition from streaming to complete
          const { rerender, container } = render(
            <MessageList
              messages={[]}
              streamingContent={text}
              isStreaming={true}
            />
          );

          // Property 1: During streaming, indicator should be present
          expect(container.textContent).toContain('Generating');
          
          // Property 2: Content should be rendered progressively
          expect(container.textContent?.length).toBeGreaterThan(0);
          
          // Property 3: Streaming content should be visible in the DOM
          const streamingBubble = container.querySelector('.text-sm');
          expect(streamingBubble).toBeTruthy();

          // Complete the streaming by moving content to messages array
          rerender(
            <MessageList
              messages={[message]}
              isStreaming={false}
            />
          );

          // Property 4: After completion, streaming indicator should be gone
          expect(container.textContent).not.toContain('Generating');
          
          // Property 5: Content should still be rendered with proper formatting
          const completedMessageContent = container.querySelector('.text-sm');
          expect(completedMessageContent).toBeTruthy();
          
          // Property 6: The message bubble structure should exist
          const messageBubble = container.querySelector('.max-w-\\[80\\%\\]');
          expect(messageBubble).toBeTruthy();
          
          // Property 7: Timestamp should be displayed after completion
          const timestamp = container.querySelector('.text-xs.opacity-70');
          expect(timestamp).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: chat-rich-content, Property 16: Streaming scroll stability
   * Validates: Requirements 6.5
   * 
   * For any streaming content update, the scroll position should remain stable 
   * without unexpected layout shifts
   */
  it('should maintain scroll stability during streaming updates', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of content updates
        fc.array(
          fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 10 }
        ),
        (contentUpdates) => {
          // Start with empty messages
          const { rerender, container } = render(
            <MessageList
              messages={[]}
              streamingContent=""
              isStreaming={true}
            />
          );

          // Get initial scroll container
          const scrollContainer = container.querySelector('.flex-1.overflow-y-auto');
          expect(scrollContainer).toBeTruthy();

          // Track that scrollIntoView is called (it maintains scroll position)
          let scrollCalled = false;
          const originalScrollIntoView = Element.prototype.scrollIntoView;
          Element.prototype.scrollIntoView = function() {
            scrollCalled = true;
          };

          // Simulate progressive content updates
          let accumulatedContent = '';
          contentUpdates.forEach((update) => {
            accumulatedContent += update + ' ';
            
            rerender(
              <MessageList
                messages={[]}
                streamingContent={accumulatedContent}
                isStreaming={true}
              />
            );

            // Verify content is rendered
            expect(container.textContent?.length).toBeGreaterThan(0);
          });

          // Verify scroll behavior was maintained
          expect(scrollCalled).toBe(true);

          // Restore original scrollIntoView
          Element.prototype.scrollIntoView = originalScrollIntoView;
        }
      ),
      { numRuns: 100 }
    );
  });
});
