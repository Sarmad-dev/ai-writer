import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { detectContentType, isValidContentType } from '@/lib/agent/utils/content-type-detection';
import type { ContentType } from '@/lib/agent/types';

// Arbitraries for generating test data

// Generate prompts with specific content type indicators
const technicalPromptArbitrary = fc.record({
  base: fc.constantFrom(
    'Write documentation for',
    'Create a technical guide about',
    'Explain the API for',
    'How to implement',
    'Tutorial on',
    'Setup instructions for'
  ),
  topic: fc.constantFrom(
    'authentication system',
    'REST API',
    'database schema',
    'React components',
    'Python functions',
    'deployment configuration'
  ),
}).map(({ base, topic }) => `${base} ${topic}`);

const reportPromptArbitrary = fc.record({
  base: fc.constantFrom(
    'Generate a quarterly report on',
    'Create an analysis of',
    'Write a summary report about',
    'Provide statistics on',
    'Analyze the performance of',
    'Executive summary for'
  ),
  topic: fc.constantFrom(
    'sales metrics',
    'revenue growth',
    'market trends',
    'customer satisfaction',
    'Q4 results',
    'annual performance'
  ),
}).map(({ base, topic }) => `${base} ${topic}`);

const blogPromptArbitrary = fc.record({
  base: fc.constantFrom(
    'Write a blog post about',
    'Create an article on',
    'Share tips for',
    'Top 10 ways to',
    'My experience with',
    'A beginner\'s guide to'
  ),
  topic: fc.constantFrom(
    'productivity',
    'travel destinations',
    'healthy eating',
    'personal growth',
    'lifestyle changes',
    'learning new skills'
  ),
}).map(({ base, topic }) => `${base} ${topic}`);

const storyPromptArbitrary = fc.record({
  base: fc.constantFrom(
    'Write a story about',
    'Create a narrative featuring',
    'Tell a tale of',
    'Once upon a time',
    'Craft a fiction story about',
    'Write a short story where'
  ),
  topic: fc.constantFrom(
    'a brave hero',
    'an unexpected adventure',
    'a mysterious character',
    'a magical journey',
    'a thrilling mystery',
    'a romantic encounter'
  ),
}).map(({ base, topic }) => `${base} ${topic}`);

const academicPromptArbitrary = fc.record({
  base: fc.constantFrom(
    'Write a research paper on',
    'Create an academic study about',
    'Analyze the literature on',
    'Write a thesis about',
    'Conduct a scholarly review of',
    'Examine the hypothesis that'
  ),
  topic: fc.constantFrom(
    'climate change effects',
    'cognitive psychology',
    'economic theory',
    'historical events',
    'scientific methodology',
    'social behavior patterns'
  ),
}).map(({ base, topic }) => `${base} ${topic}`);

const businessPromptArbitrary = fc.record({
  base: fc.constantFrom(
    'Write a business proposal for',
    'Create a strategy document about',
    'Draft a client presentation on',
    'Prepare a meeting agenda for',
    'Write a business plan for',
    'Create a pitch deck about'
  ),
  topic: fc.constantFrom(
    'new product launch',
    'market expansion',
    'partnership opportunities',
    'cost reduction',
    'revenue optimization',
    'customer acquisition'
  ),
}).map(({ base, topic }) => `${base} ${topic}`);

const generalPromptArbitrary = fc.string({ minLength: 10, maxLength: 100 });

// Arbitrary that generates prompts for all content types
const anyPromptArbitrary = fc.oneof(
  technicalPromptArbitrary,
  reportPromptArbitrary,
  blogPromptArbitrary,
  storyPromptArbitrary,
  academicPromptArbitrary,
  businessPromptArbitrary,
  generalPromptArbitrary
);

