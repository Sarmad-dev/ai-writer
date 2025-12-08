import { useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { ContentLocation } from '@/lib/agent/types';

interface UseEditorHighlightProps {
  editor: Editor | null;
}

/**
 * Hook to manage editor highlighting for suggestions
 * Provides functions to highlight and clear highlights based on content location
 */
export function useEditorHighlight({ editor }: UseEditorHighlightProps) {
  /**
   * Highlight a location in the editor
   */
  const highlightLocation = useCallback(
    (location: ContentLocation) => {
      if (!editor) return;

      try {
        // Find the position to highlight based on location information
        const { paragraphIndex, headingContext, characterOffset, nodeId } = location;

        // If we have a nodeId, try to find and highlight that specific node
        if (nodeId) {
          const node = editor.state.doc.nodeAt(parseInt(nodeId));
          if (node) {
            const pos = parseInt(nodeId);
            editor.commands.setTextSelection({ from: pos, to: pos + node.nodeSize });
            return;
          }
        }

        // If we have a paragraph index, find that paragraph
        if (paragraphIndex !== undefined) {
          let currentParagraph = 0;
          let targetPos = 0;
          let found = false;

          editor.state.doc.descendants((node, pos) => {
            if (found) return false;

            if (node.type.name === 'paragraph') {
              if (currentParagraph === paragraphIndex) {
                targetPos = pos;
                found = true;
                return false;
              }
              currentParagraph++;
            }
            return true;
          });

          if (found) {
            const node = editor.state.doc.nodeAt(targetPos);
            if (node) {
              // Highlight the entire paragraph
              editor.commands.setTextSelection({
                from: targetPos,
                to: targetPos + node.nodeSize,
              });
              
              // Scroll to the position
              editor.commands.scrollIntoView();
            }
          }
        }

        // If we have heading context, try to find that heading
        if (headingContext && !paragraphIndex) {
          let found = false;
          editor.state.doc.descendants((node, pos) => {
            if (found) return false;

            if (node.type.name === 'heading' && node.textContent.includes(headingContext)) {
              editor.commands.setTextSelection({
                from: pos,
                to: pos + node.nodeSize,
              });
              editor.commands.scrollIntoView();
              found = true;
              return false;
            }
            return true;
          });
        }

        // If we have a character offset, use it
        if (characterOffset !== undefined) {
          editor.commands.setTextSelection({
            from: characterOffset,
            to: characterOffset + 1,
          });
          editor.commands.scrollIntoView();
        }
      } catch (error) {
        console.error('Failed to highlight location:', error);
      }
    },
    [editor]
  );

  /**
   * Clear any active highlights/selections
   */
  const clearHighlight = useCallback(() => {
    if (!editor) return;

    try {
      // Clear selection by setting it to the current cursor position
      const { from } = editor.state.selection;
      editor.commands.setTextSelection(from);
    } catch (error) {
      console.error('Failed to clear highlight:', error);
    }
  }, [editor]);

  return {
    highlightLocation,
    clearHighlight,
  };
}
