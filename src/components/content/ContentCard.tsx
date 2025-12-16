"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

interface ContentCardProps {
  id: string
  title: string
  preview: string
  updatedAt: Date
  wordCount: number
}

export function ContentCard({ id, title, preview, updatedAt, wordCount }: ContentCardProps) {
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
    <Link
      href={`/content/${id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-5 text-primary" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{preview}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(updatedAt)}</span>
        <span>{wordCount.toLocaleString()} words</span>
      </div>
    </Link>
  )
}
