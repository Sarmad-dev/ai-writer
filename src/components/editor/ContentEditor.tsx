"use client";

import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import type { Editor } from "@tiptap/react";
import { useEditor } from "@/hooks/useEditor";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

interface ContentEditorProps {
  sessionId: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface ContentEditorRef {
  getEditor: () => Editor | null;
  getContent: () => string;
  setContent: (content: string) => void;
}

export const ContentEditor = ({
  sessionId,
  autoSave = true,
  autoSaveDelay = 2000,
}: ContentEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const isEditorReady = useRef(false);

  // Use the centralized editor hook for state management
  const {
    content,
    updateContent,
    settings,
    isSaving,
    isAutoSaving,
    isDirty,
    lastSaved,
    save,
    error,
    clearError,
  } = useEditor({
    documentId: sessionId,
    autoSaveDelay,
    enableAutoSave: autoSave,
  });

  // Handle content changes from the editor
  const handleContentChange = useCallback(
    (newContent: string) => {
      // Only update if the content is different and editor is ready
      if (newContent !== content && isEditorReady.current) {
        updateContent(newContent);
      }
    },
    [content, updateContent]
  );

  // Update editor content when store content changes (but avoid loops)
  useEffect(() => {
    if (
      editorRef.current &&
      isEditorReady.current &&
      content !== editorRef.current.getHTML()
    ) {
      // Temporarily disable the update listener to avoid loops
      const currentContent = editorRef.current.getHTML();
      if (currentContent !== content) {
        editorRef.current.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full max-w-6xl justify-center items-center">
      {/* Error Display */}
      {error && (
        <div className="w-[90%] max-w-6xl mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={clearError}
              className="text-destructive hover:text-destructive/80 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Save Status */}
      {(isSaving || isAutoSaving) && (
        <div className="w-[90%] max-w-6xl mb-4 p-2 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground text-center">
            {isSaving ? "Saving..." : "Auto-saving..."}
          </p>
        </div>
      )}

      {/* Editor Content */}
      <div
        className="flex-1 overflow-y-auto bg-card text-foreground w-[90%] max-w-6xl shadow-md"
        style={{
          // Apply document settings to the editor container
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}pt`,
          lineHeight: settings.lineSpacing,
          columnCount: settings.columns,
          columnGap: `${settings.columnGap}in`,
        }}
      >
        <SimpleEditor
          content={content}
          onEditorReady={(editor: Editor) => {
            editorRef.current = editor;

            // Wait for the editor to be fully mounted before setting up listeners
            setTimeout(() => {
              if (editor.view && editor.view.dom) {
                isEditorReady.current = true;

                // Set up content change listener with debouncing
                let updateTimeout: NodeJS.Timeout;
                editor.on("update", ({ editor }: { editor: Editor }) => {
                  clearTimeout(updateTimeout);
                  updateTimeout = setTimeout(() => {
                    const newContent = editor.getHTML();
                    handleContentChange(newContent);
                  }, 100); // Debounce updates
                });
              }
            }, 100);
          }}
        />
      </div>

      {/* Document Stats */}
      {isDirty && lastSaved && (
        <div className="w-[90%] max-w-6xl mt-2 p-2 text-xs text-muted-foreground text-center">
          Last saved: {lastSaved.toLocaleTimeString()}
          {isDirty && " • Unsaved changes"}
        </div>
      )}
    </div>
  );
};
