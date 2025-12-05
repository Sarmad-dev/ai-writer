import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient instance with optimized caching configuration
 * for the AI Content Writer application.
 * 
 * Configuration:
 * - Retry: 3 attempts with exponential backoff (Requirements 9.4)
 * - Stale time: 5 minutes (Requirements 9.5)
 * - Cache time: 10 minutes
 * - Refetch on window focus for fresh data
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale-while-revalidate: serve cached data while revalidating (Requirements 9.5)
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        
        // Retry failed requests with exponential backoff (Requirements 9.4)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus to ensure fresh data
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Singleton instance for server-side rendering
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse the same query client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
