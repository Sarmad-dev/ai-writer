"use client";

import { forwardRef, useCallback } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { parseShortcutKeys } from "@/lib/tiptap-utils";
import type { UseMathConfig } from "@/components/tiptap-ui/math-button/use-math";
import { useMath } from "@/components/tiptap-ui/math-button/use-math";
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";

export interface MathButtonProps
  extends Omit<ButtonProps, "type">,
    UseMathConfig {
  text?: string;
  showShortcut?: boolean;
}

export function MathShortcutBadge({ shortcutKeys }: { shortcutKeys: string }) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

export const MathButton = forwardRef<HTMLButtonElement, MathButtonProps>(
  (
    {
      editor: providedEditor,
      type = "inline",
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canInsert, handleInsert, label, shortcutKeys, Icon } =
      useMath({
        editor,
        type,
        hideWhenUnavailable,
        onToggled,
      });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleInsert();
      },
      [handleInsert, onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        role="button"
        disabled={!canInsert}
        data-disabled={!canInsert}
        tabIndex={-1}
        aria-label={label}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && <MathShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  }
);

MathButton.displayName = "MathButton";
