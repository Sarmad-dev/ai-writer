// DEPRECATED: This component is replaced by src/components/editor/ContentEditor.tsx
// which uses TipTap for rich text editing instead of markdown rendering.
// This file is kept for reference only.

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { 
  Save, 
  Download, 
  FileText, 
  Loader2, 
  Send,
  Sparkles
} from 'lucide-react';

interface ContentRendererProps {
  content: string;
  isGenerating: boolean;
}

function ContentRenderer({ content, isGenerating }: ContentRendererProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <MarkdownRenderer 
        content={content} 
        isStreaming={isGenerating}
        className="min-h-[400px]"
      />
    </div>
  );
}

interface LegacyContentEditorProps {
  sessionId: string;
  initialPrompt?: string;
  initialContent?: string;
  onPromptSubmit: (prompt: string) => void;
  onSave: (content: string) => void;
  isGenerating: boolean;
}

/**
 * @deprecated Use ContentEditor from @/components/editor/ContentEditor instead
 */
export function LegacyContentEditor({
  sessionId,
  initialPrompt = '',
  initialContent = '',
  onPromptSubmit,
  onSave,
  isGenerating,
}: LegacyContentEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(() => {
    if (prompt.trim()) {
      onPromptSubmit(prompt.trim());
    }
  }, [prompt, onPromptSubmit]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(content);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  const handleExport = useCallback((format: 'txt' | 'md' | 'html') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${sessionId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, sessionId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Content Editor (Legacy)</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('txt')}
            disabled={!content}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !content}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Enter your prompt to generate or regenerate content..."
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="min-h-[80px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            size="lg"
            className="shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd/Ctrl + Enter</kbd> to submit
        </p>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="min-h-full p-6">
          {content ? (
            <ContentRenderer content={content} isGenerating={isGenerating} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Enter a prompt above to generate content
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
