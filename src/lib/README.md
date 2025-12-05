# Library Services

This directory contains reusable service modules for the application.

## AI Services (`/ai`)

OpenAI API client for chat completions with streaming support.

```typescript
import { openai } from '@/lib/ai';

// Simple completion
const response = await openai.createChatCompletion([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
]);

// Streaming completion
for await (const chunk of openai.streamChatCompletion(messages)) {
  console.log(chunk);
}
```

## Search Services (`/search`)

Tavily search API client for web searches.

```typescript
import { tavily } from '@/lib/search';

const results = await tavily.search('your query', {
  searchDepth: 'basic',
  maxResults: 5
});
```

## API Client (`/api`)

HTTP client with error handling and interceptors.

```typescript
import { apiClient } from '@/lib/api';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { key: 'value' });
```

## Authentication (`/auth`)

Better Auth configuration for authentication.

## Database (`/db`)

Prisma client instance for database operations.

## Agent (`/agent`)

LangGraph workflow for AI content generation with web search and approval flows.
