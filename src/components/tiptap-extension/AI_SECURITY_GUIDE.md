# AI Integration Security Guide

## 🔒 **Security Architecture**

This AI integration follows security best practices by implementing a **client-server architecture** that keeps API keys secure on the server-side.

### **Architecture Overview**

```
┌─────────────────┐    HTTP Request    ┌─────────────────┐    OpenAI API    ┌─────────────────┐
│   Client-Side   │ ──────────────────► │   Server-Side   │ ──────────────► │   OpenAI API    │
│   (Browser)     │                    │   (Next.js API) │                 │   (External)    │
│                 │ ◄────────────────── │                 │ ◄────────────── │                 │
│ - AI Extension  │    HTTP Response   │ - API Routes    │   API Response  │ - GPT Models    │
│ - UI Components │                    │ - OpenAI Client │                 │ - Completions   │
│ - Client Service│                    │ - Env Variables │                 │                 │
└─────────────────┘                    └─────────────────┘                 └─────────────────┘
```

### **Security Benefits**

✅ **API Key Protection**: OpenAI API key never exposed to browser  
✅ **Server-Side Validation**: All requests validated on server  
✅ **Rate Limiting**: Can implement rate limiting on API routes  
✅ **Request Filtering**: Can filter/sanitize prompts before sending to OpenAI  
✅ **Error Handling**: Secure error messages without exposing internals  

## 🛡️ **Implementation Details**

### **Client-Side Components**
- **`AIExtension`**: Tiptap extension with AI commands
- **`AIClientService`**: HTTP client for calling server APIs
- **UI Components**: Slash commands, toolbar buttons, floating menus

### **Server-Side Components**
- **`/api/ai/generate`**: Main AI generation endpoint
- **`/api/ai/improve`**: Text improvement endpoint
- **`OpenAIClient`**: Server-only OpenAI client with API key

### **Environment Variables**
```env
OPENAI_API_KEY=sk-proj-...  # Server-side only, never sent to client
```

## 🔧 **API Endpoints**

### **POST /api/ai/generate**
Generate AI content from prompts.

**Request:**
```json
{
  "prompt": "Write a blog post about AI",
  "context": "Optional context",
  "options": {
    "model": "gpt-4o",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Response:**
```json
{
  "content": "Generated AI content...",
  "success": true
}
```

### **POST /api/ai/improve**
Improve existing text with AI.

**Request:**
```json
{
  "text": "Text to improve",
  "tone": "professional",
  "style": "clear"
}
```

## 🚀 **Usage Examples**

### **Client-Side Usage**
```typescript
import { aiClient } from '@/lib/ai/client';

// Generate content
const content = await aiClient.generateContent("Write about AI");

// Improve text
const improved = await aiClient.improveText("Some text", "professional");

// Summarize
const summary = await aiClient.summarizeText("Long text", "short");
```

### **Tiptap Extension Usage**
```typescript
// In editor commands
editor.chain().focus().generateText("Write a story").run();
editor.chain().focus().improveText({ tone: "casual" }).run();
editor.chain().focus().summarizeText({ length: "medium" }).run();
```

## 🔍 **Security Checklist**

### **✅ Implemented**
- [x] API key stored server-side only
- [x] Client-server architecture
- [x] Secure HTTP endpoints
- [x] Error handling without information leakage
- [x] Input validation on server-side

### **🔄 Recommended Enhancements**
- [ ] Rate limiting per user/IP
- [ ] Request logging and monitoring
- [ ] Content filtering for inappropriate prompts
- [ ] User authentication for AI features
- [ ] Usage quotas and billing integration

## 🛠️ **Development Guidelines**

### **Adding New AI Features**
1. **Server-Side**: Create new API route in `/api/ai/`
2. **Client-Side**: Add method to `AIClientService`
3. **Extension**: Add command to `AIExtension`
4. **UI**: Create UI components for the feature

### **Security Best Practices**
- Never expose OpenAI API key to client-side
- Always validate inputs on server-side
- Implement proper error handling
- Use HTTPS in production
- Consider implementing authentication

### **Testing**
```bash
# Test API endpoints
node test-ai-api.js

# Test client service
npm run test
```

## 📊 **Monitoring & Analytics**

### **Recommended Metrics**
- API request count and latency
- OpenAI token usage and costs
- Error rates and types
- User engagement with AI features

### **Logging**
```typescript
// Server-side logging
console.log('AI request:', { prompt, model, tokens });
console.error('AI error:', { error, prompt });
```

This architecture ensures that your AI integration is both powerful and secure, following industry best practices for handling sensitive API credentials and user data.