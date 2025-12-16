"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";

export interface UseAIFloatingMenuOptions {
  editor: Editor | null;
  triggerKey?: string;
  showOnSelection?: boolean;
}

export function useAIFloatingMenu({ 
  editor, 
  triggerKey = "Control+k",
  showOnSelection = true 
}: UseAIFloatingMenuOptions) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showMenu = useCallback((pos?: { x: number; y: number }) => {
    if (!editor) return;

    let menuPosition = pos;
    
    if (!menuPosition) {
      // Calculate position based on current selection
      const { view } = editor;
      const { selection } = editor.state;
      
      if (selection.empty) {
        // Position at cursor
        const coords = view.coordsAtPos(selection.from);
        menuPosition = { x: coords.left, y: coords.top - 10 };
      } else {
        // Position at end of selection
        const coords = view.coordsAtPos(selection.to);
        menuPosition = { x: coords.left, y: coords.top - 10 };
      }
    }

    setPosition(menuPosition);
    setIsVisible(true);
  }, [editor]);

  const hideMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for trigger key combination (Ctrl+K by default)
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        showMenu();
        return;
      }

      // Hide menu on other keys when visible
      if (isVisible && !["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
        hideMenu();
      }
    };

    const handleSelectionChange = () => {
      if (!showOnSelection || isVisible) return;

      const { selection } = editor.state;
      
      // Show menu automatically when text is selected (optional)
      if (!selection.empty && showOnSelection) {
        // Small delay to avoid showing on every selection change
        setTimeout(() => {
          if (!editor.state.selection.empty) {
            showMenu();
          }
        }, 500);
      }
    };

    const handleClick = (event: MouseEvent) => {
      // Hide menu when clicking outside
      if (isVisible) {
        const target = event.target as Element;
        const aiMenu = document.querySelector('.ai-floating-menu');
        
        if (aiMenu && !aiMenu.contains(target)) {
          hideMenu();
        }
      }
    };

    // Listen for keyboard events
    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);
    
    // Listen for selection changes
    editor.on("selectionUpdate", handleSelectionChange);
    
    // Listen for clicks outside
    document.addEventListener("click", handleClick);

    return () => {
      editorElement.removeEventListener("keydown", handleKeyDown);
      editor.off("selectionUpdate", handleSelectionChange);
      document.removeEventListener("click", handleClick);
    };
  }, [editor, isVisible, showOnSelection, showMenu, hideMenu]);

  return {
    isVisible,
    position,
    showMenu,
    hideMenu,
  };
}