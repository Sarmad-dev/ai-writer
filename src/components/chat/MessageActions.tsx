'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  initialFeedback?: 'like' | 'dislike' | null;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
}

export const MessageActions = React.memo(function MessageActions({
  messageId,
  content,
  role,
  initialFeedback = null,
  onLike,
  onDislike,
  onShare,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'like' | 'dislike' | null>(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update feedback state when initialFeedback changes
  useEffect(() => {
    setFeedbackState(initialFeedback);
  }, [initialFeedback]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const submitFeedback = async (feedbackType: 'LIKE' | 'DISLIKE') => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackType }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const handleLike = async () => {
    if (isSubmitting) return;

    // Optimistic update
    const previousState = feedbackState;
    const newState = feedbackState === 'like' ? null : 'like';
    setFeedbackState(newState);
    setIsSubmitting(true);

    try {
      await submitFeedback('LIKE');
      
      // Call optional callback
      if (onLike) {
        onLike(messageId);
      }
    } catch (error) {
      // Rollback on error
      setFeedbackState(previousState);
      console.error('Failed to submit like feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDislike = async () => {
    if (isSubmitting) return;

    // Optimistic update
    const previousState = feedbackState;
    const newState = feedbackState === 'dislike' ? null : 'dislike';
    setFeedbackState(newState);
    setIsSubmitting(true);

    try {
      await submitFeedback('DISLIKE');
      
      // Call optional callback
      if (onDislike) {
        onDislike(messageId);
      }
    } catch (error) {
      // Rollback on error
      setFeedbackState(previousState);
      console.error('Failed to submit dislike feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(messageId);
    }
  };

  return (
    <nav className="flex items-center gap-1 mt-2" aria-label="Message actions">
      {/* Copy button - available for all messages */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            className="h-7 w-7"
            aria-label={copied ? 'Copied' : 'Copy message'}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? 'Copied!' : 'Copy message'}
        </TooltipContent>
      </Tooltip>

      {/* Like/Dislike buttons - only for assistant messages */}
      {role === 'assistant' && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLike}
                disabled={isSubmitting}
                className={cn(
                  'h-7 w-7',
                  feedbackState === 'like' && 'text-green-600'
                )}
                aria-label="Like message"
                aria-pressed={feedbackState === 'like'}
              >
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Like</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDislike}
                disabled={isSubmitting}
                className={cn(
                  'h-7 w-7',
                  feedbackState === 'dislike' && 'text-red-600'
                )}
                aria-label="Dislike message"
                aria-pressed={feedbackState === 'dislike'}
              >
                <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dislike</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* Share button - available for all messages */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleShare}
            className="h-7 w-7"
            aria-label="Share message"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
    </nav>
  );
});
