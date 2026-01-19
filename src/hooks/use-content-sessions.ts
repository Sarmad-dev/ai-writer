import { ContentSession } from "@/lib/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateSessionInput {
  title: string;
  prompt?: string;
  content?: string;
}

interface UpdateSessionInput {
  title?: string;
  content?: string;
  prompt?: string;
}

interface DuplicateSessionInput {
  sessionId: string;
  title?: string;
}

// Query Keys
export const contentSessionKeys = {
  all: ["content-sessions"] as const,
  detail: (id: string) => ["content-sessions", id] as const,
};

// Fetch all sessions
async function fetchSessions(): Promise<ContentSession[]> {
  const response = await fetch("/api/content/sessions");
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  const data = await response.json();

  // Parse dates and calculate word/character counts
  return data.data.map((session: ContentSession) => {
    const content = session.content || "";
    const text = content.replace(/<[^>]*>/g, ""); // Strip HTML
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word: string) => word.length > 0);

    return {
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      wordCount: words.length,
      characterCount: text.length,
    };
  });
}

// Fetch single session
async function fetchSession(id: string): Promise<ContentSession> {
  const response = await fetch(`/api/content/sessions/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }
  const data = await response.json();

  const content = data.content || "";
  const text = content.replace(/<[^>]*>/g, ""); // Strip HTML
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word: string) => word.length > 0);

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    wordCount: words.length,
    characterCount: text.length,
  };
}

// Create session
async function createSession(
  input: CreateSessionInput
): Promise<ContentSession> {
  const response = await fetch("/api/content/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  const data = await response.json();
  const content = data.content || "";
  const text = content.replace(/<[^>]*>/g, "");
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word: string) => word.length > 0);

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    wordCount: words.length,
    characterCount: text.length,
  };
}

// Update session
async function updateSession(
  id: string,
  input: UpdateSessionInput
): Promise<ContentSession> {
  const response = await fetch(`/api/content/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update session");
  }

  const data = await response.json();
  const content = data.content || "";
  const text = content.replace(/<[^>]*>/g, "");
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word: string) => word.length > 0);

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    wordCount: words.length,
    characterCount: text.length,
  };
}

// Delete session
async function deleteSession(id: string): Promise<void> {
  const response = await fetch(`/api/content/sessions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete session");
  }
}

// Duplicate session
async function duplicateSession(
  input: DuplicateSessionInput
): Promise<ContentSession> {
  const response = await fetch("/api/content/sessions/duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to duplicate session");
  }

  const data = await response.json();
  const content = data.content || "";
  const text = content.replace(/<[^>]*>/g, "");
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word: string) => word.length > 0);

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    wordCount: words.length,
    characterCount: text.length,
  };
}

// Hooks
export function useContentSessions() {
  return useQuery({
    queryKey: contentSessionKeys.all,
    queryFn: fetchSessions,
  });
}

export function useContentSession(id: string) {
  return useQuery({
    queryKey: contentSessionKeys.detail(id),
    queryFn: () => fetchSession(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.all });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionInput }) =>
      updateSession(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.all });
      queryClient.invalidateQueries({
        queryKey: contentSessionKeys.detail(data.id),
      });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.all });
    },
  });
}

export function useDuplicateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.all });
    },
  });
}
