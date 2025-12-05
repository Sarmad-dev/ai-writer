'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  type: 'improvement' | 'addition' | 'alternative';
  content: string;
  position?: number;
  confidence: number;
}

interface SuggestionsSidebarProps {
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
}

// Mock data - will be replaced with real AI suggestions
const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    type: 'improvement',
    content: 'Consider adding more specific examples to strengthen your argument.',
    confidence: 0.85,
  },
  {
    id: '2',
    type: 'addition',
    content: 'You might want to include statistics about market growth in this section.',
    confidence: 0.92,
  },
  {
    id: '3',
    type: 'alternative',
    content: 'Alternative phrasing: "Furthermore" instead of "Also" for better flow.',
    confidence: 0.78,
  },
];

export function SuggestionsSidebar({ onAccept, onReject }: SuggestionsSidebarProps) {
  const [suggestions] = useState<Suggestion[]>(mockSuggestions);

  const getTypeColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'improvement':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'addition':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'alternative':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    }
  };

  const getTypeLabel = (type: Suggestion['type']) => {
    switch (type) {
      case 'improvement':
        return 'Improve';
      case 'addition':
        return 'Add';
      case 'alternative':
        return 'Alternative';
    }
  };

  return (
    <div className="h-full flex flex-col border-l bg-muted/30">
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {suggestions.length} suggestions available
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              No suggestions yet. Start writing to get AI-powered recommendations.
            </p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className={cn('text-xs', getTypeColor(suggestion.type))}>
                    {getTypeLabel(suggestion.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(suggestion.confidence * 100)}% confident
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">{suggestion.content}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => onAccept(suggestion.id)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onReject(suggestion.id)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
