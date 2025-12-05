'use client';

import { Suspense } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';

function ChatContent() {
  return <ChatLayout />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
