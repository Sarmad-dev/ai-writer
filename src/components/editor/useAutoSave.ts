import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  content: string;
  onSave: (content: string) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({
  content,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(content);

  useEffect(() => {
    if (!enabled) return;

    // Don't trigger save if content hasn't changed
    if (content === lastContentRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set status to pending
    setSaveStatus('pending');

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setSaveStatus('saving');

      try {
        await onSave(content);
        lastContentRef.current = content;
        setLastSaved(new Date());
        setSaveStatus('saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, delay);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, onSave, delay, enabled]);

  return {
    isSaving,
    lastSaved,
    saveStatus,
  };
}
