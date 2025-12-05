'use client';

import { useQueryState } from 'nuqs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';

export function ChatLayout() {
  const [conversationId, setConversationId] = useQueryState('c');

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatSidebar 
          currentConversationId={conversationId}
          onConversationSelect={setConversationId}
        />
        <main className="flex-1 overflow-hidden">
          <ChatInterface conversationId={conversationId} />
        </main>
      </div>
    </SidebarProvider>
  );
}
