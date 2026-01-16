import { Brain, SaveIcon, Search, Sparkles } from "lucide-react";

export interface GenerationStep {
    name: string;
    status: "pending" | "active" | "completed" | "error";
    description: string;
    icon?: any;
  }

export const GenerationSteps: GenerationStep[] = [
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
      description:
        "Creating high-quality content with advanced vocabulary and grammar",
      icon: Sparkles,
    },
    {
      name: "Save",
      status: "pending",
      description: "Saving your content",
      icon: SaveIcon,
    },
  ]