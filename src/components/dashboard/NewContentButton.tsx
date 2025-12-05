'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreateSession } from '@/lib/query/hooks/useContentSessions';
import { useRouter } from 'next/navigation';

/**
 * Button component to initiate new content generation
 * Requirements: 3.1
 */
export function NewContentButton() {
  const [isCreating, setIsCreating] = useState(false);
  const createSession = useCreateSession();
  const router = useRouter();

  const handleCreateContent = async () => {
    setIsCreating(true);
    try {
      // Create a new session with default values
      const session = await createSession.mutateAsync({
        title: 'Untitled Content',
        prompt: '',
      });

      // Navigate to the content editor/generation page
      router.push(`/content/${session.id}`);
    } catch (error) {
      console.error('Failed to create content session:', error);
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateContent}
      disabled={isCreating}
      size="lg"
      className="w-full sm:w-auto"
    >
      <Plus className="h-5 w-5" />
      {isCreating ? 'Creating...' : 'New Content'}
    </Button>
  );
}
