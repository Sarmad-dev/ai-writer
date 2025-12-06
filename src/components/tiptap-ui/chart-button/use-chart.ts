import { useCallback, useMemo } from 'react';
import type { Editor } from '@tiptap/core';
import { BarChart3 } from 'lucide-react';

export const CHART_SHORTCUT_KEY = 'Mod-Shift-C';

export interface UseChartConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onInserted?: () => void;
}

export function useChart({
  editor,
  hideWhenUnavailable = false,
  onInserted,
}: UseChartConfig = {}) {
  const canInsert = useMemo(() => {
    if (!editor) return false;
    return editor.can().insertContent({ type: 'graph' });
  }, [editor]);

  const isVisible = useMemo(() => {
    if (!editor) return false;
    if (hideWhenUnavailable && !canInsert) return false;
    return true;
  }, [editor, hideWhenUnavailable, canInsert]);

  const handleInsertChart = useCallback(() => {
    if (!editor || !canInsert) return;

    // Insert a default chart
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'graph',
        attrs: {
          id: `graph-${Date.now()}`,
          type: 'bar',
          data: [
            { name: 'A', value: 10 },
            { name: 'B', value: 20 },
            { name: 'C', value: 15 },
          ],
          config: {
            title: 'Sample Chart',
            xAxisLabel: 'Category',
            yAxisLabel: 'Value',
            legend: true,
            dataKey: 'value',
            xKey: 'name',
          },
        },
      })
      .run();

    onInserted?.();
  }, [editor, canInsert, onInserted]);

  return {
    isVisible,
    canInsert,
    handleInsertChart,
    label: 'Insert Chart',
    isActive: false,
    shortcutKeys: CHART_SHORTCUT_KEY,
    Icon: BarChart3,
  };
}
