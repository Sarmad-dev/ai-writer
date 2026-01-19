# Enhanced Link Node with Hover Previews

This implementation provides an enhanced link experience in the TipTap editor with the following features:

## Features

1. **Hover Card Previews**: When hovering over links, a preview card appears showing:
   - Website title
   - Description
   - Preview image (if available)
   - Favicon
   - Site name
   - Loading states and error handling

2. **Click to Open**: Links open in a new tab with proper security attributes (`noopener noreferrer`)

3. **Caching**: Link previews are cached to avoid repeated API calls

4. **Responsive Design**: Preview cards adjust position to stay within viewport

## Implementation Details

### Components

- **LinkNode** (`link-node-extension.ts`): Extended TipTap Link extension with custom attributes
- **LinkHoverHandler** (`link-hover-handler.tsx`): React component that handles hover events and displays preview cards
- **LinkNodeView** (`link-node-view.tsx`): Original node view implementation (not currently used)

### Dependencies

- `link-preview-js`: For fetching website metadata
- `@radix-ui/react-hover-card`: For hover card UI component
- Tailwind CSS: For styling and responsive design

### Usage

The enhanced link functionality is automatically enabled when using the SimpleEditor component. Links can be created using:

1. The link toolbar button
2. Typing URLs directly (auto-linking)
3. Pasting URLs

### Styling

Links are styled with:
- Blue color with hover effects
- Underline decoration
- Cursor pointer
- Focus ring for accessibility

### Performance Considerations

- Preview fetching is debounced (300ms delay)
- Results are cached to prevent duplicate requests
- Error handling for failed preview requests
- Graceful fallback when previews are unavailable

### Security

- Links open with `target="_blank"` and `rel="noopener noreferrer"`
- URL validation to prevent JavaScript injection
- CORS-aware preview fetching

## Configuration

The link node can be configured in the editor extensions:

```typescript
LinkNode.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'tiptap-link',
    rel: 'noopener noreferrer',
    target: '_blank',
  },
})
```

## Browser Compatibility

- Modern browsers with support for:
  - Fetch API
  - CSS Grid/Flexbox
  - ES6+ features
  - Radix UI components