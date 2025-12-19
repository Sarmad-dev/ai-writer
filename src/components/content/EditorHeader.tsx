"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Redo2,
  Save,
  Share2,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EnhancedDocumentControls } from "./EnhancedDocumentControls";
import { useEditor } from "@/hooks/useEditor";

interface EditorHeaderProps {
  // Optional props for backward compatibility
  title?: string;
  onTitleChange?: (title: string) => void;
  lastSaved?: Date;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function EditorHeader(props: EditorHeaderProps) {
  // Use single hook to avoid duplicate subscriptions
  const { 
    title: storeTitle, 
    lastSaved: storeLastSaved, 
    isDirty, 
    isSaving, 
    setTitle, 
    save, 
    canRedo, 
    canUndo, 
    undo, 
    redo 
  } = useEditor();

  // Use props if provided, otherwise use store values
  const title = props.title ?? storeTitle;
  const lastSaved = props.lastSaved ?? storeLastSaved;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  // Update editedTitle when title changes
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleSave = async () => {
    if (props.onSave) {
      props.onSave();
    } else {
      await save();
    }
  };

  const handleUndo = () => {
    if (props.onUndo) {
      props.onUndo();
    } else {
      undo();
    }
  };

  const handleRedo = () => {
    if (props.onRedo) {
      props.onRedo();
    } else {
      redo();
    }
  };

  const handleTitleSubmit = () => {
    if (props.onTitleChange) {
      props.onTitleChange(editedTitle);
    } else {
      setTitle(editedTitle);
    }
    setIsEditing(false);
  };

  return (
    <TooltipProvider>
      <header className="flex flex-col border-b border-border bg-background">
        {/* Top Row - Title and Actions */}
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" asChild>
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                    <span className="sr-only">Back to dashboard</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to dashboard</TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTitleSubmit();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-8 w-48 text-sm"
                    autoFocus
                    onBlur={handleTitleSubmit}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {title}
                  <Pencil className="size-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {lastSaved && (
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <Clock className="size-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={handleUndo}
                  disabled={!canUndo && !props.onUndo}
                >
                  <Undo2 className="size-4" />
                  <span className="sr-only">Undo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={handleRedo}
                  disabled={!canRedo && !props.onRedo}
                >
                  <Redo2 className="size-4" />
                  <span className="sr-only">Redo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>

            <div className="mx-2 h-6 w-px bg-border" />

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 bg-transparent"
              onClick={handleSave}
              disabled={!isDirty && !props.onSave}
            >
              {isSaving ? (
                <>
                  <Check className="size-4 text-green-500" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {isDirty ? "Save" : "Saved"}
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 bg-transparent"
                >
                  <Share2 className="size-4" />
                  <span className="hidden sm:inline">Share</span>
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 size-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 size-4" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 size-4" />
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Clock className="mr-2 size-4" />
                  Version history
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex h-11 items-center gap-2 overflow-x-auto border-t border-border px-4">
          <EnhancedDocumentControls />
        </div>
      </header>
    </TooltipProvider>
  );
}
