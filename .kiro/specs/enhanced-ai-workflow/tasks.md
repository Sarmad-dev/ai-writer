# Implementation Plan

- [x] 1. Update database schema for enhanced workflow




- [x] 1.1 Add contentType field to ContentSession model


  - Add ContentType enum (TECHNICAL, REPORT, BLOG, STORY, ACADEMIC, BUSINESS, GENERAL)
  - Add contentType field with default GENERAL
  - Add index on contentType
  - _Requirements: 7.1_

- [x] 1.2 Add JSON fields for suggestions and improvements


  - Add suggestions JSON field for ContextualSuggestion array
  - Add vocabularySuggestions JSON field for VocabularySuggestion array
  - Add grammarIssues JSON field for GrammarIssue array
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 1.3 Create and run database migration


  - Generate Prisma migration for schema changes
  - Run migration against database
  - Verify schema in database
  - _Requirements: 7.1, 1.1, 2.1, 3.1_


- [x] 1.4 Create migration script for existing content

  - Write script to migrate Graph records to inline format
  - Write script to migrate Image records to inline format
  - Test migration on sample data
  - _Requirements: 5.1, 5.2_

- [x] 2. Implement enhanced workflow state and types




- [x] 2.1 Define enhanced workflow state interface


  - Create EnhancedWorkflowState interface with all fields
  - Define ContentType type
  - Define VocabularySuggestion interface
  - Define GrammarIssue interface
  - Define ContextualSuggestion interface
  - Define ContentLocation interface
  - _Requirements: 1.2, 2.1, 3.1, 7.1, 9.1_

- [x] 2.2 Update workflow state annotation for LangGraph


  - Update WorkflowStateAnnotation with new fields
  - Add contentType annotation
  - Add vocabularySuggestions annotation
  - Add grammarIssues annotation
  - Add suggestions annotation
  - _Requirements: 1.1, 2.1, 3.1, 7.1_


- [x] 2.3 Write property tests for state management


  - **Property 2: Suggestions include location** - Validates: Requirements 1.2
  - **Property 10: Vocabulary suggestions include definitions** - Validates: Requirements 2.5
  - **Property 12: Grammar issues include complete information** - Validates: Requirements 3.2

- [x] 3. Implement content type detection




- [x] 3.1 Create content type detection utility


  - Implement detectContentType function
  - Use keyword analysis and pattern matching
  - Support all content types (technical, report, blog, story, academic, business)
  - Return detected type with confidence score
  - _Requirements: 7.1_

- [x] 3.2 Update AnalyzePromptNode with content type detection


  - Call detectContentType on prompt and initial content
  - Store detected type in workflow state
  - Pass content type context to downstream nodes
  - _Requirements: 7.1_

- [x] 3.3 Write property tests for content type detection


  - **Property 30: Content type detection** - Validates: Requirements 7.1

- [x] 4. Implement vocabulary enhancement node



- [x] 4.1 Create VocabularyEnhancementNode


  - Analyze generated content for word choices
  - Identify weak, repetitive, or inappropriate words
  - Generate vocabulary suggestions with alternatives
  - Include definitions and usage notes
  - Tailor suggestions to content type
  - Store suggestions in workflow state
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 4.2 Implement vocabulary suggestion application logic

  - Create function to apply vocabulary suggestion
  - Preserve surrounding formatting (bold, italic, links)
  - Update content with new word
  - _Requirements: 2.4_


- [x] 4.3 Write property tests for vocabulary enhancement


  - **Property 6: Vocabulary analysis identifies opportunities** - Validates: Requirements 2.1
  - **Property 7: Weak words get alternatives** - Validates: Requirements 2.2
  - **Property 8: Vocabulary matches content type** - Validates: Requirements 2.3
  - **Property 9: Vocabulary replacement preserves formatting** - Validates: Requirements 2.4

- [x] 5. Implement grammar checking node





- [x] 5.1 Create GrammarCheckNode


  - Integrate grammar checking library or LLM-based checking
  - Identify grammatical errors, typos, and style issues
  - Generate grammar issues with type, explanation, and correction
  - Apply style rules appropriate for content type
  - Store grammar issues in workflow state
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 5.2 Implement grammar correction application logic

  - Create function to apply grammar correction
  - Replace incorrect text with correction
  - Preserve surrounding content structure
  - _Requirements: 3.4_


- [x] 5.3 Implement grammar highlighting in editor

  - Create function to highlight problematic text
  - Pass text position to editor highlight API
  - Show error type and severity
  - _Requirements: 3.3_


- [x] 5.4 Write property tests for grammar checking

  - **Property 11: Grammar errors are identified** - Validates: Requirements 3.1
  - **Property 13: Grammar highlighting works** - Validates: Requirements 3.3
  - **Property 14: Grammar corrections replace text** - Validates: Requirements 3.4
  - **Property 15: Grammar supports multiple styles** - Validates: Requirements 3.5

