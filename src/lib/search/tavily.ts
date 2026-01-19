import { env } from '../env';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface TavilySearchOptions {
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
}

/**
 * Tavily Search API client
 */
export class TavilyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.SEARCH_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
  }

  /**
   * Execute a web search
   */
  async search(query: string, options: TavilySearchOptions = {}): Promise<SearchResult[]> {
    const { searchDepth = 'basic', maxResults = 5 } = options;

    // Validate API key
    if (!this.apiKey) {
      throw new Error('Tavily API key is required. Please set SEARCH_API_KEY environment variable.');
    }

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query must be a non-empty string');
    }

    try {
      // Tavily API expects api_key in the request body
      const requestBody = {
        api_key: this.apiKey,
        query: query.trim(),
        search_depth: searchDepth,
        max_results: maxResults,
      };

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Try to get error details from response body
        let errorMessage = `${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch {
          // If parsing fails, use status text
        }
        throw new Error(`Tavily API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();

      // Transform Tavily results to our SearchResult format
      const results: SearchResult[] = (data.results || []).map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        snippet: result.content || result.snippet || '',
        source: this.extractDomain(result.url || ''),
      }));

      return results;
    } catch (error) {
      console.error('Tavily search error:', error);
      throw error;
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }
}

// Default Tavily client instance
export const tavily = new TavilyClient();
