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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button as UiButton } from "@/components/ui/button";
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
  const [promptMode, setPromptMode] = useState<"generate" | "translate" | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");

  if (!editor) return null;

  const hasSelection = !editor.state.selection.empty;

  const handleAIAction = async (action: () => void | Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("AI action failed:", error);
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setPromptMode(null);
      setPromptInput("");
      setTargetLanguage("Spanish");
    }
  };

  const handlePromptSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!editor || !promptMode) return;

    if (promptMode === "generate") {
      const value = promptInput.trim();
      if (!value) {
        setPromptMode(null);
        return;
      }

      await handleAIAction(async () => {
        const content = await aiClient.generateContent(value);
        editor.chain().focus().insertContent(content).run();
      });
    } else if (promptMode === "translate") {
      const language = targetLanguage.trim();
      if (!language) {
        setPromptMode(null);
        return;
      }

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, "\n\n");
      if (!selectedText.trim()) {
        setPromptMode(null);
        return;
      }

      await handleAIAction(async () => {
        const translated = await aiClient.translateText(selectedText, language);
        editor.chain().focus().insertContent(translated).run();
      });
    }

    setPromptMode(null);
    setPromptInput("");
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          data-style="ghost"
          onClick={() => setPromptMode("generate")}
          disabled={isLoading}
          tooltip="Generate with AI"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>

        {hasSelection && (
          <Button
            data-style="ghost"
            onClick={() =>
              handleAIAction(() => {
                editor.chain().focus().improveText({ tone: "professional" }).run();
              })
            }
            disabled={isLoading}
            tooltip="Improve selected text"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
        )}

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
            <DropdownMenuItem
              onClick={() => setPromptMode("generate")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Text
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                handleAIAction(() => {
                  editor.chain().focus().continueWriting({ tone: "consistent" }).run();
                })
              }
            >
              <PenTool className="w-4 h-4 mr-2" />
              Continue Writing
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {hasSelection && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().improveText({ tone: "professional" }).run();
                    })
                  }
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Improve Text
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().fixGrammar().run();
                    })
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Fix Grammar
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().summarizeText({ length: "medium" }).run();
                    })
                  }
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Summarize
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setPromptMode("translate")
                    console.log("Translate selected text")
                  }}
                >
                  <Languages className="w-4 h-4 mr-2" />
                  Translate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().changeTone("professional").run();
                    })
                  }
                >
                  Make Professional
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().changeTone("casual").run();
                    })
                  }
                >
                  Make Casual
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().changeTone("friendly").run();
                    })
                  }
                >
                  Make Friendly
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().expandText().run();
                    })
                  }
                >
                  Expand Text
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    handleAIAction(() => {
                      editor.chain().focus().makeTextConcise().run();
                    })
                  }
                >
                  Make Concise
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={promptMode !== null} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePromptSubmit(e);
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {promptMode === "translate"
                  ? "Translate selected text"
                  : "Generate with AI"}
              </DialogTitle>
              <DialogDescription>
                {promptMode === "translate"
                  ? "Choose a target language to translate the selected text."
                  : "Describe what you would like the AI to write."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {promptMode === "generate" && (
                <Textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Write a blog introduction about AI writing assistants..."
                  rows={4}
                />
              )}
              {promptMode === "translate" && (
                <Input
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  placeholder="Spanish"
                />
              )}
            </div>
            <DialogFooter>
              <UiButton
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </UiButton>
              <UiButton
                type="submit"
                disabled={
                  promptMode === "generate"
                    ? !promptInput.trim()
                    : !targetLanguage.trim()
                }
              >
                {promptMode === "translate" ? "Translate" : "Generate"}
              </UiButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
