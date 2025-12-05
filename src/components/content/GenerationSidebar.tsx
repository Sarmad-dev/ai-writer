'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStatus } from '@/lib/agent/types';

interface GenerationStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
}

interface GenerationSidebarProps {
  status: WorkflowStatus;
  steps: GenerationStep[];
}

const statusConfig: Record<WorkflowStatus, { label: string; color: string; icon: any }> = {
  idle: { label: 'Ready', color: 'text-gray-500', icon: Clock },
  analyzing: { label: 'Analyzing', color: 'text-blue-500', icon: Loader2 },
  searching: { label: 'Searching', color: 'text-purple-500', icon: Loader2 },
  waiting_approval: { label: 'Waiting', color: 'text-yellow-500', icon: Clock },
  generating: { label: 'Generating', color: 'text-green-500', icon: Loader2 },
  formatting: { label: 'Formatting', color: 'text-indigo-500', icon: Loader2 },
  saving: { label: 'Saving', color: 'text-teal-500', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-green-600', icon: CheckCircle2 },
  error: { label: 'Error', color: 'text-red-500', icon: AlertCircle },
};

export function GenerationSidebar({ status, steps }: GenerationSidebarProps) {
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="h-full flex flex-col border-r bg-muted/30">
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-5 w-5', currentStatus.color, {
            'animate-spin': ['analyzing', 'searching', 'generating', 'formatting', 'saving'].includes(status)
          })} />
          <h3 className="font-semibold">Generation Progress</h3>
        </div>
        <Badge variant="secondary" className={cn('mt-2', currentStatus.color)}>
          {currentStatus.label}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {steps.map((step, index) => (
          <Card key={index} className={cn(
            'transition-all',
            step.status === 'active' && 'ring-2 ring-primary',
            step.status === 'completed' && 'bg-green-500/5',
            step.status === 'error' && 'bg-red-500/5'
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {step.status === 'pending' && (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                {step.status === 'active' && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <CardTitle className="text-sm">{step.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
