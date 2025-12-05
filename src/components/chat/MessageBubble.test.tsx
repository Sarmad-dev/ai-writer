import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  const mockMessage = {
    id: '1',
    role: 'user' as const,
    content: 'Hello, world!',
    timestamp: new Date('2024-01-01T12:00:00Z'),
  };

  it('renders user message with content', () => {
    render(<MessageBubble message={mockMessage} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders assistant message with markdown', () => {
    const assistantMessage = {
      ...mockMessage,
      role: 'assistant' as const,
      content: '# Hello\n\nThis is **bold** text.',
    };
    render(<MessageBubble message={assistantMessage} />);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  });

  it('displays timestamp', () => {
    render(<MessageBubble message={mockMessage} />);
    // Timestamp should be formatted as HH:MM
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('shows streaming indicator when streaming', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isStreaming={true}
        streamingContent="Partial content..."
      />
    );
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('hides actions when streaming', () => {
    const assistantMessage = {
      ...mockMessage,
      role: 'assistant' as const,
    };
    const { container } = render(
      <MessageBubble
        message={assistantMessage}
        isStreaming={true}
        streamingContent="Streaming..."
      />
    );
    // MessageActions should not be rendered when streaming
    expect(container.querySelector('[aria-label="Copy message"]')).not.toBeInTheDocument();
  });

  it('shows actions for assistant messages when not streaming', () => {
    const assistantMessage = {
      ...mockMessage,
      role: 'assistant' as const,
    };
    render(<MessageBubble message={assistantMessage} />);
    // Should have copy button
    expect(screen.getByLabelText('Copy message')).toBeInTheDocument();
    // Should have like/dislike buttons for assistant
    expect(screen.getByLabelText('Like message')).toBeInTheDocument();
    expect(screen.getByLabelText('Dislike message')).toBeInTheDocument();
  });

  it('shows actions for user messages when not streaming', () => {
    render(<MessageBubble message={mockMessage} />);
    // Should have copy button
    expect(screen.getByLabelText(/Copy message/i)).toBeInTheDocument();
    // Should NOT have like/dislike buttons for user
    expect(screen.queryByLabelText(/Like message/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Dislike message/i)).not.toBeInTheDocument();
  });

  it('can hide actions with showActions prop', () => {
    render(<MessageBubble message={mockMessage} showActions={false} />);
    expect(screen.queryByLabelText(/Copy message/i)).not.toBeInTheDocument();
  });

  it('uses streaming content when provided', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isStreaming={true}
        streamingContent="Streaming content..."
      />
    );
    expect(screen.getByText(/Streaming content.../)).toBeInTheDocument();
    expect(screen.queryByText('Hello, world!')).not.toBeInTheDocument();
  });
});
