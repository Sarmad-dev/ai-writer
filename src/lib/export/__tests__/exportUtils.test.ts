import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportAsMarkdown, copyDocumentLink } from '../exportUtils';

// Mock DOM APIs
Object.assign(global, {
  document: {
    createElement: vi.fn(() => ({
      innerHTML: '',
      textContent: '',
      innerText: '',
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      click: vi.fn(),
      select: vi.fn(),
      style: {},
      childNodes: [],
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
    execCommand: vi.fn(),
  },
  window: {
    location: {
      origin: 'https://example.com',
    },
  },
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
  navigator: {
    clipboard: {
      writeText: vi.fn(),
    },
  },
});

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportAsMarkdown', () => {
    it('should export plain text content as markdown', () => {
      const options = {
        title: 'Test Document',
        content: 'This is a test document with some content.',
      };

      const result = exportAsMarkdown(options);
      
      expect(result).toBe('# Test Document\n\nThis is a test document with some content.');
    });

    it('should handle HTML content and convert to markdown', () => {
      const options = {
        title: 'HTML Document',
        content: '<h2>Heading</h2><p>This is a paragraph with <strong>bold</strong> text.</p>',
      };

      const result = exportAsMarkdown(options);
      
      expect(result).toContain('# HTML Document');
      expect(result).toContain('Heading');
    });

    it('should handle empty content', () => {
      const options = {
        title: 'Empty Document',
        content: '',
      };

      const result = exportAsMarkdown(options);
      
      expect(result).toBe('# Empty Document\n\n');
    });
  });

  describe('copyDocumentLink', () => {
    it('should copy document link to clipboard', async () => {
      const documentId = 'test-doc-123';
      
      await copyDocumentLink(documentId);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/content/test-doc-123'
      );
    });

    it('should fallback to execCommand when clipboard API fails', async () => {
      const documentId = 'test-doc-123';
      
      // Mock clipboard API to fail
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Clipboard API not available'));
      
      await copyDocumentLink(documentId);
      
      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });
});