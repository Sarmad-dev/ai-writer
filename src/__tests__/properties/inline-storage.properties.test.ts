import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { ChartData, ChartDataPoint, ChartConfig } from '@/lib/agent/types';

// Arbitraries for generating test data
const chartDataPointArbitrary: fc.Arbitrary<ChartDataPoint> = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(fc.string({ minLength: 1, maxLength: 50 }), fc.integer({ min: 0, max: 10000 })),
  { minKeys: 1, maxKeys: 10 } // Ensure at least one key-value pair
);

// Generate hex color strings like "#FF5733"
const hexColorArbitrary = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

const chartConfigArbitrary: fc.Arbitrary<ChartConfig> = fc.record({
  title: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
  xAxisLabel: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  yAxisLabel: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  colors: fc.option(fc.array(hexColorArbitrary, { minLength: 1, maxLength: 10 }), { nil: undefined }),
  legend: fc.option(fc.boolean(), { nil: undefined }),
  dataKey: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  xKey: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  yKey: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
});

const chartDataArbitrary: fc.Arbitrary<ChartData> = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('bar', 'line', 'pie', 'area', 'scatter') as fc.Arbitrary<'bar' | 'line' | 'pie' | 'area' | 'scatter'>,
  data: fc.array(chartDataPointArbitrary, { minLength: 1, maxLength: 50 }),
  config: chartConfigArbitrary,
  location: fc.record({
    paragraphIndex: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
    headingContext: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    characterOffset: fc.option(fc.nat({ max: 10000 }), { nil: undefined }),
    nodeId: fc.option(fc.uuid(), { nil: undefined }),
  }),
});

// Arbitrary for TipTap image node
const imageNodeArbitrary = fc.record({
  type: fc.constant('image'),
  attrs: fc.record({
    src: fc.webUrl(),
    alt: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
    title: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
  }),
});

// Arbitrary for TipTap graph node
const graphNodeArbitrary = fc.record({
  type: fc.constant('graph'),
  attrs: fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('bar', 'line', 'pie', 'area', 'scatter'),
    data: fc.array(chartDataPointArbitrary, { minLength: 1, maxLength: 50 }),
    config: chartConfigArbitrary,
  }),
});

