import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathNodeView } from './math-node-view';

export interface MathOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      /**
       * Insert inline math
       */
      setInlineMath: (latex: string) => ReturnType;
      /**
       * Insert block math
       */
      setBlockMath: (latex: string) => ReturnType;
    };
  }
}

export const MathNode = Node.create<MathOptions>({
  name: 'math',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex'),
        renderHTML: (attributes) => {
          return {
            'data-latex': attributes.latex,
          };
        },
      },
      display: {
        default: 'inline',
        parseHTML: (element) => element.getAttribute('data-display') || 'inline',
        renderHTML: (attributes) => {
          return {
            'data-display': attributes.display,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'math' })];
  },

  addCommands() {
    return {
      setInlineMath:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex, display: 'inline' },
          });
        },
      setBlockMath:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex, display: 'block' },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-e': () => {
        const latex = prompt('Enter LaTeX equation:');
        if (latex) {
          return this.editor.commands.setInlineMath(latex);
        }
        return false;
      },
    };
  },
});

export const BlockMathNode = Node.create<MathOptions>({
  name: 'blockMath',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex'),
        renderHTML: (attributes) => {
          return {
            'data-latex': attributes.latex,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'block-math' })];
  },

  addCommands() {
    return {
      setBlockMath:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => {
        const latex = prompt('Enter LaTeX equation (block):');
        if (latex) {
          return this.editor.commands.setBlockMath(latex);
        }
        return false;
      },
    };
  },
});
