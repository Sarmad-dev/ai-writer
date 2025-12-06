# Implementation Plan

- [x] 1. Set up project infrastructure and dependencies





  - Install required packages: Prisma, Better Auth, LangGraph.js, TipTap, Recharts, GSAP, React Query, Shadcn UI, Lucide icons, fast-check
  - Configure TypeScript paths and aliases
  - Set up environment variable validation
  - _Requirements: 10.5, 11.1_

- [x] 2. Configure database and authentication




- [x] 2.1 Set up Prisma with Neon PostgreSQL


  - Create Prisma schema with User, Session, ContentSession, Graph, ApprovalRequest, and Image models
  - Configure database connection with environment variables
  - Generate Prisma client
  - _Requirements: 11.1, 11.2_



- [x] 2.2 Create initial database migration

  - Run Prisma migrate to create database tables
  - Verify schema in Neon dashboard

  - _Requirements: 11.3_

- [x] 2.3 Set up Better Auth

  - Configure Better Auth with email/password provider
  - Create auth API route at /api/auth/[...all]
  - Set up session management with httpOnly cookies
  - _Requirements: 2.1, 2.2_


- [x] 2.4 Write property tests for authentication

  - **Property 1: Valid registration creates account** - Validates: Requirements 2.1
  - **Property 2: Valid login creates session** - Validates: Requirements 2.2
  - **Property 3: Invalid credentials are rejected** - Validates: Requirements 2.3

- [x] 3. Create authentication UI components





- [x] 3.1 Build AuthProvider context


  - Create React context for auth state
  - Implement useAuth hook
  - Handle session persistence
  - _Requirements: 2.4, 2.5_

- [x] 3.2 Build LoginForm component


  - Create form with email and password fields using Shadcn UI
  - Implement form validation with Zod
  - Handle login submission and error display
  - _Requirements: 2.2, 2.3_

- [x] 3.3 Build RegisterForm component


  - Create registration form with validation
  - Implement password strength indicator
  - Handle registration submission
  - _Requirements: 2.1, 2.3_

- [x] 3.4 Create ProtectedRoute wrapper


  - Implement route protection logic
  - Redirect unauthenticated users to login
  - _Requirements: 2.4, 2.5_

- [x] 3.5 Write property tests for route protection


  - **Property 4: Authenticated access is granted** - Validates: Requirements 2.4
  - **Property 5: Unauthenticated access is blocked** - Validates: Requirements 2.5

- [x] 4. Build animated landing page




- [x] 4.1 Create HeroSection component


  - Design hero layout with headline and CTA
  - Implement GSAP timeline animations for text reveal
  - Add animated background effects
  - _Requirements: 1.1, 1.2_



- [ ] 4.2 Create FeaturesSection component
  - Build feature grid with Lucide icons
  - Implement scroll-triggered GSAP animations
  - Style with Tailwind CSS and Shadcn UI


  - _Requirements: 1.3, 1.4, 1.5_

- [x] 4.3 Create TestimonialsSection component


  - Design testimonial cards layout
  - Add scroll animations
  - _Requirements: 1.3, 1.4_



- [ ] 4.4 Create CTASection component
  - Build final call-to-action section
  - Add sign-up button linking to registration
  - _Requirements: 1.3_

- [ ] 4.5 Assemble LandingPage
  - Combine all sections in main landing page
  - Set up GSAP ScrollTrigger
  - Optimize animations for performance
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5. Set up React Query and data layer




- [x] 5.1 Configure React Query provider


  - Set up QueryClient with caching configuration
  - Wrap app with QueryClientProvider
  - Configure retry and stale time policies
  - _Requirements: 9.1, 9.4, 9.5_



- [ ] 5.2 Create API client utilities
  - Build fetch wrapper with error handling
  - Implement request/response interceptors
  - Add authentication header injection


  - _Requirements: 10.1, 10.2_

