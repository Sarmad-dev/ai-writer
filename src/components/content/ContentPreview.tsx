"use client";

import { parseHtmlForRender } from "@/lib/html-utils";
import { cn } from "@/lib/utils";

interface ContentPreviewProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

export function ContentPreview({ content, className, maxHeight = "4.5rem" }: ContentPreviewProps) {
  const sanitizedContent = parseHtmlForRender(content);

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none overflow-hidden text-ellipsis",
        "prose-headings:text-sm prose-headings:font-semibold prose-headings:mb-1",
        "prose-p:text-sm prose-p:leading-relaxed prose-p:mb-1",
        "prose-ul:text-sm prose-ul:mb-1 prose-ol:text-sm prose-ol:mb-1",
        "prose-li:text-sm prose-li:mb-0",
        "text-muted-foreground line-clamp-3",
        className
      )}
      style={{
        maxHeight,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
