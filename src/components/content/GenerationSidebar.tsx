'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Brain, 
  Search, 
  Sparkles, 
  BookOpen, 
  FileCheck, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  Save 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStatus } from '@/lib/agent/types';

interface GenerationStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
  icon?: any;
}

interface GenerationSidebarProps {
  status: WorkflowStatus;
  steps: GenerationStep[];
}

const statusConfig: Record<WorkflowStatus, { label: string; color: string; icon: any }> = {
  idle: { label: 'Ready to Generate', color: 'text-gray-500', icon: Clock },
  analyzing: { label: 'Analyzing Your Request', color: 'text-blue-500', icon: Brain },
  searching: { label: 'Researching Information', color: 'text-purple-500', icon: Search },
  waiting_approval: { label: 'Awaiting Approval', color: 'text-yellow-500', icon: Clock },
  generating: { label: 'Creating Content', color: 'text-green-500', icon: Sparkles },
  formatting: { label: 'Polishing Output', color: 'text-indigo-500', icon: FileText },
  saving: { label: 'Saving Your Work', color: 'text-teal-500', icon: Save },
  completed: { label: 'All Done!', color: 'text-green-600', icon: CheckCircle2 },
  error: { label: 'Something Went Wrong', color: 'text-red-500', icon: AlertCircle },
};

export function GenerationSidebar({ status, steps }: GenerationSidebarProps) {
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="h-full flex flex-col border-r bg-linear-to-b from-muted/30 to-muted/10">
      {/* Header with Status */}
      <div className="border-b bg-card px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            'p-2 rounded-lg',
            status === 'completed' ? 'bg-green-500/10' : 'bg-primary/10'
          )}>
            <StatusIcon className={cn('h-5 w-5', currentStatus.color, {
              'animate-spin': ['analyzing', 'searching', 'generating', 'formatting', 'saving'].includes(status)
            })} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">AI Workflow</h3>
            <p className="text-xs text-muted-foreground">{currentStatus.label}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedSteps}/{totalSteps}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                status === 'completed' ? 'bg-green-500' : 'bg-primary'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {steps.map((step, index) => {
          const StepIcon = step.icon || Clock;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div className={cn(
                  "absolute left-[19px] top-10 w-0.5 h-[calc(100%+8px)] -z-10",
                  step.status === 'completed' ? 'bg-green-500/30' : 'bg-border'
                )} />
              )}

              {/* Step Card */}
              <div className={cn(
                'relative rounded-lg border transition-all duration-300',
                step.status === 'pending' && 'bg-card/50 border-border',
                step.status === 'active' && 'bg-card border-primary shadow-md shadow-primary/10',
                step.status === 'completed' && 'bg-green-500/5 border-green-500/20',
                step.status === 'error' && 'bg-red-500/5 border-red-500/20'
              )}>
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      'shrink-0 p-1.5 rounded-md',
                      step.status === 'pending' && 'bg-muted',
                      step.status === 'active' && 'bg-primary/10',
                      step.status === 'completed' && 'bg-green-500/10',
                      step.status === 'error' && 'bg-red-500/10'
                    )}>
                      {step.status === 'pending' && (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {step.status === 'active' && (
                        <StepIcon className="h-4 w-4 text-primary animate-pulse" />
                      )}
                      {step.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {step.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        'text-sm font-medium mb-1',
                        step.status === 'pending' && 'text-muted-foreground',
                        step.status === 'active' && 'text-foreground',
                        step.status === 'completed' && 'text-foreground',
                        step.status === 'error' && 'text-red-600'
                      )}>
                        {step.name}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {status === 'completed' && (
        <div className="border-t bg-green-500/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Content ready for editing!</span>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="border-t bg-red-500/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Generation failed. Please try again.</span>
          </div>
        </div>
      )}
    </div>
  );
}
