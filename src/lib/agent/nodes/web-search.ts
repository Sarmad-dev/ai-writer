import type { WorkflowState, SearchResult } from '../types';
import { tavily } from '../../search';

/**
 * Web Search Node
 * Executes web search queries and retrieves relevant results
 * 
 * This node:
 * 1. Generates search queries from the user prompt
 * 2. Executes searches using Tavily API (or similar)
 * 3. Filters and ranks results by relevance
 * 4. Handles search errors gracefully
 */
export async function webSearchNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { prompt } = state;

    // Generate search queries from the prompt
    const searchQueries = generateSearchQueries(prompt);

    // Execute searches
    const searchResults: SearchResult[] = [];
    
    for (const query of searchQueries) {
      try {
        const results = await executeSearch(query);
        searchResults.push(...results);
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
        // Continue with other queries even if one fails
      }
    }

    // Filter and deduplicate results
    const filteredResults = filterAndDeduplicateResults(searchResults);

    // Limit to top results
    const maxResults = 5;
    const topResults = filteredResults.slice(0, maxResults);

    return {
      searchResults: topResults,
      status: 'searching',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'search'],
        searchQueries,
        totalResultsFound: searchResults.length,
      },
    };
  } catch (error) {
    console.error('Error in web search node:', error);
    
    // Return gracefully with empty results rather than failing the workflow
    return {
      searchResults: [],
      status: 'searching',
      error: undefined, // Don't set error to allow workflow to continue
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'search'],
        searchError: error instanceof Error ? error.message : 'Search failed',
      },
    };
  }
}

/**
 * Generates search queries from the user prompt
 */
function generateSearchQueries(prompt: string): string[] {
  const queries: string[] = [];
  
  // Limit query length to prevent API errors (Tavily typically handles up to ~500 chars, but keep it shorter)
  const MAX_QUERY_LENGTH = 300;
  
  // Clean and trim the prompt
  const cleanedPrompt = prompt.trim();
  
  // If prompt is short enough, use it directly
  if (cleanedPrompt.length <= MAX_QUERY_LENGTH) {
    queries.push(cleanedPrompt);
  } else {
    // Extract a shorter query from the prompt
    // Try to find the most relevant part (usually the first sentence or key phrases)
    const firstSentence = cleanedPrompt.split(/[.!?]+/)[0]?.trim();
    
    if (firstSentence && firstSentence.length <= MAX_QUERY_LENGTH && firstSentence.length > 10) {
      queries.push(firstSentence);
    } else {
      // Fallback: truncate the prompt and ensure it ends at a word boundary
      const truncated = cleanedPrompt.substring(0, MAX_QUERY_LENGTH);
      const lastSpace = truncated.lastIndexOf(' ');
      const query = lastSpace > MAX_QUERY_LENGTH * 0.8 
        ? truncated.substring(0, lastSpace)
        : truncated;
      queries.push(query.trim());
    }
  }

  // Extract additional search queries from key phrases
  // Look for titles, questions, or key terms
  const sentences = cleanedPrompt.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences.slice(0, 2)) {
    const trimmed = sentence.trim();
    if (trimmed.length <= MAX_QUERY_LENGTH && trimmed !== queries[0]) {
      queries.push(trimmed);
    }
  }

  // Extract key terms if we have very long queries
  if (cleanedPrompt.length > MAX_QUERY_LENGTH * 2 && queries.length === 0) {
    // Extract words that might be important (exclude common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'write', 'a', 'detailed', 'engaging', 'word', 'blog', 'post', 'titled']);
    const words = cleanedPrompt
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 10);
    
    if (words.length > 0) {
      const keywordQuery = words.join(' ');
      if (keywordQuery.length <= MAX_QUERY_LENGTH) {
        queries.push(keywordQuery);
      }
    }
  }

  // Ensure we have at least one query
  if (queries.length === 0) {
    queries.push(cleanedPrompt.substring(0, MAX_QUERY_LENGTH).trim());
  }

  return queries.slice(0, 3); // Limit to 3 queries max
}

/**
 * Executes a web search using Tavily API
 */
async function executeSearch(query: string): Promise<SearchResult[]> {
  try {
    // Use Tavily client for web search
    const results = await tavily.search(query, {
      searchDepth: 'basic',
      maxResults: 5,
    });

    return results;
  } catch (error) {
    console.error('Search execution error:', error);
    throw error;
  }
}

/**
 * Filters and deduplicates search results
 */
function filterAndDeduplicateResults(results: SearchResult[]): SearchResult[] {
  // Remove duplicates based on URL
  const seen = new Set<string>();
  const filtered: SearchResult[] = [];

  for (const result of results) {
    if (!seen.has(result.url) && result.title && result.snippet) {
      seen.add(result.url);
      filtered.push(result);
    }
  }

  // Sort by relevance (for now, just keep the order from the API)
  return filtered;
}


