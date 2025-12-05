import type { WorkflowState } from '../types';
import { env } from '../../env';

/**
 * Analyze Prompt Node
 * Parses user prompt and multimodal inputs, determines if web search is needed
 * 
 * This node:
 * 1. Analyzes the user's prompt to understand content requirements
 * 2. Checks for multimodal inputs (text + images)
 * 3. Determines if web search is needed for real-time data
 * 4. Extracts key topics and requirements
 */
export async function analyzePromptNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { prompt, userInputs } = state;

    // Analyze if web search is needed based on keywords and context
    const needsSearch = await determineSearchNeed(prompt);

    // Extract content requirements from the prompt
    const contentRequirements = extractContentRequirements(prompt, userInputs);

    return {
      needsSearch,
      status: 'analyzing',
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'analyze'],
        contentRequirements,
      },
    };
  } catch (error) {
    console.error('Error in analyze prompt node:', error);
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
  userInputs: WorkflowState['userInputs']
): Record<string, any> {
  const requirements: Record<string, any> = {
    hasTextInput: true,
    hasImageInput: userInputs.some(input => input.type === 'image'),
    imageCount: userInputs.filter(input => input.type === 'image').length,
    promptLength: prompt.length,
    estimatedComplexity: estimateComplexity(prompt),
  };

  // Detect if user wants specific content types
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
    requirements.contentType = 'article';
  } else if (lowerPrompt.includes('email') || lowerPrompt.includes('message')) {
    requirements.contentType = 'email';
  } else if (lowerPrompt.includes('report') || lowerPrompt.includes('analysis')) {
    requirements.contentType = 'report';
  } else if (lowerPrompt.includes('social') || lowerPrompt.includes('post')) {
    requirements.contentType = 'social';
  } else {
    requirements.contentType = 'general';
  }

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
