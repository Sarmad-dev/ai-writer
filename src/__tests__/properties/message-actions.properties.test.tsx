import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, fireEvent } from '@testing-library/react';
import { MessageActions } from '@/components/chat/MessageActions';

describe('MessageActions Properties', () => {
  // Arbitraries for generating test data
  const messageIdArbitrary = fc.uuid();
  const contentArbitrary = fc.string({ minLength: 1, maxLength: 500 });
  const roleArbitrary = fc.constantFrom('user' as const, 'assistant' as const);

  // Feature: chat-rich-content, Property 10: Assistant message feedback buttons
  // Validates: Requirements 4.3, 4.4
  it('should provide like and dislike buttons for assistant messages and update state when clicked', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        (messageId, content) => {
          const { container, rerender } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
            />
          );

          // Should have like and dislike buttons for assistant messages
          const likeButton = container.querySelector('button[aria-label="Like message"]');
          const dislikeButton = container.querySelector('button[aria-label="Dislike message"]');

          expect(likeButton).toBeTruthy();
          expect(dislikeButton).toBeTruthy();

          // Initially, neither button should be pressed
          expect(likeButton?.getAttribute('aria-pressed')).toBe('false');
          expect(dislikeButton?.getAttribute('aria-pressed')).toBe('false');

          // Click like button
          if (likeButton) {
            fireEvent.click(likeButton);
          }

          // Re-render to get updated state
          rerender(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
            />
          );

          // After clicking, like button should be pressed
          const updatedLikeButton = container.querySelector('button[aria-label="Like message"]');
          expect(updatedLikeButton?.getAttribute('aria-pressed')).toBe('true');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not provide like and dislike buttons for user messages', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        (messageId, content) => {
          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role="user"
            />
          );

          // Should NOT have like and dislike buttons for user messages
          const likeButton = container.querySelector('button[aria-label="Like message"]');
          const dislikeButton = container.querySelector('button[aria-label="Dislike message"]');

          expect(likeButton).toBeFalsy();
          expect(dislikeButton).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should toggle feedback state when clicking the same button twice', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        (messageId, content) => {
          const { container, rerender } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
            />
          );

          const likeButton = container.querySelector('button[aria-label="Like message"]') as HTMLButtonElement;
          expect(likeButton).toBeTruthy();

          // Click like button once
          fireEvent.click(likeButton);
          
          // Re-render to get updated state
          rerender(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
            />
          );

          // Should be pressed
          const updatedLikeButton1 = container.querySelector('button[aria-label="Like message"]');
          expect(updatedLikeButton1?.getAttribute('aria-pressed')).toBe('true');

          // Click like button again
          if (updatedLikeButton1) {
            fireEvent.click(updatedLikeButton1);
          }

          // Re-render again
          rerender(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
            />
          );

          // Should be unpressed (toggled off)
          const updatedLikeButton2 = container.querySelector('button[aria-label="Like message"]');
          expect(updatedLikeButton2?.getAttribute('aria-pressed')).toBe('false');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should call onLike callback when like button is clicked', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        (messageId, content) => {
          let callbackInvoked = false;
          let callbackMessageId = '';

          const handleLike = (id: string) => {
            callbackInvoked = true;
            callbackMessageId = id;
          };

          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
              onLike={handleLike}
            />
          );

          const likeButton = container.querySelector('button[aria-label="Like message"]') as HTMLButtonElement;
          expect(likeButton).toBeTruthy();

          // Click like button
          fireEvent.click(likeButton);

          // Callback should have been invoked with correct messageId
          expect(callbackInvoked).toBe(true);
          expect(callbackMessageId).toBe(messageId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should call onDislike callback when dislike button is clicked', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        (messageId, content) => {
          let callbackInvoked = false;
          let callbackMessageId = '';

          const handleDislike = (id: string) => {
            callbackInvoked = true;
            callbackMessageId = id;
          };

          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role="assistant"
              onDislike={handleDislike}
            />
          );

          const dislikeButton = container.querySelector('button[aria-label="Dislike message"]') as HTMLButtonElement;
          expect(dislikeButton).toBeTruthy();

          // Click dislike button
          fireEvent.click(dislikeButton);

          // Callback should have been invoked with correct messageId
          expect(callbackInvoked).toBe(true);
          expect(callbackMessageId).toBe(messageId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide copy button for all messages regardless of role', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        roleArbitrary,
        (messageId, content, role) => {
          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role={role}
            />
          );

          // Should always have a copy button
          const copyButton = container.querySelector('button[aria-label*="Copy"]');
          expect(copyButton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide share button for all messages regardless of role', () => {
    fc.assert(
      fc.property(
        messageIdArbitrary,
        contentArbitrary,
        roleArbitrary,
        (messageId, content, role) => {
          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role={role}
            />
          );

          // Should always have a share button
          const shareButton = container.querySelector('button[aria-label="Share message"]');
          expect(shareButton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should copy message content to clipboard when copy button is clicked', async () => {
    // Mock clipboard API
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
        messageIdArbitrary,
        contentArbitrary,
        roleArbitrary,
        async (messageId, content, role) => {
          clipboardData = null; // Reset before each test

          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role={role}
            />
          );

          const copyButton = container.querySelector('button[aria-label*="Copy"]') as HTMLButtonElement;
          expect(copyButton).toBeTruthy();

          // Click the copy button
          fireEvent.click(copyButton);

          // Wait for async clipboard operation
          await new Promise(resolve => setTimeout(resolve, 50));

          // Should have copied the message content
          expect(clipboardData).toBe(content);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show visual feedback after copying', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: async () => Promise.resolve(),
      },
    });

    await fc.assert(
      fc.asyncProperty(
        messageIdArbitrary,
        contentArbitrary,
        roleArbitrary,
        async (messageId, content, role) => {
          const { container } = render(
            <MessageActions
              messageId={messageId}
              content={content}
              role={role}
            />
          );

          const copyButton = container.querySelector('button[aria-label*="Copy"]') as HTMLButtonElement;
          expect(copyButton).toBeTruthy();

          // Initial state should show "Copy"
          expect(copyButton.getAttribute('aria-label')).toBe('Copy message');

          // Click the copy button
          fireEvent.click(copyButton);

          // Wait for state update
          await new Promise(resolve => setTimeout(resolve, 50));

          // Should show "Copied" feedback
          const updatedButton = container.querySelector('button[aria-label="Copied"]');
          expect(updatedButton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
