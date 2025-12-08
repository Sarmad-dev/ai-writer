import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { GraphNodeView } from './GraphNodeView';

export interface GraphNodeAttrs {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: Record<string, any>[];
  config: Record<string, any>;
}

export const GraphNode = Node.create({
  name: 'graph',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-id': attributes.id,
          };
        },
      },
      type: {
        default: 'bar',
        parseHTML: element => {
          // First try to get type from config
          const configStr = element.getAttribute('data-config');
          if (configStr) {
            try {
              const config = JSON.parse(configStr);
              if (config.type) {
                return config.type;
              }
            } catch (e) {
              console.error('Failed to parse config for type:', e);
            }
          }
          // Fallback to default
          return 'bar';
        },
        renderHTML: attributes => {
          // Don't render type as data-type since that's used for node identification
          return {};
        },
      },
      data: {
        default: [],
        parseHTML: element => {
          const dataStr = element.getAttribute('data-graph-data');
          return dataStr ? JSON.parse(dataStr) : [];
        },
        renderHTML: attributes => {
          return {
            'data-graph-data': JSON.stringify(attributes.data),
          };
        },
      },
      config: {
        default: {},
        parseHTML: element => {
          const configStr = element.getAttribute('data-config');
          return configStr ? JSON.parse(configStr) : {};
        },
        renderHTML: attributes => {
          return {
            'data-config': JSON.stringify(attributes.config),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="graph"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'graph' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GraphNodeView);
  },
});
