import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { documentService, SaveDocumentData } from '@/lib/services/documentService'

// Document Settings Types
export interface DocumentSettings {
  // Page Settings
  pageSize: string
  orientation: 'portrait' | 'landscape'
  
  // Margins (in inches)
  marginPreset: string
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  
  // Typography
  fontFamily: string
  fontSize: number
  lineSpacing: number
  
  // Layout
  columns: number
  columnGap: number
  
  // Appearance
  pageColor: string
  textColor: string
  backgroundColor: string
  
  // Advanced Settings
  headerHeight: number
  footerHeight: number
  showPageNumbers: boolean
  pageNumberPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  showHeader: boolean
  showFooter: boolean
  headerContent: string
  footerContent: string
  
  // Print Settings
  printMargins: boolean
  printBackground: boolean
  
  // Zoom and View
  zoomLevel: number
  viewMode: 'page' | 'web' | 'outline' | 'draft'
  
  // Language and Locale
  language: string
  spellCheck: boolean
  autoCorrect: boolean
  
  // Collaboration
  showComments: boolean
  showSuggestions: boolean
  trackChanges: boolean
}

// Editor State Types
export interface EditorState {
  // Document Info
  documentId: string | null
  title: string
  content: string
  prompt: string
  lastSaved: Date | null
  isDirty: boolean
  isAutoSaving: boolean
  
  // Document Settings
  settings: DocumentSettings
  
  // Editor State
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // History Management
  history: string[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  
  // Selection and Cursor
  selectionStart: number
  selectionEnd: number
  cursorPosition: number
  
  // UI State
  isFullscreen: boolean
  sidebarOpen: boolean
  toolbarVisible: boolean
  
  // Word Count and Statistics
  wordCount: number
  characterCount: number
  paragraphCount: number
  readingTime: number
}

// Actions Interface
export interface EditorActions {
  // Document Actions
  setDocumentId: (id: string | null) => void
  setTitle: (title: string) => void
  setContent: (content: string) => void
  setPrompt: (prompt: string) => void
  updateContent: (content: string) => void
  loadDocument: (id: string) => Promise<void>
  
  // Settings Actions
  updateSettings: (settings: Partial<DocumentSettings>) => void
  resetSettings: () => void
  loadSettings: (settings: DocumentSettings) => void
  
  // Save Actions
  save: () => Promise<void>
  autoSave: () => Promise<void>
  setSaved: (date: Date) => void
  setDirty: (dirty: boolean) => void
  
  // History Actions
  undo: () => void
  redo: () => void
  addToHistory: (content: string) => void
  clearHistory: () => void
  
  // Selection Actions
  setSelection: (start: number, end: number) => void
  setCursorPosition: (position: number) => void
  
  // UI Actions
  toggleFullscreen: () => void
  toggleSidebar: () => void
  toggleToolbar: () => void
  setZoom: (level: number) => void
  
  // Error Handling
  setError: (error: string | null) => void
  clearError: () => void
  
  // Loading States
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  
  // Statistics
  updateStatistics: (content: string) => void
  
  // Reset
  reset: () => void
}

// Default Settings
const defaultSettings: DocumentSettings = {
  // Page Settings
  pageSize: 'a4',
  orientation: 'portrait',
  
  // Margins
  marginPreset: 'normal',
  marginTop: 1,
  marginBottom: 1,
  marginLeft: 1,
  marginRight: 1,
  
  // Typography
  fontFamily: 'inter',
  fontSize: 12,
  lineSpacing: 1.15,
  
  // Layout
  columns: 1,
  columnGap: 0.5,
  
  // Appearance
  pageColor: 'white',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  
  // Advanced Settings
  headerHeight: 0.5,
  footerHeight: 0.5,
  showPageNumbers: false,
  pageNumberPosition: 'bottom-center',
  showHeader: false,
  showFooter: false,
  headerContent: '',
  footerContent: '',
  
  // Print Settings
  printMargins: true,
  printBackground: false,
  
  // Zoom and View
  zoomLevel: 100,
  viewMode: 'page',
  
  // Language and Locale
  language: 'en-US',
  spellCheck: true,
  autoCorrect: true,
  
  // Collaboration
  showComments: true,
  showSuggestions: true,
  trackChanges: false,
}

// Initial State
const initialState: EditorState = {
  // Document Info
  documentId: null,
  title: 'Untitled Document',
  content: '',
  prompt: '',
  lastSaved: null,
  isDirty: false,
  isAutoSaving: false,
  
  // Document Settings
  settings: defaultSettings,
  
  // Editor State
  isLoading: false,
  isSaving: false,
  error: null,
  
  // History Management
  history: [''],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  
  // Selection and Cursor
  selectionStart: 0,
  selectionEnd: 0,
  cursorPosition: 0,
  
  // UI State
  isFullscreen: false,
  sidebarOpen: true,
  toolbarVisible: true,
  
  // Statistics
  wordCount: 0,
  characterCount: 0,
  paragraphCount: 0,
  readingTime: 0,
}

// Utility Functions
const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const calculateReadingTime = (wordCount: number): number => {
  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200)
}

const calculateParagraphCount = (text: string): number => {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
}

