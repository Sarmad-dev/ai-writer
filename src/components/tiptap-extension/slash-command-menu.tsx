"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Editor } from "@tiptap/react";

// Icons
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Table,
  Minus,
  CheckSquare,
  Calculator,
  BarChart3
} from "lucide-react";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  command: (editor: Editor) => void;
  keywords?: string[];
}

export const defaultSlashCommands: SlashCommandItem[] = [
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
    title: "Image",
    description: "Upload an image",
    icon: Image,
    command: (editor) => {
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    keywords: ["image", "img", "picture"],
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
  {
    title: "Math Block",
    description: "Insert a math equation block",
    icon: Calculator,
    command: (editor) => editor.chain().focus().insertContent({ type: "blockMath", attrs: { content: "E = mc^2" } }).run(),
    keywords: ["math", "equation", "latex"],
  },
  {
    title: "Chart",
    description: "Insert a chart or graph",
    icon: BarChart3,
    command: (editor) => {
      // This would trigger your chart insertion logic
      editor.chain().focus().insertContent({ type: "graphNode" }).run();
    },
    keywords: ["chart", "graph", "visualization"],
  },
];

export interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  editor: Editor;
  range: { from: number; to: number };
}

export interface SlashCommandMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command, editor, range }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="slash-command-menu bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-80 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, index) => (
            <button
              key={index}
              className={`w-full text-left p-2 rounded-md flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedIndex ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              onClick={() => selectItem(index)}
            >
              <item.icon className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="p-2 text-gray-500 text-sm">No results</div>
        )}
      </div>
    );
  }
);

SlashCommandMenu.displayName = "SlashCommandMenu";