/**
 * Type definitions for API requests and responses
 */

export type SessionStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface ContentSession {
  id: string;
  userId: string;
  title: string;
  contentType: string;
  prompt: string;
  content: string | null;
  status: SessionStatus;
  metadata: Record<string, any> | null;
  
  // Document Statistics
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  readingTime: number; // in minutes
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  title: string;
  prompt: string;
  metadata?: Record<string, any>;
}

export interface UpdateSessionRequest {
  title?: string;
  prompt?: string;
  content?: string;
  status?: SessionStatus;
  metadata?: Record<string, any>;
  wordCount?: number;
  characterCount?: number;
  paragraphCount?: number;
  readingTime?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
