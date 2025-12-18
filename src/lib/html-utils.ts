/**
 * Utility functions for HTML content processing
 */

/**
 * Strip HTML tags from content
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Get word count from HTML content
 */
export function getWordCount(html: string): number {
  const text = stripHtml(html);
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Get character count from HTML content (excluding HTML tags)
 */
export function getCharacterCount(html: string): number {
  const text = stripHtml(html);
  return text.length;
}

/**
 * Truncate HTML content to a specific length while preserving tags
 */
export function truncateHtml(html: string, maxLength: number): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) {
    return html;
  }
  
  // Simple truncation - for production, consider using a library like truncate-html
  const truncated = text.substring(0, maxLength);
  return truncated + "...";
}

/**
 * Get preview text from HTML content
 */
export function getPreviewText(html: string, maxLength: number = 150): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
}

/**
 * Sanitize HTML content (basic sanitization)
 * For production, consider using DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "");
}

/**
 * Parse HTML safely for rendering
 */
export function parseHtmlForRender(html: string): string {
  return sanitizeHtml(html);
}

/**
 * Extract first heading from HTML content
 */
export function extractFirstHeading(html: string): string | null {
  const headingMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
  if (headingMatch) {
    return stripHtml(headingMatch[1]);
  }
  return null;
}

/**
 * Check if HTML content is empty or only contains whitespace
 */
export function isHtmlEmpty(html: string): boolean {
  const text = stripHtml(html).trim();
  return text.length === 0;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
