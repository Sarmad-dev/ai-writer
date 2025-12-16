"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DecorationSet } from "@tiptap/pm/view";
import { aiClient } from "@/lib/ai/client";

export interface AIExtensionOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ai: {
      /**
       * Generate text using AI
       */
      generateText: (prompt: string, options?: { 
        insertAt?: number;
        replaceSelection?: boolean;
        context?: string;
      }) => ReturnType;
      
      /**
       * Improve selected text
       */
      improveText: (options?: { tone?: string; style?: string }) => ReturnType;
      
      /**
       * Summarize selected text
       */
      summarizeText: (options?: { length?: 'short' | 'medium' | 'long' }) => ReturnType;
      
      /**
       * Translate selected text
       */
      translateText: (targetLanguage: string) => ReturnType;
      
      /**
       * Continue writing from current position
       */
      continueWriting: (options?: { tone?: string; length?: number }) => ReturnType;
      
      /**
       * Fix grammar and spelling
       */
      fixGrammar: () => ReturnType;
      
      /**
       * Change tone of selected text
       */
      changeTone: (tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative') => ReturnType;
      
      /**
       * Expand selected text with more details
       */
      expandText: (options?: { focus?: string }) => ReturnType;
      
      /**
       * Make text more concise
       */
      makeTextConcise: () => ReturnType;
    };
  }
}

// Helper function to generate AI content using client service
async function generateAIContent(
  prompt: string, 
  context?: string, 
  options: AIExtensionOptions = {}
): Promise<string> {
  try {
    return await aiClient.generateContent(prompt, context, {
      model: options.model || "gpt-4o",
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate AI content. Please try again.");
  }
}

export const AIExtension = Extension.create<AIExtensionOptions>({
  name: "ai",

  addOptions() {
    return {
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
    };
  },

  addCommands() {
    const extension = this;
    
    return {
      generateText:
        (prompt: string, options = {}) =>
        ({ editor, tr, dispatch }) => {
          const { insertAt, replaceSelection = false, context } = options;
          
          generateAIContent(prompt, context, extension.options)
            .then((content: string) => {
              if (!dispatch) return;
              
              const { selection } = editor.state;
              const pos = insertAt ?? (replaceSelection ? selection.from : selection.to);
              
              if (replaceSelection && !selection.empty) {
                tr.delete(selection.from, selection.to);
              }
              
              tr.insertText(content, pos);
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("AI generation failed:", error);
            });
          
          return true;
        },

      improveText:
        (options = {}) =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          const { tone = "professional", style = "clear" } = options;
          
          aiClient.improveText(selectedText, tone, style)
            .then((improvedText: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(improvedText));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Text improvement failed:", error);
            });
          
          return true;
        },

      summarizeText:
        (options = {}) =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          const { length = "medium" } = options;
          
          aiClient.summarizeText(selectedText, length)
            .then((summary: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(summary));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Summarization failed:", error);
            });
          
          return true;
        },

      translateText:
        (targetLanguage: string) =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          
          aiClient.translateText(selectedText, targetLanguage)
            .then((translation: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(translation));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Translation failed:", error);
            });
          
          return true;
        },

      continueWriting:
        (options = {}) =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          const { tone = "consistent", length = 200 } = options;
          
          // Get context from the current paragraph or document
          const currentNode = selection.$from.parent;
          const context = currentNode.textContent || editor.state.doc.textBetween(0, Math.min(1000, editor.state.doc.content.size));
          
          aiClient.continueWriting(context, tone, length)
            .then((continuation: string) => {
              if (!dispatch) return;
              tr.insertText(continuation, selection.to);
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Continue writing failed:", error);
            });
          
          return true;
        },

      fixGrammar:
        () =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          
          aiClient.fixGrammar(selectedText)
            .then((correctedText: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(correctedText));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Grammar fix failed:", error);
            });
          
          return true;
        },

      changeTone:
        (tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative') =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          
          aiClient.changeTone(selectedText, tone)
            .then((rewrittenText: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(rewrittenText));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Tone change failed:", error);
            });
          
          return true;
        },

      expandText:
        (options = {}) =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          const { focus } = options;
          
          aiClient.expandText(selectedText, focus)
            .then((expandedText: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(expandedText));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Text expansion failed:", error);
            });
          
          return true;
        },

      makeTextConcise:
        () =>
        ({ editor, tr, dispatch }) => {
          const { selection } = editor.state;
          if (selection.empty) return false;
          
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          
          aiClient.makeTextConcise(selectedText)
            .then((conciseText: string) => {
              if (!dispatch) return;
              tr.replaceWith(selection.from, selection.to, editor.schema.text(conciseText));
              dispatch(tr);
            })
            .catch((error: Error) => {
              console.error("Text concision failed:", error);
            });
          
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("ai-loading"),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            // Handle loading states and decorations
            return set.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});