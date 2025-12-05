'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ContentSession } from '@/lib/api/types';
import { Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ContentSessionCardProps {
  session: ContentSession;
}

/**
 * Individual session preview card component
 * Requirements: 3.4, 3.5
 */
export function ContentSessionCard({ session }: ContentSessionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/content/${session.id}`);
  };

  // Format date
  const formattedDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get preview text from content or prompt
  const previewText = session.content
    ? session.content.substring(0, 150)
    : session.prompt.substring(0, 150);

  // Status badge styling
  const statusStyles = {
    PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    GENERATING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{session.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </CardDescription>
          </div>
          <span
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap',
              statusStyles[session.status]
            )}
          >
            {session.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground line-clamp-3">
            {previewText}
            {(session.content || session.prompt).length > 150 && '...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
