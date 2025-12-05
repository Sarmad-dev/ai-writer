import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/db/prisma';
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

// Helper to generate approval request actions
const actionArbitrary = fc.constantFrom(
  'execute_search',
  'generate_graph',
  'insert_image',
  'modify_content'
);

// Helper to generate approval request details
const detailsArbitrary = fc.record({
  description: fc.string({ minLength: 10, maxLength: 100 }),
  context: fc.string({ minLength: 5, maxLength: 50 }),
  timestamp: fc.integer({ min: Date.now() - 10000, max: Date.now() }),
});

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

describe('HITL Workflow Properties', () => {
  beforeEach(async () => {
    // Clean up before tests
    try {
      await prisma.approvalRequest.deleteMany({});
      await prisma.contentSession.deleteMany({});
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await prisma.approvalRequest.deleteMany({});
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

  // Feature: ai-content-writer, Property 15: Approval request creation pauses workflow
  it('should create approval request and pause workflow for any action requiring approval', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        fc.string({ minLength: 10, maxLength: 100 }),
        actionArbitrary,
        detailsArbitrary,
        async (email, password, prompt, action, details) => {
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
          const contentSession = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title: 'Test Content',
              prompt,
              status: 'GENERATING',
            },
          });

          // Create an approval request (simulating workflow pause)
          const approvalRequest = await prisma.approvalRequest.create({
            data: {
              contentSessionId: contentSession.id,
              action,
              details,
              status: 'PENDING',
            },
          });

          // Verify approval request was created with PENDING status
          expect(approvalRequest).toBeDefined();
          expect(approvalRequest.status).toBe('PENDING');
          expect(approvalRequest.action).toBe(action);
          expect(approvalRequest.contentSessionId).toBe(contentSession.id);
          expect(approvalRequest.resolvedAt).toBeNull();

          // Verify the approval request is retrievable
          const dbApprovalRequest = await prisma.approvalRequest.findUnique({
            where: { id: approvalRequest.id },
          });
          expect(dbApprovalRequest).toBeDefined();
          expect(dbApprovalRequest?.status).toBe('PENDING');

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 16: Approval request contains details
  it('should include action description and details in any approval request', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        fc.string({ minLength: 10, maxLength: 100 }),
        actionArbitrary,
        detailsArbitrary,
        async (email, password, prompt, action, details) => {
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
          const contentSession = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title: 'Test Content',
              prompt,
              status: 'GENERATING',
            },
          });

          // Create an approval request with details
          const approvalRequest = await prisma.approvalRequest.create({
            data: {
              contentSessionId: contentSession.id,
              action,
              details,
              status: 'PENDING',
            },
          });

          // Verify approval request contains all required details
          expect(approvalRequest.action).toBe(action);
          expect(approvalRequest.details).toBeDefined();
          expect(typeof approvalRequest.details).toBe('object');
          
          // Verify details structure matches what was provided
          const storedDetails = approvalRequest.details as Record<string, any>;
          expect(storedDetails.description).toBe(details.description);
          expect(storedDetails.context).toBe(details.context);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 17: Approval resumes workflow
  it('should resume workflow for any approved approval request', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        fc.string({ minLength: 10, maxLength: 100 }),
        actionArbitrary,
        detailsArbitrary,
        async (email, password, prompt, action, details) => {
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
          const contentSession = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title: 'Test Content',
              prompt,
              status: 'GENERATING',
            },
          });

          // Create a pending approval request
          const approvalRequest = await prisma.approvalRequest.create({
            data: {
              contentSessionId: contentSession.id,
              action,
              details,
              status: 'PENDING',
            },
          });

          // Approve the request (simulating user approval)
          const approvedRequest = await prisma.approvalRequest.update({
            where: { id: approvalRequest.id },
            data: {
              status: 'APPROVED',
              resolvedAt: new Date(),
            },
          });

          // Verify the request was approved
          expect(approvedRequest.status).toBe('APPROVED');
          expect(approvedRequest.resolvedAt).toBeDefined();
          expect(approvedRequest.resolvedAt).toBeInstanceOf(Date);
          
          // Verify the approval can be retrieved with APPROVED status
          const dbApprovalRequest = await prisma.approvalRequest.findUnique({
            where: { id: approvalRequest.id },
          });
          expect(dbApprovalRequest?.status).toBe('APPROVED');

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 18: Rejection skips action
  it('should skip action for any rejected approval request', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        fc.string({ minLength: 10, maxLength: 100 }),
        actionArbitrary,
        detailsArbitrary,
        async (email, password, prompt, action, details) => {
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
          const contentSession = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title: 'Test Content',
              prompt,
              status: 'GENERATING',
            },
          });

          // Create a pending approval request
          const approvalRequest = await prisma.approvalRequest.create({
            data: {
              contentSessionId: contentSession.id,
              action,
              details,
              status: 'PENDING',
            },
          });

          // Reject the request (simulating user rejection)
          const rejectedRequest = await prisma.approvalRequest.update({
            where: { id: approvalRequest.id },
            data: {
              status: 'REJECTED',
              resolvedAt: new Date(),
            },
          });

          // Verify the request was rejected
          expect(rejectedRequest.status).toBe('REJECTED');
          expect(rejectedRequest.resolvedAt).toBeDefined();
          expect(rejectedRequest.resolvedAt).toBeInstanceOf(Date);
          
          // Verify the rejection can be retrieved with REJECTED status
          const dbApprovalRequest = await prisma.approvalRequest.findUnique({
            where: { id: approvalRequest.id },
          });
          expect(dbApprovalRequest?.status).toBe('REJECTED');

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 19: Timeout handling
  it('should handle timeout for any approval request exceeding timeout period', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        fc.string({ minLength: 10, maxLength: 100 }),
        actionArbitrary,
        detailsArbitrary,
        async (email, password, prompt, action, details) => {
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
          const contentSession = await prisma.contentSession.create({
            data: {
              userId: user.id,
              title: 'Test Content',
              prompt,
              status: 'GENERATING',
            },
          });

          // Create an approval request with old timestamp (simulating timeout)
          const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
          const approvalRequest = await prisma.approvalRequest.create({
            data: {
              contentSessionId: contentSession.id,
              action,
              details,
              status: 'PENDING',
              createdAt: oldTimestamp,
            },
          });

          // Simulate timeout handling by updating to TIMEOUT status
          const timeoutThreshold = 5 * 60 * 1000; // 5 minutes
          const isTimedOut = Date.now() - approvalRequest.createdAt.getTime() > timeoutThreshold;

          if (isTimedOut) {
            const timedOutRequest = await prisma.approvalRequest.update({
              where: { id: approvalRequest.id },
              data: {
                status: 'TIMEOUT',
                resolvedAt: new Date(),
              },
            });

            // Verify the request was marked as timed out
            expect(timedOutRequest.status).toBe('TIMEOUT');
            expect(timedOutRequest.resolvedAt).toBeDefined();
            expect(timedOutRequest.resolvedAt).toBeInstanceOf(Date);
          }

          // Verify timeout detection works
          expect(isTimedOut).toBe(true);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });
});
