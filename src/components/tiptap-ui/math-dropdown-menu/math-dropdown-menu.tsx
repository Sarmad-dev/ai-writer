"use client";

import { forwardRef, useCallback, useMemo } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { SigmaIcon } from "@/components/tiptap-icons/sigma-icon";
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";

export interface MathDropdownMenuProps {
  editor?: Editor | null;
  portal?: boolean;
}

export const MathDropdownMenu = forwardRef<
  HTMLButtonElement,
  MathDropdownMenuProps
>(({ editor: providedEditor, portal = false }, ref) => {
  const { editor } = useTiptapEditor(providedEditor);

  const canInsert = useMemo(() => {
    if (!editor) return false;
    return editor.can().chain().focus().run();
  }, [editor]);

  const handleInlineMath = useCallback(() => {
    if (!editor) return;
    const latex = prompt("Enter LaTeX equation (inline):");
    if (latex) {
      editor.chain().focus().setInlineMath(latex).run();
    }
  }, [editor]);

  const handleBlockMath = useCallback(() => {
    if (!editor) return;
    const latex = prompt("Enter LaTeX equation (block):");
    if (latex) {
      editor.chain().focus().setBlockMath(latex).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <DropdownMenu modal={portal}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          type="button"
          data-style="ghost"
          disabled={!canInsert}
          data-disabled={!canInsert}
          tabIndex={-1}
          aria-label="Insert Math Equation"
          tooltip="Insert Math Equation"
        >
          <SigmaIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleInlineMath}>
          <SigmaIcon className="tiptap-button-icon" />
          <span>Inline Math</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlockMath}>
          <SigmaIcon className="tiptap-button-icon" />
          <span>Block Math</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

MathDropdownMenu.displayName = "MathDropdownMenu";
