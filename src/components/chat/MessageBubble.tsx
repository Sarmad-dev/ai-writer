'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageActions } from './MessageActions';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'like' | 'dislike' | null;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
  showActions?: boolean;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  isStreaming = false,
  streamingContent,
  showActions = true,
  onLike,
  onDislike,
  onShare,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const displayContent = isStreaming && streamingContent !== undefined ? streamingContent : message.content;

  return (
    <article
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
      role="article"
      aria-label={`${isUser ? 'User' : 'Assistant'} message`}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-popover text-foreground'
            : 'bg-transparent'
        )}
      >
        {/* Message content */}
        <div className="text-sm" role="region" aria-label="Message content">
          {isUser ? (
            // User messages: simple whitespace-preserved text
            <div className="whitespace-pre-wrap wrap-break-word">
              {displayContent}
            </div>
          ) : (
            // Assistant messages: rich markdown rendering
            <MarkdownRenderer
              content={displayContent}
              isStreaming={isStreaming}
            />
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs opacity-70 mt-2 flex items-center gap-2">
          {isStreaming && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              <span aria-live="polite">Generating...</span>
            </>
          )}
          {!isStreaming && (
            <time dateTime={message.timestamp.toISOString()}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          )}
        </div>

        {/* Message actions */}
        {showActions && !isStreaming && (
          <MessageActions
            messageId={message.id}
            content={message.content}
            role={message.role}
            initialFeedback={message.feedback}
            onLike={onLike}
            onDislike={onDislike}
            onShare={onShare}
          />
        )}
      </div>
    </article>
  );
});
