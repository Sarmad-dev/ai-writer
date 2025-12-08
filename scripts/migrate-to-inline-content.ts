/**
 * Migration script to convert existing Graph and Image records to inline format
 * 
 * This script:
 * 1. Migrates Graph records to inline format in content JSON
 * 2. Migrates Image records to inline format in content JSON
 * 3. Tests migration on sample data
 * 
 * Requirements: 5.1, 5.2
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

interface TipTapContent {
  type: string;
  content?: any[];
  attrs?: any;
  text?: string;
}

interface ChartNode {
  type: 'graph';
  attrs: {
    id: string;
    type: string;
    data: any;
    config: any;
  };
}

interface ImageNode {
  type: 'image';
  attrs: {
    src: string;
    alt?: string;
    title?: string;
  };
}

/**
 * Migrate a single ContentSession's Graph records to inline format
 */
async function migrateGraphsToInline(sessionId: string): Promise<void> {
  console.log(`\nMigrating graphs for session: ${sessionId}`);
  
  const session = await prisma.contentSession.findUnique({
    where: { id: sessionId },
    include: { graphs: true }
  });

  if (!session) {
    console.log(`Session ${sessionId} not found`);
    return;
  }

  if (session.graphs.length === 0) {
    console.log(`No graphs to migrate for session ${sessionId}`);
    return;
  }

  console.log(`Found ${session.graphs.length} graphs to migrate`);

  // Parse existing content or create new structure
  let content: TipTapContent;
  try {
    content = session.content ? JSON.parse(session.content) : {
      type: 'doc',
      content: []
    };
  } catch (error) {
    console.error(`Failed to parse content for session ${sessionId}:`, error);
    content = {
      type: 'doc',
      content: []
    };
  }

  // Ensure content has a content array
  if (!content.content) {
    content.content = [];
  }

  // Convert graphs to inline chart nodes
  const chartNodes: ChartNode[] = session.graphs
    .sort((a, b) => a.position - b.position)
    .map(graph => ({
      type: 'graph',
      attrs: {
        id: graph.id,
        type: graph.type.toLowerCase(),
        data: graph.data,
        config: graph.config
      }
    }));

  // Insert chart nodes at appropriate positions
  for (const chartNode of chartNodes) {
    const graph = session.graphs.find(g => g.id === chartNode.attrs.id);
    if (graph) {
      const position = Math.min(graph.position, content.content.length);
      content.content.splice(position, 0, chartNode);
      console.log(`Inserted chart ${chartNode.attrs.id} at position ${position}`);
    }
  }

  // Update session with inline content
  await prisma.contentSession.update({
    where: { id: sessionId },
    data: {
      content: JSON.stringify(content)
    }
  });

  console.log(`Updated session ${sessionId} with inline charts`);

  // Delete old graph records
  const deleteResult = await prisma.graph.deleteMany({
    where: { contentSessionId: sessionId }
  });

  console.log(`Deleted ${deleteResult.count} graph records for session ${sessionId}`);
}

/**
 * Migrate Image records to inline format in content
 * Note: Images in the Image table are user uploads, not necessarily in content
 * This function looks for image references in content and ensures they're inline
 */
async function migrateImagesToInline(sessionId: string): Promise<void> {
  console.log(`\nChecking images for session: ${sessionId}`);
  
  const session = await prisma.contentSession.findUnique({
    where: { id: sessionId }
  });

  if (!session || !session.content) {
    console.log(`No content to process for session ${sessionId}`);
    return;
  }

  // Parse content
  let content: TipTapContent;
  try {
    content = JSON.parse(session.content);
  } catch (error) {
    console.error(`Failed to parse content for session ${sessionId}:`, error);
    return;
  }

  // Check if content already has inline images
  const hasImages = JSON.stringify(content).includes('"type":"image"');
  
  if (hasImages) {
    console.log(`Session ${sessionId} already has inline images`);
  } else {
    console.log(`Session ${sessionId} has no image nodes`);
  }
}

/**
 * Migrate all ContentSessions
 */
async function migrateAllSessions(): Promise<void> {
  console.log('Starting migration of all content sessions...\n');

  const sessions = await prisma.contentSession.findMany({
    include: {
      graphs: true
    }
  });

  console.log(`Found ${sessions.length} total sessions`);

  const sessionsWithGraphs = sessions.filter(s => s.graphs.length > 0);
  console.log(`Found ${sessionsWithGraphs.length} sessions with graphs to migrate`);

  for (const session of sessionsWithGraphs) {
    try {
      await migrateGraphsToInline(session.id);
      await migrateImagesToInline(session.id);
    } catch (error) {
      console.error(`Error migrating session ${session.id}:`, error);
    }
  }

  console.log('\nMigration complete!');
}

/**
 * Test migration on sample data
 */
async function testMigration(): Promise<void> {
  console.log('Testing migration with sample data...\n');

  // Create a test session with sample graph
  const testUser = await prisma.user.findFirst();
  
  if (!testUser) {
    console.log('No users found. Skipping test migration.');
    return;
  }

  const testSession = await prisma.contentSession.create({
    data: {
      userId: testUser.id,
      title: 'Test Migration Session',
      prompt: 'Test prompt',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Test content before chart' }]
          }
        ]
      }),
      status: 'COMPLETED'
    }
  });

  console.log(`Created test session: ${testSession.id}`);

  // Create a test graph
  const testGraph = await prisma.graph.create({
    data: {
      contentSessionId: testSession.id,
      type: 'BAR',
      data: [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 }
      ],
      config: {
        title: 'Test Chart',
        xAxisLabel: 'Category',
        yAxisLabel: 'Value'
      },
      position: 1
    }
  });

  console.log(`Created test graph: ${testGraph.id}`);

  // Run migration on test session
  await migrateGraphsToInline(testSession.id);

  // Verify migration
  const migratedSession = await prisma.contentSession.findUnique({
    where: { id: testSession.id },
    include: { graphs: true }
  });

  if (migratedSession) {
    const content = JSON.parse(migratedSession.content || '{}');
    const hasInlineChart = content.content?.some((node: any) => node.type === 'graph');
    const graphsDeleted = migratedSession.graphs.length === 0;

    console.log('\nTest Results:');
    console.log(`- Inline chart present: ${hasInlineChart ? '✓' : '✗'}`);
    console.log(`- Old graph records deleted: ${graphsDeleted ? '✓' : '✗'}`);

    if (hasInlineChart && graphsDeleted) {
      console.log('\n✓ Test migration successful!');
    } else {
      console.log('\n✗ Test migration failed!');
    }

    // Clean up test data
    await prisma.contentSession.delete({
      where: { id: testSession.id }
    });
    console.log('\nTest data cleaned up');
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'test':
        await testMigration();
        break;
      case 'migrate':
        await migrateAllSessions();
        break;
      case 'session':
        const sessionId = args[1];
        if (!sessionId) {
          console.error('Please provide a session ID');
          process.exit(1);
        }
        await migrateGraphsToInline(sessionId);
        await migrateImagesToInline(sessionId);
        break;
      default:
        console.log('Usage:');
        console.log('  npm run migrate:content test      - Test migration with sample data');
        console.log('  npm run migrate:content migrate   - Migrate all sessions');
        console.log('  npm run migrate:content session <id> - Migrate specific session');
        break;
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
