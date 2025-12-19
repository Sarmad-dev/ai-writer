import { DocumentSettings } from "@/stores/editorStore"

export interface DocumentData {
  id: string
  title: string
  content: string
  documentSettings?: DocumentSettings | null
  wordCount: number
  characterCount: number
  paragraphCount: number
  readingTime: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

export interface SaveDocumentData {
  title?: string
  content?: string
  settings?: DocumentSettings
  wordCount?: number
  characterCount?: number
  paragraphCount?: number
  readingTime?: number
}

class DocumentService {
  private baseUrl = "/api/documents"

  async getDocument(id: string): Promise<DocumentData> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch document")
    }
    
    const data = await response.json()
    return data.document
  }

  async saveDocument(id: string, data: SaveDocumentData): Promise<DocumentData> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save document")
    }
    
    const result = await response.json()
    return result.document
  }

  async saveDocumentSettings(id: string, settings: DocumentSettings): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save document settings")
    }
  }

  async getDocumentSettings(id: string): Promise<DocumentSettings | null> {
    const response = await fetch(`${this.baseUrl}/${id}/settings`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch document settings")
    }
    
    const data = await response.json()
    return data.settings
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete document")
    }
  }

  async createDocument(data: {
    title: string
    content?: string
    contentType?: string
    settings?: DocumentSettings
  }): Promise<DocumentData> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create document")
    }
    
    const result = await response.json()
    return result.document
  }

  // Auto-save functionality
  private autoSaveTimeouts = new Map<string, NodeJS.Timeout>()

  scheduleAutoSave(
    documentId: string, 
    data: SaveDocumentData, 
    delay: number = 2000
  ): void {
    // Clear existing timeout
    const existingTimeout = this.autoSaveTimeouts.get(documentId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Schedule new auto-save
    const timeout = setTimeout(async () => {
      try {
        await this.saveDocument(documentId, data)
        this.autoSaveTimeouts.delete(documentId)
      } catch (error) {
        console.error("Auto-save failed:", error)
        // Could emit an event or call a callback here
      }
    }, delay)

    this.autoSaveTimeouts.set(documentId, timeout)
  }

  cancelAutoSave(documentId: string): void {
    const timeout = this.autoSaveTimeouts.get(documentId)
    if (timeout) {
      clearTimeout(timeout)
      this.autoSaveTimeouts.delete(documentId)
    }
  }
}

export const documentService = new DocumentService()