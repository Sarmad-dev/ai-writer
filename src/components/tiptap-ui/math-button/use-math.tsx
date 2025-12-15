"use client";

import { useCallback, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { SigmaIcon } from "@/components/tiptap-icons/sigma-icon";

export const INLINE_MATH_SHORTCUT_KEY = "Mod-Shift-E";
export const BLOCK_MATH_SHORTCUT_KEY = "Mod-Shift-M";

export interface UseMathConfig {
  editor?: Editor | null;
  type?: "inline" | "block";
  hideWhenUnavailable?: boolean;
  onToggled?: (active: boolean) => void;
}

export function useMath({
  editor,
  type = "inline",
  hideWhenUnavailable = false,
  onToggled,
}: UseMathConfig) {
  const isInline = type === "inline";
  const commandName = isInline ? "setInlineMath" : "setBlockMath";

  const canInsert = useMemo(() => {
    if (!editor) return false;
    return editor.can().chain().focus().run();
  }, [editor]);

  const isVisible = useMemo(() => {
    if (!editor) return false;
    if (hideWhenUnavailable && !canInsert) return false;
    return true;
  }, [editor, hideWhenUnavailable, canInsert]);

  const handleInsert = useCallback(() => {
    if (!editor) return;

    const latex = prompt(`Enter LaTeX equation (${type}):`);
    if (latex) {
      if (isInline) {
        editor.chain().focus().setInlineMath(latex).run();
      } else {
        editor.chain().focus().setBlockMath(latex).run();
      }
      onToggled?.(true);
    }
  }, [editor, type, isInline, onToggled]);

  return {
    isVisible,
    canInsert,
    handleInsert,
    label: isInline ? "Insert Inline Math" : "Insert Block Math",
    shortcutKeys: isInline ? INLINE_MATH_SHORTCUT_KEY : BLOCK_MATH_SHORTCUT_KEY,
    Icon: SigmaIcon,
  };
}
