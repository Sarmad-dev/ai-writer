"use client";

import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { createPortal } from "react-dom";
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Languages, 
  PenTool, 
  CheckCircle,
  Volume2,
  Expand,
  Minimize2,
  X,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { aiClient } from "@/lib/ai/client";

export interface AIAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  inputLabel?: string;
  action: (editor: Editor, selectedText: string, range: { from: number; to: number }, input?: string) => Promise<void>;
  keywords?: string[];
}

export const aiActions: AIAction[] = [
  {
    id: "improve",
    title: "Improve Writing",
    description: "Enhance clarity and flow",
    icon: Wand2,
    action: async (editor, selectedText, range) => {
      console.log('✨ AI Action - improve called:', {
        selectedText: selectedText,
        selectedTextLength: selectedText.length,
        range: range
      });
      
      const improved = await aiClient.improveText(selectedText, "professional", "clear");
      
      console.log('✨ AI Action - improve result:', {
        improved: improved,
        improvedLength: improved.length
      });
      
      editor.chain().focus().deleteRange(range).insertContent(improved).run();
    },
  },
  {
    id: "fix-grammar",
    title: "Fix Grammar",
    description: "Correct errors and typos",
    icon: CheckCircle,
    action: async (editor, selectedText, range) => {
      const corrected = await aiClient.fixGrammar(selectedText);
      editor.chain().focus().deleteRange(range).insertContent(corrected).run();
    },
  },
  {
    id: "summarize",
    title: "Summarize",
    description: "Create a brief summary",
    icon: FileText,
    action: async (editor, selectedText, range) => {
      const summary = await aiClient.summarizeText(selectedText, "medium");
      editor.chain().focus().deleteRange(range).insertContent(summary).run();
    },
  },
  {
    id: "translate",
    title: "Translate",
    description: "Translate to another language",
    icon: Languages,
    requiresInput: true,
    inputPlaceholder: "e.g., Spanish, French, German...",
    inputLabel: "Translate to which language?",
    action: async (editor, selectedText, range, language) => {
      if (!language) return;
      const translation = await aiClient.translateText(selectedText, language);
      editor.chain().focus().deleteRange(range).insertContent(translation).run();
    },
  },
  {
    id: "change-tone-professional",
    title: "Make Professional",
    description: "Convert to professional tone",
    icon: Volume2,
    action: async (editor, selectedText, range) => {
      const rewritten = await aiClient.changeTone(selectedText, "professional");
      editor.chain().focus().deleteRange(range).insertContent(rewritten).run();
    },
  },
  {
    id: "change-tone-casual",
    title: "Make Casual",
    description: "Convert to casual tone",
    icon: Volume2,
    action: async (editor, selectedText, range) => {
      const rewritten = await aiClient.changeTone(selectedText, "casual");
      editor.chain().focus().deleteRange(range).insertContent(rewritten).run();
    },
  },
  {
    id: "expand",
    title: "Expand Text",
    description: "Add more details",
    icon: Expand,
    requiresInput: true,
    inputPlaceholder: "e.g., examples, technical details, background...",
    inputLabel: "What should I focus on? (optional)",
    action: async (editor, selectedText, range, focus) => {
      const expanded = await aiClient.expandText(selectedText, focus);
      editor.chain().focus().deleteRange(range).insertContent(expanded).run();
    },
  },
  {
    id: "make-concise",
    title: "Make Concise",
    description: "Shorten while keeping key points",
    icon: Minimize2,
    action: async (editor, selectedText, range) => {
      const concise = await aiClient.makeTextConcise(selectedText);
      editor.chain().focus().deleteRange(range).insertContent(concise).run();
    },
  },
  {
    id: "continue-writing",
    title: "Continue Writing",
    description: "AI continues from here",
    icon: PenTool,
    requiresInput: true,
    inputPlaceholder: "e.g., professional, creative, casual...",
    inputLabel: "Writing tone? (optional)",
    action: async (editor, selectedText, range, tone) => {
      const continuation = await aiClient.continueWriting(selectedText, tone || "consistent", 200);
      editor.chain().focus().setTextSelection(range.to).insertContent(" " + continuation).run();
    },
  },
  {
    id: "custom-prompt",
    title: "Custom AI Action",
    description: "Enter your own instruction",
    icon: Sparkles,
    requiresInput: true,
    inputPlaceholder: "e.g., Rewrite this as a poem, Make it more technical...",
    inputLabel: "What would you like me to do with this text?",
    action: async (editor, selectedText, range, customPrompt) => {
      if (!customPrompt) return;
      const result = await aiClient.generateContent(`${customPrompt}\n\nText: ${selectedText}`);
      editor.chain().focus().deleteRange(range).insertContent(result).run();
    },
  },
];

