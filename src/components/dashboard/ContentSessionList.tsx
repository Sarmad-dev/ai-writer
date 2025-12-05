'use client';

import { useContentSessions } from '@/lib/query/hooks/useContentSessions';
import { ContentSessionCard } from './ContentSessionCard';
import { Loader2, FileX } from 'lucide-react';

/**
 * Component to display user's content sessions
 * Requirements: 3.4
 */
export function ContentSessionList() {
  const { data, isLoading, error } = useContentSessions();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your content sessions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-destructive/10 text-destructive rounded-full p-3 w-fit mx-auto mb-4">
            <FileX className="h-6 w-6" />
          </div>
          <h3 className="font-semibold mb-2">Failed to load sessions</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="bg-muted rounded-full p-3 w-fit mx-auto mb-4">
            <FileX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No content sessions yet</h3>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first AI-generated content. Click the "New Content" button above.
          </p>
        </div>
      </div>
    );
  }

  // Display sessions in a grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.data.map((session) => (
        <ContentSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
