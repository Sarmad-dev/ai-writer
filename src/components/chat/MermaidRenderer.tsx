'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

// Lazy load mermaid library
let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;
let mermaidInstance: typeof import('mermaid').default | null = null;

const loadMermaid = async () => {
  if (mermaidInstance) {
    return mermaidInstance;
  }

  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const mermaid = mod.default;
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'strict',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          suppressErrorRendering: false,
        });
      } catch (err) {
        console.warn('Mermaid initialization warning:', err);
      }
      mermaidInstance = mermaid;
      return mermaid;
    });
  }

  return mermaidPromise;
};

export const MermaidRenderer = React.memo(function MermaidRenderer({
  chart,
  className,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');
  const renderAttemptedRef = useRef(false);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart.trim()) {
        setLoading(false);
        return;
      }

      // Prevent multiple render attempts for the same chart
      if (renderAttemptedRef.current) {
        return;
      }
      renderAttemptedRef.current = true;

      setLoading(true);
      setError(null);

      try {
        // Lazy load mermaid library
        const mermaid = await loadMermaid();
        
        // Generate a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Validate and render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
        
        setSvg(renderedSvg);
        setLoading(false);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setLoading(false);
      }
    };

    renderDiagram();
  }, [chart]);

  // Loading state
  if (loading) {
    return (
      <div className={cn('my-4', className)} role="img" aria-label="Loading diagram">
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'my-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg',
          className
        )}
        role="alert"
        aria-label="Diagram rendering error"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive mb-2">
              Failed to render Mermaid diagram
            </p>
            <p className="text-xs text-destructive/80 mb-3">{error}</p>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                Show diagram source
              </summary>
              <pre className="mt-2 p-3 bg-muted/50 rounded border border-border overflow-x-auto">
                <code className="text-xs font-mono">{chart}</code>
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Successful render
  return (
    <figure
      ref={containerRef}
      className={cn(
        'my-4 flex justify-center items-center overflow-x-auto',
        className
      )}
      role="img"
      aria-label="Mermaid diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});
