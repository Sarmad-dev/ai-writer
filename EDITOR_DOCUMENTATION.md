# Document Editor System Documentation

## Overview

This document editor system provides a comprehensive, Google Docs-like editing experience with advanced document settings, state management, and auto-save functionality.

## Architecture

### 1. State Management (Zustand Store)

**Location:** `src/stores/editorStore.ts`

The editor uses Zustand for state management with the following features:

#### Document Settings
- **Page Settings**: Size (A4, A3, Letter, etc.), orientation (portrait/landscape)
- **Margins**: Presets (normal, narrow, wide, etc.) with custom values
- **Typography**: Font family, size, line spacing
- **Layout**: Columns, column gap
- **Appearance**: Page color, text color, background color
- **Advanced**: Headers, footers, page numbers
- **Print Settings**: Print margins, print background
- **View**: Zoom level, view mode (page, web, outline, draft)
- **Language**: Spell check, auto-correct
- **Collaboration**: Comments, suggestions, track changes

#### Editor State
- Document info (ID, title, content)
- Save state (last saved, dirty flag, auto-saving)
- History management (undo/redo with 50-entry limit)
- Selection and cursor position
- UI state (fullscreen, sidebar, toolbar)
- Statistics (word count, character count, paragraphs, reading time)

#### Key Actions
```typescript
// Document operations
setDocumentId(id: string)
setTitle(title: string)
setContent(content: string)
loadDocument(id: string)

// Settings
updateSettings(settings: Partial<DocumentSettings>)
resetSettings()

// Save operations
save() // Manual save
autoSave() // Auto-save with debouncing

// History
undo()
redo()

// UI
toggleFullscreen()
toggleSidebar()
setZoom(level: number)
```

### 2. Database Schema

**Location:** `prisma/schema.prisma`

Enhanced `ContentSession` model with:

```prisma
model ContentSession {
  // ... existing fields
  
  // Document Settings
  documentSettings      Json?
  
  // Statistics
  wordCount             Int
  characterCount        Int
  paragraphCount        Int
  readingTime           Int
  
  // Version Control
  version               Int
  isTemplate            Boolean
  templateCategory      String?
  
  // Collaboration
  isShared              Boolean
  shareToken            String?
  allowComments         Boolean
  allowEditing          Boolean
  
  // Publishing
  isPublished           Boolean
  publishedAt           DateTime?
  slug                  String?
  
  // Relations
  documentVersions      DocumentVersion[]
  documentComments      DocumentComment[]
  documentCollaborators DocumentCollaborator[]
}
```

#### New Models

**DocumentVersion** - Version history tracking
```prisma
model DocumentVersion {
  id               String
  contentSessionId String
  version          Int
  title            String
  content          String
  documentSettings Json?
  changesSummary   String?
  createdAt        DateTime
  createdBy        String
}
```

**DocumentComment** - Comments and annotations
```prisma
model DocumentComment {
  id               String
  contentSessionId String
  userId           String
  content          String
  selectionStart   Int?  // For inline comments
  selectionEnd     Int?
  isResolved       Boolean
  parentId         String?  // For threaded comments
  replies          DocumentComment[]
}
```

**DocumentCollaborator** - Collaboration management
```prisma
model DocumentCollaborator {
  id               String
  contentSessionId String
  userId           String
  role             CollaboratorRole  // OWNER, EDITOR, COMMENTER, VIEWER
  invitedBy        String
  invitedAt        DateTime
  acceptedAt       DateTime?
  lastAccessedAt   DateTime?
}
```

### 3. API Routes

#### Document Operations

**GET /api/documents** - List user's documents
- Query params: `page`, `limit`, `search`, `contentType`
- Returns paginated list with statistics

**POST /api/documents** - Create new document
```json
{
  "title": "Document Title",
  "content": "Initial content",
  "contentType": "GENERAL",
  "settings": { /* DocumentSettings */ },
  "isTemplate": false
}
```

**GET /api/documents/[id]** - Get document with settings
- Returns full document with user info

**PUT /api/documents/[id]** - Update document
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "settings": { /* DocumentSettings */ },
  "wordCount": 100,
  "characterCount": 500,
  "paragraphCount": 5,
  "readingTime": 1
}
```

**DELETE /api/documents/[id]** - Delete document

**GET /api/documents/[id]/settings** - Get document settings only

**PUT /api/documents/[id]/settings** - Update document settings only

### 4. Service Layer

**Location:** `src/lib/services/documentService.ts`

Provides abstraction over API calls:

```typescript
// Load document
const document = await documentService.getDocument(id)

// Save document
await documentService.saveDocument(id, {
  title: "New Title",
  content: "New content",
  settings: documentSettings
})

// Auto-save with debouncing
documentService.scheduleAutoSave(id, data, 2000)

// Cancel auto-save
documentService.cancelAutoSave(id)
```

### 5. React Hook

**Location:** `src/hooks/useEditor.ts`

Provides easy integration with components:

```typescript
const editor = useEditor({
  documentId: "doc-123",
  autoSaveDelay: 2000,
  enableAutoSave: true
})

// Access state
editor.title
editor.content
editor.isDirty
editor.isSaving
editor.settings
editor.wordCount