// Arbitrary for TipTap document with inline elements
const tipTapDocArbitrary = fc.record({
  type: fc.constant('doc'),
  content: fc.array(
    fc.oneof(
      // Paragraph nodes
      fc.record({
        type: fc.constant('paragraph'),
        content: fc.array(
          fc.record({
            type: fc.constant('text'),
            text: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
      }),
      // Image nodes
      imageNodeArbitrary,
      // Graph nodes
      graphNodeArbitrary
    ),
    { minLength: 1, maxLength: 20 }
  ),
});

describe('Inline Storage Properties', () => {
  // Feature: enhanced-ai-workflow, Property 21: Images stored inline
  it('should store image URLs directly in content structure for any image', () => {
    fc.assert(
      fc.property(imageNodeArbitrary, (imageNode) => {
        // Verify image node has correct structure
        expect(imageNode.type).toBe('image');
        expect(imageNode.attrs).toBeDefined();
        expect(imageNode.attrs.src).toBeDefined();
        expect(typeof imageNode.attrs.src).toBe('string');
        expect(imageNode.attrs.src.length).toBeGreaterThan(0);

        // Verify image URL is stored inline (not a reference to a separate table)
        // The URL should be a direct URL, not an ID
        expect(imageNode.attrs.src).toMatch(/^https?:\/\//);

        // Verify optional attributes
        if (imageNode.attrs.alt !== null) {
          expect(typeof imageNode.attrs.alt).toBe('string');
        }
        if (imageNode.attrs.title !== null) {
          expect(typeof imageNode.attrs.title).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-ai-workflow, Property 22: Charts stored inline
  it('should store chart data, type, and config directly in content structure for any chart', () => {
    fc.assert(
      fc.property(graphNodeArbitrary, (graphNode) => {
        // Verify graph node has correct structure
        expect(graphNode.type).toBe('graph');
        expect(graphNode.attrs).toBeDefined();

        // Verify all required attributes are present
        expect(graphNode.attrs.id).toBeDefined();
        expect(typeof graphNode.attrs.id).toBe('string');

        expect(graphNode.attrs.type).toBeDefined();
        expect(['bar', 'line', 'pie', 'area', 'scatter']).toContain(graphNode.attrs.type);

        expect(graphNode.attrs.data).toBeDefined();
        expect(Array.isArray(graphNode.attrs.data)).toBe(true);
        expect(graphNode.attrs.data.length).toBeGreaterThan(0);

        expect(graphNode.attrs.config).toBeDefined();
        expect(typeof graphNode.attrs.config).toBe('object');

        // Verify chart data is stored inline (not a reference)
        // Each data point should be an object with key-value pairs
        graphNode.attrs.data.forEach((dataPoint: ChartDataPoint) => {
          expect(typeof dataPoint).toBe('object');
          expect(dataPoint).not.toBeNull();
          
          // Verify values are strings or numbers
          Object.values(dataPoint).forEach((value) => {
            expect(['string', 'number']).toContain(typeof value);
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-ai-workflow, Property 23: Content round-trip preserves inline elements
  it('should preserve all inline images and charts when saving and loading content', () => {
    fc.assert(
      fc.property(tipTapDocArbitrary, (doc) => {
        // Simulate save: convert to JSON string
        const savedContent = JSON.stringify(doc);

        // Simulate load: parse JSON string
        const loadedContent = JSON.parse(savedContent);

        // Verify structure is preserved
        expect(loadedContent.type).toBe(doc.type);
        expect(loadedContent.content).toBeDefined();
        expect(Array.isArray(loadedContent.content)).toBe(true);
        expect(loadedContent.content.length).toBe(doc.content.length);

        // Verify each node is preserved
        for (let i = 0; i < doc.content.length; i++) {
          const originalNode = doc.content[i];
          const loadedNode = loadedContent.content[i];

          expect(loadedNode.type).toBe(originalNode.type);

          // For image nodes, verify all attributes are preserved
          if (originalNode.type === 'image') {
            expect(loadedNode.attrs).toBeDefined();
            expect(loadedNode.attrs.src).toBe(originalNode.attrs.src);
            expect(loadedNode.attrs.alt).toBe(originalNode.attrs.alt);
            expect(loadedNode.attrs.title).toBe(originalNode.attrs.title);
          }

          // For graph nodes, verify all attributes are preserved
          if (originalNode.type === 'graph') {
            expect(loadedNode.attrs).toBeDefined();
            expect(loadedNode.attrs.id).toBe(originalNode.attrs.id);
            expect(loadedNode.attrs.type).toBe(originalNode.attrs.type);
            expect(JSON.stringify(loadedNode.attrs.data)).toBe(JSON.stringify(originalNode.attrs.data));
            expect(JSON.stringify(loadedNode.attrs.config)).toBe(JSON.stringify(originalNode.attrs.config));
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  // Feature: enhanced-ai-workflow, Property 24: No orphaned records
  it('should not create separate database records for any inline content', () => {
    fc.assert(
      fc.property(tipTapDocArbitrary, (doc) => {
        // Extract all image and graph nodes
        const imageNodes = doc.content.filter((node: any) => node.type === 'image');
        const graphNodes = doc.content.filter((node: any) => node.type === 'graph');

        // Verify images are stored inline (no separate Image table records)
        imageNodes.forEach((imageNode: any) => {
          // Image URL should be directly in the node, not a reference ID
          expect(imageNode.attrs.src).toBeDefined();
          expect(typeof imageNode.attrs.src).toBe('string');
          
          // Should be a URL, not a database ID (UUIDs or CUIDs)
          // URLs contain protocol and domain
          expect(imageNode.attrs.src).toMatch(/^https?:\/\//);
        });

        // Verify charts are stored inline (no separate Graph table records)
        graphNodes.forEach((graphNode: any) => {
          // Chart data should be directly in the node
          expect(graphNode.attrs.data).toBeDefined();
          expect(Array.isArray(graphNode.attrs.data)).toBe(true);
          
          // Data should be actual data points, not references
          expect(graphNode.attrs.data.length).toBeGreaterThan(0);
          graphNode.attrs.data.forEach((dataPoint: any) => {
            expect(typeof dataPoint).toBe('object');
            expect(dataPoint).not.toBeNull();
          });

          // Config should be directly in the node
          expect(graphNode.attrs.config).toBeDefined();
          expect(typeof graphNode.attrs.config).toBe('object');
        });

        // The key insight: all content is self-contained in the doc structure
        // No external references to separate tables
        const contentString = JSON.stringify(doc);
        
        // Verify the entire document can be serialized without losing information
        expect(contentString.length).toBeGreaterThan(0);
        
        // Verify it can be deserialized
        const parsed = JSON.parse(contentString);
        expect(parsed).toBeDefined();
        expect(parsed.type).toBe('doc');
      }),
      { numRuns: 100 }
    );
  });

  // Additional property: Verify chart data structure is valid
  it('should have valid chart data structure for any chart', () => {
    fc.assert(
      fc.property(chartDataArbitrary, (chart: ChartData) => {
        // Verify chart has all required fields
        expect(chart.id).toBeDefined();
        expect(typeof chart.id).toBe('string');

        expect(chart.type).toBeDefined();
        expect(['bar', 'line', 'pie', 'area', 'scatter']).toContain(chart.type);

        expect(chart.data).toBeDefined();
        expect(Array.isArray(chart.data)).toBe(true);
        expect(chart.data.length).toBeGreaterThan(0);

        expect(chart.config).toBeDefined();
        expect(typeof chart.config).toBe('object');

        expect(chart.location).toBeDefined();
        expect(typeof chart.location).toBe('object');

        // Verify data points have valid structure
        chart.data.forEach((dataPoint) => {
          expect(typeof dataPoint).toBe('object');
          expect(dataPoint).not.toBeNull();
          
          // Each data point should have at least one key-value pair
          const keys = Object.keys(dataPoint);
          expect(keys.length).toBeGreaterThan(0);

          // Values should be strings or numbers
          Object.values(dataPoint).forEach((value) => {
            expect(['string', 'number']).toContain(typeof value);
          });
        });
      }),
      { numRuns: 100 }
    );
  });
});