// Store Implementation
export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Document Actions
        setDocumentId: (id) => set({ documentId: id }),
        
        setTitle: (title) => set({ title, isDirty: true }),
        
        setContent: (content) => {
          set({ content, isDirty: true })
          get().updateStatistics(content)
          get().addToHistory(content)
        },

        setPrompt: (prompt) => set({ prompt, isDirty: true }),
        
        updateContent: (content) => {
          set({ content, isDirty: true })
          get().updateStatistics(content)
        },
        
        // Settings Actions
        updateSettings: (newSettings) => {
          const currentSettings = get().settings
          const updatedSettings = { ...currentSettings, ...newSettings }
          set({ 
            settings: updatedSettings, 
            isDirty: true 
          })
        },
        
        resetSettings: () => set({ settings: defaultSettings, isDirty: true }),
        
        loadSettings: (settings) => set({ settings }),
        
        // Document Actions
        loadDocument: async (id: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const document = await documentService.getDocument(id)
            
            set({
              documentId: document.id,
              title: document.title,
              content: document.content || '',
              prompt: document.prompt || '',
              settings: document.documentSettings || defaultSettings,
              wordCount: document.wordCount,
              characterCount: document.characterCount,
              paragraphCount: document.paragraphCount,
              readingTime: document.readingTime,
              lastSaved: new Date(document.updatedAt),
              isDirty: false,
              isLoading: false,
              error: null,
              history: [document.content || ''],
              historyIndex: 0,
              canUndo: false,
              canRedo: false,
            })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load document'
            })
          }
        },

        // Save Actions
        save: async () => {
          const state = get()
          if (!state.documentId || (!state.isDirty && !state.settings)) return
          
          set({ isSaving: true, error: null })
          
          try {
            const saveData: SaveDocumentData = {
              title: state.title,
              content: state.content,
              settings: state.settings,
              wordCount: state.wordCount,
              characterCount: state.characterCount,
              paragraphCount: state.paragraphCount,
              readingTime: state.readingTime,
            }
            
            await documentService.saveDocument(state.documentId, saveData)
            
            set({ 
              isSaving: false, 
              isDirty: false, 
              lastSaved: new Date(),
              error: null 
            })
          } catch (error) {
            set({ 
              isSaving: false, 
              error: error instanceof Error ? error.message : 'Failed to save document' 
            })
          }
        },
        
        autoSave: async () => {
          const state = get()
          if (!state.documentId || !state.isDirty || state.isSaving) return
          
          set({ isAutoSaving: true })
          
          try {
            const saveData: SaveDocumentData = {
              title: state.title,
              content: state.content,
              settings: state.settings,
              wordCount: state.wordCount,
              characterCount: state.characterCount,
              paragraphCount: state.paragraphCount,
              readingTime: state.readingTime,
            }
            
            documentService.scheduleAutoSave(state.documentId, saveData)
            
            set({ 
              isAutoSaving: false, 
              isDirty: false, 
              lastSaved: new Date() 
            })
          } catch (error) {
            set({ isAutoSaving: false })
          }
        },
        
        setSaved: (date) => set({ lastSaved: date, isDirty: false }),
        
        setDirty: (dirty) => set({ isDirty: dirty }),
        
        // History Actions
        undo: () => {
          const state = get()
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1
            const content = state.history[newIndex]
            set({
              content,
              historyIndex: newIndex,
              canUndo: newIndex > 0,
              canRedo: true,
              isDirty: true
            })
            get().updateStatistics(content)
          }
        },
        
        redo: () => {
          const state = get()
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1
            const content = state.history[newIndex]
            set({
              content,
              historyIndex: newIndex,
              canUndo: true,
              canRedo: newIndex < state.history.length - 1,
              isDirty: true
            })
            get().updateStatistics(content)
          }
        },
        
        addToHistory: (content) => {
          const state = get()
          const newHistory = state.history.slice(0, state.historyIndex + 1)
          newHistory.push(content)
          
          // Limit history to 50 entries
          if (newHistory.length > 50) {
            newHistory.shift()
          }
          
          const newIndex = newHistory.length - 1
          set({
            history: newHistory,
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: false
          })
        },
        
        clearHistory: () => {
          const content = get().content
          set({
            history: [content],
            historyIndex: 0,
            canUndo: false,
            canRedo: false
          })
        },
        
        // Selection Actions
        setSelection: (start, end) => set({ selectionStart: start, selectionEnd: end }),
        
        setCursorPosition: (position) => set({ cursorPosition: position }),
        
        // UI Actions
        toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
        
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        toggleToolbar: () => set((state) => ({ toolbarVisible: !state.toolbarVisible })),
        
        setZoom: (level) => {
          const clampedLevel = Math.max(25, Math.min(500, level))
          set((state) => ({
            settings: { ...state.settings, zoomLevel: clampedLevel }
          }))
        },
        
        // Error Handling
        setError: (error) => set({ error }),
        
        clearError: () => set({ error: null }),
        
        // Loading States
        setLoading: (loading) => set({ isLoading: loading }),
        
        setSaving: (saving) => set({ isSaving: saving }),
        
        // Statistics
        updateStatistics: (content) => {
          const wordCount = calculateWordCount(content)
          const characterCount = content.length
          const paragraphCount = calculateParagraphCount(content)
          const readingTime = calculateReadingTime(wordCount)
          
          set({
            wordCount,
            characterCount,
            paragraphCount,
            readingTime
          })
        },
        
        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'editor-store',
        partialize: (state) => ({
          settings: state.settings,
          sidebarOpen: state.sidebarOpen,
          toolbarVisible: state.toolbarVisible,
        }),
      }
    ),
    { name: 'EditorStore' }
  )
)

// Note: Individual selectors removed to prevent getSnapshot caching issues
// Use the useEditor hook instead for accessing store state