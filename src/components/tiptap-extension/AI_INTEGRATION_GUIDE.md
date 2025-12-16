# Tiptap AI Integration Guide

This guide explains the comprehensive AI integration for the Tiptap editor, including custom commands, slash commands, and floating menus.

## 🚀 Features

### AI Commands Available

1. **Generate Text** - Create new content from prompts
2. **Improve Text** - Enhance selected text for clarity and flow
3. **Summarize** - Create summaries in different lengths
4. **Translate** - Translate text to any language
5. **Continue Writing** - AI continues from current position
6. **Fix Grammar** - Correct grammar and spelling errors
7. **Change Tone** - Adjust text tone (professional, casual, friendly, formal, creative)
8. **Expand Text** - Add more details and examples
9. **Make Concise** - Shorten text while keeping key points

### Access Methods

#### 1. Slash Commands (`/`)
- Type `/` to open the slash command menu
- AI commands appear at the top with sparkle icons
- Examples: `/ai generate`, `/improve`, `/summarize`

#### 2. Toolbar Buttons
- AI toolbar buttons in the main toolbar
- Quick access to generate and improve functions
- Dropdown menu with all AI actions

#### 3. Floating Menu (`Ctrl+K`)
- Press `Ctrl+K` to open the AI floating menu
- Context-aware actions based on selection
- Quick access to most common AI functions

## 🛠 Technical Implementation

### Core Components

#### AIExtension (`src/components/tiptap-extension/ai-extension.ts`)
- Main Tiptap extension providing AI commands
- Integrates with existing OpenAI client
- Handles all AI operations asynchronously

#### AI Slash Commands (`src/components/tiptap-ui/ai-commands/`)
- Defines AI-specific slash commands
- Integrated with the main slash command system
- Provides user-friendly prompts and interactions

#### AI Toolbar (`src/components/tiptap-ui/ai-toolbar/`)
- Toolbar buttons for quick AI access
- Loading states and error handling
- Dropdown menu for advanced actions

#### AI Floating Menu (`src/components/tiptap-ui/ai-floating-menu/`)
- Context-sensitive AI menu
- Keyboard shortcut activation
- Smart positioning and interaction

### Integration Points

#### OpenAI Client Integration
```typescript
// Uses existing OpenAI client from src/lib/ai/openai.ts
import { openai, type ChatMessage } from "@/lib/ai";

// Configured with your existing API key and settings
const response = await openai.createChatCompletion(messages, {
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 2000,
});
```

#### Editor Integration
```typescript
// Added to SimpleEditor extensions
AIExtension.configure({
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 2000,
}),
```

## 📖 Usage Examples

### Basic Text Generation
1. Type `/ai generate` or click the AI button
2. Enter your prompt: "Write a blog post introduction about AI"
3. AI generates content at cursor position

### Text Improvement
1. Select text you want to improve
2. Type `/improve` or use Ctrl+K → Improve
3. AI enhances the selected text

### Smart Continuation
1. Place cursor where you want to continue
2. Type `/continue` or use the continue button
3. AI analyzes context and continues writing

### Quick Translation
1. Select text to translate
2. Type `/translate` or use floating menu
3. Specify target language
4. AI replaces with translation

## ⚙️ Configuration

### AI Model Settings
```typescript
// In SimpleEditor component
AIExtension.configure({
  model: "gpt-4o",        // OpenAI model to use
  temperature: 0.7,       // Creativity level (0-1)
  maxTokens: 2000,        // Maximum response length
}),
```

### Keyboard Shortcuts
- `Ctrl+K` - Open AI floating menu
- `/` - Open slash commands (includes AI)
- `Escape` - Close any AI menu

### Customization Options
```typescript
// Customize AI floating menu behavior
const aiFloatingMenu = useAIFloatingMenu({ 
  editor, 
  triggerKey: "Control+k",     // Change shortcut
  showOnSelection: false       // Auto-show on text selection
});
```

## 🎨 Styling

### CSS Classes
- `.ai-floating-menu` - Main floating menu container
- `.ai-loading` - Loading state indicator
- `.ai-toolbar-button` - Toolbar button styling
- `.ai-generating` - Active generation indicator

### Custom Styling
```scss
// Override AI component styles
.ai-floating-menu {
  // Custom menu styling
}

.ai-loading {
  // Custom loading animation
}
```

## 🔧 Error Handling

### Automatic Retry
- Failed requests are logged to console
- User-friendly error messages
- Graceful fallback behavior

### Rate Limiting
- Respects OpenAI API rate limits
- Loading states prevent multiple requests
- Queue management for concurrent requests

## 🚦 Best Practices

### Performance
- AI requests are debounced to prevent spam
- Loading states provide immediate feedback
- Async operations don't block the editor

### User Experience
- Clear visual feedback for AI operations
- Contextual commands based on selection
- Keyboard shortcuts for power users

### Security
- Uses existing OpenAI client configuration
- API key management through environment variables
- No client-side API key exposure

## 🔮 Future Enhancements

### Planned Features
- Streaming AI responses for real-time feedback
- Custom AI prompt templates
- AI-powered content suggestions
- Integration with other AI providers
- Collaborative AI editing

### Extension Points
- Custom AI command creation
- Plugin system for AI providers
- Webhook integration for AI events
- Analytics and usage tracking

## 📚 API Reference

### AI Extension Commands
```typescript
// Generate new content
editor.chain().focus().generateText(prompt, options).run()

// Improve selected text
editor.chain().focus().improveText({ tone, style }).run()

// Summarize content
editor.chain().focus().summarizeText({ length }).run()

// Translate text
editor.chain().focus().translateText(language).run()

// Continue writing
editor.chain().focus().continueWriting({ tone, length }).run()

// Fix grammar
editor.chain().focus().fixGrammar().run()

// Change tone
editor.chain().focus().changeTone(tone).run()

// Expand text
editor.chain().focus().expandText({ focus }).run()

// Make concise
editor.chain().focus().makeTextConcise().run()
```

This AI integration provides a comprehensive, production-ready solution that leverages your existing OpenAI infrastructure while providing multiple intuitive ways for users to access AI functionality within the editor.