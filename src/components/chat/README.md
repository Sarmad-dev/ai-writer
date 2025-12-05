# Chat Interface

A simple ChatGPT-like interface for quick AI conversations without complex workflows.

## Features

- **Real-time Streaming**: Messages appear as they're generated
- **Simple & Fast**: No web search, no approval flow - just chat
- **Sidebar Navigation**: Browse and manage conversations
- **Auto-save**: Conversations are automatically saved
- **Responsive Design**: Works on all screen sizes

## Pages

- `/chat` - Main chat interface with sidebar

## Usage

Navigate to `/chat` for quick AI conversations.

### Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in message

## Components

- `ChatLayout`: Main layout with sidebar and chat interface
- `ChatSidebar`: Conversation list and navigation
- `ChatInterface`: Main chat area with message handling
- `ChatInput`: Auto-resizing textarea input field
- `MessageList`: Display messages with streaming support

## API Endpoints

- `POST /api/chat/stream` - Stream AI responses
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversations` - Create new conversation

## Database Schema

```prisma
model ChatConversation {
  id        String        @id
  userId    String
  title     String
  messages  ChatMessage[]
}

model ChatMessage {
  id             String
  conversationId String
  role           MessageRole  // USER, ASSISTANT, SYSTEM
  content        String
}
```

## Difference from Content Generation

- **Chat** (`/chat`): Simple, fast conversations without workflows
- **Content** (`/content/[id]`): Full LangGraph workflow with web search, approval flow, and structured content generation
