# TipTap Rich Text Editor

This directory contains the TipTap-based rich text editor implementation for the AI Content Writer application.

## Components

### ContentEditor
Main editor component that integrates all editor functionality.

**Props:**
- `sessionId` (string): Unique identifier for the content session
- `initialContent` (string, optional): Initial HTML content to load
- `onSave` (function, optional): Async callback for saving content
- `onContentChange` (function, optional): Callback fired on content changes
- `editable` (boolean, default: true): Whether the editor is editable
- `autoSave` (boolean, default: true): Enable auto-save functionality
- `autoSaveDelay` (number, default: 2000): Debounce delay in ms for auto-save

**Example:**
```tsx
<ContentEditor
  sessionId="session-123"
  initialContent="<p>Hello World</p>"
  onSave={async (content) => {
    await saveToDatabase(content);
  }}
  onContentChange={(content) => {
    console.log('Content changed:', content);
  }}
  autoSave={true}
  autoSaveDelay={2000}
/>
```

### EditorToolbar
Formatting toolbar with buttons for text formatting, headings, lists, images, and graphs.

### TipTapEditor
Wrapper component for the TipTap EditorContent.

### useTipTapEditor
Custom hook that configures and returns a TipTap editor instance.

**Extensions included:**
- StarterKit (headings, bold, italic, lists, etc.)
- Image extension
- Custom GraphNode extension

### useAutoSave
Custom hook for auto-saving content with debouncing.

**Returns:**
- `isSaving`: Boolean indicating if save is in progress
- `lastSaved`: Date of last successful save
- `saveStatus`: Current save status ('idle' | 'pending' | 'saving' | 'saved' | 'error')

## Custom Extensions

### GraphNode
Custom TipTap node for embedding interactive charts/graphs in the content.

**Attributes:**
- `id`: Unique identifier
- `type`: Chart type ('bar' | 'line' | 'pie' | 'area' | 'scatter')
- `data`: Array of data points
- `config`: Chart configuration (title, labels, colors, etc.)

## Features

- ✅ Rich text formatting (bold, italic, strike, code)
- ✅ Headings (H1-H6)
- ✅ Lists (bullet and ordered)
- ✅ Blockquotes
- ✅ Image insertion
- ✅ Graph/chart embedding
- ✅ Undo/Redo
- ✅ Auto-save with debouncing
- ✅ Save status indicators
- ✅ Manual save button
- ✅ Keyboard shortcuts

## Keyboard Shortcuts

- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo

## Testing

Property-based tests are located in `src/__tests__/properties/editor.properties.test.tsx`:

- **Property 24**: Content display in editor
- **Property 25**: Real-time content updates
- **Property 26**: Content save and load round-trip

Run tests with:
```bash
npm test -- src/__tests__/properties/editor.properties.test.tsx
```

## Migration from Legacy Editor

The old markdown-based ContentEditor in `src/components/content/ContentEditor.tsx` has been deprecated. Use this TipTap-based editor instead for:

- Better rich text editing experience
- WYSIWYG editing
- Embedded graphs and images
- Better formatting control
- Auto-save functionality
