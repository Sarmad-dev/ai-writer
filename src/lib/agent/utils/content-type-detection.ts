import type { ContentType } from '../types';

/**
 * Content Type Detection Result
 */
export interface ContentTypeDetectionResult {
  type: ContentType;
  confidence: number; // 0-1 scale
  indicators: string[]; // Keywords/patterns that led to this detection
}

/**
 * Keywords and patterns for each content type
 */
const CONTENT_TYPE_PATTERNS = {
  technical: {
    keywords: [
      'api', 'code', 'function', 'algorithm', 'implementation', 'technical',
      'documentation', 'sdk', 'library', 'framework', 'database', 'server',
      'architecture', 'system', 'protocol', 'interface', 'class', 'method',
      'debug', 'compile', 'deploy', 'configuration', 'integration', 'endpoint',
      'authentication', 'authorization', 'encryption', 'performance', 'optimization',
      'tutorial', 'guide', 'how to', 'setup', 'install', 'configure'
    ],
    patterns: [
      /\b(function|class|interface|type|const|let|var)\s+\w+/i,
      /\b(import|export|require)\s+/i,
      /\b(GET|POST|PUT|DELETE|PATCH)\s+/i,
      /\b(http|https|ftp):\/\//i,
      /\b\w+\(\)/i, // function calls
      /```[\s\S]*?```/i, // code blocks
    ],
  },
  report: {
    keywords: [
      'report', 'analysis', 'findings', 'results', 'data', 'statistics',
      'metrics', 'performance', 'quarterly', 'annual', 'summary', 'executive',
      'overview', 'conclusion', 'recommendation', 'assessment', 'evaluation',
      'survey', 'study', 'research', 'investigation', 'audit', 'review',
      'forecast', 'projection', 'trend', 'comparison', 'benchmark', 'kpi',
      'revenue', 'profit', 'loss', 'growth', 'decline', 'increase', 'decrease'
    ],
    patterns: [
      /\b(q[1-4]|quarter|fiscal year|fy)\s+\d{4}/i,
      /\b\d+(\.\d+)?%/i, // percentages
      /\$\d+/i, // dollar amounts
      /\b(increased|decreased|grew|declined)\s+by\s+\d+/i,
    ],
  },
  blog: {
    keywords: [
      'blog', 'post', 'article', 'share', 'thoughts', 'opinion', 'perspective',
      'experience', 'journey', 'story', 'tips', 'tricks', 'advice', 'guide',
      'beginner', 'learn', 'discover', 'explore', 'understand', 'master',
      'today', 'recently', 'lately', 'personal', 'lifestyle', 'travel',
      'food', 'fashion', 'health', 'fitness', 'productivity', 'motivation',
      'inspiration', 'review', 'comparison', 'best', 'top', 'ultimate'
    ],
    patterns: [
      /\b(hey|hi|hello)\s+(everyone|folks|friends|readers)/i,
      /\b(i|we|you)\s+(think|believe|feel|want|need)/i,
      /\b(check out|take a look|have a look)/i,
      /\b\d+\s+(tips|ways|reasons|things|steps)/i,
    ],
  },
  story: {
    keywords: [
      'story', 'tale', 'narrative', 'character', 'plot', 'scene', 'chapter',
      'protagonist', 'antagonist', 'hero', 'villain', 'adventure', 'journey',
      'once upon', 'long ago', 'in a', 'there was', 'there were',
      'suddenly', 'meanwhile', 'later', 'finally', 'eventually',
      'said', 'asked', 'replied', 'whispered', 'shouted', 'thought',
      'felt', 'saw', 'heard', 'smelled', 'touched', 'tasted',
      'fiction', 'fantasy', 'mystery', 'thriller', 'romance', 'drama'
    ],
    patterns: [
      /\b(once upon a time|long ago|in a land)/i,
      /\b(he|she|they)\s+(said|asked|replied|whispered|shouted)/i,
      /\b(suddenly|meanwhile|later|finally|eventually)/i,
      /["'].*?["']/i, // dialogue
    ],
  },
  academic: {
    keywords: [
      'research', 'study', 'paper', 'thesis', 'dissertation', 'journal',
      'abstract', 'introduction', 'methodology', 'results', 'discussion',
      'conclusion', 'references', 'bibliography', 'citation', 'hypothesis',
      'theory', 'analysis', 'experiment', 'data', 'findings', 'evidence',
      'literature review', 'peer review', 'scholarly', 'academic',
      'university', 'professor', 'phd', 'doctorate', 'undergraduate',
      'graduate', 'publication', 'conference', 'symposium', 'proceedings'
    ],
    patterns: [
      /\b(et al\.|ibid\.|op\. cit\.)/i,
      /\b\d{4}\s*[,;]\s*p+\.\s*\d+/i, // citations like "2020, p. 45"
      /\[\d+\]/i, // reference numbers
      /\b(according to|as stated by|research shows|studies indicate)/i,
    ],
  },
  business: {
    keywords: [
      'business', 'company', 'corporation', 'enterprise', 'organization',
      'strategy', 'plan', 'proposal', 'pitch', 'presentation', 'meeting',
      'client', 'customer', 'stakeholder', 'partner', 'vendor', 'supplier',
      'market', 'industry', 'sector', 'competition', 'competitive',
      'revenue', 'profit', 'cost', 'budget', 'investment', 'roi',
      'sales', 'marketing', 'branding', 'product', 'service', 'solution',
      'contract', 'agreement', 'terms', 'conditions', 'policy', 'procedure'
    ],
    patterns: [
      /\b(dear|to|from|subject|re:)/i, // business communication
      /\b(llc|inc|corp|ltd|co\.)/i, // company suffixes
      /\b(q[1-4]|quarter)\s+\d{4}/i,
      /\b(please|kindly|thank you|regards|sincerely)/i,
    ],
  },
};

/**
 * Detects the content type based on prompt and optional initial content
 * 
 * @param prompt - The user's prompt
 * @param initialContent - Optional initial content to analyze
 * @returns ContentTypeDetectionResult with detected type, confidence, and indicators
 */
export function detectContentType(
  prompt: string,
  initialContent?: string
): ContentTypeDetectionResult {
  const textToAnalyze = `${prompt} ${initialContent || ''}`.toLowerCase();
  
  // Calculate scores for each content type
  const scores: Record<ContentType, { score: number; indicators: string[] }> = {
    technical: { score: 0, indicators: [] },
    report: { score: 0, indicators: [] },
    blog: { score: 0, indicators: [] },
    story: { score: 0, indicators: [] },
    academic: { score: 0, indicators: [] },
    business: { score: 0, indicators: [] },
    general: { score: 0, indicators: [] },
  };

  // Score each content type based on keywords and patterns
  for (const [type, config] of Object.entries(CONTENT_TYPE_PATTERNS)) {
    const contentType = type as Exclude<ContentType, 'general'>;
    
    // Check keywords
    for (const keyword of config.keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        scores[contentType].score += 1;
        scores[contentType].indicators.push(keyword);
      }
    }
    
    // Check patterns (weighted more heavily)
    for (const pattern of config.patterns) {
      if (pattern.test(textToAnalyze)) {
        scores[contentType].score += 2;
        scores[contentType].indicators.push(`pattern: ${pattern.source}`);
      }
    }
  }

  // Find the content type with the highest score
  let maxScore = 0;
  let detectedType: ContentType = 'general';
  let indicators: string[] = [];

  for (const [type, data] of Object.entries(scores)) {
    if (data.score > maxScore) {
      maxScore = data.score;
      detectedType = type as ContentType;
      indicators = data.indicators;
    }
  }

  // Calculate confidence based on score
  // If no indicators found, default to 'general' with low confidence
  if (maxScore === 0) {
    return {
      type: 'general',
      confidence: 0.5,
      indicators: ['no specific indicators found'],
    };
  }

  // Normalize confidence to 0-1 scale
  // Max score of 10+ indicators = high confidence (0.9)
  // Score of 1-2 = medium confidence (0.6-0.7)
  const confidence = Math.min(0.5 + (maxScore * 0.05), 0.95);

  return {
    type: detectedType,
    confidence,
    indicators: indicators.slice(0, 5), // Return top 5 indicators
  };
}

/**
 * Validates if a string is a valid ContentType
 */
export function isValidContentType(type: string): type is ContentType {
  const validTypes: ContentType[] = [
    'technical', 'report', 'blog', 'story', 'academic', 'business', 'general'
  ];
  return validTypes.includes(type as ContentType);
}
