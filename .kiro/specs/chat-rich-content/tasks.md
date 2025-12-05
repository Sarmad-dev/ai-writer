# Implementation Plan

- [x] 1. Install required dependencies









  - Install react-markdown, remark-gfm for markdown parsing
  - Install react-syntax-highlighter for code highlighting
  - Install katex and react-katex for math rendering
  - Install mermaid for diagram rendering
  - Install dompurify and @types/dompurify for sanitization
  - _Requirements: 1.1, 2.1, 3.1, 5.3_

- [x] 2. Create core MarkdownRenderer component




  - [x] 2.1 Implement MarkdownRenderer with react-markdown


    - Set up react-markdown with remark-gfm plugin
    - Configure custom renderers for each element type
    - Add DOMPurify sanitization for security
    - Handle streaming vs complete content states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  

  - [x] 2.2 Write property test for markdown element rendering


    - **Property 1: Markdown element rendering**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [x] 3. Implement CodeBlock component with syntax highlighting





  - [x] 3.1 Create CodeBlock component


    - Implement syntax highlighting with react-syntax-highlighter
    - Add language label display
    - Preserve whitespace and indentation
    - Support common languages (JS, TS, Python, Java, C++, Go, Rust, SQL)
    - Add copy button with clipboard functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2_
  


  - [x] 3.2 Write property test for code block syntax highlighting
    - **Property 2: Code block syntax highlighting**
    - **Validates: Requirements 2.1, 2.4**
  
  - [x] 3.3 Write property test for code whitespace preservation

    - **Property 3: Code whitespace preservation**
    - **Validates: Requirements 2.3**
  

  - [x] 3.4 Write property test for inline code rendering
    - **Property 4: Inline code rendering**
    - **Validates: Requirements 2.2**

  
  - [x] 3.5 Write property test for code block language labels
    - **Property 5: Code block language labels**
    - **Validates: Requirements 2.5**
  
  - [x] 3.6 Write property test for code block copy functionality
    - **Property 17: Code block copy functionality**
    - **Validates: Requirements 7.2, 7.4**

- [x] 4. Implement MathRenderer component






  - [x] 4.1 Create MathRenderer with KaTeX

    - Set up KaTeX for inline and block math rendering
    - Handle LaTeX syntax for common symbols and operators
    - Support fractions, exponents, subscripts, matrices
    - Handle chemical formulas with proper formatting
    - Add error handling for invalid LaTeX
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.2 Write property test for inline math rendering


    - **Property 6: Inline math rendering**
    - **Validates: Requirements 3.1**
  

  - [x] 4.3 Write property test for block math rendering
    - **Property 7: Block math rendering**
    - **Validates: Requirements 3.2**

  
  - [x] 4.4 Write property test for math symbol support
    - **Property 8: Math symbol support**
    - **Validates: Requirements 3.3, 3.4**
  
  - [x] 4.5 Write property test for chemical formula rendering
    - **Property 9: Chemical formula rendering**
    - **Validates: Requirements 3.5**

- [x] 5. Create MessageActions component




  - [x] 5.1 Implement message action buttons


    - Create copy button with clipboard API
    - Add visual feedback for copy action
    - Implement like/dislike buttons for assistant messages
    - Add share button functionality
    - Handle button state updates
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  


  - [x] 5.2 Write property test for assistant message feedback buttons
    - **Property 10: Assistant message feedback buttons**
    - **Validates: Requirements 4.3, 4.4**

- [x] 6. Implement ImageRenderer component






  - [x] 6.1 Create ImageRenderer with loading and error states

    - Handle markdown image syntax
    - Support base64-encoded images
    - Add loading skeleton
    - Implement error fallback UI
    - Scale large images to fit container
    - Add lazy loading
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  

  - [x] 6.2 Write property test for markdown image rendering

    - **Property 11: Markdown image rendering**
    - **Validates: Requirements 5.1**
  

  - [x] 6.3 Write property test for base64 image rendering
    - **Property 12: Base64 image rendering**
    - **Validates: Requirements 5.2**

  
  - [x] 6.4 Write property test for large image scaling
    - **Property 14: Large image scaling**
    - **Validates: Requirements 5.5**

- [x] 7. Implement MermaidRenderer component




  - [x] 7.1 Create MermaidRenderer for diagrams


    - Set up mermaid library with React wrapper
    - Handle Mermaid syntax parsing
    - Render diagrams as SVG
    - Add error handling for invalid syntax
    - Provide loading state
    - _Requirements: 5.3_
  
  - [x] 7.2 Write property test for Mermaid diagram rendering


    - **Property 13: Mermaid diagram rendering**
    - **Validates: Requirements 5.3**

