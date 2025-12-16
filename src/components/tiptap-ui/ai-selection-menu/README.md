# AI Selection Menu

A smart, context-aware AI menu that appears when text is selected in the Tiptap editor.

## 🎯 **Features**

### **Smart Text Selection Detection**
- Automatically appears when text is selected (5+ characters)
- Debounced to avoid flickering on quick selections
- Positioned intelligently near the selection

### **Rich AI Actions**
- **Improve Writing** - Enhance clarity and flow
- **Fix Grammar** - Correct errors and typos  
- **Summarize** - Create brief summaries
- **Translate** - Translate to any language (with input)
- **Change Tone** - Professional/Casual tone conversion
- **Expand Text** - Add more details (with optional focus input)
- **Make Concise** - Shorten while keeping key points
- **Continue Writing** - AI continues from selection (with tone input)
- **Custom AI Action** - Enter your own instruction (with input)

### **Interactive Input System**
- **Inline Input Fields** - For actions requiring additional input
- **Smart Validation** - Optional inputs for expand/continue actions
- **Keyboard Navigation** - Enter to submit, Escape to go back
- **Loading States** - Visual feedback during AI processing

### **User Experience**
- **Contextual Positioning** - Menu appears near selection
- **Responsive Design** - Adapts to screen boundaries
- **Error Handling** - Graceful error messages and recovery
- **Keyboard Shortcuts** - Full keyboard navigation support

## 🚀 **Usage**

### **Basic Usage**
1. **Select Text** - Highlight any text (5+ characters)
2. **Choose Action** - Click on desired AI action
3. **Provide Input** - Enter additional details if required
4. **Execute** - AI processes and replaces the text

### **Actions Without Input**
- Improve Writing
- Fix Grammar  
- Summarize
- Make Professional/Casual
- Make Concise

### **Actions With Input**
- **Translate** - "Translate to which language?"
- **Expand Text** - "What should I focus on? (optional)"
- **Continue Writing** - "Writing tone? (optional)"
- **Custom AI Action** - "What would you like me to do with this text?"

## 🔧 **Technical Implementation**

### **Components**
```typescript
// Main menu component
<AISelectionMenu
  editor={editor}
  isVisible={isVisible}
  position={{ x: 100, y: 200 }}
  selectedText="Selected text content"
  range={{ from: 10, to: 25 }}
  onClose={() => {}}
/>

// Hook for state management
const aiSelectionMenu = useAISelectionMenu({
  editor,
  autoShowOnSelection: true,
  minSelectionLength: 5
});
```

### **AI Actions Structure**
```typescript
interface AIAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  inputLabel?: string;
  action: (editor: Editor, selectedText: string, input?: string) => Promise<void>;
}
```

### **Hook Options**
```typescript
interface UseAISelectionMenuOptions {
  editor: Editor | null;
  autoShowOnSelection?: boolean;    // Default: true
  minSelectionLength?: number;      // Default: 3
}
```

## 🎨 **Styling**

### **CSS Classes**
- `.ai-selection-menu` - Main container
- Custom input styling with focus states
- Smooth animations and transitions
- Dark mode support

### **Responsive Design**
- Automatically adjusts position to stay within viewport
- Scrollable action list for smaller screens
- Touch-friendly button sizes

## 🔒 **Security**

### **Server-Side Processing**
- All AI operations go through secure API routes
- No client-side API key exposure
- Input validation and sanitization

### **Error Handling**
- Graceful failure with user-friendly messages
- Automatic retry suggestions
- No sensitive information in error messages

## 📱 **Mobile Support**

### **Touch Interactions**
- Touch-friendly button sizes
- Proper touch event handling
- Mobile-optimized positioning

### **Responsive Layout**
- Adapts to smaller screens
- Scrollable content areas
- Optimized for mobile keyboards

## 🎯 **Best Practices**

### **Performance**
- Debounced selection detection (300ms)
- Efficient re-rendering with React hooks
- Minimal DOM manipulation

### **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA labels and roles

### **User Experience**
- Clear visual feedback
- Intuitive input flows
- Consistent interaction patterns
- Error recovery paths

## 🔮 **Future Enhancements**

### **Planned Features**
- **Smart Suggestions** - Context-aware action recommendations
- **Batch Operations** - Process multiple selections
- **Custom Actions** - User-defined AI workflows
- **Keyboard Shortcuts** - Quick access to common actions
- **Action History** - Recently used actions
- **Templates** - Predefined AI instruction templates

### **Integration Points**
- **Workflow Integration** - Connect with existing workflows
- **Analytics** - Usage tracking and optimization
- **Customization** - User preference settings
- **Team Sharing** - Shared AI action libraries

This AI Selection Menu provides a seamless, intelligent way to enhance text with AI assistance, making content creation faster and more intuitive.