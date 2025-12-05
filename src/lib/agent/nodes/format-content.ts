import type { WorkflowState } from '../types';

/**
 * Format Content Node
 * Structures content for TipTap JSON format
 * 
 * This node:
 * 1. Converts markdown content to TipTap JSON format
 * 2. Embeds graphs at appropriate positions
 * 3. Applies proper formatting and structure
 * 4. Prepares content for the rich text editor
 */
export async function formatContentNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { generatedContent, graphs } = state;

    // Convert markdown to TipTap JSON
    const formattedContent = convertMarkdownToTipTap(generatedContent, graphs);

    return {
      formattedContent,
      status: 'formatting',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'format'],
      },
    };
  } catch (error) {
    console.error('Error in format content node:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to format content',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'format'],
      },
    };
  }
}

/**
 * Converts markdown content to TipTap JSON format
 */
function convertMarkdownToTipTap(
  markdown: string,
  graphs: WorkflowState['graphs']
): any {
  const doc: any = {
    type: 'doc',
    content: [],
  };

  // Split content into lines for processing
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = '';

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        doc.content.push(createParagraphNode(text));
      }
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim();
        codeBlockContent = [];
      } else {
        doc.content.push(createCodeBlockNode(codeBlockContent.join('\n'), codeBlockLanguage));
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLanguage = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle headings
    if (line.startsWith('#')) {
      flushParagraph();
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      doc.content.push(createHeadingNode(text, Math.min(level, 6)));
      continue;
    }

    // Handle horizontal rules
    if (/^[-*_]{3,}$/.test(line.trim())) {
      flushParagraph();
      doc.content.push({ type: 'horizontalRule' });
      continue;
    }

    // Handle bullet lists
    if (line.match(/^\s*[-*+]\s/)) {
      flushParagraph();
      const items = [line];
      // Collect consecutive list items
      while (i + 1 < lines.length && lines[i + 1].match(/^\s*[-*+]\s/)) {
        items.push(lines[++i]);
      }
      doc.content.push(createBulletListNode(items));
      continue;
    }

    // Handle ordered lists
    if (line.match(/^\s*\d+\.\s/)) {
      flushParagraph();
      const items = [line];
      // Collect consecutive list items
      while (i + 1 < lines.length && lines[i + 1].match(/^\s*\d+\.\s/)) {
        items.push(lines[++i]);
      }
      doc.content.push(createOrderedListNode(items));
      continue;
    }

    // Handle empty lines
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    // Regular paragraph text
    currentParagraph.push(line);
  }

  // Flush any remaining paragraph
  flushParagraph();

  // Embed graphs at the end (in production, you'd want smarter placement)
  graphs.forEach(graph => {
    doc.content.push(createGraphNode(graph));
  });

  return doc;
}

/**
 * Creates a TipTap paragraph node with inline formatting
 */
function createParagraphNode(text: string): any {
  return {
    type: 'paragraph',
    content: parseInlineFormatting(text),
  };
}

/**
 * Creates a TipTap heading node
 */
function createHeadingNode(text: string, level: number): any {
  return {
    type: 'heading',
    attrs: { level },
    content: parseInlineFormatting(text),
  };
}

/**
 * Creates a TipTap code block node
 */
function createCodeBlockNode(code: string, language: string): any {
  return {
    type: 'codeBlock',
    attrs: { language: language || null },
    content: [
      {
        type: 'text',
        text: code,
      },
    ],
  };
}

/**
 * Creates a TipTap bullet list node
 */
function createBulletListNode(items: string[]): any {
  return {
    type: 'bulletList',
    content: items.map(item => ({
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: parseInlineFormatting(item.replace(/^\s*[-*+]\s/, '')),
        },
      ],
    })),
  };
}

/**
 * Creates a TipTap ordered list node
 */
function createOrderedListNode(items: string[]): any {
  return {
    type: 'orderedList',
    content: items.map(item => ({
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: parseInlineFormatting(item.replace(/^\s*\d+\.\s/, '')),
        },
      ],
    })),
  };
}

/**
 * Creates a custom graph node for TipTap
 */
function createGraphNode(graph: WorkflowState['graphs'][0]): any {
  return {
    type: 'graph',
    attrs: {
      id: graph.id,
      chartType: graph.type,
      data: graph.data,
      config: graph.config,
    },
  };
}

/**
 * Parses inline formatting (bold, italic, links, code)
 */
function parseInlineFormatting(text: string): any[] {
  const content: any[] = [];
  let currentText = '';
  let i = 0;

  const flushText = () => {
    if (currentText) {
      content.push({ type: 'text', text: currentText });
      currentText = '';
    }
  };

  while (i < text.length) {
    // Handle bold (**text** or __text__)
    if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
      flushText();
      const delimiter = text.slice(i, i + 2);
      const endIndex = text.indexOf(delimiter, i + 2);
      if (endIndex !== -1) {
        const boldText = text.slice(i + 2, endIndex);
        content.push({
          type: 'text',
          text: boldText,
          marks: [{ type: 'bold' }],
        });
        i = endIndex + 2;
        continue;
      }
    }

    // Handle italic (*text* or _text_)
    if (text[i] === '*' || text[i] === '_') {
      flushText();
      const delimiter = text[i];
      const endIndex = text.indexOf(delimiter, i + 1);
      if (endIndex !== -1 && text[i + 1] !== delimiter) {
        const italicText = text.slice(i + 1, endIndex);
        content.push({
          type: 'text',
          text: italicText,
          marks: [{ type: 'italic' }],
        });
        i = endIndex + 1;
        continue;
      }
    }

    // Handle inline code (`code`)
    if (text[i] === '`') {
      flushText();
      const endIndex = text.indexOf('`', i + 1);
      if (endIndex !== -1) {
        const codeText = text.slice(i + 1, endIndex);
        content.push({
          type: 'text',
          text: codeText,
          marks: [{ type: 'code' }],
        });
        i = endIndex + 1;
        continue;
      }
    }

    // Handle links [text](url)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i);
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          flushText();
          const linkText = text.slice(i + 1, closeBracket);
          const url = text.slice(closeBracket + 2, closeParen);
          content.push({
            type: 'text',
            text: linkText,
            marks: [{ type: 'link', attrs: { href: url } }],
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    currentText += text[i];
    i++;
  }

  flushText();

  return content.length > 0 ? content : [{ type: 'text', text: '' }];
}
