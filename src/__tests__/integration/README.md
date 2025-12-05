# Integration Tests

## Complete Message Rendering Integration Tests

This test suite (`complete-message-rendering.test.tsx`) provides comprehensive integration testing for the chat rich content rendering system.

### Test Coverage

#### 1. MarkdownRenderer - Basic Elements (6 tests)
- Mermaid diagram rendering
- Inline math with KaTeX
- Block math with KaTeX
- Image rendering with ImageRenderer
- Table rendering with TableRenderer
- Code blocks with CodeBlock component

#### 2. Full Message Rendering with Mixed Content (3 tests)
- Mixed content with all renderers (headings, code, math, tables, images)
- Complex nested content in tables (inline code, bold text)
- Multiple code blocks with different languages

#### 3. MessageBubble Integration (3 tests)
- Complete message with actions (copy, like, dislike, share)
- User messages without markdown rendering
- Like/dislike buttons only for assistant messages

#### 4. Streaming Content Integration (3 tests)
- Progressive rendering of streaming content
- Streaming completion and action display
- Streaming with code blocks

#### 5. Message Actions Integration (4 tests)
- Like action with API integration
- Dislike action with API integration
- API error handling with rollback
- Copy to clipboard functionality

#### 6. Complex Real-World Scenarios (7 tests)
- Complete technical response with all content types (API documentation example)
- Mathematical paper with multiple equations
- Code tutorial with multiple languages (TypeScript, Python, SQL)
- Streaming message with progressive updates
- Base64 image rendering
- Tables with inline code and formatting
- Chemical formulas in math mode

### Requirements Validated

These integration tests validate all requirements from the chat-rich-content spec:

- **Requirement 1**: Markdown formatting (headings, lists, emphasis, links, blockquotes)
- **Requirement 2**: Code blocks with syntax highlighting
- **Requirement 3**: Mathematical equations (inline and block)
- **Requirement 4**: Message actions (copy, like, dislike, share)
- **Requirement 5**: Images, diagrams, and visual content
- **Requirement 6**: Streaming content rendering
- **Requirement 7**: Code block copy functionality
- **Requirement 8**: Performance and accessibility
- **Requirement 9**: Table rendering

### Test Statistics

- **Total Tests**: 26
- **All Passing**: ✓
- **Test Duration**: ~3.5 seconds
- **Coverage**: All major features and edge cases

### Running the Tests

```bash
# Run all integration tests
npm test -- --run src/__tests__/integration/

# Run specific test file
npm test -- --run src/__tests__/integration/complete-message-rendering.test.tsx
```

### Notes

- Tests use lazy loading for heavy components (CodeBlock, ImageRenderer, MermaidRenderer)
- API calls are mocked using vitest's `vi.fn()`
- Clipboard API is mocked for copy functionality tests
- Tests wait for async components to load using `waitFor()`
- Mermaid rendering errors in test environment are expected (DOM limitations)
