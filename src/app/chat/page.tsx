"use client";

import { Suspense } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Loader2 } from "lucide-react";

function ChatContent() {
  return <ChatLayout />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin size-4 text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
