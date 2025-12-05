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

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: searchDepth,
          max_results: maxResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status} - ${response.statusText}`);
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
