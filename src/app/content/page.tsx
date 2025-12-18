"use client";

import { ContentCard } from "@/components/content/ContentCard";
import { ContentHeader } from "@/components/content/ContentHeader";
import { ContentListItem } from "@/components/content/ContentListItem";
import { useState } from "react";
import {
  useContentSessions,
  useUpdateSession,
  useDeleteSession,
  useDuplicateSession,
} from "@/hooks/use-content-sessions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Recent");

  const { data: sessions, isLoading, error } = useContentSessions();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const duplicateSession = useDuplicateSession();

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await updateSession.mutateAsync({
        id,
        data: { title: newTitle },
      });
      toast.success("Success", { description: "Content renamed successfully" });
    } catch (error) {
      toast.error("Error", { description: "Failed to rename content" });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateSession.mutateAsync({ sessionId: id });
      toast.success("Success", {
        description: "Content duplicated successfully",
      });
    } catch (error) {
      toast("Error", { description: "Failed to duplicate content" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession.mutateAsync(id);
      toast("Success", { description: "Content deleted successfully" });
    } catch (error) {
      toast("Error", { description: "Failed to delete content" });
    }
  };

  const filteredContent = (sessions || [])
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "Recent") {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      if (sortBy === "Alphabetical") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "Word Count") {
        return b.wordCount - a.wordCount;
      }
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!!error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-lg font-medium text-destructive">
          Failed to load content
        </p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ContentHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <main className="flex-1 p-6">
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                content={item.content}
                updatedAt={item.updatedAt}
                wordCount={item.wordCount}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContent.map((item) => (
              <ContentListItem
                key={item.id}
                id={item.id}
                title={item.title}
                content={item.content}
                updatedAt={item.updatedAt}
                wordCount={item.wordCount}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
        {filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">No content found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first content to get started"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
