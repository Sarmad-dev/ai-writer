/**
 * Custom error class for API errors with structured error information
 * (Requirements 10.1, 10.2)
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(statusCode: number, body: any): ApiError {
    return new ApiError(
      statusCode,
      body?.error?.code || 'UNKNOWN_ERROR',
      body?.error?.message || 'An unknown error occurred',
      body?.error?.details
    );
  }
}

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
