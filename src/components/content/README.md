# Content Components

This directory contains components related to content editing and management.

## EditorHeader

The `EditorHeader` component provides the main toolbar for the document editor with the following features:

### Auto-Save Toggle

The editor header now includes an auto-save toggle switch that allows users to enable or disable automatic saving of their documents.

#### Features:
- **Toggle Switch**: Shadcn Switch component positioned next to the save button
- **Visual Feedback**: Shows current auto-save state (enabled/disabled)
- **Tooltip**: Provides contextual information about the toggle action
- **Persistent State**: Auto-save preference is saved in the editor store and persisted across sessions

#### Usage:

```tsx
import { EditorHeader } from '@/components/content/EditorHeader';

// Basic usage (uses store state)
<EditorHeader />

// With custom auto-save control
<EditorHeader 
  autoSaveEnabled={autoSaveEnabled}
  onAutoSaveToggle={(enabled) => setAutoSaveEnabled(enabled)}
/>
```

#### Props:
- `autoSaveEnabled?: boolean` - Override the store's auto-save state
- `onAutoSaveToggle?: (enabled: boolean) => void` - Custom handler for auto-save toggle

#### Store Integration:
The auto-save functionality is integrated with the Zustand editor store:
- `autoSaveEnabled: boolean` - Current auto-save state
- `autoSaveDelay: number` - Delay in milliseconds before auto-save triggers
- `toggleAutoSave()` - Toggle auto-save on/off
- `setAutoSaveEnabled(enabled: boolean)` - Set auto-save state directly
- `setAutoSaveDelay(delay: number)` - Set auto-save delay

#### Auto-Save Logic:
- When enabled, documents are automatically saved after the specified delay when changes are detected
- Auto-save respects the `isDirty` state and only saves when there are actual changes
- Auto-save can be temporarily disabled during manual save operations
- The feature works in conjunction with the existing manual save functionality

#### Styling:
- Uses a scaled-down switch (75% size) to fit the header layout
- Responsive text that hides on smaller screens
- Consistent with the overall header design language
- Proper tooltip positioning and accessibility

#### Testing:
Comprehensive test suite covering:
- Switch rendering and state
- Toggle functionality
- Custom prop handling
- Tooltip behavior
- Accessibility features

Run tests with:
```bash
npm test src/components/content/__tests__/EditorHeader.test.tsx
```