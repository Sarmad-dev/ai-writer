'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react';
import { GenerationSidebar } from '@/components/content/GenerationSidebar';
import { ContentEditor } from '@/components/editor/ContentEditor';
import { SuggestionsSidebar } from '@/components/content/SuggestionsSidebar';
import type { WorkflowStatus } from '@/lib/agent/types';

interface GenerationStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
}

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [status, setStatus] = useState<WorkflowStatus>('idle');
  const [content, setContent] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([
    { name: 'Analyze Prompt', status: 'pending', description: 'Understanding your requirements' },
    { name: 'Web Search', status: 'pending', description: 'Gathering relevant information' },
    { name: 'Approval', status: 'pending', description: 'Waiting for approval if needed' },
    { name: 'Generate Content', status: 'pending', description: 'Creating your content' },
    { name: 'Detect Graphs', status: 'pending', description: 'Identifying diagrams and visualizations' },
    { name: 'Format & Polish', status: 'pending', description: 'Finalizing the output' },
    { name: 'Save', status: 'pending', description: 'Saving to database' },
  ]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/api/content/sessions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session');
        
        const data = await response.json();
        setPromptInput(data.prompt || '');
        setContent(data.content || '');
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Handle generation with SSE
  const startGeneration = useCallback(async (promptText: string) => {
    if (!promptText.trim()) return;

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsGenerating(true);
    setError(null);
    setStatus('analyzing');
    
    // Reset steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));

    // Update session with new prompt
    try {
      await fetch(`/api/content/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
    } catch (err) {
      console.error('Error updating prompt:', err);
      setError('Failed to update prompt');
      setIsGenerating(false);
      return;
    }

    // Connect to SSE stream
    const eventSource = new EventSource(`/api/agent/generate?sessionId=${sessionId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          console.log('Connected to generation stream');
        } else if (data.type === 'status') {
          setStatus(data.status);
          updateStepsFromStatus(data.status);
        } else if (data.type === 'state') {
          if (data.status) {
            setStatus(data.status);
            updateStepsFromStatus(data.status);
          }
          if (data.generatedContent) {
            setContent(data.generatedContent);
          }
          // Update steps based on node history
          if (data.metadata?.nodeHistory) {
            updateStepsFromNodeHistory(data.metadata.nodeHistory);
          }
        } else if (data.type === 'complete') {
          setStatus('completed');
          updateStepsFromStatus('completed');
          if (data.content) {
            setContent(data.content);
          }
          setIsGenerating(false);
          eventSource.close();
          eventSourceRef.current = null;
        } else if (data.type === 'error') {
          setError(data.error);
          setStatus('error');
          updateStepsFromStatus('error');
          setIsGenerating(false);
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      setIsGenerating(false);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [sessionId]);

  const updateStepsFromNodeHistory = useCallback((nodeHistory: string[]) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      const nodeMap: Record<string, number> = {
        'analyze': 0,
        'search': 1,
        'approval': 2,
        'generate': 3,
        'detectGraphs': 4,
        'format': 5,
        'save': 6,
      };

      // Mark all nodes in history as completed
      nodeHistory.forEach((nodeName) => {
        const stepIndex = nodeMap[nodeName];
        if (stepIndex !== undefined) {
          newSteps[stepIndex].status = 'completed';
        }
      });

      return newSteps;
    });
  }, []);

  const updateStepsFromStatus = useCallback((currentStatus: WorkflowStatus) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      
      switch (currentStatus) {
        case 'analyzing':
          newSteps[0].status = 'active';
          break;
        case 'searching':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'active';
          break;
        case 'waiting_approval':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'active';
          break;
        case 'generating':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'completed';
          newSteps[3].status = 'active';
          break;
        case 'formatting':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'completed';
          newSteps[3].status = 'completed';
          newSteps[4].status = 'completed';
          newSteps[5].status = 'active';
          break;
        case 'saving':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'completed';
          newSteps[3].status = 'completed';
          newSteps[4].status = 'completed';
          newSteps[5].status = 'completed';
          newSteps[6].status = 'active';
          break;
        case 'completed':
          newSteps.forEach((step) => (step.status = 'completed'));
          break;
        case 'error':
          newSteps.forEach((step) => {
            if (step.status === 'active') step.status = 'error';
          });
          break;
      }
      
      return newSteps;
    });
  }, []);

  const handleSave = useCallback(async (newContent: string) => {
    try {
      const response = await fetch(`/api/content/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }
    } catch (err) {
      console.error('Error saving content:', err);
      throw err;
    }
  }, [sessionId]);

  const handleAcceptSuggestion = useCallback((suggestionId: string) => {
    console.log('Accepting suggestion:', suggestionId);
    // TODO: Implement suggestion acceptance
  }, []);

  const handleRejectSuggestion = useCallback((suggestionId: string) => {
    console.log('Rejecting suggestion:', suggestionId);
    // TODO: Implement suggestion rejection
  }, []);

  const handleGenerateClick = useCallback(() => {
    if (promptInput.trim() && !isGenerating) {
      startGeneration(promptInput);
    }
  }, [promptInput, isGenerating, startGeneration]);

  const handlePromptKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerateClick();
    }
  }, [handleGenerateClick, isGenerating]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Prompt Input */}
        <div className="flex-1 max-w-2xl flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Enter your prompt to generate or regenerate content..."
              className="pl-10 pr-4"
              disabled={isGenerating}
            />
          </div>
          <Button 
            onClick={handleGenerateClick}
            disabled={!promptInput.trim() || isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Generation Progress */}
        <div className="w-80 shrink-0">
          <GenerationSidebar status={status} steps={steps} />
        </div>

        {/* Center - Content Editor */}
        <div className="flex-1 min-w-0">
          <ContentEditor
            sessionId={sessionId}
            initialContent={content}
            onSave={handleSave}
            autoSave={true}
            autoSaveDelay={2000}
          />
        </div>

        {/* Right Sidebar - AI Suggestions */}
        <div className="w-80 shrink-0">
          <SuggestionsSidebar
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
          />
        </div>
      </div>
    </div>
  );
}