- [ ] 5.3 Create React Query hooks for content sessions
  - Implement useContentSessions query hook
  - Implement useCreateSession mutation hook


  - Implement useUpdateSession mutation hook
  - Implement useDeleteSession mutation hook
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 5.4 Write property tests for data management
  - **Property 31: Cache invalidation on mutation** - Validates: Requirements 9.3
  - **Property 32: Request retry on failure** - Validates: Requirements 9.4
  - **Property 33: Cached data serving** - Validates: Requirements 9.5

- [x] 6. Build dashboard and content session management







- [x] 6.1 Create Dashboard page


  - Build main dashboard layout
  - Add navigation and user menu
  - Implement protected route wrapper
  - _Requirements: 3.4_

- [x] 6.2 Create ContentSessionList component


  - Fetch and display user's content sessions using React Query
  - Implement loading and error states
  - Add empty state for no sessions
  - _Requirements: 3.4_

- [x] 6.3 Create ContentSessionCard component


  - Design session card with title, preview, and metadata
  - Add click handler to open session
  - Show session status badge
  - _Requirements: 3.4, 3.5_

- [x] 6.4 Create NewContentButton component


  - Build button to initiate new content generation
  - Open modal or navigate to content creation page
  - _Requirements: 3.1_

- [x] 6.5 Write property tests for content sessions


  - **Property 6: Prompt submission creates session** - Validates: Requirements 3.1
  - **Property 8: Session persistence** - Validates: Requirements 3.3
  - **Property 9: Session list ordering** - Validates: Requirements 3.4
  - **Property 10: Session loading preserves state** - Validates: Requirements 3.5

- [x] 7. Implement LangGraph.js AI agent workflow




- [x] 7.1 Set up LangGraph.js workflow structure


  - Define workflow state interface
  - Create workflow graph with nodes
  - Implement state transitions
  - _Requirements: 3.2, 12.2_

- [x] 7.2 Implement Analyze Prompt node


  - Parse user prompt and multimodal inputs
  - Determine if web search is needed
  - Extract content requirements
  - _Requirements: 3.2, 12.1_



- [ ] 7.3 Implement Web Search node
  - Integrate web search API (Tavily or similar)
  - Execute search queries
  - Filter and extract relevant results
  - Handle search errors gracefully


  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7.4 Implement Approval node
  - Create approval request in database
  - Pause workflow execution


  - Wait for user response via polling or webhooks
  - Resume workflow based on approval/rejection
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.5 Implement Generate Content node


  - Call LLM API (OpenAI or similar) with context
  - Stream generated content
  - Handle multimodal inputs (text + images)
  - Incorporate search results with citations


  - _Requirements: 3.2, 4.2, 4.4, 12.1, 12.3_

- [ ] 7.6 Implement Graph Generation node
  - Detect statistical data in content


  - Determine appropriate chart type
  - Create graph configuration
  - _Requirements: 6.1_



- [ ] 7.7 Implement Format Content node
  - Structure content for TipTap JSON format
  - Embed graphs at appropriate positions
  - Apply formatting
  - _Requirements: 6.2, 7.1_

- [ ] 7.8 Implement Save node
  - Persist content to database
  - Update session status
  - Trigger React Query cache invalidation
  - _Requirements: 3.3_

- [ ] 7.9 Write property tests for AI workflow
  - **Property 7: Session creation starts workflow** - Validates: Requirements 3.2
  - **Property 11: Search execution on demand** - Validates: Requirements 4.1
  - **Property 12: Search results incorporation** - Validates: Requirements 4.2
  - **Property 13: Search error handling** - Validates: Requirements 4.3
  - **Property 14: Source citation** - Validates: Requirements 4.4

- [x] 8. Create AI agent API routes





- [x] 8.1 Create /api/agent/generate endpoint


  - Accept content generation request
  - Create Content Session in database
  - Initiate LangGraph workflow
  - Stream response using Server-Sent Events
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8.2 Create /api/agent/approve endpoint


  - Accept approval/rejection for HITL requests
  - Update ApprovalRequest in database
  - Resume workflow execution
  - _Requirements: 5.3, 5.4_



