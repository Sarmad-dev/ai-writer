'use client';

import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageRendererProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export const ImageRenderer = React.memo(function ImageRenderer({
  src,
  alt,
  title,
  className,
}: ImageRendererProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    setImageDimensions(null);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoading(false);
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Check if image is base64 encoded
  const isBase64 = src.startsWith('data:image/');

  // Error fallback UI
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 p-6 my-4 bg-muted/50 border border-border rounded-lg',
          className
        )}
        role="img"
        aria-label={alt || 'Failed to load image'}
      >
        <ImageOff className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Failed to load image
          </p>
          {alt && (
            <p className="text-xs text-muted-foreground/70 mt-1">{alt}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <figure className={cn('relative my-4', className)}>
      {/* Loading skeleton */}
      {loading && (
        <Skeleton className="w-full h-64 rounded-lg" aria-label="Loading image" />
      )}

      {/* Image with lazy loading and scaling */}
      <img
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'max-w-full h-auto rounded-lg border border-border',
          loading && 'hidden',
          // Scale large images to fit container
          'object-contain max-h-[600px]'
        )}
        style={{
          display: loading ? 'none' : 'block',
        }}
      />

      {/* Optional caption from title or alt */}
      {!loading && !error && (title || alt) && (
        <figcaption className="text-xs text-muted-foreground text-center mt-2">
          {title || alt}
        </figcaption>
      )}
    </figure>
  );
});
