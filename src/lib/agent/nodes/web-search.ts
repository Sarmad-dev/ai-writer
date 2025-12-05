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
  // For now, use the prompt as-is
  // In a production system, you might use an LLM to generate better queries
  const queries: string[] = [];

  // Main query is the prompt itself
  queries.push(prompt);

  // Extract potential sub-queries from questions
  const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Add up to 2 additional queries from sentences
  for (let i = 0; i < Math.min(2, sentences.length - 1); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 10) {
      queries.push(sentence);
    }
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


