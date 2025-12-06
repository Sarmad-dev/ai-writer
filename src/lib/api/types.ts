/**
 * Type definitions for API requests and responses
 */

export type SessionStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface ContentSession {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  content: string | null;
  status: SessionStatus;
  metadata: Record<string, any> | null;
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
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
