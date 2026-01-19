"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  useContentSessions,
  useDeleteSession,
  useDuplicateSession,
  useCreateSession,
} from "@/hooks/use-content-sessions";
import { cn } from "@/lib/utils";
import {
  FileText,
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Copy,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ContentSidebarProps {
  activeId?: string;
}

export function ContentSidebar({ activeId }: ContentSidebarProps) {
  const { data, isLoading } = useContentSessions();
  const deleteSession = useDeleteSession();
  const duplicateSession = useDuplicateSession();
  const createSession = useCreateSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");

  const filteredContent = data?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-linear-to-b from-muted/30 to-muted/10">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="text-sm font-semibold">My Content</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          <span className="sr-only">New content</span>
        </Button>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="text-primary animate-spin size-6" />
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredContent?.map((item) => (
            <Link
              href={`/content/${item.id}`}
              key={item.id}
              className={cn(
                "group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent",
                activeId === item.id && "bg-accent"
              )}
            >
              {item.contentType === "folder" ? (
                <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(new Date(item.updatedAt))}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await duplicateSession.mutateAsync({
                          sessionId: item.id,
                        });
                        toast.success("Success", {
                          description: "Content duplicated successfully",
                        });
                      } catch {
                        toast.error("Error", {
                          description: "Failed to duplicate content",
                        });
                      }
                    }}
                  >
                    <Copy className="mr-2 size-3" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(item.id);
                      setDeleteTitle(item.title);
                    }}
                  >
                    <Trash2 className="mr-2 size-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setNewTitle("");
            setNewPrompt("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newTitle.trim()) {
                toast.error("Please enter a title for your session");
                return;
              }
              try {
                const session = await createSession.mutateAsync({
                  title: newTitle.trim(),
                  prompt: newPrompt.trim() || undefined,
                  content: "",
                });
                toast.success("Session created successfully!");
                setCreateOpen(false);
                setNewTitle("");
                setNewPrompt("");
                router.push(`/content/${session.id}`);
              } catch (error) {
                console.error("Error creating session:", error);
                toast.error("Failed to create session");
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Start a new content session. You can add a title and optional
                prompt to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sidebar-new-title">Title *</Label>
                <Input
                  id="sidebar-new-title"
                  placeholder="Enter session title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sidebar-new-prompt">
                  Initial Prompt (Optional)
                </Label>
                <Textarea
                  id="sidebar-new-prompt"
                  placeholder="Enter an initial prompt or idea for your content..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setNewTitle("");
                  setNewPrompt("");
                }}
                disabled={createSession.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSession.isPending}>
                {createSession.isPending ? "Creating..." : "Create Session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
            setDeleteTitle("");
          }
        }}
        title={deleteTitle}
        onDelete={async () => {
          if (!deleteId) return;
          try {
            await deleteSession.mutateAsync(deleteId);
            toast.success("Success", { description: "Content deleted successfully" });
          } catch {
            toast.error("Error", { description: "Failed to delete content" });
          } finally {
            setDeleteId(null);
            setDeleteTitle("");
          }
        }}
      />
    </aside>
  );
}
