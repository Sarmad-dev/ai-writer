import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  ContentSession,
  CreateSessionRequest,
  UpdateSessionRequest,
  PaginatedResponse,
} from '@/lib/api/types';

/**
 * Query keys for content sessions
 */
export const contentSessionKeys = {
  all: ['contentSessions'] as const,
  lists: () => [...contentSessionKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...contentSessionKeys.lists(), filters] as const,
  details: () => [...contentSessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...contentSessionKeys.details(), id] as const,
};

/**
 * Hook to fetch all content sessions for the current user
 * (Requirements 9.1)
 */
export function useContentSessions(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: contentSessionKeys.list({ page, pageSize }),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ContentSession>>(
        `/content/sessions?page=${page}&pageSize=${pageSize}`
      );
      return response;
    },
  });
}

/**
 * Hook to fetch a single content session by ID
 * (Requirements 9.1)
 */
export function useContentSession(id: string) {
  return useQuery({
    queryKey: contentSessionKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ContentSession>(`/content/sessions/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new content session
 * (Requirements 9.2, 9.3)
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionRequest) => {
      const response = await apiClient.post<ContentSession>('/content/sessions', data);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch content sessions list (Requirements 9.3)
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing content session
 * (Requirements 9.2, 9.3)
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSessionRequest;
    }) => {
      const response = await apiClient.put<ContentSession>(
        `/content/sessions/${id}`,
        data
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate specific session and list (Requirements 9.3)
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.lists() });
    },
  });
}

/**
 * Hook to delete a content session
 * (Requirements 9.2, 9.3)
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/content/sessions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate specific session and list (Requirements 9.3)
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contentSessionKeys.lists() });
    },
  });
}
