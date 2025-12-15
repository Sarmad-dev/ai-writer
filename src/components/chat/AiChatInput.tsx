"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconArrowUp,
  IconCloud,
  IconPhotoScan,
} from "@tabler/icons-react";
import { useRef, useState } from "react";

// Removed PROMPTS for cleaner interface

const MODELS = [
  {
    value: "gpt-5",
    name: "GPT-5",
    description: "Most advanced model",
    max: true,
  },
  {
    value: "gpt-4o",
    name: "GPT-4o",
    description: "Fast and capable",
  },
  {
    value: "gpt-4",
    name: "GPT-4",
    description: "Reliable and accurate",
  },
  {
    value: "claude-3.5",
    name: "Claude 3.5 Sonnet",
    description: "Great for coding tasks",
  },
];

interface AiChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function AiChatInput({ onSend, disabled }: AiChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    
    onSend(inputValue.trim());
    setInputValue("");
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleModelChange = (value: string) => {
    const model = MODELS.find((m) => m.value === value);
    if (model) {
      setSelectedModel(model);
    }
  };

  const renderMaxBadge = () => (
    <div className="flex h-[14px] items-center gap-1.5 rounded border border-border px-1 py-0">
      <span
        className="text-[9px] font-bold uppercase"
        style={{
          background:
            "linear-gradient(to right, rgb(129, 161, 193), rgb(125, 124, 155))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MAX
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-[calc(42rem-5rem)]">
      <div className="flex min-h-[120px] flex-col rounded-2xl cursor-text bg-card border border-border shadow-lg">
        <div className="flex-1 relative overflow-y-auto max-h-[258px]">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything"
            disabled={disabled}
            className="w-full border-0 p-3 transition-[padding] duration-200 ease-in-out min-h-[48.4px] outline-none text-[16px] text-foreground resize-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent! whitespace-pre-wrap wrap-break-word"
          />
        </div>

        <div className="flex min-h-[40px] items-center gap-2 p-2 pb-1">
          <div className="flex aspect-1 items-center gap-1 rounded-full bg-muted p-1.5 text-xs">
            <IconCloud className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="relative flex items-center">
            <Select
              value={selectedModel.value}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="w-fit border-none bg-transparent! p-0 text-sm text-muted-foreground hover:text-foreground focus:ring-0 shadow-none">
                <SelectValue>
                  {selectedModel.max ? (
                    <div className="flex items-center gap-1">
                      <span>{selectedModel.name}</span>
                      {renderMaxBadge()}
                    </div>
                  ) : (
                    <span>{selectedModel.name}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.max ? (
                      <div className="flex items-center gap-1">
                        <span>{model.name}</span>
                        {renderMaxBadge()}
                      </div>
                    ) : (
                      <span>{model.name}</span>
                    )}
                    <span className="text-muted-foreground block text-xs">
                      {model.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground transition-all duration-100"
              title="Attach images"
            >
              <IconPhotoScan className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-100 cursor-pointer bg-primary",
                inputValue && "bg-primary hover:bg-primary/90!"
              )}
              disabled={!inputValue || disabled}
              onClick={handleSend}
            >
              <IconArrowUp className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
}
