import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import {
  useContentSessions,
  useCreateSession,
  contentSessionKeys,
} from '@/lib/query/hooks';
import { apiClient } from '@/lib/api';
import type { ContentSession, CreateSessionRequest } from '@/lib/api/types';

/**
 * Property-Based Tests for Data Management
 * Testing React Query caching, invalidation, and retry behavior
 */

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Helper to create a wrapper with QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// Arbitraries for generating test data
const sessionStatusArb = fc.constantFrom('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

const contentSessionArb = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  prompt: fc.string({ minLength: 1, maxLength: 500 }),
  content: fc.option(fc.string({ maxLength: 1000 }), { nil: null }),
  status: sessionStatusArb,
  metadata: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: null }),
  createdAt: fc.integer({ min: 1577836800000, max: 1767225600000 }).map((ts) => new Date(ts).toISOString()),
  updatedAt: fc.integer({ min: 1577836800000, max: 1767225600000 }).map((ts) => new Date(ts).toISOString()),
}) as fc.Arbitrary<ContentSession>;

const createSessionRequestArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  prompt: fc.string({ minLength: 1, maxLength: 500 }),
  metadata: fc.option(fc.dictionary(fc.string(), fc.jsonValue())),
}) as fc.Arbitrary<CreateSessionRequest>;

describe('Data Management Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: ai-content-writer, Property 31: Cache invalidation on mutation
   * Validates: Requirements 9.3
   */
  it('should invalidate cache when mutation succeeds', async () => {
    await fc.assert(
      fc.asyncProperty(
        createSessionRequestArb,
        contentSessionArb,
        async (createRequest, mockSession) => {
          const queryClient = createTestQueryClient();
          const wrapper = createWrapper(queryClient);

          // Mock successful creation
          vi.mocked(apiClient.post).mockResolvedValueOnce(mockSession);

          // Pre-populate cache with some data
          const initialSessions = [mockSession];
          queryClient.setQueryData(
            contentSessionKeys.list({ page: 1, pageSize: 20 }),
            { data: initialSessions, total: 1, page: 1, pageSize: 20 }
          );

          // Verify cache is populated
          const cachedData = queryClient.getQueryData(
            contentSessionKeys.list({ page: 1, pageSize: 20 })
          );
          expect(cachedData).toBeDefined();

          // Execute mutation
          const { result } = renderHook(() => useCreateSession(), { wrapper });

          result.current.mutate(createRequest);

          await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
          });

          // Verify cache was invalidated (marked as stale)
          const queryState = queryClient.getQueryState(
            contentSessionKeys.list({ page: 1, pageSize: 20 })
          );

          // After invalidation, the query should be marked as invalid/stale
          expect(queryState?.isInvalidated).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ai-content-writer, Property 32: Request retry on failure
   * Validates: Requirements 9.4
   */
  it('should retry failed requests according to retry policy', async () => {
    // Use a faster retry delay for testing
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          retryDelay: 100, // Fast retry for testing
          staleTime: 0,
        },
      },
    });

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 3 }), async (failureCount) => {
        const wrapper = createWrapper(testQueryClient);

        // Mock API to fail a specific number of times, then succeed
        let attemptCount = 0;
        const mockSessions = {
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
        };

        vi.mocked(apiClient.get).mockImplementation(async () => {
          attemptCount++;
          if (attemptCount <= failureCount) {
            // Fail for the specified number of times
            throw new Error('Network error');
          }
          return mockSessions;
        });

        const { result } = renderHook(() => useContentSessions(1, 20), {
          wrapper,
        });

        // Wait for query to complete (either success after retries or final failure)
        await waitFor(
          () => {
            expect(result.current.isLoading).toBe(false);
          },
          { timeout: 5000 }
        );

        // Should eventually succeed after retries (since failureCount <= 3)
        expect(result.current.isSuccess).toBe(true);
        expect(attemptCount).toBe(failureCount + 1); // Initial + retries
        
        // Clear the query cache for next iteration
        testQueryClient.clear();
      }),
      { numRuns: 10 } // Reduced runs to avoid timeout
    );
  }, 30000); // Increase test timeout

  /**
   * Feature: ai-content-writer, Property 33: Cached data serving
   * Validates: Requirements 9.5
   */
  it('should serve cached data immediately while revalidating', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(contentSessionArb, { minLength: 1, maxLength: 10 }),
        async (sessions) => {
          const queryClient = createTestQueryClient();
          const wrapper = createWrapper(queryClient);

          const mockResponse = {
            data: sessions,
            total: sessions.length,
            page: 1,
            pageSize: 20,
          };

          // Pre-populate cache
          queryClient.setQueryData(
            contentSessionKeys.list({ page: 1, pageSize: 20 }),
            mockResponse
          );

          // Mock API for background revalidation
          vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

          // Render hook
          const { result } = renderHook(() => useContentSessions(1, 20), {
            wrapper,
          });

          // Should immediately have cached data (not loading)
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toEqual(mockResponse);
          expect(result.current.data?.data).toHaveLength(sessions.length);

          // Verify data matches cached sessions
          expect(result.current.data?.data).toEqual(sessions);
        }
      ),
      { numRuns: 100 }
    );
  });
});
