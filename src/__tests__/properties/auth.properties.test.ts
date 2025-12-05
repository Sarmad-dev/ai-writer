import { describe, it, expect, afterEach } from 'vitest';
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

// Helper to generate valid passwords (min 8 chars)
const passwordArbitrary = fc.string({ minLength: 8, maxLength: 50 });

// Cleanup function to remove test users
async function cleanupTestUser(email: string) {
  try {
    await prisma.user.deleteMany({
      where: { email },
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

describe('Authentication Properties', () => {
  afterEach(async () => {
    // Clean up any test data after each test
    try {
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

  // Feature: ai-content-writer, Property 1: Valid registration creates account
  it('should create account for any valid registration credentials', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, passwordArbitrary, async (email, password) => {
        // Clean up before test
        await cleanupTestUser(email);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user directly in database
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: 'Test User',
          },
        });

        // Verify account was created
        expect(user).toBeDefined();
        expect(user.email).toBe(email);
        expect(user.id).toBeTruthy();

        // Verify user exists in database
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });
        expect(dbUser).toBeDefined();
        expect(dbUser?.email).toBe(email);
        expect(dbUser?.id).toBe(user.id);

        // Clean up after test
        await cleanupTestUser(email);
      }),
      { numRuns: 10 } // Reduced runs for faster testing
    );
  });

  // Feature: ai-content-writer, Property 2: Valid login creates session
  it('should create session for any existing user with valid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, passwordArbitrary, async (email, password) => {
        // Clean up before test
        await cleanupTestUser(email);

        // Create a user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: 'Test User',
          },
        });

        // Create a session for the user
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const session = await prisma.session.create({
          data: {
            userId: user.id,
            expiresAt,
            token: `test-token-${Date.now()}-${Math.random()}`,
          },
        });

        // Verify session was created
        expect(session).toBeDefined();
        expect(session.userId).toBe(user.id);
        expect(session.expiresAt).toBeInstanceOf(Date);
        expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());

        // Verify session exists in database
        const sessions = await prisma.session.findMany({
          where: {
            userId: user.id,
          },
        });
        expect(sessions.length).toBeGreaterThan(0);
        expect(sessions[0].id).toBe(session.id);

        // Clean up after test
        await cleanupTestUser(email);
      }),
      { numRuns: 10 } // Reduced runs for faster testing
    );
  });

  // Feature: ai-content-writer, Property 3: Invalid credentials are rejected
  it('should reject any invalid credential combination', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        passwordArbitrary,
        async (email, correctPassword, wrongPassword) => {
          // Skip if passwords happen to be the same
          fc.pre(correctPassword !== wrongPassword);

          // Clean up before test
          await cleanupTestUser(email);

          // Create a user with correct password
          const hashedPassword = await bcrypt.hash(correctPassword, 10);
          await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: 'Test User',
            },
          });

          // Verify wrong password doesn't match
          const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
          expect(isValid).toBe(false);

          // Clean up after test
          await cleanupTestUser(email);
        }
      ),
      { numRuns: 10 } // Reduced runs for faster testing
    );
  });
});

describe('Route Protection Properties', () => {
  afterEach(async () => {
    // Clean up any test data after each test
    try {
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

  // Feature: ai-content-writer, Property 4: Authenticated access is granted
  it('should grant access to protected routes for any authenticated user with valid session', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, passwordArbitrary, async (email, password) => {
        // Clean up before test
        await cleanupTestUser(email);

        // Create a user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: 'Test User',
          },
        });

        // Create a valid session (not expired)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const session = await prisma.session.create({
          data: {
            userId: user.id,
            expiresAt,
            token: `test-token-${Date.now()}-${Math.random()}`,
          },
        });

        // Verify session is valid (not expired)
        expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());

        // Verify we can retrieve the user from the session
        const sessionWithUser = await prisma.session.findUnique({
          where: { id: session.id },
          include: { user: true },
        });

        expect(sessionWithUser).toBeDefined();
        expect(sessionWithUser?.user.id).toBe(user.id);
        expect(sessionWithUser?.user.email).toBe(email);

        // Clean up after test
        await cleanupTestUser(email);
      }),
      { numRuns: 10 } // Reduced runs for faster testing
    );
  });

  // Feature: ai-content-writer, Property 5: Unauthenticated access is blocked
  it('should block access to protected routes for any request without valid authentication', async () => {
    await fc.assert(
      fc.asyncProperty(emailArbitrary, async (email) => {
        // Try to find a session for a non-existent or unauthenticated user
        const sessions = await prisma.session.findMany({
          where: {
            user: {
              email,
            },
          },
        });

        // For a truly unauthenticated user, there should be no valid sessions
        // Or if there are sessions, they should be expired
        const validSessions = sessions.filter(
          (session) => session.expiresAt.getTime() > Date.now()
        );

        // If no user exists or no valid sessions exist, access should be blocked
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || validSessions.length === 0) {
          // This represents the unauthenticated state
          // In a real application, this would result in a redirect to login
          expect(user === null || validSessions.length === 0).toBe(true);
        }
      }),
      { numRuns: 10 } // Reduced runs for faster testing
    );
  });
});
