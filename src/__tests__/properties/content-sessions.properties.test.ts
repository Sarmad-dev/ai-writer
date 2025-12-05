import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

// Helper to generate valid email addresses
const emailArbitrary = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]{3,10}$/),
    fc.constantFrom('gmail.com', 'yahoo.com', 'test.com', 'example.com')
  )
  .map(([local, domain]) => `${local}@${domain}`);

// Helper to generate valid passwords
const passwordArbitrary = fc.string({ minLength: 8, maxLength: 50 });

// Helper to generate content session data
const sessionTitleArbitrary = fc.string({ minLength: 1, maxLength: 100 });
const sessionPromptArbitrary = fc.string({ minLength: 1, maxLength: 500 });
const sessionContentArbitrary = fc.option(fc.string({ minLength: 0, maxLength: 1000 }), {
  nil: null,
});
const sessionStatusArbitrary = fc.constantFrom(
  'PENDING',
  'GENERATING',
  'COMPLETED',
  'FAILED'
);

// Cleanup function
async function cleanupTestData(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.contentSession.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

describe('Content Session Properties', () => {
  afterEach(async () => {
    // Clean up test data
    try {
      await prisma.contentSession.deleteMany({});
      await prisma.session.deleteMany({});
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: '@',
          },
        },
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  // Feature: ai-content-writer, Property 6: Prompt submission creates session
  it('should create a new Content Session for any valid content generation prompt', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        sessionTitleArbitrary,
        sessionPromptArbitrary,
        async (email, password, title, prompt) => {
          // Clean up before test
          await cleanupTestData(email);

          // Create a user
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: 'Test User',
            },
          });

          // Create a content session
          const session = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title,
              prompt,
              status: 'PENDING',
            },
          });

          // Verify session was created with correct properties
          expect(session).toBeDefined();
          expect(session.id).toBeTruthy();
          expect(session.userId).toBe(user.id);
          expect(session.title).toBe(title);
          expect(session.prompt).toBe(prompt);
          expect(session.status).toBe('PENDING');

          // Verify session exists in database
          const dbSession = await prisma.contentSession.findUnique({
            where: { id: session.id },
          });
          expect(dbSession).toBeDefined();
          expect(dbSession?.id).toBe(session.id);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 8: Session persistence
  it('should persist Content Session data and be retrievable by session ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        sessionTitleArbitrary,
        sessionPromptArbitrary,
        sessionContentArbitrary,
        sessionStatusArbitrary,
        async (email, password, title, prompt, content, status) => {
          // Clean up before test
          await cleanupTestData(email);

          // Create a user
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: 'Test User',
            },
          });

          // Create a content session
          const session = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title,
              prompt,
              content,
              status,
            },
          });

          // Retrieve the session by ID
          const retrievedSession = await prisma.contentSession.findUnique({
            where: { id: session.id },
          });

          // Verify all data persisted correctly
          expect(retrievedSession).toBeDefined();
          expect(retrievedSession?.id).toBe(session.id);
          expect(retrievedSession?.userId).toBe(user.id);
          expect(retrievedSession?.title).toBe(title);
          expect(retrievedSession?.prompt).toBe(prompt);
          expect(retrievedSession?.content).toBe(content);
          expect(retrievedSession?.status).toBe(status);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 9: Session list ordering
  it('should return sessions ordered by creation time (newest first) for any user with multiple sessions', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        fc.array(
          fc.record({
            title: sessionTitleArbitrary,
            prompt: sessionPromptArbitrary,
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (email, password, sessionData) => {
          // Clean up before test
          await cleanupTestData(email);

          // Create a user
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: 'Test User',
            },
          });

          // Create multiple sessions with slight delays to ensure different timestamps
          const createdSessions = [];
          for (const data of sessionData) {
            const session = await prisma.contentSession.create({
              data: {
                userId: user.id,
                title: data.title,
                prompt: data.prompt,
                status: 'PENDING',
              },
            });
            createdSessions.push(session);
            // Small delay to ensure different createdAt timestamps
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          // Retrieve sessions ordered by creation time (newest first)
          const sessions = await prisma.contentSession.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
          });

          // Verify sessions are ordered correctly
          expect(sessions.length).toBe(sessionData.length);
          for (let i = 0; i < sessions.length - 1; i++) {
            expect(sessions[i].createdAt.getTime()).toBeGreaterThanOrEqual(
              sessions[i + 1].createdAt.getTime()
            );
          }

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 5 } // Reduced runs due to delays
    );
  });

  // Feature: ai-content-writer, Property 10: Session loading preserves state
  it('should preserve exact content and state when loading any Content Session by ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        sessionTitleArbitrary,
        sessionPromptArbitrary,
        sessionContentArbitrary,
        sessionStatusArbitrary,
        async (email, password, title, prompt, content, status) => {
          // Clean up before test
          await cleanupTestData(email);

          // Create a user
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: 'Test User',
            },
          });

          // Create a content session with all fields
          const originalSession = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title,
              prompt,
              content,
              status,
            },
          });

          // Load the session by ID
          const loadedSession = await prisma.contentSession.findUnique({
            where: { id: originalSession.id },
          });

          // Verify all fields are preserved exactly
          expect(loadedSession).toBeDefined();
          expect(loadedSession?.id).toBe(originalSession.id);
          expect(loadedSession?.userId).toBe(originalSession.userId);
          expect(loadedSession?.title).toBe(originalSession.title);
          expect(loadedSession?.prompt).toBe(originalSession.prompt);
          expect(loadedSession?.content).toBe(originalSession.content);
          expect(loadedSession?.status).toBe(originalSession.status);
          expect(loadedSession?.createdAt.getTime()).toBe(
            originalSession.createdAt.getTime()
          );
          expect(loadedSession?.updatedAt.getTime()).toBe(
            originalSession.updatedAt.getTime()
          );

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });
});

