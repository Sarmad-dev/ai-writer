import type { EnhancedWorkflowState } from '../types';
import { detectContentType } from '../utils/content-type-detection';

/**
 * Enhanced Analyze Prompt Node
 * Parses user prompt and multimodal inputs, determines if web search is needed,
 * and detects the content type for tailored suggestions
 * 
 * This node:
 * 1. Analyzes the user's prompt to understand content requirements
 * 2. Detects the content type (technical, report, blog, story, academic, business, general)
 * 3. Checks for multimodal inputs (text + images)
 * 4. Determines if web search is needed for real-time data
 * 5. Extracts key topics and requirements
 */
export async function analyzePromptEnhancedNode(
  state: EnhancedWorkflowState
): Promise<Partial<EnhancedWorkflowState>> {
  try {
    const { prompt, userInputs } = state;

    // Detect content type from prompt
    const contentTypeResult = detectContentType(prompt);

    // Analyze if web search is needed based on keywords and context
    const needsSearch = await determineSearchNeed(prompt);

    // Extract content requirements from the prompt
    const contentRequirements = extractContentRequirements(prompt, userInputs);

    return {
      contentType: contentTypeResult.type,
      needsSearch,
      status: 'analyzing',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'analyze'],
        contentRequirements,
        contentTypeDetection: {
          type: contentTypeResult.type,
          confidence: contentTypeResult.confidence,
          indicators: contentTypeResult.indicators,
        },
      },
    };
  } catch (error) {
    console.error('Error in enhanced analyze prompt node:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to analyze prompt',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'analyze'],
      },
    };
  }
}

/**
 * Determines if web search is needed based on the prompt content
 */
async function determineSearchNeed(prompt: string): Promise<boolean> {
  // Keywords that indicate need for real-time or factual data
  const searchIndicators = [
    'latest',
    'current',
    'recent',
    'today',
    'statistics',
    'data',
    'research',
    'study',
    'report',
    'news',
    'trends',
    'market',
    'price',
    'rate',
    'compare',
    'versus',
    'vs',
    'what is',
    'who is',
    'when did',
    'where is',
    'how many',
    'how much',
  ];

  const lowerPrompt = prompt.toLowerCase();
  
  // Check if any search indicators are present
  const hasSearchIndicator = searchIndicators.some(indicator => 
    lowerPrompt.includes(indicator)
  );

  // Additional heuristic: if prompt asks a question, it might need search
  const hasQuestion = /\?/.test(prompt) || 
    /^(what|who|when|where|why|how|which|can|could|should|would|is|are|do|does)/i.test(prompt);

  return hasSearchIndicator || hasQuestion;
}

/**
 * Extracts content requirements from prompt and multimodal inputs
 */
function extractContentRequirements(
  prompt: string,
  userInputs: EnhancedWorkflowState['userInputs']
): Record<string, any> {
  const requirements: Record<string, any> = {
    hasTextInput: true,
    hasImageInput: userInputs.some(input => input.type === 'image'),
    imageCount: userInputs.filter(input => input.type === 'image').length,
    promptLength: prompt.length,
    estimatedComplexity: estimateComplexity(prompt),
  };

  return requirements;
}

/**
 * Estimates the complexity of the content request
 */
function estimateComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
  const wordCount = prompt.split(/\s+/).length;
  
  if (wordCount < 10) return 'simple';
  if (wordCount < 50) return 'medium';
  return 'complex';
}
