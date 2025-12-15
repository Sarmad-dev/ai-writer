'use client';

import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import type { Editor } from '@tiptap/react';
import { useAutoSave } from './useAutoSave';
import { Button } from '@/components/ui/button';
import { Save, Loader2, FileText, Clock } from 'lucide-react';
import { SimpleEditor } from '../tiptap-templates/simple/simple-editor';

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
    {
      initialContent = '',
      onSave,
      autoSave = true,
      autoSaveDelay = 2000,
    },
    ref
  ) {
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<Editor | null>(null);


  // Auto-save functionality
  const { isSaving: isAutoSaving, lastSaved, saveStatus } = useAutoSave({
    content: initialContent,
    onSave: onSave || (async () => {}),
    delay: autoSaveDelay,
    enabled: autoSave && !!onSave,
  });

  const handleManualSave = async () => {
    if (!onSave || !initialContent) return;

    setIsSaving(true);
    try {
      await onSave(initialContent);
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Expose editor instance to parent
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header with Save Button */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Content Editor</h2>
          
          {/* Save Status Indicator */}
          {autoSave && onSave && (
            <div className="flex items-center gap-2 text-xs">
              {saveStatus === 'saving' || isAutoSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-muted-foreground">Saving...</span>
                </>
              ) : saveStatus === 'pending' ? (
                <>
                  <Clock className="h-3 w-3" />
                  <span className="text-muted-foreground">Pending...</span>
                </>
              ) : saveStatus === 'saved' && lastSaved ? (
                <>
                  <span className="text-green-600 dark:text-green-400">
                    Saved {formatLastSaved(lastSaved)}
                  </span>
                </>
              ) : saveStatus === 'error' ? (
                <span className="text-red-600 dark:text-red-400">Save failed</span>
              ) : null}
            </div>
          )}
        </div>

        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={isSaving || isAutoSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Now
          </Button>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <SimpleEditor content={initialContent} onEditorReady={(editor) => (editorRef.current = editor)} />
      </div>
    </div>
  );
});
