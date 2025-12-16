"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { createPortal } from "react-dom";

// Icons
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Table,
  Minus,
  CheckSquare,
} from "lucide-react";
export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  command: (editor: Editor) => void | boolean | Promise<void>;
  keywords?: string[];
}

const basicSlashCommands: SlashCommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    keywords: ["h1", "heading", "title"],
  },
  {
    title: "Heading 2", 
    description: "Medium section heading",
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    keywords: ["h2", "heading", "subtitle"],
  },
  {
    title: "Heading 3",
    description: "Small section heading", 
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    keywords: ["h3", "heading"],
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: List,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    keywords: ["ul", "list", "bullet"],
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    keywords: ["ol", "list", "numbered", "ordered"],
  },
  {
    title: "Task List",
    description: "Create a task list with checkboxes",
    icon: CheckSquare,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
    keywords: ["todo", "task", "checkbox"],
  },
  {
    title: "Quote",
    description: "Create a blockquote",
    icon: Quote,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    keywords: ["quote", "blockquote"],
  },
  {
    title: "Code Block",
    description: "Create a code block",
    icon: Code,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    keywords: ["code", "codeblock"],
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: Table,
    command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    keywords: ["table", "grid"],
  },
  {
    title: "Horizontal Rule",
    description: "Insert a horizontal divider",
    icon: Minus,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    keywords: ["hr", "divider", "line"],
  },
];

// Use only basic commands for slash menu
export const defaultSlashCommands: SlashCommandItem[] = basicSlashCommands;

export interface SlashCommandMenuProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  query: string;
  range: { from: number; to: number };
}

export function SlashCommandMenu({
  editor,
  isOpen,
  onClose,
  position,
  query,
  range,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<SlashCommandItem[]>([]);

  // Filter items based on query
  useEffect(() => {
    const filtered = defaultSlashCommands.filter((item) => {
      if (!query) return true;
      const searchText = `${item.title} ${item.description} ${item.keywords?.join(" ") || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(async (item: SlashCommandItem) => {
    // Remove the slash and query text
    editor.chain().focus().deleteRange(range).run();
    
    // Execute the command (handle both sync and async)
    try {
      await item.command(editor);
    } catch (error) {
      console.error("Command execution failed:", error);
    }
    
    onClose();
  }, [editor, range, onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev + filteredItems.length - 1) % filteredItems.length);
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        break;
      case "Enter":
        event.preventDefault();
        if (filteredItems[selectedIndex]) {
          executeCommand(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, filteredItems, selectedIndex, executeCommand, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || filteredItems.length === 0) return null;

  return createPortal(
    <div
      className="slash-command-menu bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-80 overflow-y-auto min-w-[280px] z-1000"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
      }}
    >
      {filteredItems.map((item, index) => (
        <button
          key={index}
          className={`w-full text-left p-2 rounded-md flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            index === selectedIndex ? "bg-gray-100 dark:bg-gray-700" : ""
          }`}
          onClick={() => executeCommand(item)}
        >
          <item.icon className="w-4 h-4 text-gray-500 shrink-0" />
          <div>
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {item.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
}