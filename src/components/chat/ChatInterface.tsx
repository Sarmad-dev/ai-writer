'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryState } from 'nuqs';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversationId: string | null;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setConversationId] = useQueryState('c');
  const skipLoadRef = useRef(false);
  const currentConversationRef = useRef<string | null>(null);

  // Load messages when conversation changes
  useEffect(() => {
    // Skip loading if we just updated the URL from within this component
    if (skipLoadRef.current) {
      skipLoadRef.current = false;
      currentConversationRef.current = conversationId;
      return;
    }

    // Only load if conversation actually changed
    if (conversationId && conversationId !== currentConversationRef.current) {
      currentConversationRef.current = conversationId;
      loadMessages(conversationId);
    } else if (!conversationId) {
      currentConversationRef.current = null;
      setMessages([]);
    }
  }, [conversationId]);

  const loadMessages = async (convId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/conversations/${convId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      const data = await response.json();
      
      // Transform API messages to UI format
      const transformedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Start streaming response
    setIsStreaming(true);
    setStreamingContent('');
    setStatusMessage('');

    try {
      // Start streaming via fetch with ReadableStream
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Read the stream
      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === 'status') {
                // Handle status updates
                setStatusMessage(data.status);
              } else if (data.type === 'content') {
                fullContent += data.content;
                setStreamingContent(fullContent);
                setStatusMessage(''); // Clear status when content starts
              } else if (data.type === 'done') {
                // Save the complete message
                const assistantMessage: Message = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: fullContent,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingContent('');
                setStatusMessage('');
                setIsStreaming(false);
                
                // Update URL with conversation ID if this is a new conversation
                if (data.conversationId && !conversationId) {
                  skipLoadRef.current = true; // Skip the next load since we already have the messages
                  setConversationId(data.conversationId);
                }
                return;
              } else if (data.type === 'error') {
                console.error('Streaming error:', data.error);
                setIsStreaming(false);
                setStreamingContent('');
                setStatusMessage('');
                return;
              }
            } catch (e) {
              // Skip invalid JSON
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }

      // If stream ends without 'done' event, save what we have
      if (fullContent) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      setStreamingContent('');
      setIsStreaming(false);


    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Chat</h1>
      </div>

      <MessageList 
        messages={messages}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        statusMessage={statusMessage}
        isLoading={isLoading}
      />

      <ChatInput 
        onSend={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  );
}
