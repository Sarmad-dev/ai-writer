"use client"

import { useEditor } from "@/hooks/useEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EditorTest() {
  const editor = useEditor({
    documentId: "test-doc",
    enableAutoSave: false, // Disable for testing
  })

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Editor Store Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title:</label>
            <Input
              value={editor.title}
              onChange={(e) => editor.setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Content:</label>
            <textarea
              value={editor.content}
              onChange={(e) => editor.updateContent(e.target.value)}
              placeholder="Enter document content"
              className="w-full h-32 p-2 border rounded"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={editor.save} disabled={!editor.isDirty}>
              Save {editor.isDirty && "(*)"}
            </Button>
            <Button onClick={editor.undo} disabled={!editor.canUndo}>
              Undo
            </Button>
            <Button onClick={editor.redo} disabled={!editor.canRedo}>
              Redo
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Document ID: {editor.documentId || "None"}</div>
            <div>Is Dirty: {editor.isDirty ? "Yes" : "No"}</div>
            <div>Word Count: {editor.wordCount}</div>
            <div>Character Count: {editor.characterCount}</div>
            <div>Can Undo: {editor.canUndo ? "Yes" : "No"}</div>
            <div>Can Redo: {editor.canRedo ? "Yes" : "No"}</div>
            <div>Font Size: {editor.settings.fontSize}pt</div>
            <div>Page Size: {editor.settings.pageSize}</div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => editor.updateSettings({ fontSize: editor.settings.fontSize + 1 })}
            >
              Increase Font Size
            </Button>
            <Button 
              onClick={() => editor.updateSettings({ fontSize: Math.max(8, editor.settings.fontSize - 1) })}
            >
              Decrease Font Size
            </Button>
          </div>
          
          {editor.error && (
            <div className="text-red-600 text-sm">
              Error: {editor.error}
              <Button onClick={editor.clearError} size="sm" className="ml-2">
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}