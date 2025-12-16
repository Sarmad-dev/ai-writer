# Slash Command Integration

This implementation provides a Notion-like slash command experience for the Tiptap editor.

## How it works

1. **Trigger**: Type `/` at the beginning of a line or after a space
2. **Menu**: A dropdown menu appears with available commands
3. **Navigation**: Use arrow keys to navigate, Enter to select, Escape to close
4. **Search**: Continue typing after `/` to filter commands (e.g., `/head` shows heading options)

## Available Commands

- **Headings**: `/h1`, `/h2`, `/h3` - Create different heading levels
- **Lists**: `/ul`, `/ol`, `/task` - Create bullet, numbered, or task lists
- **Blocks**: `/quote`, `/code`, `/table`, `/hr` - Insert special blocks
- **Media**: `/image` - Insert images

## Components

- `SlashCommandMenu`: The dropdown menu component
- `useSlashCommand`: Hook that manages slash command state
- `defaultSlashCommands`: Array of available commands

## Customization

To add new commands, extend the `defaultSlashCommands` array:

```typescript
const customCommands: SlashCommandItem[] = [
  {
    title: "Custom Block",
    description: "Insert a custom block",
    icon: MyIcon,
    command: (editor) => editor.chain().focus().insertContent("Custom content").run(),
    keywords: ["custom", "block"],
  },
];
```

## Integration

The slash command is automatically integrated into the SimpleEditor component and works alongside the existing SlashCommandTriggerButton.