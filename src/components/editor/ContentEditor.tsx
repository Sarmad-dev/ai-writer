"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import type { Editor } from "@tiptap/react";
import { useAutoSave } from "./useAutoSave";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

interface ContentEditorProps {
  sessionId: string;
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface ContentEditorRef {
  getEditor: () => Editor | null;
}

export const ContentEditor = forwardRef<ContentEditorRef, ContentEditorProps>(
  function ContentEditor(
    { initialContent = "", onSave, autoSave = true, autoSaveDelay = 2000 },
    ref
  ) {
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<Editor | null>(null);

    // Auto-save functionality
    // const { isSaving: isAutoSaving, lastSaved, saveStatus } = useAutoSave({
    //   content: initialContent,
    //   onSave: onSave || (async () => {}),
    //   delay: autoSaveDelay,
    //   enabled: autoSave && !!onSave,
    // });

    const handleManualSave = async () => {
      if (!onSave || !initialContent) return;

      setIsSaving(true);
      try {
        await onSave(initialContent);
      } catch (error) {
        console.error("Failed to save content:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const formatLastSaved = (date: Date | null) => {
      if (!date) return "";
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
    };

    // Expose editor instance to parent
    useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
    }));

    return (
      <div className="flex flex-col h-full w-full max-w-6xl justify-center items-center">
        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-card text-foreground w-[90%] max-w-6xl shadow-md">
          <SimpleEditor
            content={initialContent}
            onEditorReady={(editor) => (editorRef.current = editor)}
          />
        </div>
      </div>
    );
  }
);