- [x] 8.3 Create /api/search/web endpoint

  - Proxy web search requests
  - Handle API authentication
  - Return formatted results

  - _Requirements: 4.1_

- [x] 8.4 Write property tests for HITL workflow

  - **Property 15: Approval request creation pauses workflow** - Validates: Requirements 5.1
  - **Property 16: Approval request contains details** - Validates: Requirements 5.2
  - **Property 17: Approval resumes workflow** - Validates: Requirements 5.3
  - **Property 18: Rejection skips action** - Validates: Requirements 5.4
  - **Property 19: Timeout handling** - Validates: Requirements 5.5

- [-] 9. Build AI agent UI components



- [x] 9.1 Create AgentInterface component


  - Build chat-like interface for AI interaction
  - Display generation progress
  - Show streaming content updates
  - _Requirements: 3.2_

- [x] 9.2 Create ApprovalRequestModal component


  - Design modal for approval requests
  - Show action details and context
  - Add approve/reject buttons
  - Handle approval submission
  - _Requirements: 5.1, 5.2_

- [x] 9.3 Create StreamingContent component


  - Display AI-generated content as it streams
  - Handle real-time updates via SSE
  - Show loading indicators
  - _Requirements: 3.2_

- [x] 10. Implement TipTap rich text editor




- [x] 10.1 Set up TipTap editor instance


  - Configure TipTap with required extensions
  - Add StarterKit for basic formatting
  - Configure Image extension
  - Create custom Graph node extension
  - _Requirements: 7.1, 7.3_



- [x] 10.2 Create ContentEditor component

  - Build main editor container
  - Integrate TipTap editor
  - Handle content loading and saving


  - _Requirements: 7.1, 7.2_


- [x] 10.3 Create EditorToolbar component
  - Build formatting toolbar (bold, italic, headings, lists)
  - Add image insertion button


  - Add graph insertion button
  - Wire up toolbar actions to editor commands
  - _Requirements: 7.3_


- [x] 10.4 Implement auto-save functionality

  - Debounce editor changes
  - Trigger React Query mutation to save content
  - Show save status indicator
  - _Requirements: 7.4_

- [x] 10.5 Write property tests for editor

  - **Property 24: Content display in editor** - Validates: Requirements 7.1
  - **Property 25: Real-time content updates** - Validates: Requirements 7.2
  - **Property 26: Content save and load round-trip** - Validates: Requirements 7.4, 7.5

- [ ] 11. Implement image handling
- [ ] 11.1 Create ImageUploader component
  - Build image upload interface
  - Implement drag-and-drop support
  - Add file validation (type, size)
  - Show upload progress
  - _Requirements: 8.1_

- [ ] 11.2 Create /api/upload/image endpoint
  - Handle image upload
  - Validate file type and size
  - Store image (Vercel Blob or S3)
  - Save Image record in database
  - Return image URL
  - _Requirements: 8.2_

- [ ] 11.3 Integrate image insertion in TipTap
  - Wire ImageUploader to TipTap editor
  - Insert image at cursor position
  - Implement image resizing and repositioning
  - _Requirements: 8.3, 8.4_

- [ ] 11.4 Write property tests for image handling
  - **Property 27: Image upload returns URL** - Validates: Requirements 8.2
  - **Property 28: Image URL embedding** - Validates: Requirements 8.3
  - **Property 29: Image manipulation** - Validates: Requirements 8.4
  - **Property 30: Image reference persistence** - Validates: Requirements 8.5

- [ ] 12. Implement graph generation and editing




- [x] 12.1 Create ChartRenderer component


  - Build wrapper for Recharts components
  - Support bar, line, pie, area, scatter charts
  - Render based on graph configuration
  - _Requirements: 6.5_



- [x] 12.2 Create GraphNode TipTap extension

  - Define custom TipTap node for graphs
  - Render ChartRenderer in node view


  - Handle node selection and deletion
  - _Requirements: 6.2_