- [x] 6. Implement statistical data node




- [x] 6.1 Create StatisticalDataNode


  - Analyze content to determine if data visualization would help
  - Generate appropriate data points based on content context
  - Select optimal chart type (bar, line, pie, area, scatter)
  - Format data in TipTap-compatible format
  - Include chart configuration (title, labels, colors)
  - Store charts in workflow state
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.2 Implement chart embedding logic


  - Create function to embed chart in content structure
  - Determine appropriate location based on context
  - Insert chart node with id, type, data, and config
  - _Requirements: 4.5_

- [x] 6.3 Write property tests for statistical data


  - **Property 16: Statistical data determination** - Validates: Requirements 4.1
  - **Property 17: Data generation is contextual** - Validates: Requirements 4.2
  - **Property 18: Chart type selection is valid** - Validates: Requirements 4.3
  - **Property 19: Chart format matches TipTap** - Validates: Requirements 4.4
  - **Property 20: Charts are embedded at correct location** - Validates: Requirements 4.5

- [x] 7. Implement suggestions node


- [x] 7.1 Create SuggestionsNode


  - Generate context-aware suggestions based on prompt and content
  - Include precise location information (paragraph index, heading context)
  - Generate preview of surrounding content
  - Calculate relevance scores
  - Order suggestions by relevance and position
  - Tailor suggestions to content type
  - Store suggestions in workflow state
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 7.2, 9.1, 9.2_


- [x] 7.2 Implement suggestion application logic
  - Create function to apply suggestion at specified location
  - Preserve surrounding content structure
  - Scroll to and focus insertion point
  - _Requirements: 1.3, 9.4_


- [x] 7.3 Implement suggestion lifecycle management
  - Mark suggestions as applied or dismissed
  - Detect when suggestions become outdated
  - Remove or mark outdated suggestions


  - _Requirements: 9.5_

- [x] 7.4 Write property tests for suggestions

  - **Property 1: Suggestions are always created** - Validates: Requirements 1.1
  - **Property 3: Suggestion application preserves content** - Validates: Requirements 1.3
  - **Property 4: Suggestion display includes required fields** - Validates: Requirements 1.4
  - **Property 5: Suggestions are ordered correctly** - Validates: Requirements 1.5

- [x] 8. Update workflow graph to remove approval and add new nodes




- [x] 8.1 Remove approval node from workflow


  - Remove approvalNode from workflow graph
  - Remove conditional edges for approval
  - Remove pendingApproval from state
  - _Requirements: 6.1_



- [ ] 8.2 Add new nodes to workflow graph
  - Add vocabularyEnhancement node after generate
  - Add grammarCheck node after vocabulary
  - Add statisticalData node after grammar
  - Add suggestions node after statistical data
  - Update format node to handle inline charts


  - _Requirements: 2.1, 3.1, 4.1, 1.1_

- [ ] 8.3 Update workflow edges and routing
  - Connect generate → vocabulary → grammar → stats → suggestions → format → save


  - Remove approval-related conditional edges
  - Ensure search executes automatically without approval
  - _Requirements: 6.2, 6.3_

- [ ] 8.4 Write property tests for streamlined workflow
  - **Property 25: No approval requests created** - Validates: Requirements 6.1
  - **Property 26: Search executes automatically** - Validates: Requirements 6.2
  - **Property 27: Workflow executes all nodes** - Validates: Requirements 6.3
  - **Property 28: Complete response provided** - Validates: Requirements 6.4

- [x] 9. Update format and save nodes for inline storage




- [x] 9.1 Update FormatContentNode for inline charts


  - Embed charts directly in content JSON
  - Use TipTap graph node format
  - Include id, type, data, and config attributes
  - Position charts at appropriate locations
  - _Requirements: 4.4, 4.5, 5.2_



- [ ] 9.2 Update FormatContentNode for inline images
  - Embed image URLs directly in content JSON
  - Use TipTap image node format
  - Preserve image positioning and sizing


  - _Requirements: 5.1_

- [ ] 9.3 Update SaveNode to persist inline content
  - Save content JSON with inline images and charts
  - Save suggestions, vocabulary improvements, and grammar issues


  - Do not create separate Graph or Image records
  - Update session status
  - _Requirements: 5.3, 5.4_

- [ ] 9.4 Write property tests for inline storage
  - **Property 21: Images stored inline** - Validates: Requirements 5.1
  - **Property 22: Charts stored inline** - Validates: Requirements 5.2
  - **Property 23: Content round-trip preserves inline elements** - Validates: Requirements 5.3, 5.4
  - **Property 24: No orphaned records** - Validates: Requirements 5.5

- [x] 10. Implement error handling and graceful degradation





