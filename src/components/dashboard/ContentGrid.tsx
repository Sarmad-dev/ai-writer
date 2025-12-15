'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  MoreHorizontal,
  Eye,
  Edit,
  Share,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { useContentSessions } from '@/lib/query/hooks/useContentSessions';
import { ContentSession } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentCardProps {
  session: ContentSession;
  index: number;
  size?: 'small' | 'medium' | 'large';
}

function ContentCard({ session, index, size = 'medium' }: ContentCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/content/${session.id}`);
  };

  const formattedDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const previewText = session.content
    ? session.content.substring(0, 120)
    : session.prompt.substring(0, 120);

  const statusStyles = {
    PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    GENERATING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
  };

  return (
    <div
      className={cn(
        'dashboard-card group opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:-translate-y-1 transition-all',
        sizeClasses[size]
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <Card className="h-full cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {session.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
                <Badge className={cn('text-xs', statusStyles[session.status])}>
                  {session.status}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClick}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Bookmark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative" onClick={handleClick}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {previewText}
                {(session.content || session.prompt).length > 120 && '...'}
              </p>
              
              {size === 'large' && (
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>High engagement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>124 views</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ContentGrid() {
  const { data, isLoading, error } = useContentSessions();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-48 animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-destructive mb-4">
            <FileText className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="font-semibold mb-2">Failed to load content</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground mb-4">
            <FileText className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="font-semibold mb-2">No content yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Get started by creating your first AI-generated content.
          </p>
          <Button className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
            Create Content
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Create a varied layout with different card sizes
  const getCardSize = (index: number): 'small' | 'medium' | 'large' => {
    if (index === 0) return 'large';
    if (index % 5 === 0) return 'medium';
    return 'small';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-[200px]">
      {data.data.map((session, index) => (
        <ContentCard 
          key={session.id} 
          session={session} 
          index={index}
          size={getCardSize(index)}
        />
      ))}
    </div>
  );
}