'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { GenerationSidebar } from '@/components/content/GenerationSidebar';
import { ContentEditor } from '@/components/content/ContentEditor';
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
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([
    { name: 'Analyze Prompt', status: 'pending', description: 'Understanding your requirements' },
    { name: 'Web Search', status: 'pending', description: 'Gathering relevant information' },
    { name: 'Generate Content', status: 'pending', description: 'Creating your content' },
    { name: 'Format & Polish', status: 'pending', description: 'Finalizing the output' },
    { name: 'Save', status: 'pending', description: 'Saving to database' },
  ]);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/api/content/sessions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session');
        
        const data = await response.json();
        setPrompt(data.prompt || '');
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

  // Connect to SSE for generation updates
  useEffect(() => {
    if (status === 'idle' || status === 'completed' || status === 'error') {
      return;
    }

    const eventSource = new EventSource(`/api/agent/generate?sessionId=${sessionId}`);

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
        } else if (data.type === 'complete') {
          setStatus('completed');
          updateStepsFromStatus('completed');
          if (data.content) {
            setContent(data.content);
          }
        } else if (data.type === 'error') {
          setError(data.error);
          setStatus('error');
          updateStepsFromStatus('error');
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, status]);

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
        case 'generating':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'active';
          break;
        case 'formatting':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'completed';
          newSteps[3].status = 'active';
          break;
        case 'saving':
          newSteps[0].status = 'completed';
          newSteps[1].status = 'completed';
          newSteps[2].status = 'completed';
          newSteps[3].status = 'completed';
          newSteps[4].status = 'active';
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

  const handlePromptSubmit = useCallback(async (newPrompt: string) => {
    try {
      setStatus('analyzing');
      setError(null);
      
      // Update prompt in database
      await fetch(`/api/content/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: newPrompt }),
      });

      setPrompt(newPrompt);

      // Start generation
      const response = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: newPrompt,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }
    } catch (err) {
      console.error('Error submitting prompt:', err);
      setError('Failed to start generation');
      setStatus('error');
    }
  }, [sessionId]);

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
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

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
            initialPrompt={prompt}
            initialContent={content}
            onPromptSubmit={handlePromptSubmit}
            onSave={handleSave}
            isGenerating={!['idle', 'completed', 'error'].includes(status)}
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