export interface AISelectionMenuProps {
  editor: Editor;
  isVisible: boolean;
  position: { x: number; y: number };
  selectedText: string;
  range: { from: number; to: number };
  onClose: () => void;
}

export function AISelectionMenu({
  editor,
  isVisible,
  position,
  selectedText,
  range,
  onClose,
}: AISelectionMenuProps) {
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wasVisible = useRef(false);

  // Debug: Log props when component renders
  console.log('🎨 AI Selection Menu - Component rendered:', {
    isVisible,
    selectedText,
    selectedTextLength: selectedText?.length,
    range,
    position,
    selectedAction: selectedAction?.id,
    showingInputForm: !!selectedAction?.requiresInput
  });

  // Reset state only when menu opens fresh (not when already visible)
  useEffect(() => {
    if (isVisible && !wasVisible.current) {
      // Only reset when opening the menu for the first time
      setSelectedAction(null);
      setInputValue("");
      setError(null);
      setIsLoading(false);
    }
    wasVisible.current = isVisible;
  }, [isVisible]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedAction) {
          setSelectedAction(null);
        } else {
          onClose();
        }
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, selectedAction, onClose]);

  const handleActionClick = (action: AIAction) => {
    console.log('🎯 AI Selection Menu - handleActionClick called:', {
      actionId: action.id,
      requiresInput: action.requiresInput,
      currentSelectedText: selectedText,
      currentSelectedTextLength: selectedText?.length || 0,
      currentRange: range
    });
    
    if (action.requiresInput) {
      console.log('🎯 Setting selectedAction to:', action.id);
      setSelectedAction(action);
      setInputValue("");
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: AIAction, input?: string) => {
    console.log('🔍 AI Selection Menu - executeAction called:', {
      actionId: action.id,
      selectedText: selectedText,
      selectedTextLength: selectedText?.length || 0,
      range: range,
      input: input,
      hasInput: !!input
    });

    setIsLoading(true);
    setError(null);

    try {
      // Execute the AI action with the captured range
      await action.action(editor, selectedText, range, input);
      
      onClose();
    } catch (error) {
      console.error("AI action failed:", error);
      setError(error instanceof Error ? error.message : "AI action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = () => {
    console.log('📝 AI Selection Menu - handleInputSubmit called:', {
      selectedAction: selectedAction?.id,
      inputValue: inputValue,
      inputValueLength: inputValue?.length || 0,
      selectedText: selectedText,
      selectedTextLength: selectedText?.length || 0
    });
    
    if (selectedAction) {
      executeAction(selectedAction, inputValue);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleInputSubmit();
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      className="ai-selection-menu bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[320px] max-w-[400px] z-50"
      style={{
        position: "fixed",
        left: Math.min(position.x, window.innerWidth - 420),
        top: position.y,
        transform: "translateY(-100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedAction ? selectedAction.title : "AI Assistant"}
          </span>
        </div>
        <Button
          data-style="ghost"
          onClick={() => selectedAction ? setSelectedAction(null) : onClose()}
          className="p-1 h-6 w-6"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Selected text preview */}
      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300 max-h-20 overflow-hidden">
        <div className="font-medium mb-1">Selected text:</div>
        "{selectedText.length > 150 ? selectedText.substring(0, 150) + "..." : selectedText}"
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Input form for actions that require input */}
      {selectedAction?.requiresInput ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {selectedAction.inputLabel}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={selectedAction.inputPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-style="ghost"
              onClick={() => setSelectedAction(null)}
              disabled={isLoading}
              className="flex-1 px-3 py-2"
            >
              Back
            </Button>
            <Button
              onClick={handleInputSubmit}
              disabled={isLoading || (!inputValue && selectedAction.id !== "expand" && selectedAction.id !== "continue-writing")}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Execute
                  <ArrowRight className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Action buttons */
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {aiActions.map((action) => (
            <Button
              key={action.id}
              data-style="ghost"
              className="w-full justify-start p-3 h-auto"
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3 w-full">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <action.icon className="w-4 h-4 text-gray-500" />
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
                {action.requiresInput && (
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Footer tip */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">Esc</kbd> to {selectedAction ? "go back" : "close"}
        </p>
      </div>
    </div>,
    document.body
  );
}