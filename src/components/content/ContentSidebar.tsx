"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileText, FolderOpen, MoreHorizontal, Plus, Search } from "lucide-react"
import { useState } from "react"

interface ContentItem {
  id: string
  title: string
  updatedAt: Date
  type: "document" | "folder"
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "Blog Post: AI in 2025",
    updatedAt: new Date(),
    type: "document",
  },
  {
    id: "2",
    title: "Marketing Copy",
    updatedAt: new Date(Date.now() - 86400000),
    type: "document",
  },
  {
    id: "3",
    title: "Product Description",
    updatedAt: new Date(Date.now() - 172800000),
    type: "document",
  },
  {
    id: "4",
    title: "Email Newsletter",
    updatedAt: new Date(Date.now() - 259200000),
    type: "document",
  },
  {
    id: "5",
    title: "Social Media Posts",
    updatedAt: new Date(Date.now() - 345600000),
    type: "folder",
  },
  {
    id: "6",
    title: "Landing Page Copy",
    updatedAt: new Date(Date.now() - 432000000),
    type: "document",
  },
]

interface ContentSidebarProps {
  activeId?: string
}

export function ContentSidebar({ activeId }: ContentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContent = mockContent.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-linear-to-b from-muted/30 to-muted/10">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="text-sm font-semibold">My Content</h2>
        <Button variant="ghost" size="icon" className="size-7">
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

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent",
                activeId === item.id && "bg-accent",
              )}
            >
              {item.type === "folder" ? (
                <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(item.updatedAt)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
