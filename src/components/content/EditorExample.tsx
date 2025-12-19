"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useEditor } from "@/hooks/useEditor"
import { EditorHeader } from "./EditorHeader"
import { DocumentStatistics, CompactDocumentStatistics } from "./DocumentStatistics"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface EditorExampleProps {
  documentId?: string
}

export function EditorExample({ documentId }: EditorExampleProps) {
  const editor = useEditor({
    documentId,
    autoSaveDelay: 2000,
    enableAutoSave: true,
  })

  // Update statistics when content changes
  useEffect(() => {
    if (editor.content) {
      // This is automatically handled by the store's updateContent method
      // but we can trigger it manually if needed
    }
  }, [editor.content])

  const handleContentChange = (value: string) => {
    editor.updateContent(value)
  }

  if (editor.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (editor.error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{editor.error}</p>
            <Button onClick={editor.clearError} variant="outline">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col">
        {/* Editor Header */}
        <EditorHeader />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <ResizablePanelGroup orientation="horizontal">
            {/* Main Editor Panel */}
            <ResizablePanel defaultSize={75} minSize={50}>
              <div className="flex h-full flex-col">
                {/* Editor Content */}
                <div className="flex-1 p-4">
                  <div 
                    className="mx-auto max-w-4xl"
                    style={{
                      fontFamily: editor.settings.fontFamily,
                      fontSize: `${editor.settings.fontSize}pt`,
                      lineHeight: editor.settings.lineSpacing,
                      color: editor.settings.textColor,
                      backgroundColor: editor.settings.backgroundColor,
                      zoom: `${editor.settings.zoomLevel}%`,
                    }}
                  >
                    {/* Document Content */}
                    <div 
                      className="min-h-[800px] rounded-lg border bg-white p-8 shadow-sm"
                      style={{
                        marginTop: `${editor.settings.marginTop}in`,
                        marginBottom: `${editor.settings.marginBottom}in`,
                        marginLeft: `${editor.settings.marginLeft}in`,
                        marginRight: `${editor.settings.marginRight}in`,
                        backgroundColor: editor.settings.pageColor === 'white' ? '#ffffff' : 
                                       editor.settings.pageColor === 'cream' ? '#fefce8' :
                                       editor.settings.pageColor === 'light-gray' ? '#f3f4f6' :
                                       editor.settings.pageColor === 'light-blue' ? '#eff6ff' :
                                       editor.settings.pageColor === 'light-green' ? '#f0fdf4' :
                                       editor.settings.pageColor === 'sepia' ? '#fff7ed' :
                                       editor.settings.pageColor === 'dark' ? '#111827' : '#ffffff',
                        columns: editor.settings.columns > 1 ? editor.settings.columns : 'auto',
                        columnGap: editor.settings.columns > 1 ? `${editor.settings.columnGap}in` : 'normal',
                      }}
                    >
                      {/* Header */}
                      {editor.settings.showHeader && (
                        <div className="mb-4 border-b pb-2 text-sm text-muted-foreground">
                          {editor.settings.headerContent || editor.title}
                        </div>
                      )}

                      {/* Main Content */}
                      <Textarea
                        value={editor.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Start writing your document..."
                        className="min-h-[600px] resize-none border-none bg-transparent p-0 text-base focus-visible:ring-0"
                        style={{
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          lineHeight: 'inherit',
                          color: 'inherit',
                        }}
                      />

                      {/* Footer */}
                      {editor.settings.showFooter && (
                        <div className="mt-4 border-t pt-2 text-sm text-muted-foreground">
                          {editor.settings.footerContent || (
                            <div className="flex justify-between">
                              <span>{editor.title}</span>
                              {editor.settings.showPageNumbers && <span>Page 1</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="border-t bg-muted/30 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <CompactDocumentStatistics />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {editor.isAutoSaving && (
                        <span className="flex items-center gap-1">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                          Auto-saving...
                        </span>
                      )}
                      {editor.lastSaved && (
                        <span>
                          Last saved: {editor.lastSaved.toLocaleTimeString()}
                        </span>
                      )}
                      {editor.isDirty && !editor.isAutoSaving && (
                        <span className="text-orange-600">Unsaved changes</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            {/* Sidebar Panel */}
            {editor.sidebarOpen && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                  <div className="h-full border-l bg-muted/30">
                    <div className="p-4 space-y-4">
                      {/* Document Statistics */}
                      <DocumentStatistics />

                      {/* Quick Actions */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={editor.save}
                            disabled={!editor.isDirty || editor.isSaving}
                          >
                            {editor.isSaving ? "Saving..." : "Save Document"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={editor.toggleFullscreen}
                          >
                            {editor.isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => editor.updateSettings({ 
                              viewMode: editor.settings.viewMode === 'page' ? 'web' : 'page' 
                            })}
                          >
                            Switch to {editor.settings.viewMode === 'page' ? 'Web' : 'Page'} View
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Document Info */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Document Info</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
                          <div>Document ID: {editor.documentId || 'New Document'}</div>
                          <div>View Mode: {editor.settings.viewMode}</div>
                          <div>Zoom: {editor.settings.zoomLevel}%</div>
                          <div>Font: {editor.settings.fontFamily} {editor.settings.fontSize}pt</div>
                          <div>Page: {editor.settings.pageSize.toUpperCase()} {editor.settings.orientation}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </SidebarProvider>
  )
}