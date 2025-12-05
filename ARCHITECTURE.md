# Application Architecture

## Overview

This application provides two distinct AI interaction modes:

1. **Simple Chat** - Quick conversations without workflows
2. **Content Generation** - Full AI workflow with research and approvals

## Pages & Routes

### `/chat` - Simple Chat Interface
- **Purpose**: Quick, ChatGPT-like conversations
- **Features**: 
  - Real-time streaming responses
  - Conversation history
  - No complex workflows
- **Components**: `ChatLayout`, `ChatSidebar`, `ChatInterface`
- **API**: `/api/chat/stream`
- **Database**: `ChatConversation`, `ChatMessage`

### `/content/[id]` - AI Content Generation
- **Purpose**: Structured content creation with research
- **Features**:
  - LangGraph workflow integration
  - Web search capabilities
  - Human-in-the-loop approval flow
  - Graph/chart generation
  - TipTap editor (to be implemented)
- **Components**: `AgentInterface`, `ApprovalRequestModal`, `StreamingContent`
- **API**: `/api/agent/generate`
- **Database**: `ContentSession`, `ApprovalRequest`, `Graph`

### `/dashboard` - Overview
- **Purpose**: View all content sessions
- **Features**:
  - Session cards with status
  - Click to view/edit in `/content/[id]`
- **Components**: `ContentSessionList`, `ContentSessionCard`

## Database Schema

### Chat (Simple Conversations)
```prisma
ChatConversation
├── id
├── userId
├── title
└── messages[]
    ├── role (USER/ASSISTANT/SYSTEM)
    └── content

```

### Content (AI Workflow)
```prisma
ContentSession
├── id
├── userId
├── title
├── prompt
├── content
├── status (PENDING/GENERATING/COMPLETED/FAILED)
├── graphs[]
└── approvalRequests[]
```

## Workflows

### Simple Chat Flow
```
User Message → /api/chat/stream → AI Response → Save to DB
```

### Content Generation Flow
```
User Prompt → /api/agent/generate → LangGraph Workflow
                                    ↓
                            1. Analyze Prompt
                            2. Web Search (if needed)
                            3. Approval Request (if needed)
                            4. Generate Content
                            5. Detect Graphs
                            6. Format Content
                            7. Save to DB
```

## API Endpoints

### Chat
- `GET /api/chat/conversations` - List conversations
- `POST /api/chat/conversations` - Create conversation
- `POST /api/chat/stream` - Stream chat responses

### Content
- `GET /api/content/sessions` - List content sessions
- `POST /api/content/sessions` - Create session
- `GET /api/content/sessions/[id]` - Get session details
- `POST /api/agent/generate` - Generate content with workflow
- `POST /api/agent/approval/[id]` - Handle approval requests

## Component Structure

```
src/
├── app/
│   ├── chat/
│   │   └── page.tsx (Simple chat interface)
│   ├── content/
│   │   └── [id]/
│   │       └── page.tsx (Content generation with workflow)
│   ├── dashboard/
│   │   └── page.tsx (Session overview)
│   └── api/
│       ├── chat/
│       │   ├── conversations/
│       │   └── stream/
│       ├── content/
│       │   └── sessions/
│       └── agent/
│           ├── generate/
│           └── approval/
├── components/
│   ├── chat/ (Simple chat components)
│   │   ├── ChatLayout.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ChatInput.tsx
│   │   └── MessageList.tsx
│   ├── agent/ (Workflow components)
│   │   ├── AgentInterface.tsx
│   │   ├── ApprovalRequestModal.tsx
│   │   └── StreamingContent.tsx
│   └── dashboard/ (Overview components)
│       ├── ContentSessionList.tsx
│       └── ContentSessionCard.tsx
└── lib/
    └── agent/
        ├── workflow.ts (LangGraph workflow)
        └── nodes/ (Workflow nodes)
```

## Key Differences

| Feature | Chat (`/chat`) | Content (`/content/[id]`) |
|---------|---------------|---------------------------|
| Purpose | Quick conversations | Structured content creation |
| Workflow | None | Full LangGraph workflow |
| Web Search | No | Yes (when needed) |
| Approvals | No | Yes (human-in-the-loop) |
| Graphs | No | Yes (auto-generated) |
| Editor | Simple textarea | TipTap (planned) |
| Speed | Fast | Thorough |
| Use Case | Q&A, chat | Articles, reports, research |

## Future Enhancements

1. **TipTap Editor Integration** - Rich text editing for content sessions
2. **Real AI API Integration** - Replace mock responses with OpenAI/Anthropic
3. **Export Options** - PDF, Markdown, HTML export
4. **Collaboration** - Share sessions with team members
5. **Templates** - Pre-built prompts for common content types
