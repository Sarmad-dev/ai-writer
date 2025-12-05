# Application Flow Diagrams

## User Journey

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│          Dashboard                  │
│  (/dashboard)                       │
│                                     │
│  • View all content sessions        │
│  • See status badges                │
│  • Create new content               │
└──────┬──────────────────────┬───────┘
       │                      │
       │                      │
   ┌───▼────┐            ┌────▼─────┐
   │  Chat  │            │ Content  │
   │ /chat  │            │/content/ │
   └────────┘            └──────────┘
```

## Chat Flow (Simple)

```
User Opens /chat
       │
       ▼
┌──────────────────────────────────┐
│  Chat Interface                  │
│  ┌────────────────────────────┐  │
│  │  Sidebar                   │  │
│  │  • New Chat                │  │
│  │  • Conversation History    │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Chat Area                 │  │
│  │  • Messages                │  │
│  │  • Streaming responses     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Input Box                 │  │
│  │  Type message → Enter      │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
       │
       ▼
POST /api/chat/stream
       │
       ▼
┌──────────────────────────────────┐
│  Simple AI Response              │
│  • No workflow                   │
│  • Direct streaming              │
│  • Save to ChatMessage           │
└──────────────────────────────────┘
       │
       ▼
Display streaming response
```

## Content Flow (Complex Workflow)

```
User Opens /content/[id]
       │
       ▼
┌──────────────────────────────────┐
│  Agent Interface                 │
│  • Status display                │
│  • Streaming content             │
│  • Approval modals               │
└──────────────────────────────────┘
       │
       ▼
POST /api/agent/generate
       │
       ▼
┌──────────────────────────────────┐
│  LangGraph Workflow              │
│                                  │
│  1. Analyze Prompt               │
│     ├─ Parse intent              │
│     └─ Determine if search needed│
│                                  │
│  2. Web Search (if needed)       │
│     ├─ Search web                │
│     └─ Collect results           │
│                                  │
│  3. Approval Request             │
│     ├─ Show modal                │
│     ├─ User approves/rejects     │
│     └─ Continue workflow         │
│                                  │
│  4. Generate Content             │
│     ├─ Use AI model              │
│     └─ Stream output             │
│                                  │
│  5. Detect Graphs                │
│     ├─ Analyze for data          │
│     └─ Generate visualizations   │
│                                  │
│  6. Format Content               │
│     ├─ Structure output          │
│     └─ Apply formatting          │
│                                  │
│  7. Save to Database             │
│     ├─ ContentSession            │
│     ├─ Graphs                    │
│     └─ ApprovalRequests          │
└──────────────────────────────────┘
       │
       ▼
Display final content
```

## Database Relationships

```
User
├── ChatConversation[]
│   └── ChatMessage[]
│       ├── role: USER
│       ├── role: ASSISTANT
│       └── role: SYSTEM
│
└── ContentSession[]
    ├── status: PENDING/GENERATING/COMPLETED/FAILED
    ├── Graph[]
    │   ├── type: BAR/LINE/PIE/AREA/SCATTER
    │   └── data: JSON
    └── ApprovalRequest[]
        └── status: PENDING/APPROVED/REJECTED/TIMEOUT
```

## API Flow

### Chat API
```
Client                    Server                   Database
  │                         │                         │
  ├─POST /api/chat/stream──▶│                         │
  │                         ├─Create conversation────▶│
  │                         │◀────conversation id─────┤
  │                         │                         │
  │                         ├─Generate AI response    │
  │                         │                         │
  │◀─Stream: chunk 1────────┤                         │
  │◀─Stream: chunk 2────────┤                         │
  │◀─Stream: chunk 3────────┤                         │
  │                         │                         │
  │                         ├─Save messages──────────▶│
  │◀─Stream: done───────────┤                         │
```

### Content API
```
Client                    Server                   Database
  │                         │                         │
  ├─POST /api/agent/generate│                         │
  │                         ├─Create session─────────▶│
  │                         │◀────session id──────────┤
  │                         │                         │
  │                         ├─Start LangGraph workflow│
  │                         │                         │
  │◀─Status: analyzing──────┤                         │
  │◀─Status: searching──────┤                         │
  │                         │                         │
  │◀─Approval request───────┤                         │
  ├─POST /api/agent/approval│                         │
  │                         ├─Update approval────────▶│
  │                         │                         │
  │◀─Status: generating─────┤                         │
  │◀─Content: chunk 1───────┤                         │
  │◀─Content: chunk 2───────┤                         │
  │                         │                         │
  │                         ├─Save content───────────▶│
  │                         ├─Save graphs────────────▶│
  │◀─Complete───────────────┤                         │
```

## Component Hierarchy

```
App
├── /chat
│   └── ChatLayout
│       ├── ChatSidebar
│       │   ├── SidebarHeader
│       │   ├── SidebarContent
│       │   └── SidebarMenu
│       └── ChatInterface
│           ├── MessageList
│           │   └── Message[]
│           └── ChatInput
│
├── /content/[id]
│   └── ContentDetailPage
│       ├── AgentInterface
│       │   ├── StatusDisplay
│       │   ├── StreamingContent
│       │   └── MessageList
│       └── ApprovalRequestModal
│           ├── ApprovalDetails
│           └── ApprovalActions
│
└── /dashboard
    └── DashboardContent
        ├── Header
        │   └── Navigation
        ├── NewContentButton
        └── ContentSessionList
            └── ContentSessionCard[]
```

## State Management

### Chat State
```
ChatInterface
├── messages: Message[]
├── isStreaming: boolean
├── streamingContent: string
└── conversationId: string | null
```

### Content State
```
AgentInterface
├── messages: Message[]
├── status: WorkflowStatus
├── streamingContent: string
├── error: string | null
└── sessionId: string

ApprovalRequestModal
├── approvalRequest: ApprovalRequestData | null
├── isSubmitting: boolean
└── error: string | null
```

## Workflow States

```
Content Generation Workflow:

idle → analyzing → searching → waiting_approval
                      ↓              ↓
                   (skip)      (approved/rejected)
                      ↓              ↓
                      └──────────────┘
                             ↓
                       generating
                             ↓
                       formatting
                             ↓
                         saving
                             ↓
                        completed
                             
                    (any step can → error)
```
