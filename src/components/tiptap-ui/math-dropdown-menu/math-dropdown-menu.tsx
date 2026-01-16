"use client";

import { forwardRef, useCallback, useMemo, useState } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button as UiButton } from "@/components/ui/button";
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

  const [openType, setOpenType] = useState<"inline" | "block" | null>(null);
  const [latexInput, setLatexInput] = useState("");

  const canInsert = useMemo(() => {
    if (!editor) return false;
    return editor.can().chain().focus().run();
  }, [editor]);

  const handleInlineMath = useCallback(() => {
    if (!editor) return;
    setOpenType("inline");
    setLatexInput("");
  }, [editor]);

  const handleBlockMath = useCallback(() => {
    if (!editor) return;
    setOpenType("block");
    setLatexInput("");
  }, [editor]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setOpenType(null);
      setLatexInput("");
    }
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      if (!editor || !openType) return;
      const value = latexInput.trim();
      if (!value) {
        setOpenType(null);
        return;
      }

      const chain = editor.chain().focus();
      if (openType === "inline") {
        chain.setInlineMath(value);
      } else {
        chain.setBlockMath(value);
      }
      chain.run();

      setOpenType(null);
      setLatexInput("");
    },
    [editor, openType, latexInput]
  );

  if (!editor) return null;

  return (
    <>
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

      <Dialog open={openType !== null} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {openType === "block"
                  ? "Insert block equation"
                  : "Insert inline equation"}
              </DialogTitle>
              <DialogDescription>
                Enter a LaTeX expression to insert into the editor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder={
                  openType === "block"
                    ? "\\int_a^b f(x)\\,dx"
                    : "E = mc^2"
                }
                autoFocus
              />
            </div>
            <DialogFooter>
              <UiButton
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </UiButton>
              <UiButton type="submit" disabled={!latexInput.trim()}>
                Insert
              </UiButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
});

MathDropdownMenu.displayName = "MathDropdownMenu";
