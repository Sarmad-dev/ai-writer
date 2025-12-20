"use client";

import { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";

export interface UseAISelectionMenuOptions {
  editor: Editor | null;
  autoShowOnSelection?: boolean;
  minSelectionLength?: number;
}

export function useAISelectionMenu({ 
  editor, 
  autoShowOnSelection = true,
  minSelectionLength = 3
}: UseAISelectionMenuOptions) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [range, setRange] = useState({ from: 0, to: 0 });

  const showMenu = useCallback((pos?: { x: number; y: number }) => {
    if (!editor || !editor.view || !editor.view.dom) return;

    const { selection } = editor.state;
    
    if (selection.empty) {
      hideMenu();
      return;
    }

    const text = editor.state.doc.textBetween(selection.from, selection.to);
    
    console.log('🎯 AI Selection Hook - showMenu called:', {
      selectionFrom: selection.from,
      selectionTo: selection.to,
      text: text,
      textLength: text.length,
      minSelectionLength: minSelectionLength
    });
    
    if (text.length < minSelectionLength) {
      console.log('🎯 AI Selection Hook - Text too short, hiding menu');
      hideMenu();
      return;
    }

    let menuPosition = pos;
    
    if (!menuPosition) {
      // Calculate position based on selection end
      const { view } = editor;
      try {
        const coords = view.coordsAtPos(selection.to);
        menuPosition = { 
          x: coords.left, 
          y: coords.top - 10 
        };
      } catch (error) {
        // Editor view not ready yet
        console.warn("Editor view not ready for AI selection menu");
        return;
      }
    }

    console.log('🎯 AI Selection Hook - Showing menu:', {
      text: text,
      range: { from: selection.from, to: selection.to },
      position: menuPosition
    });

    setSelectedText(text);
    setRange({ from: selection.from, to: selection.to });
    setPosition(menuPosition);
    setIsVisible(true);
  }, [editor, minSelectionLength]);

  const hideMenu = useCallback(() => {
    setIsVisible(false);
    setSelectedText("");
    setRange({ from: 0, to: 0 });
  }, []);

  useEffect(() => {
    if (!editor || !autoShowOnSelection || !editor.view || !editor.view.dom) return;

    let selectionTimeout: NodeJS.Timeout;

    const handleSelectionChange = () => {
      // Clear any existing timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      // Debounce selection changes to avoid showing menu on quick selections
      // Use a longer delay when menu is visible to prevent accidental hiding
      const delay = isVisible ? 500 : 300;
      
      selectionTimeout = setTimeout(() => {
        const { selection } = editor.state;
        
        if (selection.empty) {
          // Double-check that we're not clicking on the menu before hiding
          const aiMenu = document.querySelector('.ai-selection-menu');
          if (aiMenu && aiMenu.matches(':hover')) {
            // Don't hide if mouse is over the menu
            return;
          }
          hideMenu();
          return;
        }

        const text = editor.state.doc.textBetween(selection.from, selection.to);
        
        if (text.length >= minSelectionLength) {
          showMenu();
        } else {
          hideMenu();
        }
      }, delay);
    };

    const handleClick = (event: MouseEvent) => {
      // Hide menu when clicking outside, but not when clicking on the menu itself
      if (isVisible) {
        const target = event.target as Element;
        const aiMenu = document.querySelector('.ai-selection-menu');
        
        // Don't hide if clicking on the menu or any of its children
        if (aiMenu && aiMenu.contains(target)) {
          return;
        }
        
        // Check if we're clicking in the editor
        const editorElement = editor.view?.dom;
        if (editorElement && editorElement.contains(target)) {
          // If clicking in editor, let selection change handler deal with it
          return;
        } else {
          // Clicking outside editor and menu, hide menu
          hideMenu();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Hide menu on certain key presses
      if (isVisible && ["Escape", "Enter", "Backspace", "Delete"].includes(event.key)) {
        if (event.key === "Escape") {
          event.preventDefault();
          hideMenu();
        }
      }
    };

    // Listen for selection changes
    editor.on("selectionUpdate", handleSelectionChange);
    
    // Listen for clicks outside
    document.addEventListener("click", handleClick);
    
    // Listen for key presses
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      editor.off("selectionUpdate", handleSelectionChange);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, autoShowOnSelection, minSelectionLength, isVisible, showMenu, hideMenu]);

  return {
    isVisible,
    position,
    selectedText,
    range,
    showMenu,
    hideMenu,
  };
}