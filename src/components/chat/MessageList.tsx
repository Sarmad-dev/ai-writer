'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
  statusMessage?: string;
  isLoading?: boolean;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

export function MessageList({ 
  messages, 
  streamingContent, 
  isStreaming, 
  statusMessage, 
  isLoading,
  onLike,
  onDislike,
  onShare,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        )}

        {!isLoading && messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
            <p className="text-muted-foreground">
              Ask me anything and I'll generate content for you
            </p>
          </div>
        )}

        {!isLoading && messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={false}
            showActions={true}
            onLike={onLike}
            onDislike={onDislike}
            onShare={onShare}
          />
        ))}

        {isStreaming && (
          <>
            {streamingContent ? (
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                }}
                isStreaming={true}
                streamingContent={streamingContent}
                showActions={false}
              />
            ) : (
              <div className="flex gap-3 justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{statusMessage || 'Thinking...'}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
