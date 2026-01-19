# Document Export Utilities

This module provides comprehensive document export functionality for the AI Writing Assistant, supporting multiple formats including PDF, DOCX, and Markdown.

## Features

- **PDF Export**: High-quality PDF generation with proper formatting, margins, and typography
- **DOCX Export**: Microsoft Word compatible documents with structured content
- **Markdown Export**: Clean markdown conversion with support for various HTML elements
- **Link Sharing**: Copy document links to clipboard for easy sharing

## Supported Export Formats

### PDF Export
- Uses `jspdf` library for reliable PDF generation
- Supports custom margins, fonts, and page layouts
- Handles structured content (headings, paragraphs, text)
- Automatic page breaks and text wrapping
- Configurable typography settings

### DOCX Export
- Uses `docx` library for Microsoft Word compatibility
- Preserves document structure and formatting
- Supports headings, paragraphs, and text styling
- Configurable font sizes and spacing
- Professional document metadata

### Markdown Export
- Uses `turndown` for HTML to Markdown conversion
- Supports standard markdown elements
- Custom rules for strikethrough and highlighting
- Clean, readable output format
- Preserves document structure

## Usage

```typescript
import { 
  exportAsPDF, 
  exportAsDOCX, 
  downloadMarkdown, 
  copyDocumentLink 
} from '@/lib/export/exportUtils';

// Export as PDF
await exportAsPDF({
  title: 'My Document',
  content: '<h1>Hello World</h1><p>This is content.</p>',
  settings: {
    fontSize: 12,
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 1,
    marginRight: 1,
  }
});

// Export as DOCX
await exportAsDOCX({
  title: 'My Document',
  content: '<h1>Hello World</h1><p>This is content.</p>',
  settings: {
    fontSize: 12,
  }
});

// Export as Markdown
downloadMarkdown({
  title: 'My Document',
  content: '<h1>Hello World</h1><p>This is content.</p>',
});

// Copy document link
await copyDocumentLink('document-id-123');
```

## Content Processing

The export utilities intelligently process different content formats:

1. **HTML Content**: Parsed and converted to structured elements
2. **Plain Text**: Handled as-is with basic formatting
3. **Mixed Content**: Automatically detected and processed appropriately

### Supported HTML Elements

- Headings (h1-h6)
- Paragraphs (p)
- Text formatting (strong, em, etc.)
- Line breaks (br)
- Lists and other block elements

## Error Handling

All export functions include comprehensive error handling:

- User-friendly error messages via toast notifications
- Graceful fallbacks for unsupported content
- Proper cleanup of temporary resources
- Loading states during export operations

## Browser Compatibility

- Modern browsers with ES6+ support
- Clipboard API with fallback to execCommand
- File download via Blob URLs
- No server-side dependencies required

## Dependencies

- `jspdf`: PDF generation
- `docx`: DOCX document creation
- `turndown`: HTML to Markdown conversion
- `html2canvas`: Future enhancement for image capture

## Testing

Comprehensive test suite covering:
- Markdown export functionality
- Link copying with clipboard fallbacks
- Content processing edge cases
- Error handling scenarios

Run tests with:
```bash
npm test src/lib/export/__tests__/exportUtils.test.ts
```

## Future Enhancements

- Image embedding in PDF/DOCX exports
- Custom styling and themes
- Batch export functionality
- Cloud storage integration
- Advanced formatting options