import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { ImageRenderer } from '@/components/chat/ImageRenderer';

describe('ImageRenderer Properties', () => {
  // Arbitraries for generating image data
  const safeTextArbitrary = fc
    .stringMatching(/^[a-zA-Z0-9 ]+$/)
    .filter(s => s.trim().length > 0 && s.length <= 50);

  const imageUrlArbitrary = fc.webUrl({ validSchemes: ['http', 'https'] });

  const base64ImageArbitrary = fc
    .constantFrom(
      // Small 1x1 red pixel PNG
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      // Small 1x1 blue pixel PNG
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
      // Small 1x1 green pixel PNG
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
    );

  // Feature: chat-rich-content, Property 11: Markdown image rendering
  // Validates: Requirements 5.1
  it('should render img element with correct src and alt attributes for any markdown image', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        safeTextArbitrary,
        (src, alt) => {
          const { container } = render(<ImageRenderer src={src} alt={alt} />);
          
          // Should render an img element
          const imgElement = container.querySelector('img');
          expect(imgElement).toBeTruthy();
          
          // Should have correct src attribute
          expect(imgElement?.getAttribute('src')).toBe(src);
          
          // Should have correct alt attribute
          expect(imgElement?.getAttribute('alt')).toBe(alt);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include title attribute when provided', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        safeTextArbitrary,
        safeTextArbitrary,
        (src, alt, title) => {
          const { container } = render(<ImageRenderer src={src} alt={alt} title={title} />);
          
          const imgElement = container.querySelector('img');
          expect(imgElement).toBeTruthy();
          expect(imgElement?.getAttribute('title')).toBe(title);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have lazy loading attribute for performance', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        safeTextArbitrary,
        (src, alt) => {
          const { container } = render(<ImageRenderer src={src} alt={alt} />);
          
          const imgElement = container.querySelector('img');
          expect(imgElement).toBeTruthy();
          expect(imgElement?.getAttribute('loading')).toBe('lazy');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 12: Base64 image rendering
  // Validates: Requirements 5.2
  it('should decode and display base64-encoded images inline', () => {
    fc.assert(
      fc.property(
        base64ImageArbitrary,
        safeTextArbitrary,
        (base64Src, alt) => {
          const { container } = render(<ImageRenderer src={base64Src} alt={alt} />);
          
          // Should render an img element
          const imgElement = container.querySelector('img');
          expect(imgElement).toBeTruthy();
          
          // Should have the base64 data URI as src
          expect(imgElement?.getAttribute('src')).toBe(base64Src);
          
          // Should start with data:image/
          expect(base64Src.startsWith('data:image/')).toBe(true);
          
          // Should have lazy loading
          expect(imgElement?.getAttribute('loading')).toBe('lazy');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 14: Large image scaling
  // Validates: Requirements 5.5
  it('should scale images to fit within container bounds', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        safeTextArbitrary,
        (src, alt) => {
          const { container } = render(<ImageRenderer src={src} alt={alt} />);
          
          const imgElement = container.querySelector('img');
          expect(imgElement).toBeTruthy();
          
          // Should have max-width and max-height constraints
          const classList = imgElement?.className || '';
          expect(classList).toContain('max-w-full');
          expect(classList).toContain('max-h-');
          
          // Should have object-contain for proper scaling
          expect(classList).toContain('object-contain');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display loading skeleton before image loads', () => {
    fc.assert(
      fc.property(
        imageUrlArbitrary,
        safeTextArbitrary,
        (src, alt) => {
          const { container } = render(<ImageRenderer src={src} alt={alt} />);
          
          // Should have a skeleton element initially
          const skeleton = container.querySelector('[data-slot="skeleton"]');
          expect(skeleton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display error fallback UI when image fails to load', async () => {
    await fc.assert(
      fc.asyncProperty(
        safeTextArbitrary,
        async (alt) => {
          // Use an invalid URL that will fail to load
          const invalidSrc = 'https://invalid-domain-that-does-not-exist-12345.com/image.png';
          
          const { container } = render(<ImageRenderer src={invalidSrc} alt={alt} />);
          
          // Trigger error by simulating image load failure
          const imgElement = container.querySelector('img');
          if (imgElement) {
            imgElement.dispatchEvent(new Event('error'));
          }
          
          // Wait for error state to render
          await waitFor(() => {
            // Should show error message
            const errorText = container.textContent || '';
            expect(errorText).toContain('Failed to load image');
            
            // Should display alt text in error state
            if (alt) {
              expect(errorText).toContain(alt);
            }
            
            // Should have error icon
            const errorIcon = container.querySelector('svg');
            expect(errorIcon).toBeTruthy();
          }, { timeout: 1000 });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display caption when title or alt is provided after load', () => {
    fc.assert(
      fc.property(
        base64ImageArbitrary,
        safeTextArbitrary,
        fc.option(safeTextArbitrary, { nil: undefined }),
        (src, alt, title) => {
          const { container } = render(<ImageRenderer src={src} alt={alt} title={title} />);
          
          // Simulate image load event with act
          const imgElement = container.querySelector('img');
          if (imgElement) {
            act(() => {
              imgElement.dispatchEvent(new Event('load', { bubbles: true }));
            });
          }
          
          // Should display caption with title or alt
          const captionText = container.textContent || '';
          const expectedCaption = (title || alt).trim();
          // Caption should contain the expected text (trimmed for comparison)
          expect(captionText.trim()).toContain(expectedCaption);
        }
      ),
      { numRuns: 100 }
    );
  });
});
