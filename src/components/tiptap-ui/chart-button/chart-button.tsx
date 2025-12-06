"use client";

import { forwardRef, useCallback } from "react";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Tiptap UI ---
import type { UseChartConfig } from "./use-chart";
import { CHART_SHORTCUT_KEY, useChart } from "./use-chart";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";

type IconProps = React.SVGProps<SVGSVGElement>;
type IconComponent = ({ className, ...props }: IconProps) => React.ReactElement;

export interface ChartButtonProps
  extends Omit<ButtonProps, "type">,
    UseChartConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
  /**
   * Optional custom icon component to render instead of the default.
   */
  icon?: React.MemoExoticComponent<IconComponent> | React.FC<IconProps>;
}

export function ChartShortcutBadge({
  shortcutKeys = CHART_SHORTCUT_KEY,
}: {
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for inserting charts in a Tiptap editor.
 *
 * For custom button implementations, use the `useChart` hook instead.
 */
export const ChartButton = forwardRef<HTMLButtonElement, ChartButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onInserted,
      showShortcut = false,
      onClick,
      icon: CustomIcon,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      canInsert,
      handleInsertChart,
      label,
      isActive,
      shortcutKeys,
      Icon,
    } = useChart({
      editor,
      hideWhenUnavailable,
      onInserted,
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleInsertChart();
      },
      [handleInsertChart, onClick]
    );

    if (!isVisible) {
      return null;
    }

    const RenderIcon = CustomIcon ?? Icon;

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <RenderIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && <ChartShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  }
);

ChartButton.displayName = "ChartButton";