- [ ] 12.3 Create GraphEditor component
  - Build interface for editing graph data


  - Add chart type selector
  - Implement DataTable for editing values
  - Add styling options (colors, labels)
  - _Requirements: 6.3_


- [ ] 12.4 Create /api/content/graphs/[id] endpoint
  - Handle graph updates
  - Validate graph data
  - Persist changes to database
  - _Requirements: 6.4_

- [x] 12.5 Write property tests for graphs


  - **Property 20: Statistical data generates charts** - Validates: Requirements 6.1
  - **Property 21: Graph embedding in content** - Validates: Requirements 6.2
  - **Property 22: Graph editability** - Validates: Requirements 6.3
  - **Property 23: Graph modification persistence** - Validates: Requirements 6.4

- [ ] 13. Create content session API routes
- [ ] 13.1 Create /api/content/sessions endpoint
  - Implement GET to list user's sessions
  - Implement POST to create new session
  - Add pagination support
  - Apply authentication middleware
  - _Requirements: 3.1, 3.4_

- [ ] 13.2 Create /api/content/sessions/[id] endpoint
  - Implement GET to fetch specific session
  - Implement PUT to update session content
  - Implement DELETE to remove session
  - Verify user ownership
  - _Requirements: 3.5, 7.4_

- [ ] 14. Implement error handling and logging
- [ ] 14.1 Create global error boundary
  - Build ErrorBoundary component
  - Create ErrorFallback UI
  - Implement error logging
  - _Requirements: 10.4_

- [ ] 14.2 Create route-specific error boundaries
  - Add error boundary for editor
  - Add error boundary for dashboard
  - Add error boundary for agent interface
  - _Requirements: 10.4_

- [ ] 14.3 Implement database error handling
  - Add try-catch blocks for Prisma operations
  - Return meaningful error messages
  - Log errors for debugging
  - _Requirements: 11.4_

- [ ] 14.4 Write property tests for error handling
  - **Property 34: Error boundary catches errors** - Validates: Requirements 10.4
  - **Property 35: Query error handling** - Validates: Requirements 11.4

- [ ] 15. Add multimodal input support
- [ ] 15.1 Extend prompt input to accept files
  - Add file input to content generation form
  - Support text + image combinations
  - Validate supported media types
  - _Requirements: 12.1_

- [ ] 15.2 Update AI agent to process multimodal inputs
  - Modify Analyze Prompt node to handle images
  - Pass images to LLM API
  - Incorporate image analysis in content
  - _Requirements: 12.1, 12.3_

- [ ] 15.3 Implement media type validation
  - Check file types against supported list
  - Reject unsupported types with clear errors
  - _Requirements: 12.4_

- [ ] 15.4 Write property tests for multimodal inputs
  - **Property 36: Multimodal input processing** - Validates: Requirements 12.1
  - **Property 37: Multimodal output incorporation** - Validates: Requirements 12.3
  - **Property 38: Unsupported media rejection** - Validates: Requirements 12.4

- [ ] 16. Polish UI and add final touches
- [ ] 16.1 Implement responsive design
  - Ensure all components work on mobile
  - Test tablet layouts
  - Adjust animations for mobile performance
  - _Requirements: 1.4_

- [ ] 16.2 Add loading states and skeletons
  - Create skeleton loaders for content lists
  - Add loading spinners for async operations
  - Improve perceived performance
  - _Requirements: 10.1_

- [ ] 16.3 Implement toast notifications
  - Add toast library (Sonner or similar)
  - Show success/error notifications
  - Notify on save, errors, approvals
  - _Requirements: 10.4_

- [ ] 16.4 Add keyboard shortcuts
  - Implement shortcuts for editor (Cmd+B, Cmd+I, etc.)
  - Add shortcut for save (Cmd+S)
  - Show keyboard shortcut hints
  - _Requirements: 7.3_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Fix any failing tests
  - Verify all core functionality works end-to-end
  - Ask the user if questions arise