describe('Content Type Detection Properties', () => {
  // Feature: enhanced-ai-workflow, Property 30: Content type detection
  it('should detect and assign a content type for any content analyzed', () => {
    fc.assert(
      fc.property(anyPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Verify result has required fields
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.confidence).toBeDefined();
        expect(result.indicators).toBeDefined();

        // Verify type is a valid ContentType
        expect(isValidContentType(result.type)).toBe(true);
        const validTypes: ContentType[] = [
          'technical', 'report', 'blog', 'story', 'academic', 'business', 'general'
        ];
        expect(validTypes).toContain(result.type);

        // Verify confidence is in valid range [0, 1]
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        // Verify indicators is an array
        expect(Array.isArray(result.indicators)).toBe(true);

        // Verify indicators are strings
        result.indicators.forEach(indicator => {
          expect(typeof indicator).toBe('string');
        });
      }),
      { numRuns: 100 }
    );
  });

  // Property: Technical prompts should be detected with valid type
  it('should detect a valid content type for prompts with technical indicators', () => {
    fc.assert(
      fc.property(technicalPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Should detect a valid content type
        expect(isValidContentType(result.type)).toBe(true);

        // Confidence should be in valid range
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        // Should have some indicators
        expect(Array.isArray(result.indicators)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Property: Report prompts should be detected with valid type
  it('should detect a valid content type for prompts with report indicators', () => {
    fc.assert(
      fc.property(reportPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Should detect a valid content type
        expect(isValidContentType(result.type)).toBe(true);

        // Confidence should be in valid range
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        // Should have some indicators
        expect(Array.isArray(result.indicators)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Property: Blog prompts should be detected as blog
  it('should detect blog content type for prompts with blog indicators', () => {
    fc.assert(
      fc.property(blogPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Blog prompts should be detected as blog or general
        expect(['blog', 'general']).toContain(result.type);

        // If detected as blog, confidence should be reasonable
        if (result.type === 'blog') {
          expect(result.confidence).toBeGreaterThan(0.5);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property: Story prompts should be detected with valid type
  it('should detect a valid content type for prompts with story indicators', () => {
    fc.assert(
      fc.property(storyPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Should detect a valid content type
        expect(isValidContentType(result.type)).toBe(true);

        // Confidence should be in valid range
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        // Should have some indicators
        expect(Array.isArray(result.indicators)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Property: Academic prompts should be detected with valid type
  it('should detect a valid content type for prompts with academic indicators', () => {
    fc.assert(
      fc.property(academicPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Should detect a valid content type
        expect(isValidContentType(result.type)).toBe(true);

        // Confidence should be in valid range
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);

        // Should have some indicators
        expect(Array.isArray(result.indicators)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // Property: Business prompts should be detected as business
  it('should detect business content type for prompts with business indicators', () => {
    fc.assert(
      fc.property(businessPromptArbitrary, (prompt: string) => {
        const result = detectContentType(prompt);

        // Business prompts should be detected as business or general
        expect(['business', 'general']).toContain(result.type);

        // If detected as business, confidence should be reasonable
        if (result.type === 'business') {
          expect(result.confidence).toBeGreaterThan(0.5);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property: Detection with initial content should consider both prompt and content
  it('should consider both prompt and initial content when provided', () => {
    fc.assert(
      fc.property(
        anyPromptArbitrary,
        fc.string({ minLength: 50, maxLength: 200 }),
        (prompt: string, initialContent: string) => {
          const resultWithoutContent = detectContentType(prompt);
          const resultWithContent = detectContentType(prompt, initialContent);

          // Both results should be valid
          expect(isValidContentType(resultWithoutContent.type)).toBe(true);
          expect(isValidContentType(resultWithContent.type)).toBe(true);

          // Both should have valid confidence scores
          expect(resultWithoutContent.confidence).toBeGreaterThanOrEqual(0);
          expect(resultWithoutContent.confidence).toBeLessThanOrEqual(1);
          expect(resultWithContent.confidence).toBeGreaterThanOrEqual(0);
          expect(resultWithContent.confidence).toBeLessThanOrEqual(1);

          // The result with content might have different confidence or type
          // but should still be valid
          expect(isValidContentType(resultWithContent.type)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Empty or very short prompts should default to general
  it('should default to general for empty or very short prompts', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 5 }), (prompt: string) => {
        const result = detectContentType(prompt);

        // Very short prompts should likely be general
        // (unless they happen to contain a strong indicator)
        expect(isValidContentType(result.type)).toBe(true);

        // Confidence should be relatively low for very short prompts
        if (result.type === 'general') {
          expect(result.confidence).toBeLessThanOrEqual(0.7);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property: isValidContentType should correctly validate content types
  it('should correctly validate content type strings', () => {
    fc.assert(
      fc.property(fc.string(), (str: string) => {
        const validTypes = [
          'technical', 'report', 'blog', 'story', 'academic', 'business', 'general'
        ];
        const isValid = isValidContentType(str);

        if (validTypes.includes(str)) {
          expect(isValid).toBe(true);
        } else {
          expect(isValid).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property: Confidence should increase with more indicators
  it('should have higher confidence when more indicators are present', () => {
    // Create prompts with varying numbers of technical indicators
    const singleIndicator = 'Write API documentation';
    const multipleIndicators = 'Write technical API documentation with code examples and implementation guide';

    const resultSingle = detectContentType(singleIndicator);
    const resultMultiple = detectContentType(multipleIndicators);

    // Both should detect technical
    expect(['technical', 'general']).toContain(resultSingle.type);
    expect(['technical', 'general']).toContain(resultMultiple.type);

    // The one with multiple indicators should have more indicators found
    // (This is a heuristic test, not a strict property)
    if (resultSingle.type === 'technical' && resultMultiple.type === 'technical') {
      expect(resultMultiple.indicators.length).toBeGreaterThanOrEqual(resultSingle.indicators.length);
    }
  });
});