- [x] 8. Implement TableRenderer component





  - [x] 8.1 Create TableRenderer with responsive styling


    - Parse markdown table syntax
    - Render HTML tables with proper structure
    - Apply alternating row colors
    - Add responsive wrapper for small screens
    - Style headers distinctly from body cells
    - Support nested content in cells
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  


  - [x] 8.2 Write property test for table rendering
    - **Property 19: Table rendering**
    - **Validates: Requirements 9.1, 9.2, 9.3**
  


  - [x] 8.3 Write property test for table header styling
    - **Property 20: Table header styling**
    - **Validates: Requirements 9.4**
  
  - [x] 8.4 Write property test for nested content in tables
    - **Property 21: Nested content in tables**
    - **Validates: Requirements 9.5**

- [x] 9. Create MessageBubble component




  - [x] 9.1 Implement MessageBubble wrapper


    - Wrap message content with styling
    - Integrate MessageActions component
    - Handle streaming state display
    - Support both user and assistant messages
    - Add timestamp display
    - _Requirements: 4.1, 4.3_

- [x] 10. Integrate custom renderers into MarkdownRenderer




  - [x] 10.1 Configure react-markdown custom components

    - Map code blocks to CodeBlock component
    - Map images to ImageRenderer component
    - Map tables to TableRenderer component
    - Add math rendering support via remark plugin or custom renderer
    - Add Mermaid rendering for code blocks with language "mermaid"
    - _Requirements: 1.1, 2.1, 3.1, 5.1, 5.3, 9.1_

- [x] 11. Update MessageList to use new MessageBubble




  - [x] 11.1 Refactor MessageList component


    - Replace plain message rendering with MessageBubble
    - Pass streaming state to MessageBubble
    - Maintain scroll behavior
    - Keep loading and empty states
    - _Requirements: 6.1, 6.4, 6.5_
  

  - [x] 11.2 Write property test for streaming content progressive rendering


    - **Property 15: Streaming content progressive rendering**
    - **Validates: Requirements 6.1, 6.4**

  
  - [x] 11.3 Write property test for streaming scroll stability

    - **Property 16: Streaming scroll stability**
    - **Validates: Requirements 6.5**

- [x] 12. Add accessibility features







  - [x] 12.1 Implement accessibility enhancements


    - Add ARIA labels to all action buttons
    - Ensure keyboard navigation for interactive elements
    - Add focus indicators
    - Ensure semantic HTML structure
    - Test with screen readers
    - _Requirements: 8.5_
  


  - [x] 12.2 Write property test for accessibility compliance


    - **Property 18: Accessibility compliance**
    - **Validates: Requirements 8.5**

- [x] 13. Implement performance optimizations




  - [x] 13.1 Add lazy loading and memoization


    - Lazy load heavy libraries (mermaid, syntax highlighter themes)
    - Memoize MarkdownRenderer with React.memo
    - Memoize CodeBlock and other expensive components
    - Add dynamic imports for optional renderers
    - _Requirements: 8.1, 8.4_

- [x] 14. Add database support for message feedback




  - [x] 14.1 Create MessageFeedback model in Prisma schema


    - Add MessageFeedback table with messageId, userId, feedbackType
    - Create migration
    - Generate Prisma client
    - _Requirements: 4.4_
  


  - [x] 14.2 Create API endpoint for message feedback

    - Implement POST /api/chat/messages/[id]/feedback
    - Handle like/dislike recording
    - Return updated feedback state

    - _Requirements: 4.4_
  
  - [x] 14.3 Connect MessageActions to feedback API

    - Call feedback API on like/dislike click
    - Handle optimistic updates
    - Handle errors with rollback
    - _Requirements: 4.4_

- [x] 15. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Test complete integration





  - [x] 16.1 Manual testing of rich content rendering

    - Test with various markdown content types
    - Test code blocks in multiple languages
    - Test mathematical equations
    - Test images and diagrams
    - Test tables with nested content
    - Test streaming behavior
    - Test message actions
    - _Requirements: All_
  
  - [x] 16.2 Write integration tests for complete message rendering


    - Test full message rendering with mixed content
    - Test streaming with real-time updates
    - Test message actions with API integration
    - _Requirements: All_