// Actions
editor.setTitle("New Title")
editor.updateContent("New content")
editor.save()
editor.undo()
editor.redo()
editor.updateSettings({ fontSize: 14 })
```

Features:
- Auto-save with configurable delay
- Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)
- Unsaved changes warning
- Automatic statistics calculation

### 6. Components

#### EditorHeader
**Location:** `src/components/content/EditorHeader.tsx`

Features:
- Editable title
- Save button with status
- Undo/Redo buttons
- Share menu (PDF, DOCX, Markdown export)
- More options menu
- Document controls toolbar

#### EnhancedDocumentControls
**Location:** `src/components/content/EnhancedDocumentControls.tsx`

Comprehensive toolbar with:
- View mode selector
- Zoom controls
- Page size and orientation
- Margins with presets
- Font family and size
- Line spacing
- Columns
- Page color
- Advanced settings (headers, footers, spell check, etc.)

#### DocumentStatistics
**Location:** `src/components/content/DocumentStatistics.tsx`

Two variants:
- **Full card** - Detailed statistics with icons
- **Compact** - Inline statistics for status bar

Shows:
- Word count
- Character count
- Paragraph count
- Reading time

#### EditorExample
**Location:** `src/components/content/EditorExample.tsx`

Complete editor implementation with:
- Header with controls
- Main editing area with live preview
- Sidebar with statistics and quick actions
- Status bar with auto-save indicator
- Responsive layout

## Usage Examples

### Basic Usage

```tsx
import { EditorExample } from "@/components/content/EditorExample"

export default function EditorPage() {
  return <EditorExample documentId="doc-123" />
}
```

### Custom Implementation

```tsx
"use client"

import { useEditor } from "@/hooks/useEditor"
import { EditorHeader } from "@/components/content/EditorHeader"
import { DocumentStatistics } from "@/components/content/DocumentStatistics"

export function MyEditor({ documentId }: { documentId: string }) {
  const editor = useEditor({ documentId })

  return (
    <div>
      <EditorHeader />
      
      <textarea
        value={editor.content}
        onChange={(e) => editor.updateContent(e.target.value)}
        style={{
          fontFamily: editor.settings.fontFamily,
          fontSize: `${editor.settings.fontSize}pt`,
          lineHeight: editor.settings.lineSpacing,
        }}
      />
      
      <DocumentStatistics />
    </div>
  )
}
```

### Using Store Directly

```tsx
import { useEditorStore } from "@/stores/editorStore"

function MyComponent() {
  const title = useEditorStore((state) => state.title)
  const setTitle = useEditorStore((state) => state.setTitle)
  const settings = useEditorStore((state) => state.settings)
  const updateSettings = useEditorStore((state) => state.updateSettings)
  
  return (
    <div>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
      
      <button onClick={() => updateSettings({ fontSize: 14 })}>
        Increase Font
      </button>
    </div>
  )
}
```

## Features

### Auto-Save
- Configurable delay (default: 2 seconds)
- Debounced to prevent excessive API calls
- Visual indicator in status bar
- Automatic on content/settings change

### History Management
- Undo/Redo with 50-entry limit
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Disabled state when at history boundaries

### Document Statistics
- Real-time word count
- Character count
- Paragraph count
- Reading time estimation (200 words/min)

### Keyboard Shortcuts
- **Ctrl+S** - Save document
- **Ctrl+Z** - Undo
- **Ctrl+Shift+Z** or **Ctrl+Y** - Redo

### Unsaved Changes Warning
- Browser warning when leaving with unsaved changes
- Automatic cleanup on unmount

## Migration

To apply the database changes:

```bash
npx prisma migrate dev --name add_enhanced_document_features
```

## Configuration

### Default Settings

Located in `src/stores/editorStore.ts`:

```typescript
const defaultSettings: DocumentSettings = {
  pageSize: 'a4',
  orientation: 'portrait',
  marginPreset: 'normal',
  marginTop: 1,
  marginBottom: 1,
  marginLeft: 1,
  marginRight: 1,
  fontFamily: 'inter',
  fontSize: 12,
  lineSpacing: 1.15,
  columns: 1,
  columnGap: 0.5,
  pageColor: 'white',
  // ... more settings
}
```

### Auto-Save Delay

Configure in hook usage:

```typescript
const editor = useEditor({
  documentId: "doc-123",
  autoSaveDelay: 3000, // 3 seconds
  enableAutoSave: true
})
```

## Best Practices

1. **Always use the hook** - `useEditor` provides automatic cleanup and keyboard shortcuts
2. **Enable auto-save** - Prevents data loss
3. **Show save status** - Use `isDirty`, `isSaving`, `lastSaved` to inform users
4. **Handle errors** - Display `error` state to users
5. **Persist settings** - Store uses localStorage for settings persistence
6. **Validate on save** - Check `documentId` exists before saving

## Troubleshooting

### Auto-save not working
- Check `enableAutoSave` is true
- Verify `documentId` is set
- Check network tab for API errors

### Settings not persisting
- Verify Zustand persist middleware is configured
- Check localStorage in browser DevTools

### Undo/Redo not working
- History is limited to 50 entries
- Check `canUndo`/`canRedo` state
- Verify content changes are calling `addToHistory`

## Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Comment threads and mentions
- [ ] Version comparison and restore
- [ ] Template library
- [ ] Export to multiple formats
- [ ] Advanced formatting toolbar
- [ ] Image upload and management
- [ ] Table of contents generation
- [ ] Citation management
- [ ] Grammar and style checking