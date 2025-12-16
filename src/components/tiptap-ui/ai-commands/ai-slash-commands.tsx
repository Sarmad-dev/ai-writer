"use client";

import { Editor } from "@tiptap/react";
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
  Lightbulb,
  MessageSquare,
  Zap
} from "lucide-react";
import { SlashCommandItem } from "@/components/tiptap-ui/slash-command-menu/slash-command-menu";

export const aiSlashCommands: SlashCommandItem[] = [
  {
    title: "AI Generate",
    description: "Generate content with AI",
    icon: Sparkles,
    command: (editor: Editor) => {
      const prompt = window.prompt("What would you like me to write about?");
      if (prompt) {
        editor.chain().focus().generateText(prompt).run();
      }
    },
    keywords: ["ai", "generate", "write", "create"],
  },
  {
    title: "Improve Writing",
    description: "Enhance selected text with AI",
    icon: Wand2,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to improve");
        return;
      }
      editor.chain().focus().improveText({ tone: "professional", style: "clear" }).run();
    },
    keywords: ["improve", "enhance", "better", "rewrite"],
  },
  {
    title: "Summarize",
    description: "Create a summary of selected text",
    icon: FileText,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to summarize");
        return;
      }
      
      const length = window.prompt("Summary length? (short/medium/long)", "medium") as 'short' | 'medium' | 'long';
      if (length && ['short', 'medium', 'long'].includes(length)) {
        editor.chain().focus().summarizeText({ length }).run();
      }
    },
    keywords: ["summarize", "summary", "brief", "tldr"],
  },
  {
    title: "Translate",
    description: "Translate selected text",
    icon: Languages,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to translate");
        return;
      }
      
      const language = window.prompt("Translate to which language?", "Spanish");
      if (language) {
        editor.chain().focus().translateText(language).run();
      }
    },
    keywords: ["translate", "language", "convert"],
  },
  {
    title: "Continue Writing",
    description: "AI continues from current position",
    icon: PenTool,
    command: (editor: Editor) => {
      const tone = window.prompt("Writing tone? (professional/casual/creative)", "professional");
      if (tone) {
        editor.chain().focus().continueWriting({ tone, length: 200 }).run();
      }
    },
    keywords: ["continue", "extend", "more", "keep writing"],
  },
  {
    title: "Fix Grammar",
    description: "Correct grammar and spelling",
    icon: CheckCircle,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to fix");
        return;
      }
      editor.chain().focus().fixGrammar().run();
    },
    keywords: ["grammar", "spelling", "correct", "fix"],
  },
  {
    title: "Change Tone",
    description: "Adjust the tone of selected text",
    icon: Volume2,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to change tone");
        return;
      }
      
      const tone = window.prompt("New tone? (professional/casual/friendly/formal/creative)", "professional") as any;
      if (tone && ['professional', 'casual', 'friendly', 'formal', 'creative'].includes(tone)) {
        editor.chain().focus().changeTone(tone).run();
      }
    },
    keywords: ["tone", "style", "voice", "mood"],
  },
  {
    title: "Expand Text",
    description: "Add more details and examples",
    icon: Expand,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to expand");
        return;
      }
      
      const focus = window.prompt("Focus on specific aspect? (optional)", "");
      editor.chain().focus().expandText({ focus: focus || undefined }).run();
    },
    keywords: ["expand", "elaborate", "details", "more"],
  },
  {
    title: "Make Concise",
    description: "Shorten while keeping key points",
    icon: Minimize2,
    command: (editor: Editor) => {
      const { selection } = editor.state;
      if (selection.empty) {
        alert("Please select some text to make concise");
        return;
      }
      editor.chain().focus().makeTextConcise().run();
    },
    keywords: ["concise", "shorten", "brief", "compress"],
  },
  {
    title: "Brainstorm Ideas",
    description: "Generate ideas on a topic",
    icon: Lightbulb,
    command: (editor: Editor) => {
      const topic = window.prompt("What topic would you like ideas for?");
      if (topic) {
        const prompt = `Generate 5-7 creative ideas related to: ${topic}. Format as a bullet list with brief explanations.`;
        editor.chain().focus().generateText(prompt).run();
      }
    },
    keywords: ["brainstorm", "ideas", "creative", "suggestions"],
  },
  {
    title: "Write Email",
    description: "Generate professional email",
    icon: MessageSquare,
    command: (editor: Editor) => {
      const purpose = window.prompt("What is the email about?");
      const tone = window.prompt("Email tone? (professional/friendly/formal)", "professional");
      
      if (purpose) {
        const prompt = `Write a ${tone} email about: ${purpose}. Include appropriate greeting, body, and closing.`;
        editor.chain().focus().generateText(prompt).run();
      }
    },
    keywords: ["email", "message", "communication", "letter"],
  },
  {
    title: "Quick Action",
    description: "Custom AI prompt",
    icon: Zap,
    command: (editor: Editor) => {
      const customPrompt = window.prompt("Enter your custom AI instruction:");
      if (customPrompt) {
        const { selection } = editor.state;
        if (!selection.empty) {
          const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
          const fullPrompt = `${customPrompt}\n\nText: ${selectedText}`;
          editor.chain().focus().generateText(fullPrompt, { replaceSelection: true }).run();
        } else {
          editor.chain().focus().generateText(customPrompt).run();
        }
      }
    },
    keywords: ["custom", "prompt", "ai", "action"],
  },
];