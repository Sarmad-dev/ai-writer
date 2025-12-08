import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/db/prisma';
import { createEnhancedInitialState, executeEnhancedWorkflow } from '@/lib/agent/workflow';
import type { EnhancedWorkflowState } from '@/lib/agent/types';

// Mock environment variables for testing
vi.mock('@/lib/env', () => ({
  env: {
    OPENAI_API_KEY: 'test-key',
    SEARCH_API_KEY: 'test-key',
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: 'test-secret-32-characters-long!!',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NODE_ENV: 'test',
  },
}));

// Helper to generate valid prompts
const promptArbitrary = fc.string({ minLength: 10, maxLength: 200 });

// Helper to generate session IDs
const sessionIdArbitrary = fc.uuid();

// Helper to create a test content session
async function createTestSession(userId: string, prompt: string) {
  return await prisma.contentSession.create({
    data: {
      userId,
      title: 'Test Session',
      prompt,
      status: 'PENDING',
    },
  });
}

// Helper to create a test user
async function createTestUser(email: string) {
  return await prisma.user.create({
    data: {
      email,
      name: 'Test User',
    },
  });
}

// Cleanup function
async function cleanupTestData() {
  try {
    await prisma.contentSession.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

describe('Streamlined Workflow Properties', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  // Feature: enhanced-ai-workflow, Property 25: No approval requests created
  // **Validates: Requirements 6.1**
  it('should not create approval requests for any workflow execution', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        promptArbitrary,
        async (email, prompt) => {
          // Create test user
          const user = await createTestUser(email);

          // Create content session
          const session = await createTestSession(user.id, prompt);

          // Create enhanced initial state (no pendingApproval field)
          const initialState = createEnhancedInitialState(session.id, prompt);

          // Verify initial state does not have pendingApproval
          expect(initialState).not.toHaveProperty('pendingApproval');

          // Verify state has enhanced workflow fields
          expect(initialState).toHaveProperty('contentType');
          expect(initialState).toHaveProperty('vocabularySuggestions');
          expect(initialState).toHaveProperty('grammarIssues');
          expect(initialState).toHaveProperty('charts');
          expect(initialState).toHaveProperty('suggestions');

          // Query database to ensure no approval requests exist
          const approvalRequests = await prisma.approvalRequest.findMany({
            where: {
              contentSessionId: session.id,
            },
          });

          expect(approvalRequests).toHaveLength(0);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: enhanced-ai-workflow, Property 26: Search executes automatically
  // **Validates: Requirements 6.2**
  it('should execute search automatically without approval for any workflow that needs search', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'What are the latest trends in AI?',
          'How much does a Tesla cost today?',
          'What is the current price of Bitcoin?',
          'Who won the recent election?',
          'What are the statistics on climate change?'
        ),
        async (searchPrompt) => {
          // Create initial state with a prompt that needs search
          const sessionId = `test-session-${Date.now()}`;
          const state = createEnhancedInitialState(sessionId, searchPrompt);

          // The analyze node should detect that search is needed
          const { analyzePromptEnhancedNode } = await import(
            '@/lib/agent/nodes/analyze-prompt-enhanced'
          );
          const analyzedStatePartial = await analyzePromptEnhancedNode(state);
          const analyzedState = { ...state, ...analyzedStatePartial };

          // Verify that search was determined to be needed
          expect(analyzedState.needsSearch).toBe(true);

          // Verify no approval is pending
          expect(analyzedState).not.toHaveProperty('pendingApproval');

          // Verify the workflow can proceed directly to search
          const { webSearchNode } = await import('@/lib/agent/nodes/web-search');

          // Mock fetch for search
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              results: [
                {
                  title: 'Test Result',
                  url: 'https://example.com',
                  snippet: 'Test snippet',
                },
              ],
            }),
          });

          // Cast to WorkflowState for compatibility (webSearchNode only needs common fields)
          const searchStatePartial = await webSearchNode(analyzedState as any);
          const searchState = { ...analyzedState, ...searchStatePartial };

          // Verify search executed without approval
          expect(searchState.searchResults).toBeDefined();
          expect(searchState.metadata?.nodeHistory).toContain('search');
          expect(searchState).not.toHaveProperty('pendingApproval');
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: enhanced-ai-workflow, Property 27: Workflow executes all nodes
  // **Validates: Requirements 6.3**
  it('should execute all required nodes without interruption for any workflow', async () => {
    await fc.assert(
      fc.asyncProperty(promptArbitrary, async (prompt) => {
        const sessionId = `test-session-${Date.now()}`;
        const state = createEnhancedInitialState(sessionId, prompt);

        // Mock all external API calls
        global.fetch = vi.fn().mockImplementation((url: string) => {
          if (typeof url === 'string' && url.includes('openai')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                choices: [
                  {
                    message: {
                      content: 'Generated content for testing',
                    },
                  },
                ],
              }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: async () => ({ results: [] }),
          });
        });

        // Execute analyze node
        const { analyzePromptEnhancedNode } = await import(
          '@/lib/agent/nodes/analyze-prompt-enhanced'
        );
        let currentState = state;
        currentState = { ...currentState, ...(await analyzePromptEnhancedNode(currentState)) };
        expect(currentState.metadata?.nodeHistory).toContain('analyze');

        // Execute generate node (cast to any for compatibility)
        const { generateContentNode } = await import('@/lib/agent/nodes/generate-content');
        currentState = { ...currentState, ...(await generateContentNode(currentState as any)) };
        expect(currentState.metadata?.nodeHistory).toContain('generate');

        // Execute vocabulary node
        const { vocabularyEnhancementNode } = await import(
          '@/lib/agent/nodes/vocabulary-enhancement'
        );
        currentState = { ...currentState, ...(await vocabularyEnhancementNode(currentState)) };
        expect(currentState.metadata?.nodeHistory).toContain('vocabularyEnhancement');

        // Execute grammar node
        const { grammarCheckNode } = await import('@/lib/agent/nodes/grammar-check');
        currentState = { ...currentState, ...(await grammarCheckNode(currentState)) };
        expect(currentState.metadata?.nodeHistory).toContain('grammarCheck');

        // Execute statistical data node
        const { statisticalDataNode } = await import('@/lib/agent/nodes/statistical-data');
        currentState = { ...currentState, ...(await statisticalDataNode(currentState)) };
        expect(currentState.metadata?.nodeHistory).toContain('statisticalData');

        // Execute suggestions node
        const { suggestionsNode } = await import('@/lib/agent/nodes/suggestions');
        currentState = { ...currentState, ...(await suggestionsNode(currentState)) };
        expect(currentState.metadata?.nodeHistory).toContain('suggestions');

        // Verify all nodes executed in sequence
        const nodeHistory = currentState.metadata?.nodeHistory || [];
        expect(nodeHistory).toContain('analyze');
        expect(nodeHistory).toContain('generate');
        expect(nodeHistory).toContain('vocabularyEnhancement');
        expect(nodeHistory).toContain('grammarCheck');
        expect(nodeHistory).toContain('statisticalData');
        expect(nodeHistory).toContain('suggestions');

        // Verify no approval-related fields exist
        expect(currentState).not.toHaveProperty('pendingApproval');
      }),
      { numRuns: 10 }
    );
  });

  // Feature: enhanced-ai-workflow, Property 28: Complete response provided
  // **Validates: Requirements 6.4**
  it('should provide complete response with all enhancements for any completed workflow', async () => {
    await fc.assert(
      fc.asyncProperty(promptArbitrary, async (prompt) => {
        const sessionId = `test-session-${Date.now()}`;
        const state = createEnhancedInitialState(sessionId, prompt);

        // Mock all external API calls
        global.fetch = vi.fn().mockImplementation((url: string) => {
          if (typeof url === 'string' && url.includes('openai')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                choices: [
                  {
                    message: {
                      content: 'Generated content with some weak words and grammar issues.',
                    },
                  },
                ],
              }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: async () => ({ results: [] }),
          });
        });

        // Execute the full workflow through all nodes
        const { analyzePromptEnhancedNode } = await import(
          '@/lib/agent/nodes/analyze-prompt-enhanced'
        );
        const { generateContentNode } = await import('@/lib/agent/nodes/generate-content');
        const { vocabularyEnhancementNode } = await import(
          '@/lib/agent/nodes/vocabulary-enhancement'
        );
        const { grammarCheckNode } = await import('@/lib/agent/nodes/grammar-check');
        const { statisticalDataNode } = await import('@/lib/agent/nodes/statistical-data');
        const { suggestionsNode } = await import('@/lib/agent/nodes/suggestions');

        let currentState = state;
        currentState = { ...currentState, ...(await analyzePromptEnhancedNode(currentState)) };
        currentState = { ...currentState, ...(await generateContentNode(currentState as any)) };
        currentState = { ...currentState, ...(await vocabularyEnhancementNode(currentState)) };
        currentState = { ...currentState, ...(await grammarCheckNode(currentState)) };
        currentState = { ...currentState, ...(await statisticalDataNode(currentState)) };
        currentState = { ...currentState, ...(await suggestionsNode(currentState)) };

        // Verify complete response includes all required fields
        expect(currentState.generatedContent).toBeDefined();
        expect(typeof currentState.generatedContent).toBe('string');
        expect(currentState.generatedContent.length).toBeGreaterThan(0);

        // Verify enhancement arrays are defined (may be empty)
        expect(Array.isArray(currentState.vocabularySuggestions)).toBe(true);
        expect(Array.isArray(currentState.grammarIssues)).toBe(true);
        expect(Array.isArray(currentState.charts)).toBe(true);
        expect(Array.isArray(currentState.suggestions)).toBe(true);

        // Verify content type is set
        expect(currentState.contentType).toBeDefined();
        expect(typeof currentState.contentType).toBe('string');

        // Verify no approval-related fields
        expect(currentState).not.toHaveProperty('pendingApproval');
      }),
      { numRuns: 10 }
    );
  });
});
