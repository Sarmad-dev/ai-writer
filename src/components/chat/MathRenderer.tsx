'use client';

import React, { useMemo, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load react-katex components
const InlineMath = lazy(() =>
  import('react-katex').then((mod) => ({ default: mod.InlineMath }))
);

const BlockMath = lazy(() =>
  import('react-katex').then((mod) => ({ default: mod.BlockMath }))
);

interface MathRendererProps {
  math: string;
  displayMode?: boolean; // true for block math, false for inline math
  className?: string;
}

export const MathRenderer = React.memo(function MathRenderer({
  math,
  displayMode = false,
  className = '',
}: MathRendererProps) {
  // Sanitize and prepare math content
  const sanitizedMath = useMemo(() => {
    return math.trim();
  }, [math]);

  // Error fallback component
  const ErrorFallback = ({ error }: { error: Error }) => {
    console.error('KaTeX rendering error:', error);
    return (
      <span
        className={`inline-block px-2 py-1 bg-destructive/10 text-destructive rounded text-sm font-mono ${className}`}
        title="Invalid LaTeX syntax"
      >
        <span className="text-xs mr-1">⚠️</span>
        {sanitizedMath}
      </span>
    );
  };

  if (displayMode) {
    // Block math - centered and on its own line
    return (
      <div 
        className={`my-4 overflow-x-auto ${className}`}
        role="math"
        aria-label={`Mathematical equation: ${sanitizedMath}`}
      >
        <Suspense fallback={<Skeleton className="w-full h-12 rounded" />}>
          <BlockMath
            math={sanitizedMath}
            errorColor="#ef4444"
            renderError={(error: Error) => <ErrorFallback error={error} />}
          />
        </Suspense>
      </div>
    );
  } else {
    // Inline math - within text flow
    return (
      <span 
        className={`inline-block ${className}`}
        role="math"
        aria-label={`Mathematical expression: ${sanitizedMath}`}
      >
        <Suspense fallback={<Skeleton className="inline-block w-16 h-4 rounded" />}>
          <InlineMath
            math={sanitizedMath}
            errorColor="#ef4444"
            renderError={(error: Error) => <ErrorFallback error={error} />}
          />
        </Suspense>
      </span>
    );
  }
});