- [x] 10.1 Add error handling to vocabulary node

  - Wrap vocabulary analysis in try-catch
  - Continue workflow if vocabulary enhancement fails
  - Log error and add to metadata
  - _Requirements: 6.5_

- [x] 10.2 Add error handling to grammar node

  - Wrap grammar checking in try-catch
  - Continue workflow if grammar checking fails
  - Log error and add to metadata
  - _Requirements: 6.5_

- [x] 10.3 Add error handling to statistical data node

  - Wrap chart generation in try-catch
  - Continue workflow if chart generation fails
  - Log error and add to metadata
  - _Requirements: 6.5_

- [x] 10.4 Add error handling to suggestions node

  - Wrap suggestion generation in try-catch
  - Continue workflow if suggestions fail
  - Log error and add to metadata
  - _Requirements: 6.5_

- [x] 10.5 Write property tests for error handling


  - **Property 29: Graceful error handling** - Validates: Requirements 6.5

- [x] 11. Create UI components for suggestions panel




- [x] 11.1 Create SuggestionsPanel component


  - Display list of context-aware suggestions
  - Show location context and preview
  - Implement one-click application
  - Highlight corresponding location on hover
  - Filter by suggestion type
  - _Requirements: 1.4, 9.2, 9.3_



- [ ] 11.2 Implement suggestion hover highlighting
  - Connect hover event to editor highlight API
  - Highlight corresponding text in editor
  - Clear highlight on mouse leave


  - _Requirements: 9.3_

- [ ] 11.3 Implement suggestion application UI
  - Add apply button to each suggestion
  - Show loading state during application
  - Scroll to and focus insertion point
  - Mark suggestion as applied
  - _Requirements: 1.3, 9.4_

- [x] 12. Create UI components for vocabulary panel






- [x] 12.1 Create VocabularyPanel component

  - Display list of vocabulary suggestions
  - Show original word, suggested word, and definition
  - Show usage notes
  - Implement one-click replacement
  - Group by paragraph or section
  - _Requirements: 2.5_



- [ ] 12.2 Implement vocabulary replacement UI
  - Add replace button to each suggestion
  - Show preview of replacement
  - Preserve formatting during replacement
  - Mark suggestion as applied
  - _Requirements: 2.4_

- [x] 13. Create UI components for grammar panel




- [x] 13.1 Create GrammarPanel component


  - Display list of grammar issues
  - Show error type, explanation, and correction
  - Show severity indicators (error, warning, suggestion)
  - Implement one-click correction
  - Group by severity
  - _Requirements: 3.2_

- [x] 13.2 Implement grammar highlighting in editor

  - Highlight problematic text with severity colors
  - Show tooltip with explanation on hover
  - Clear highlights when corrections are applied
  - _Requirements: 3.3_

- [x] 13.3 Implement grammar correction UI

  - Add fix button to each issue
  - Show preview of correction
  - Apply correction and update content
  - Mark issue as resolved
  - _Requirements: 3.4_

- [ ] 14. Create content type selector component
- [ ] 14.1 Create ContentTypeSelector component
  - Display detected content type
  - Allow manual content type selection
  - Show content type options (technical, report, blog, story, academic, business)
  - Update workflow context when changed
  - _Requirements: 7.1_

- [ ] 14.2 Implement content type change handling
  - Trigger re-analysis when content type changes
  - Update suggestions, vocabulary, and grammar based on new type
  - Show loading state during re-analysis
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 15. Implement content type-specific suggestion logic
- [ ] 15.1 Add technical writing support
  - Generate technical terminology suggestions
  - Suggest code examples when appropriate
  - Suggest structured formatting (headings, lists, tables)
  - _Requirements: 10.1_

- [ ] 15.2 Add report writing support
  - Suggest data visualizations for key metrics
  - Suggest executive summary sections
  - Suggest formal language improvements
  - _Requirements: 10.2_

- [ ] 15.3 Add blog writing support
  - Suggest engaging headlines
  - Suggest conversational tone improvements
  - Suggest SEO improvements (keywords, meta descriptions)
  - _Requirements: 10.3_

- [ ] 15.4 Add story writing support
  - Suggest narrative improvements
  - Suggest character development enhancements
  - Suggest descriptive language
  - _Requirements: 10.4_

- [ ] 15.5 Add academic writing support
  - Suggest citation formats
  - Suggest formal structure (abstract, introduction, conclusion)
  - Suggest scholarly vocabulary
  - _Requirements: 10.5_

- [ ] 15.6 Write property tests for content type support
  - **Property 31: Suggestions match content type** - Validates: Requirements 7.2
  - **Property 32: Vocabulary matches content type** - Validates: Requirements 7.3
  - **Property 33: Grammar rules match content type** - Validates: Requirements 7.4
  - **Property 34: Visualizations match content type** - Validates: Requirements 7.5
  - **Property 45: Technical writing support** - Validates: Requirements 10.1
  - **Property 46: Report writing support** - Validates: Requirements 10.2
  - **Property 47: Blog writing support** - Validates: Requirements 10.3
  - **Property 48: Story writing support** - Validates: Requirements 10.4
  - **Property 49: Academic writing support** - Validates: Requirements 10.5

