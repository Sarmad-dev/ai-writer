import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  bash: 'Bash',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  yaml: 'YAML',
  markdown: 'Markdown',
  swift: 'Swift',
  kotlin: 'Kotlin',
};

export function CodeBlockNodeView({ node, updateAttributes, extension }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || 'plaintext';
  const languageLabel = LANGUAGE_LABELS[language] || language;

  const handleCopy = async () => {
    const code = node.textContent;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-language">{languageLabel}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="code-block-copy-button"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre>
        <NodeViewContent as="div" className="hljs" />
      </pre>
    </NodeViewWrapper>
  );
}
