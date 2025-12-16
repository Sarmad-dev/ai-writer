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

interface ContentListItemProps {
  id: string
  title: string
  preview: string
  updatedAt: Date
  wordCount: number
}

export function ContentListItem({ id, title, preview, updatedAt, wordCount }: ContentListItemProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Link
      href={`/content/${id}`}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="truncate text-sm text-muted-foreground">{preview}</p>
      </div>
      <div className="hidden shrink-0 text-sm text-muted-foreground sm:block">{wordCount.toLocaleString()} words</div>
      <div className="hidden shrink-0 text-sm text-muted-foreground md:block">{formatDate(updatedAt)}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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
    </Link>
  )
}
