import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { tavily } from '@/lib/search';
import type { SearchResult } from '@/lib/agent/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchRequestBody {
  query: string;
  maxResults?: number;
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SearchRequestBody = await req.json();
    const { query, maxResults = 5 } = body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Query is required and must be a non-empty string' } },
        { status: 400 }
      );
    }

    // Execute search using Tavily client
    const results = await tavily.search(query, {
      searchDepth: 'basic',
      maxResults,
    });

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Web search endpoint error:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
