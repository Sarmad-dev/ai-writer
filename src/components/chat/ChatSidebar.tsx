"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string | null) => void;
}

export function ChatSidebar({
  currentConversationId,
  onConversationSelect,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const { state } = useSidebar();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    onConversationSelect(null);
  };

  // Refresh conversations when current conversation changes
  useEffect(() => {
    if (currentConversationId && currentConversationId !== "new") {
      // Check if this conversation is already in the list
      const exists = conversations.some((c) => c.id === currentConversationId);
      if (!exists) {
        fetchConversations();
      }
    }
  }, [currentConversationId]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`border-b ${state === "expanded" ? "p-4" : "p-2"}`}>
        <div className="flex items-center justify-between">
          {state === "expanded" && (
            <h2 className="text-lg font-semibold">Chat</h2>
          )}
          <SidebarTrigger />
        </div>
        <Button
          onClick={handleNewChat}
          className={
            state === "expanded"
              ? "w-full mt-3"
              : "flex items-center! justify-center!"
          }
          size={state === "expanded" ? "sm" : "icon-sm"}
        >
          <Plus className="h-4 w-4 mr-2" />
          {state === "expanded" && "New Chat"}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No conversations yet
              </p>
            ) : (
              <SidebarMenu>
                {conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      onClick={() => onConversationSelect(conversation.id)}
                      isActive={currentConversationId === conversation.id}
                      className={cn(
                        "w-full justify-start",
                        currentConversationId === conversation.id && "bg-accent"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{conversation.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