- [ ] 16. Update API routes for enhanced workflow
- [ ] 16.1 Update /api/agent/generate endpoint
  - Remove approval request handling
  - Stream vocabulary suggestions
  - Stream grammar issues
  - Stream contextual suggestions
  - Stream charts in TipTap format
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 16.2 Create /api/suggestions/apply endpoint
  - Accept suggestion ID and session ID
  - Apply suggestion at specified location
  - Return updated content
  - _Requirements: 1.3_

- [ ] 16.3 Create /api/vocabulary/apply endpoint
  - Accept vocabulary suggestion ID and session ID
  - Replace word while preserving formatting
  - Return updated content
  - _Requirements: 2.4_

- [ ] 16.4 Create /api/grammar/apply endpoint
  - Accept grammar issue ID and session ID
  - Apply correction
  - Return updated content
  - _Requirements: 3.4_

- [ ] 17. Implement chart format validation
- [ ] 17.1 Create chart data validation utilities
  - Validate ChartDataPoint structure
  - Validate ChartConfig structure
  - Validate ChartType enum values
  - Validate TipTap chart node structure
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 17.2 Add validation to StatisticalDataNode
  - Validate generated chart data before embedding
  - Ensure all required attributes are present
  - Ensure data types are correct
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 17.3 Write property tests for chart format
  - **Property 35: Chart data uses correct interface** - Validates: Requirements 8.1
  - **Property 36: Chart config uses correct interface** - Validates: Requirements 8.2
  - **Property 37: Chart type is valid** - Validates: Requirements 8.3
  - **Property 38: Chart node has required attributes** - Validates: Requirements 8.4
  - **Property 39: Charts render correctly** - Validates: Requirements 8.5

- [ ] 18. Implement location tracking for suggestions
- [ ] 18.1 Add location tracking to suggestion generation
  - Calculate paragraph index for each suggestion
  - Extract heading context
  - Calculate character offset
  - Store in ContentLocation structure
  - _Requirements: 9.1_

- [ ] 18.2 Implement content preview generation
  - Extract surrounding content for each suggestion
  - Generate preview text (50-100 characters)
  - Include in suggestion display
  - _Requirements: 9.2_

- [ ] 18.3 Implement scroll and focus on application
  - Scroll editor to suggestion location
  - Focus insertion point
  - Highlight applied content briefly
  - _Requirements: 9.4_

- [ ] 18.4 Write property tests for location tracking
  - **Property 40: Suggestions include location context** - Validates: Requirements 9.1
  - **Property 41: Suggestions show content preview** - Validates: Requirements 9.2
  - **Property 42: Hover highlights location** - Validates: Requirements 9.3
  - **Property 43: Application scrolls to location** - Validates: Requirements 9.4
  - **Property 44: Outdated suggestions are marked** - Validates: Requirements 9.5

- [ ] 19. Run migration script and cleanup
- [ ] 19.1 Run content migration script
  - Migrate existing Graph records to inline format
  - Migrate existing Image records to inline format
  - Verify migrated content renders correctly
  - _Requirements: 5.1, 5.2_

- [ ] 19.2 Drop deprecated tables
  - Drop Graph table
  - Drop Image table
  - Drop ApprovalRequest table
  - Verify no foreign key constraints remain
  - _Requirements: 5.5, 6.1_

- [ ] 19.3 Update database indexes
  - Add index on contentType field
  - Remove indexes on dropped tables
  - Optimize query performance
  - _Requirements: 7.1_

- [ ] 20. Performance optimization
- [ ] 20.1 Implement parallel node execution
  - Run vocabulary and grammar nodes in parallel
  - Merge results before suggestions node
  - Reduce total workflow execution time
  - _Requirements: 6.3_

- [ ] 20.2 Add caching for content type detection
  - Cache detected content type per session
  - Invalidate cache when content changes significantly
  - Reduce redundant analysis
  - _Requirements: 7.1_

- [ ] 20.3 Implement debounced suggestion updates
  - Debounce suggestion panel updates during editing
  - Batch suggestion invalidation checks
  - Improve editor performance
  - _Requirements: 9.5_

- [ ] 20.4 Add lazy loading for panels
  - Lazy load suggestions panel
  - Lazy load vocabulary panel
  - Lazy load grammar panel
  - Improve initial page load time
  - _Requirements: 1.4, 2.5, 3.2_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Fix any failing tests
  - Verify all core functionality works end-to-end
  - Test with different content types
  - Verify inline storage works correctly
  - Verify no approval requests are created
  - Ask the user if questions arise
