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

// Helper to generate chart types
const chartTypeArbitrary = fc.constantFrom('BAR', 'LINE', 'PIE', 'AREA', 'SCATTER');

// Helper to generate chart data
const chartDataPointArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }),
  value: fc.integer({ min: 0, max: 1000 }),
});

const chartDataArbitrary = fc.array(chartDataPointArbitrary, {
  minLength: 1,
  maxLength: 10,
});

// Helper to generate chart config
const chartConfigArbitrary = fc.record({
  title: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  xAxisLabel: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
  yAxisLabel: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
  colors: fc.option(
    fc.array(
      fc.constantFrom(
        '#8884d8',
        '#82ca9d',
        '#ffc658',
        '#ff7c7c',
        '#8dd1e1',
        '#d084d0',
        '#ffb347'
      ),
      {
        minLength: 1,
        maxLength: 7,
      }
    )
  ),
  legend: fc.option(fc.boolean()),
  dataKey: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  xKey: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  yKey: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
});

// Cleanup function
async function cleanupTestData(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const sessions = await prisma.contentSession.findMany({
        where: { userId: user.id },
      });
      for (const session of sessions) {
        await prisma.graph.deleteMany({ where: { contentSessionId: session.id } });
      }
      await prisma.contentSession.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

describe('Graph Properties', () => {
  afterEach(async () => {
    // Clean up test data
    try {
      await prisma.graph.deleteMany({});
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

  // Feature: ai-content-writer, Property 20: Statistical data generates charts
  it('should create appropriate chart visualization for any statistical data identified', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        chartTypeArbitrary,
        chartDataArbitrary,
        chartConfigArbitrary,
        async (email, password, chartType, chartData, chartConfig) => {
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
              title: 'Test Session',
              prompt: 'Test prompt',
              status: 'PENDING',
            },
          });

          // Create a graph with statistical data
          const graph = await prisma.graph.create({
            data: {
              contentSessionId: contentSession.id,
              type: chartType,
              data: chartData as any,
              config: chartConfig as any,
              position: 0,
            },
          });

          // Verify graph was created with correct properties
          expect(graph).toBeDefined();
          expect(graph.id).toBeTruthy();
          expect(graph.contentSessionId).toBe(contentSession.id);
          expect(graph.type).toBe(chartType);
          expect(graph.data).toEqual(chartData);
          expect(graph.config).toEqual(chartConfig);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 21: Graph embedding in content
  it('should embed generated graph in content structure at appropriate position', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        chartTypeArbitrary,
        chartDataArbitrary,
        chartConfigArbitrary,
        fc.integer({ min: 0, max: 100 }),
        async (email, password, chartType, chartData, chartConfig, position) => {
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
              title: 'Test Session',
              prompt: 'Test prompt',
              status: 'PENDING',
            },
          });

          // Create a graph at a specific position
          const graph = await prisma.graph.create({
            data: {
              contentSessionId: contentSession.id,
              type: chartType,
              data: chartData as any,
              config: chartConfig as any,
              position,
            },
          });

          // Verify graph is embedded at the correct position
          expect(graph.position).toBe(position);

          // Retrieve the graph and verify it's associated with the content session
          const retrievedGraph = await prisma.graph.findUnique({
            where: { id: graph.id },
            include: { contentSession: true },
          });

          expect(retrievedGraph).toBeDefined();
          expect(retrievedGraph?.contentSessionId).toBe(contentSession.id);
          expect(retrievedGraph?.position).toBe(position);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 22: Graph editability
  it('should allow modification of chart type, data values, and styling options for any generated graph', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        chartTypeArbitrary,
        chartDataArbitrary,
        chartConfigArbitrary,
        chartTypeArbitrary,
        chartDataArbitrary,
        chartConfigArbitrary,
        async (
          email,
          password,
          initialType,
          initialData,
          initialConfig,
          newType,
          newData,
          newConfig
        ) => {
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
              title: 'Test Session',
              prompt: 'Test prompt',
              status: 'PENDING',
            },
          });

          // Create a graph with initial values
          const graph = await prisma.graph.create({
            data: {
              contentSessionId: contentSession.id,
              type: initialType,
              data: initialData as any,
              config: initialConfig as any,
              position: 0,
            },
          });

          // Update the graph with new values
          const updatedGraph = await prisma.graph.update({
            where: { id: graph.id },
            data: {
              type: newType,
              data: newData as any,
              config: newConfig as any,
            },
          });

          // Verify all modifications were applied
          expect(updatedGraph.type).toBe(newType);
          expect(updatedGraph.data).toEqual(newData);
          expect(updatedGraph.config).toEqual(newConfig);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });

  // Feature: ai-content-writer, Property 23: Graph modification persistence
  it('should persist graph modifications to database and preserve them on reload', async () => {
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        chartTypeArbitrary,
        chartDataArbitrary,
        chartConfigArbitrary,
        chartTypeArbitrary,
        chartDataArbitrary,
        chartConfigArbitrary,
        async (
          email,
          password,
          initialType,
          initialData,
          initialConfig,
          newType,
          newData,
          newConfig
        ) => {
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
              title: 'Test Session',
              prompt: 'Test prompt',
              status: 'PENDING',
            },
          });

          // Create a graph with initial values
          const graph = await prisma.graph.create({
            data: {
              contentSessionId: contentSession.id,
              type: initialType,
              data: initialData as any,
              config: initialConfig as any,
              position: 0,
            },
          });

          // Update the graph
          await prisma.graph.update({
            where: { id: graph.id },
            data: {
              type: newType,
              data: newData as any,
              config: newConfig as any,
            },
          });

          // Reload the graph from database
          const reloadedGraph = await prisma.graph.findUnique({
            where: { id: graph.id },
          });

          // Verify modifications persisted correctly
          expect(reloadedGraph).toBeDefined();
          expect(reloadedGraph?.type).toBe(newType);
          expect(reloadedGraph?.data).toEqual(newData);
          expect(reloadedGraph?.config).toEqual(newConfig);

          // Clean up after test
          await cleanupTestData(email);
        }
      ),
      { numRuns: 10 }
    );
  });
});
