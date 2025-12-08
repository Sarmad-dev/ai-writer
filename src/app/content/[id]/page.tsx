"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Sparkles,
  Brain,
  Search,
  Save as SaveIcon,
} from "lucide-react";
import { GenerationSidebar } from "@/components/content/GenerationSidebar";
import {
  ContentEditor,
  type ContentEditorRef,
} from "@/components/editor/ContentEditor";
import type {
  WorkflowStatus,
} from "@/lib/agent/types";

interface GenerationStep {
  name: string;
  status: "pending" | "active" | "completed" | "error";
  description: string;
  icon?: any;
}

export default function ContentDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [content, setContent] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<ContentEditorRef>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      name: "Analyze & Detect",
      status: "pending",
      description: "Understanding your request and detecting content type",
      icon: Brain,
    },
    {
      name: "Research",
      status: "pending",
      description: "Searching the web for relevant information",
      icon: Search,
    },
    {
      name: "Generate Content",
      status: "pending",
      description: "Creating high-quality content with advanced vocabulary and grammar",
      icon: Sparkles,
    },
    {
      name: "Save",
      status: "pending",
      description: "Saving your content",
      icon: SaveIcon,
    },
  ]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`/api/content/sessions/${sessionId}`);
        if (!response.ok) throw new Error("Failed to load session");

        const data = await response.json();
        setPromptInput(data.prompt || "");
        setContent(data.content || "");
      } catch (err) {
        console.error("Error loading session:", err);
        setError("Failed to load session");
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
  const startGeneration = useCallback(
    async (promptText: string) => {
      if (!promptText.trim()) return;

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsGenerating(true);
      setError(null);
      setStatus("analyzing");

      // Reset steps
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: "pending" as const }))
      );

      // Update session with new prompt
      try {
        await fetch(`/api/content/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText }),
        });
      } catch (err) {
        console.error("Error updating prompt:", err);
        setError("Failed to update prompt");
        setIsGenerating(false);
        return;
      }

      // Connect to SSE stream
      const eventSource = new EventSource(
        `/api/agent/generate?sessionId=${sessionId}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "connected") {
            console.log("Connected to generation stream");
          } else if (data.type === "status") {
            setStatus(data.status);
            updateStepsFromStatus(data.status);
          } else if (data.type === "state") {
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
          } else if (data.type === "complete") {
            setStatus("completed");
            updateStepsFromStatus("completed");
            if (data.content) {
              setContent(data.content);
            }
            setIsGenerating(false);
            eventSource.close();
            eventSourceRef.current = null;
          } else if (data.type === "error") {
            setError(data.error);
            setStatus("error");
            updateStepsFromStatus("error");
            setIsGenerating(false);
            eventSource.close();
            eventSourceRef.current = null;
          }
        } catch (err) {
          console.error("Failed to parse SSE message:", err);
        }
      };

      eventSource.onerror = () => {
        setIsGenerating(false);
        eventSource.close();
        eventSourceRef.current = null;
      };
    },
    [sessionId]
  );

  const updateStepsFromNodeHistory = useCallback((nodeHistory: string[]) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      const nodeMap: Record<string, number> = {
        analyze: 0,
        search: 1,
        generate: 2,
        save: 3,
      };

      // Mark all nodes in history as completed
      nodeHistory.forEach((nodeName) => {
        const stepIndex = nodeMap[nodeName];
        if (stepIndex !== undefined) {
          newSteps[stepIndex].status = "completed";
        }
      });

      return newSteps;
    });
  }, []);

  const updateStepsFromStatus = useCallback((currentStatus: WorkflowStatus) => {
    setSteps((prev) => {
      const newSteps = [...prev];

      switch (currentStatus) {
        case "analyzing":
          newSteps[0].status = "active";
          break;
        case "searching":
          newSteps[0].status = "completed";
          newSteps[1].status = "active";
          break;
        case "generating":
          newSteps[0].status = "completed";
          newSteps[1].status = "completed";
          newSteps[2].status = "active";
          break;
        case "saving":
          newSteps[0].status = "completed";
          newSteps[1].status = "completed";
          newSteps[2].status = "completed";
          newSteps[3].status = "active";
          break;
        case "completed":
          newSteps.forEach((step) => (step.status = "completed"));
          break;
        case "error":
          newSteps.forEach((step) => {
            if (step.status === "active") step.status = "error";
          });
          break;
      }

      return newSteps;
    });
  }, []);

  const handleSave = useCallback(
    async (newContent: string) => {
      try {
        const response = await fetch(`/api/content/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          throw new Error("Failed to save content");
        }
      } catch (err) {
        console.error("Error saving content:", err);
        throw err;
      }
    },
    [sessionId]
  );



  const handleGenerateClick = useCallback(() => {
    if (promptInput.trim() && !isGenerating) {
      startGeneration(promptInput);
    }
  }, [promptInput, isGenerating, startGeneration]);

  const handlePromptKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
        e.preventDefault();
        handleGenerateClick();
      }
    },
    [handleGenerateClick, isGenerating]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Generation Progress */}
        <div className="w-80 shrink-0">
          <GenerationSidebar status={status} steps={steps} />
        </div>

        {/* Center - Content Editor */}
        <div className="flex-1 min-w-0 relative">
          <ContentEditor
            ref={editorRef}
            sessionId={sessionId}
            initialContent={content}
            onSave={handleSave}
            autoSave={true}
            autoSaveDelay={2000}
          />
          <div className="relative w-full h-[50px] -top-14 flex items-center justify-center">
            <div className="flex items-center justify-center gap-4 w-[500px] border-2 border-secondary rounded-md px-2 h-full group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all bg-background">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <Input
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Enter your prompt to generate or regenerate content..."
                className="h-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent!"
                disabled={isGenerating}
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
