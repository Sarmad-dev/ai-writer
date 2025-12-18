"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { ContentPreview } from "./ContentPreview";
import { formatDate, formatNumber } from "@/lib/html-utils";
import { useState } from "react";
import { RenameDialog } from "./RenameDialog";
import { DeleteDialog } from "./DeleteDialog";

interface ContentCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  wordCount: number;
  onRename?: (id: string, newTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ContentCard({
  id,
  title,
  content,
  updatedAt,
  wordCount,
  onRename,
  onDuplicate,
  onDelete,
}: ContentCardProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRename = (newTitle: string) => {
    onRename?.(id, newTitle);
    setShowRenameDialog(false);
  };

  const handleDuplicate = () => {
    onDuplicate?.(id);
  };

  const handleDelete = () => {
    onDelete?.(id);
    setShowDeleteDialog(false);
  };

  return (
    <>
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setShowRenameDialog(true);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleDuplicate();
                }}
              >
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="mb-2 font-semibold line-clamp-1">{title}</h3>
        <div className="mb-4 flex-1">
          {content && <ContentPreview content={content} />}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(updatedAt)}</span>
          <span>{formatNumber(wordCount)} words</span>
        </div>
      </Link>

      <RenameDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        currentTitle={title}
        onRename={handleRename}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={title}
        onDelete={handleDelete}
      />
    </>
  );
}
