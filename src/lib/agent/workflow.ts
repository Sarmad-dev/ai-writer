import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import type { WorkflowState, WorkflowConfig } from './types';
import { analyzePromptNode } from './nodes/analyze-prompt';
import { webSearchNode } from './nodes/web-search';
import { approvalNode } from './nodes/approval';
import { generateContentNode } from './nodes/generate-content';
import { graphGenerationNode } from './nodes/graph-generation';
import { formatContentNode } from './nodes/format-content';
import { saveNode } from './nodes/save';

// Default workflow configuration
export const defaultWorkflowConfig: WorkflowConfig = {
  maxSearchResults: 5,
  approvalTimeout: 300000, // 5 minutes
  llmModel: 'gpt-4-turbo-preview',
  temperature: 0.7,
};

// Define state annotation for LangGraph
const WorkflowStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>,
  prompt: Annotation<string>,
  userInputs: Annotation<any[]>,
  needsSearch: Annotation<boolean>,
  searchResults: Annotation<any[]>,
  pendingApproval: Annotation<any>,
  generatedContent: Annotation<string>,
  graphs: Annotation<any[]>,
  formattedContent: Annotation<any>,
  status: Annotation<string>,
  error: Annotation<string | undefined>,
  metadata: Annotation<any>,
});

// Create the workflow graph
export function createAgentWorkflow(config: WorkflowConfig = defaultWorkflowConfig) {
  // Define the state graph
  const workflow = new StateGraph(WorkflowStateAnnotation);

  // Add nodes to the workflow
  workflow.addNode('analyze', analyzePromptNode);
  workflow.addNode('search', webSearchNode);
  workflow.addNode('approval', approvalNode);
  workflow.addNode('generate', generateContentNode);
  workflow.addNode('detectGraphs', graphGenerationNode);
  workflow.addNode('format', formatContentNode);
  workflow.addNode('save', saveNode);

  // Use type assertion to work around LangGraph's strict typing
  const graph = workflow as any;

  // Define the workflow edges and conditional routing
  graph.addEdge(START, 'analyze');

  // After analyze, decide if we need search
  graph.addConditionalEdges(
    'analyze',
    (state: WorkflowState) => {
      if (state.error) return 'end';
      return state.needsSearch ? 'search' : 'generate';
    },
    {
      search: 'search',
      generate: 'generate',
      end: END,
    }
  );

  // After search, check if approval is needed
  graph.addConditionalEdges(
    'search',
    (state: WorkflowState) => {
      if (state.error) return 'end';
      return state.pendingApproval ? 'approval' : 'generate';
    },
    {
      approval: 'approval',
      generate: 'generate',
      end: END,
    }
  );

  // After approval, decide next step based on approval status
  graph.addConditionalEdges(
    'approval',
    (state: WorkflowState) => {
      if (state.error) return 'end';
      if (state.pendingApproval?.status === 'APPROVED') {
        return 'generate';
      } else if (state.pendingApproval?.status === 'REJECTED') {
        // Skip search and go directly to generate
        return 'generate';
      }
      return 'end';
    },
    {
      generate: 'generate',
      end: END,
    }
  );

  // After generate, detect if we need graphs
  graph.addEdge('generate', 'detectGraphs');

  // After graph detection, format the content
  graph.addEdge('detectGraphs', 'format');

  // After formatting, save to database
  graph.addEdge('format', 'save');

  // After save, end the workflow
  graph.addEdge('save', END);

  // Compile the workflow
  return graph.compile();
}

// Helper function to create initial state
export function createInitialState(
  sessionId: string,
  prompt: string,
  userInputs: WorkflowState['userInputs'] = []
): WorkflowState {
  return {
    sessionId,
    prompt,
    userInputs,
    needsSearch: false,
    searchResults: [],
    pendingApproval: undefined,
    generatedContent: '',
    graphs: [],
    formattedContent: null,
    status: 'idle',
    error: undefined,
    metadata: {
      startTime: Date.now(),
      nodeHistory: [],
    },
  };
}

// Helper function to execute the workflow
export async function executeWorkflow(
  sessionId: string,
  prompt: string,
  userInputs: WorkflowState['userInputs'] = [],
  config?: WorkflowConfig
) {
  const workflow = createAgentWorkflow(config);
  const initialState = createInitialState(sessionId, prompt, userInputs);

  try {
    const result = await workflow.invoke(initialState);
    return result;
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

// Helper function to stream workflow execution
export async function* streamWorkflow(
  sessionId: string,
  prompt: string,
  userInputs: WorkflowState['userInputs'] = [],
  config?: WorkflowConfig
) {
  const workflow = createAgentWorkflow(config);
  const initialState = createInitialState(sessionId, prompt, userInputs);

  try {
    const stream = await workflow.stream(initialState);
    for await (const chunk of stream) {
      // LangGraph streams chunks with node names as keys
      // Extract the actual state from the chunk
      console.log('[streamWorkflow] Chunk keys:', Object.keys(chunk));
      
      // Get the first (and usually only) value from the chunk
      const nodeOutput = Object.values(chunk)[0];
      
      if (nodeOutput && typeof nodeOutput === 'object') {
        // Yield the node output as WorkflowState
        yield nodeOutput as WorkflowState;
      }
    }
  } catch (error) {
    console.error('Workflow streaming error:', error);
    throw error;
  }
}
