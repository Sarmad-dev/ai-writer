'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  FileText, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'content' | 'chat' | 'report';
  title: string;
  status: 'completed' | 'processing' | 'failed';
  timestamp: string;
  preview?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'content',
    title: 'Blog Post: AI in Healthcare',
    status: 'completed',
    timestamp: '2 minutes ago',
    preview: 'Artificial intelligence is revolutionizing healthcare by enabling...',
  },
  {
    id: '2',
    type: 'chat',
    title: 'Marketing Strategy Discussion',
    status: 'completed',
    timestamp: '15 minutes ago',
    preview: 'Discussed various approaches to digital marketing campaigns...',
  },
  {
    id: '3',
    type: 'report',
    title: 'Q4 Performance Analysis',
    status: 'processing',
    timestamp: '1 hour ago',
    preview: 'Generating comprehensive analysis of quarterly metrics...',
  },
  {
    id: '4',
    type: 'content',
    title: 'Product Description: Smart Watch',
    status: 'completed',
    timestamp: '2 hours ago',
    preview: 'Experience the future of wearable technology with our latest...',
  },
  {
    id: '5',
    type: 'content',
    title: 'Email Newsletter Template',
    status: 'failed',
    timestamp: '3 hours ago',
    preview: 'Failed to generate newsletter due to content policy...',
  },
];

function ActivityItemComponent({ item, index }: { item: ActivityItem; index: number }) {
  const getIcon = () => {
    switch (item.type) {
      case 'content':
        return FileText;
      case 'chat':
        return MessageSquare;
      case 'report':
        return BarChart3;
      default:
        return FileText;
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <Badge variant="secondary" className={cn('text-xs', variants[item.status])}>
        {item.status}
      </Badge>
    );
  };

  const Icon = getIcon();

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer opacity-0 animate-in fade-in slide-in-from-left-4 duration-300"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{item.title}</h4>
          {getStatusIcon()}
        </div>
        
        {item.preview && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.preview}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function RecentActivity() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto activity-scrollbar">
          {mockActivities.map((item, index) => (
            <ActivityItemComponent key={item.id} item={item} index={index} />
          ))}
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}