'use client';

import React, { lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRenderer, TableHead, TableBody, TableRow, TableCell } from './TableRenderer';

// Lazy load heavy components
const CodeBlock = lazy(() =>
  import('./CodeBlock').then((mod) => ({ default: mod.CodeBlock }))
);

const ImageRenderer = lazy(() =>
  import('./ImageRenderer').then((mod) => ({ default: mod.ImageRenderer }))
);

const MermaidRenderer = lazy(() =>
  import('./MermaidRenderer').then((mod) => ({ default: mod.MermaidRenderer }))
);

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  content,
  isStreaming = false,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, {
            strict: false,
            trust: true,
            throwOnError: false,
            output: 'html',
            displayMode: false,
            fleqn: false,
            macros: {
              "\\RR": "\\mathbb{R}",
              "\\NN": "\\mathbb{N}",
              "\\ZZ": "\\mathbb{Z}",
              "\\QQ": "\\mathbb{Q}",
              "\\CC": "\\mathbb{C}",
            },
          }]
        ]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 first:mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mt-4 mb-2 first:mt-0" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold mt-3 mb-2 first:mt-0" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-base font-semibold mt-2 mb-1 first:mt-0" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-sm font-semibold mt-2 mb-1 first:mt-0" {...props} />
          ),

          // Paragraphs
          p: ({ node, children, ...props }) => {
            // Check if paragraph contains only an image (to avoid nesting div in p)
            const hasOnlyImage = node?.children?.length === 1 && 
              node.children[0].type === 'element' && 
              node.children[0].tagName === 'img';
            
            if (hasOnlyImage) {
              // Render children directly without p wrapper
              return <>{children}</>;
            }
            
            return <p className="mb-4 last:mb-0 leading-relaxed" {...props}>{children}</p>;
          },

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),

          // Emphasis
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through" {...props} />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground/30 pl-4 py-2 my-4 italic text-muted-foreground"
              {...props}
            />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t border-border" {...props} />
          ),

          // Inline code
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            // Block code - extract language and code content
            const language = match[1];
            const codeString = String(children).replace(/\n$/, '');
            
            // Check if it's a Mermaid diagram
            if (language === 'mermaid') {
              return (
                <Suspense fallback={<Skeleton className="w-full h-64 rounded-lg my-4" />}>
                  <MermaidRenderer chart={codeString} />
                </Suspense>
              );
            }
            
            return (
              <Suspense fallback={<Skeleton className="w-full h-32 rounded-lg my-4" />}>
                <CodeBlock code={codeString} language={language} />
              </Suspense>
            );
          },

          // Pre (wraps code blocks) - prevent double wrapping
          pre: ({ node, children }) => {
            // If children is a CodeBlock, render it directly without pre wrapper
            return <>{children}</>;
          },

          // Images with ImageRenderer component
          img: ({ node, src, alt, title, ...props }) => (
            <Suspense fallback={<Skeleton className="w-full h-64 rounded-lg my-4" />}>
              <ImageRenderer
                src={typeof src === 'string' ? src : ''}
                alt={typeof alt === 'string' ? alt : ''}
                title={typeof title === 'string' ? title : undefined}
                {...props}
              />
            </Suspense>
          ),

          // Tables with TableRenderer component
          table: ({ node, ...props }) => (
            <TableRenderer {...props} />
          ),
          thead: ({ node, ...props }) => (
            <TableHead {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <TableBody {...props} />
          ),
          tr: ({ node, children, ...props }) => {
            // Pass through - alternating colors will be handled by CSS nth-child
            return (
              <TableRow {...props}>
                {children}
              </TableRow>
            );
          },
          th: ({ node, ...props }) => (
            <TableCell isHeader={true} {...props} />
          ),
          td: ({ node, ...props }) => (
            <TableCell isHeader={false} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-current ml-1 animate-pulse" />
      )}
    </div>
  );
});
