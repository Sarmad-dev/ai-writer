'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AlertCircle, Play, Loader2, BarChart3, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const EChartsRenderer = lazy(() =>
  import('./EChartsRenderer').then((mod) => ({ default: mod.EChartsRenderer }))
);

interface ChartRendererProps {
  code: string;
  className?: string;
  autoExecute?: boolean;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  images?: string[];
  interactiveData?: any;
  logs?: any[];
  error?: string;
  traceback?: string[];
}

export const ChartRenderer = React.memo(function ChartRenderer({
  code,
  className,
  autoExecute = true,
}: ChartRendererProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [executed, setExecuted] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'static'>('interactive');

  const executeCode = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/charts/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      setResult(data);
      setExecuted(true);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute code',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoExecute && !executed) {
      executeCode();
    }
  }, [autoExecute, executed]);
  if (loading) {
    return (
      <div className={cn('my-4 p-4 border rounded-lg', className)}>
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Executing Python code...</span>
        </div>
        <Skeleton className="w-full h-64 rounded" />
      </div>
    );
  }

  if (!executed && !autoExecute) {
    return (
      <div className={cn('my-4 p-4 border rounded-lg', className)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Python Chart Code</span>
          <Button onClick={executeCode} size="sm" className="gap-2">
            <Play className="w-3 h-3" />
            Execute
          </Button>
        </div>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  if (result?.error) {
    return (
      <div className={cn('my-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive mb-2">
              Python Execution Error
            </p>
            <p className="text-xs text-destructive/80 mb-3">{result.error}</p>
            {result.traceback && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                  Show traceback
                </summary>
                <pre className="mt-2 p-3 bg-muted/50 rounded border overflow-x-auto">
                  <code>{Array.isArray(result.traceback) ? result.traceback.join('\n') : String(result.traceback)}</code>
                </pre>
              </details>
            )}
            <details className="text-xs mt-3">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                Show code
              </summary>
              <pre className="mt-2 p-3 bg-muted/50 rounded border overflow-x-auto">
                <code>{code}</code>
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    const hasInteractiveData = result.interactiveData && Object.keys(result.interactiveData).length > 0;
    const hasImages = result.images && result.images.length > 0;

    return (
      <div className={cn('my-4', className)}>
        {/* Mode toggle buttons */}
        {hasInteractiveData && hasImages && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={viewMode === 'interactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('interactive')}
              className="gap-2"
            >
              <BarChart3 className="w-3 h-3" />
              Interactive
            </Button>
            <Button
              variant={viewMode === 'static' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('static')}
              className="gap-2"
            >
              <Image className="w-3 h-3" />
              Static
            </Button>
          </div>
        )}

        {/* Display interactive chart */}
        {viewMode === 'interactive' && hasInteractiveData && (
          <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg" />}>
            <EChartsRenderer data={result.interactiveData} />
          </Suspense>
        )}

        {/* Display static images */}
        {(viewMode === 'static' || !hasInteractiveData) && hasImages && (
          <div className="space-y-4">
            {result.images?.map((image, index) => (
              <div key={index} className="flex justify-center">
                <img
                  src={image}
                  alt={`Generated chart ${index + 1}`}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Fallback if no charts available */}
        {!hasImages && !hasInteractiveData && (
          <div className="p-4 bg-muted/50 rounded text-sm text-muted-foreground">
            No charts were generated from the code.
          </div>
        )}
        
        {/* Display text output if any */}
        {result.output && (
          <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
            <pre className="whitespace-pre-wrap">{result.output}</pre>
          </div>
        )}
      </div>
    );
  }

  return null;
});