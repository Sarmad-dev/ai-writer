"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { aiClient } from "@/lib/ai/client";
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Languages, 
  PenTool, 
  CheckCircle,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AIToolbarButtonsProps {
  editor: Editor | null;
}

export function AIToolbarButtons({ editor }: AIToolbarButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!editor) return null;

  const hasSelection = !editor.state.selection.empty;

  const handleAIAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      action();
      // Note: The actual loading state should be managed by the AI extension
      // This is just for immediate UI feedback
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("AI action failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Quick AI Generate */}
      <Button
        data-style="ghost"
        onClick={() => handleAIAction(async () => {
          const prompt = window.prompt("What would you like me to write?");
          if (prompt) {
            try {
              const content = await aiClient.generateContent(prompt);
              editor.chain().focus().insertContent(content).run();
            } catch (error) {
              console.error("AI generation failed:", error);
              alert("Failed to generate content. Please try again.");
            }
          }
        })}
        disabled={isLoading}
        tooltip="Generate with AI"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </Button>

      {/* Improve Text (only show if text is selected) */}
      {hasSelection && (
        <Button
          data-style="ghost"
          onClick={() => handleAIAction(() => {
            editor.chain().focus().improveText({ tone: "professional" }).run();
          })}
          disabled={isLoading}
          tooltip="Improve selected text"
        >
          <Wand2 className="w-4 h-4" />
        </Button>
      )}

      {/* More AI Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-style="ghost"
            disabled={isLoading}
            tooltip="More AI actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {/* Text Generation */}
          <DropdownMenuItem
            onClick={() => handleAIAction(() => {
              const prompt = window.prompt("What would you like me to write?");
              if (prompt) {
                editor.chain().focus().generateText(prompt).run();
              }
            })}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Text
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleAIAction(() => {
              editor.chain().focus().continueWriting({ tone: "consistent" }).run();
            })}
          >
            <PenTool className="w-4 h-4 mr-2" />
            Continue Writing
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Text Improvement (only if text selected) */}
          {hasSelection && (
            <>
              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().improveText({ tone: "professional" }).run();
                })}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Improve Text
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().fixGrammar().run();
                })}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Fix Grammar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().summarizeText({ length: "medium" }).run();
                })}
              >
                <FileText className="w-4 h-4 mr-2" />
                Summarize
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  const language = window.prompt("Translate to which language?", "Spanish");
                  if (language) {
                    editor.chain().focus().translateText(language).run();
                  }
                })}
              >
                <Languages className="w-4 h-4 mr-2" />
                Translate
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Tone Changes */}
              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().changeTone("professional").run();
                })}
              >
                Make Professional
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().changeTone("casual").run();
                })}
              >
                Make Casual
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().changeTone("friendly").run();
                })}
              >
                Make Friendly
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Text Length */}
              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().expandText().run();
                })}
              >
                Expand Text
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAIAction(() => {
                  editor.chain().focus().makeTextConcise().run();
                })}
              >
                Make Concise
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}