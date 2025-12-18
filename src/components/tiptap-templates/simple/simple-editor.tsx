"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@/components/tiptap-node/image-node/image-node-extension";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import { GraphNode } from "@/components/editor/extensions";
import { CodeBlockNode } from "@/components/tiptap-node/code-block-node/code-block-node-extension";
import { MathNode, BlockMathNode } from "@/components/tiptap-node/math-node";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-node/math-node/math-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { ChartButton } from "@/components/tiptap-ui/chart-button";
import { MathDropdownMenu } from "@/components/tiptap-ui/math-dropdown-menu";

import { TextStyle } from "@tiptap/extension-text-style";

import { NodeBackground } from "@/components/tiptap-extension/node-background-extension";
import { NodeAlignment } from "@/components/tiptap-extension/node-alignment-extension";
import { AIExtension } from "@/components/tiptap-extension/ai-extension";
import { SlashCommandMenu } from "@/components/tiptap-ui/slash-command-menu";
import { AIToolbarButtons } from "@/components/tiptap-ui/ai-toolbar";
import { AISelectionMenu } from "@/components/tiptap-ui/ai-selection-menu";
import { useSlashCommand } from "@/hooks/use-slash-command";
import { useAISelectionMenu } from "@/hooks/use-ai-selection-menu";

import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension";
import { TableHandleExtension } from "@/components/tiptap-node/table-node/extensions/table-handle";

import { TableTriggerButton } from "@/components/tiptap-node/table-node/ui/table-trigger-button";
import { TableHandle } from "@/components/tiptap-node/table-node/ui/table-handle/table-handle";
import { TableSelectionOverlay } from "@/components/tiptap-node/table-node/ui/table-selection-overlay";
import { TableCellHandleMenu } from "@/components/tiptap-node/table-node/ui/table-cell-handle-menu";
import { TableExtendRowColumnButtons } from "@/components/tiptap-node/table-node/ui/table-extend-row-column-button";

// Import required styles
import "@/components/tiptap-node/table-node/styles/prosemirror-table.scss";
import "@/components/tiptap-node/table-node/styles/table-node.scss";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Components ---
import { ThemeToggle } from "@/components/ui/theme-toggle";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";
import "@/components/tiptap-extension/slash-command.scss";
import "@/components/tiptap-extension/ai-extension.scss";
import { SlashCommandTriggerButton } from "@/components/tiptap-ui/slash-command-trigger-button";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  editor,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  editor: any;
}) => {
  return (
    <div className="flex items-center justify-center overflow-x-auto bg-background fixed -mt-3">
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <ChartButton />
        <MathDropdownMenu portal={isMobile} />
      </ToolbarGroup>

      <ToolbarSeparator />

      {editor && (
        <ToolbarGroup>
          <AIToolbarButtons editor={editor} />
        </ToolbarGroup>
      )}

      <Spacer />

      <div className="toolbar">
        <TableTriggerButton />
      </div>

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </div>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({
  content,
  onEditorReady,
}: {
  content: string;
  onEditorReady?: (editor: any) => void;
}) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor(
    {
      immediatelyRender: false,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Main content area, start typing to enter text.",
          class: "simple-editor",
        },
      },
      extensions: [
        StarterKit.configure({
          horizontalRule: false,
          codeBlock: false, // Disable default code block
          link: {
            openOnClick: false,
            enableClickSelection: true,
          },
        }),
        CodeBlockNode, // Use custom code block with syntax highlighting
        TableKit.configure({
          table: {
            resizable: true, // Enable column resizing
          },
        }),
        TableHandleExtension, // Required for row/column manipulation
        NodeAlignment, // For cell alignment
        NodeBackground, // For cell background colors
        TextStyle, // For text styling
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Image.configure({
          HTMLAttributes: {
            class: "custom-image-class",
          },
        }),
        Typography,
        Superscript,
        Subscript,
        Selection,
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: handleImageUpload,
          onError: (error) => console.error("Upload failed:", error),
        }),
        GraphNode, // Add graph/chart support
        MathNode, // Add inline math support
        BlockMathNode, // Add block math support
        AIExtension.configure({
          model: "gpt-4o",
          temperature: 0.7,
          maxTokens: 2000,
        }), // Add AI capabilities
      ],
      content,
    },
    [content]
  );

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Slash command functionality
  const slashCommand = useSlashCommand({ editor });

  // AI selection menu functionality (shows when text is selected)
  const aiSelectionMenu = useAISelectionMenu({
    editor,
    autoShowOnSelection: true,
    minSelectionLength: 5, // Only show for selections of 5+ characters
  });

  return (
    <EditorContext.Provider value={{ editor }}>
      <Toolbar
        ref={toolbarRef}
        style={{
          ...(isMobile
            ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
            : {}),
        }}
        variant="fixed"
      >
        {mobileView === "main" ? (
          <MainToolbarContent
            onHighlighterClick={() => setMobileView("highlighter")}
            onLinkClick={() => setMobileView("link")}
            isMobile={isMobile}
            editor={editor}
          />
        ) : (
          <MobileToolbarContent
            type={mobileView === "highlighter" ? "highlighter" : "link"}
            onBack={() => setMobileView("main")}
          />
        )}
      </Toolbar>

      <EditorContent
        editor={editor}
        role="presentation"
        className="simple-editor-content"
      />

      <TableHandle />
      <TableSelectionOverlay
        showResizeHandles={true}
        cellMenu={(props) => (
          <TableCellHandleMenu
            editor={props.editor}
            onMouseDown={(e) => props.onResizeStart?.("br")(e)}
          />
        )}
      />
      <TableExtendRowColumnButtons />

      <SlashCommandTriggerButton
        editor={editor}
        text="Insert Block"
        trigger="/"
        hideWhenUnavailable={true}
        showShortcut={true}
        onTriggered={(trigger) => console.log("Inserted:", trigger)}
      />

      {editor && (
        <SlashCommandMenu
          editor={editor}
          isOpen={slashCommand.isOpen}
          onClose={slashCommand.closeMenu}
          position={slashCommand.position}
          query={slashCommand.query}
          range={slashCommand.range}
        />
      )}

      {editor && (
        <AISelectionMenu
          editor={editor}
          isVisible={aiSelectionMenu.isVisible}
          position={aiSelectionMenu.position}
          selectedText={aiSelectionMenu.selectedText}
          range={aiSelectionMenu.range}
          onClose={aiSelectionMenu.hideMenu}
        />
      )}
    </EditorContext.Provider>
  );
}
