import { useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { documentService } from '@/lib/services/documentService'
import { useShallow } from 'zustand/react/shallow'

interface UseEditorOptions {
  documentId?: string
  autoSaveDelay?: number
  enableAutoSave?: boolean
}

export function useEditor(options: UseEditorOptions = {}) {
  const {
    documentId: optionsDocumentId,
    autoSaveDelay = 2000,
    enableAutoSave = true,
  } = options

  // Use a single selector with shallow comparison to prevent getSnapshot caching issues
  const store = useEditorStore(
    useShallow((state) => ({
      // State
      documentId: state.documentId,
      title: state.title,
      content: state.content,
      prompt: state.prompt,
      isDirty: state.isDirty,
      lastSaved: state.lastSaved,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      isAutoSaving: state.isAutoSaving,
      error: state.error,
      settings: state.settings,
      wordCount: state.wordCount,
      characterCount: state.characterCount,
      paragraphCount: state.paragraphCount,
      readingTime: state.readingTime,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      isFullscreen: state.isFullscreen,
      sidebarOpen: state.sidebarOpen,
      toolbarVisible: state.toolbarVisible,
      // Actions
      loadDocument: state.loadDocument,
      setTitle: state.setTitle,
      setContent: state.setContent,
      setPrompt: state.setPrompt,
      updateContent: state.updateContent,
      updateSettings: state.updateSettings,
      save: state.save,
      undo: state.undo,
      redo: state.redo,
      toggleFullscreen: state.toggleFullscreen,
      toggleSidebar: state.toggleSidebar,
      toggleToolbar: state.toggleToolbar,
      setZoom: state.setZoom,
      clearError: state.clearError,
      reset: state.reset,
    }))
  )

  // Destructure from the single selector
  const {
    documentId,
    title,
    content,
    prompt,
    isDirty,
    lastSaved,
    isLoading,
    isSaving,
    isAutoSaving,
    error,
    settings,
    wordCount,
    characterCount,
    paragraphCount,
    readingTime,
    canUndo,
    canRedo,
    isFullscreen,
    sidebarOpen,
    toolbarVisible,
    loadDocument,
    setTitle,
    setContent,
    setPrompt,
    updateContent,
    updateSettings,
    save,
    undo,
    redo,
    toggleFullscreen,
    toggleSidebar,
    toggleToolbar,
    setZoom,
    clearError,
    reset,
  } = store
  const autoSaveTimeoutRef = useRef<any>(undefined)

  // Load document when documentId changes
  useEffect(() => {
    if (optionsDocumentId && optionsDocumentId !== documentId) {
      loadDocument(optionsDocumentId)
    }
  }, [optionsDocumentId, documentId, loadDocument])

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (!enableAutoSave || !documentId || !isDirty) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Schedule auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      useEditorStore.getState().autoSave()
    }, autoSaveDelay)
  }, [enableAutoSave, documentId, isDirty, autoSaveDelay])

  // Trigger auto-save when content changes
  useEffect(() => {
    if (isDirty) {
      scheduleAutoSave()
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isDirty, scheduleAutoSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      if (documentId) {
        documentService.cancelAutoSave(documentId)
      }
    }
  }, [documentId])

  // Handle beforeunload to save changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
      
      // Ctrl/Cmd + Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y to redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault()
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [save, undo, redo])

  return {
    // Document state
    documentId,
    title,
    content,
    prompt,
    isDirty,
    lastSaved,
    
    // Loading states
    isLoading,
    isSaving,
    isAutoSaving,
    error,
    
    // Settings
    settings,
    
    // Statistics
    wordCount,
    characterCount,
    paragraphCount,
    readingTime,
    
    // History
    canUndo,
    canRedo,
    
    // UI state
    isFullscreen,
    sidebarOpen,
    toolbarVisible,
    
    // Actions
    setTitle,
    setContent,
    setPrompt,
    updateContent,
    updateSettings,
    save,
    undo,
    redo,
    toggleFullscreen,
    toggleSidebar,
    toggleToolbar,
    setZoom,
    clearError,
    reset,
    
    // Utility functions
    scheduleAutoSave,
  }
}

// Hook for document statistics only
export function useDocumentStats() {
  return useEditorStore(
    useShallow((state) => ({
      wordCount: state.wordCount,
      characterCount: state.characterCount,
      paragraphCount: state.paragraphCount,
      readingTime: state.readingTime,
    }))
  )
}

// Hook for document settings only (deprecated - use useEditor instead)
export function useDocumentSettingsOnly() {
  return useEditorStore(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
    }))
  )
}