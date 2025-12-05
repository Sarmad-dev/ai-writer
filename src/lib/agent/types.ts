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
