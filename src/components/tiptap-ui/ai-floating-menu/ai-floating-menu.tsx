"use client";

import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { createPortal } from "react-dom";
import { aiClient } from "@/lib/ai/client";
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Languages, 
  CheckCircle,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/tiptap-ui-primitive/button";

interface AIFloatingMenuProps {
  editor: Editor;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export function AIFloatingMenu({ editor, isVisible, position, onClose }: AIFloatingMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const hasSelection = !editor.state.selection.empty;
  const selectedText = hasSelection 
    ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
    : "";

  const handleAIAction = async (action: () => void, actionName: string) => {
    setIsLoading(true);
    setSelectedAction(actionName);
    
    try {
      action();
      // Close menu after action
      setTimeout(() => {
        setIsLoading(false);
        setSelectedAction(null);
        onClose();
      }, 500);
    } catch (error) {
      console.error("AI action failed:", error);
      setIsLoading(false);
      setSelectedAction(null);
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const aiActions = [
    {
      id: "improve",
      label: "Improve",
      icon: Wand2,
      description: "Enhance clarity and flow",
      action: () => editor.chain().focus().improveText({ tone: "professional" }).run(),
      requiresSelection: true,
    },
    {
      id: "fix-grammar",
      label: "Fix Grammar",
      icon: CheckCircle,
      description: "Correct errors",
      action: () => editor.chain().focus().fixGrammar().run(),
      requiresSelection: true,
    },
    {
      id: "summarize",
      label: "Summarize",
      icon: FileText,
      description: "Create brief summary",
      action: () => editor.chain().focus().summarizeText({ length: "medium" }).run(),
      requiresSelection: true,
    },
    {
      id: "translate",
      label: "Translate",
      icon: Languages,
      description: "Translate text",
      action: () => {
        const language = window.prompt("Translate to which language?", "Spanish");
        if (language) {
          editor.chain().focus().translateText(language).run();
        }
      },
      requiresSelection: true,
    },
    {
      id: "generate",
      label: "Generate",
      icon: Sparkles,
      description: "Create new content",
      action: () => {
        const prompt = window.prompt("What would you like me to write?");
        if (prompt) {
          editor.chain().focus().generateText(prompt).run();
        }
      },
      requiresSelection: false,
    },
  ];

  const availableActions = aiActions.filter(action => 
    !action.requiresSelection || hasSelection
  );

  return createPortal(
    <div
      className="ai-floating-menu bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[280px] z-50"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: "translateY(-100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            AI Assistant
          </span>
        </div>
        <Button
          data-style="ghost"
          onClick={onClose}
          className="p-1 h-6 w-6"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Selected text preview */}
      {hasSelection && selectedText.length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300 max-h-16 overflow-hidden">
          "{selectedText.length > 100 ? selectedText.substring(0, 100) + "..." : selectedText}"
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-1">
        {availableActions.map((action) => (
          <Button
            key={action.id}
            data-style="ghost"
            className="w-full justify-start p-2 h-auto"
            onClick={() => handleAIAction(action.action, action.id)}
            disabled={isLoading}
          >
            <div className="flex items-center gap-3 w-full">
              {isLoading && selectedAction === action.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <action.icon className="w-4 h-4 text-gray-500" />
              )}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {action.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Footer tip */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">Esc</kbd> to close
        </p>
      </div>
    </div>,
    document.body
  );
}