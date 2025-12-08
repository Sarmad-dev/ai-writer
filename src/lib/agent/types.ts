// Agent workflow types and interfaces

export interface MultimodalInput {
  type: 'text' | 'image';
  content: string; // text content or image URL
  metadata?: Record<string, any>;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface GraphData {
  id: string;
  type: 'BAR' | 'LINE' | 'PIE' | 'AREA' | 'SCATTER';
  data: Record<string, string | number>[];
  config: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: string[];
    legend?: boolean;
  };
}

export interface ApprovalRequestData {
  id: string;
  action: string;
  details: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMEOUT';
}

export type WorkflowStatus = 
  | 'idle' 
  | 'analyzing' 
  | 'searching' 
  | 'waiting_approval' 
  | 'generating' 
  | 'formatting' 
  | 'saving' 
  | 'completed' 
  | 'error';

// Enhanced workflow types for the new workflow

export type ContentType = 'technical' | 'report' | 'blog' | 'story' | 'academic' | 'business' | 'general';

export interface ContentLocation {
  paragraphIndex?: number;
  headingContext?: string;
  characterOffset?: number;
  nodeId?: string;
}

export interface VocabularySuggestion {
  id: string;
  originalWord: string;
  suggestedWord: string;
  definition: string;
  usageNote: string;
  location: ContentLocation;
  relevanceScore: number;
}

export interface GrammarIssue {
  id: string;
  type: 'grammar' | 'spelling' | 'style' | 'punctuation';
  problematicText: string;
  explanation: string;
  correction: string;
  location: ContentLocation;
  severity: 'error' | 'warning' | 'suggestion';
}

export interface ContextualSuggestion {
  id: string;
  text: string;
  type: 'addition' | 'expansion' | 'clarification' | 'example';
  location: ContentLocation;
  contextPreview: string;
  relevanceScore: number;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  legend?: boolean;
  dataKey?: string;
  xKey?: string;
  yKey?: string;
}

export interface ChartData {
  id: string;
  type: ChartType;
  data: ChartDataPoint[];
  config: ChartConfig;
  location: ContentLocation;
}

// Main workflow state interface
export interface WorkflowState {
  sessionId: string;
  prompt: string;
  userInputs: MultimodalInput[];
  needsSearch: boolean;
  searchResults: SearchResult[];
  pendingApproval?: ApprovalRequestData;
  generatedContent: string;
  graphs: GraphData[];
  formattedContent: any; // TipTap JSON format
  status: WorkflowStatus;
  error?: string;
  metadata: {
    startTime: number;
    endTime?: number;
    nodeHistory: string[];
    [key: string]: any; // Allow additional metadata fields
  };
}

// Enhanced workflow state interface
export interface EnhancedWorkflowState {
  sessionId: string;
  prompt: string;
  contentType: ContentType;
  userInputs: MultimodalInput[];
  needsSearch: boolean;
  searchResults: SearchResult[];
  generatedContent: string;
  charts: ChartData[];
  status: WorkflowStatus;
  error?: string;
  metadata: {
    startTime: number;
    endTime?: number;
    nodeHistory: string[];
    [key: string]: any; // Allow additional metadata fields
  };
}

// Node result types
export interface NodeResult {
  success: boolean;
  data?: any;
  error?: string;
  nextNode?: string;
}

// Configuration for the workflow
export interface WorkflowConfig {
  maxSearchResults: number;
  approvalTimeout: number; // milliseconds
  llmModel: string;
  temperature: number;
}
