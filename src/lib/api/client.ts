import { ApiError } from './errors';

/**
 * Request interceptor type
 */
export type RequestInterceptor = (
  url: string,
  options: RequestInit
) => RequestInit | Promise<RequestInit>;

/**
 * Response interceptor type
 */
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseUrl?: string;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

/**
 * API Client class with error handling, interceptors, and authentication
 * (Requirements 10.1, 10.2)
 */
class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.requestInterceptors = config.requestInterceptors || [];
    this.responseInterceptors = config.responseInterceptors || [];
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Apply all request interceptors
   */
  private async applyRequestInterceptors(
    url: string,
    options: RequestInit
  ): Promise<RequestInit> {
    let modifiedOptions = options;
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await interceptor(url, modifiedOptions);
    }
    return modifiedOptions;
  }

  /**
   * Apply all response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  /**
   * Main fetch wrapper with error handling
   */
  async fetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Apply request interceptors
    const modifiedOptions = await this.applyRequestInterceptors(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    try {
      // Make the request
      let response = await fetch(url, modifiedOptions);

      // Apply response interceptors
      response = await this.applyResponseInterceptors(response);

      // Handle error responses
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw ApiError.fromResponse(response.status, errorBody);
      }

      // Parse successful response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as any;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap other errors
      if (error instanceof Error) {
        throw new ApiError(0, 'NETWORK_ERROR', error.message);
      }

      throw new ApiError(0, 'UNKNOWN_ERROR', 'An unknown error occurred');
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Default authentication interceptor that injects auth headers
 * Better Auth handles authentication via httpOnly cookies automatically,
 * but this interceptor can be used for additional auth headers if needed
 */
export const authInterceptor: RequestInterceptor = (url, options) => {
  // Better Auth uses httpOnly cookies, so no manual header injection needed
  // This interceptor is here for extensibility if needed
  return options;
};

/**
 * Create and configure the default API client instance
 */
export function createApiClient(config?: ApiClientConfig): ApiClient {
  const client = new ApiClient(config);
  
  // Add default interceptors
  client.addRequestInterceptor(authInterceptor);
  
  return client;
}

// Default API client instance
export const apiClient = createApiClient({
  baseUrl: '/api',
});
