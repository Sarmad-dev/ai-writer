'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load syntax highlighter to reduce initial bundle size
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then((mod) => ({
    default: mod.Prism,
  }))
);

// Lazy load theme
const oneDarkPromise = import('react-syntax-highlighter/dist/esm/styles/prism').then(
  (mod) => mod.oneDark
);

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

// Internal component that uses the lazy-loaded SyntaxHighlighter
const CodeBlockContent = React.memo(function CodeBlockContent({
  code,
  language,
  showLineNumbers,
  syntaxLanguage,
}: {
  code: string;
  language: string;
  showLineNumbers: boolean;
  syntaxLanguage: string;
}) {
  const [theme, setTheme] = useState<any>(null);

  // Load theme on mount
  React.useEffect(() => {
    oneDarkPromise.then(setTheme);
  }, []);

  if (!theme) {
    return <Skeleton className="w-full h-32 rounded-b-lg" />;
  }

  return (
    <Suspense fallback={<Skeleton className="w-full h-32 rounded-b-lg" />}>
      <SyntaxHighlighter
        language={syntaxLanguage}
        style={theme}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          fontSize: '0.875rem',
          border: '1px solid hsl(var(--border))',
          borderTop: 'none',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
        }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </Suspense>
  );
});

export const CodeBlock = React.memo(function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Normalize language identifier
  const normalizedLanguage = language.toLowerCase().trim();

  // Map common language aliases to supported languages
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    cpp: 'cpp',
    'c++': 'cpp',
    rs: 'rust',
  };

  const displayLanguage = languageMap[normalizedLanguage] || normalizedLanguage;

  // Supported languages list
  const supportedLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'go',
    'rust',
    'sql',
    'jsx',
    'tsx',
    'json',
    'html',
    'css',
    'bash',
    'shell',
    'yaml',
    'markdown',
  ];

  // Use the language if supported, otherwise default to 'text'
  const syntaxLanguage = supportedLanguages.includes(displayLanguage)
    ? displayLanguage
    : 'text';

  return (
    <div className={cn('relative group my-4', className)} role="region" aria-label={`Code block in ${displayLanguage || 'text'}`}>
      {/* Language label and copy button header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border border-b-0 border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase" aria-label={`Programming language: ${displayLanguage || 'text'}`}>
          {displayLanguage || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-muted transition-colors opacity-70 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code block with syntax highlighting */}
      <CodeBlockContent
        code={code}
        language={language}
        showLineNumbers={showLineNumbers}
        syntaxLanguage={syntaxLanguage}
      />
    </div>
  );
});
