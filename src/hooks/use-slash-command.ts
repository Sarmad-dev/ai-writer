"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";

export interface UseSlashCommandOptions {
  editor: Editor | null;
  char?: string;
}

export function useSlashCommand({ editor, char = "/" }: UseSlashCommandOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [query, setQuery] = useState("");
  const [range, setRange] = useState({ from: 0, to: 0 });

  const openMenu = useCallback((pos: { x: number; y: number }, textRange: { from: number; to: number }, searchQuery: string = "") => {
    setPosition(pos);
    setRange(textRange);
    setQuery(searchQuery);
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setRange({ from: 0, to: 0 });
  }, []);

  useEffect(() => {
    if (!editor || !editor.view || !editor.view.dom) return;

    const handleUpdate = () => {
      if (!isOpen) return;

      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;

      // Check if we still have a slash command context
      let slashPos = -1;
      let currentQuery = "";

      // Look backwards from cursor to find slash
      for (let i = $from.pos - 1; i >= Math.max(0, $from.pos - 50); i--) {
        const currentChar = state.doc.textBetween(i, i + 1);
        if (currentChar === char) {
          slashPos = i;
          currentQuery = state.doc.textBetween(i + 1, $from.pos);
          break;
        }
        if (currentChar === " " || currentChar === "\n") {
          break;
        }
      }

      if (slashPos === -1) {
        closeMenu();
        return;
      }

      // Update query if it changed
      if (currentQuery !== query) {
        setQuery(currentQuery);
        setRange({ from: slashPos, to: $from.pos });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;

      if (event.key === char) {
        const isAtStart = $from.parentOffset === 0;
        const prevChar = $from.parentOffset > 0 
          ? state.doc.textBetween($from.pos - 1, $from.pos) 
          : "";
        const isAfterSpace = prevChar === " " || prevChar === "\n";

        if (isAtStart || isAfterSpace) {
          // Get cursor position for menu placement
          setTimeout(() => {
            const { view } = editor;
            if (!view || !view.dom) return;
            
            try {
              const coords = view.coordsAtPos($from.pos);
              openMenu(
                { x: coords.left, y: coords.bottom + 8 },
                { from: $from.pos, to: $from.pos + 1 },
                ""
              );
            } catch (error) {
              // Editor view not ready yet
              console.warn("Editor view not ready for slash command");
            }
          }, 0);
        }
      }
    };

    // Listen for editor updates
    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    // Listen for keydown events
    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
      editorElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, char, isOpen, query, openMenu, closeMenu]);

  return {
    isOpen,
    position,
    query,
    range,
    openMenu,
    closeMenu,
  };
}