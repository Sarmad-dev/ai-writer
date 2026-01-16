import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import type {
  WorkflowConfig,
  EnhancedWorkflowState,
} from "./types";
import { analyzePromptEnhancedNode } from "./nodes/analyze-prompt-enhanced";
import { webSearchNode } from "./nodes/web-search";
import { generateContentNode } from "./nodes/generate-content";
import { saveNode } from "./nodes/save";

// Default workflow configuration
export const defaultWorkflowConfig: WorkflowConfig = {
  maxSearchResults: 5,
  approvalTimeout: 300000, // 5 minutes (deprecated, kept for backward compatibility)
  llmModel: "gpt-5.1",
  temperature: 0.7,
};

// Enhanced workflow state annotation for LangGraph
export const EnhancedWorkflowStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>,
  prompt: Annotation<string>,
  contentType: Annotation<string>,
  userInputs: Annotation<any[]>,
  needsSearch: Annotation<boolean>,
  searchResults: Annotation<any[]>,
  generatedContent: Annotation<string>,
  charts: Annotation<any[]>,
  status: Annotation<string>,
  error: Annotation<string | undefined>,
  metadata: Annotation<any>,
});

// Create the enhanced workflow graph (no approval, with new nodes)
export function createEnhancedWorkflow(
  config: WorkflowConfig = defaultWorkflowConfig
) {
  // Define the state graph with enhanced state annotation
  const workflow = new StateGraph(EnhancedWorkflowStateAnnotation);

  // Add nodes to the workflow
  workflow.addNode("analyze", analyzePromptEnhancedNode);
  workflow.addNode("search", webSearchNode);
  workflow.addNode("generate", generateContentNode);
  workflow.addNode("save", saveNode);

  // Use type assertion to work around LangGraph's strict typing
  const graph = workflow as any;

  // Define the workflow edges and conditional routing
  graph.addEdge(START, "analyze");

  // After analyze, decide if we need search
  graph.addConditionalEdges(
    "analyze",
    (state: EnhancedWorkflowState) => {
      if (state.error) return "end";
      return state.needsSearch ? "search" : "generate";
    },
    {
      search: "search",
      generate: "generate",
      end: END,
    }
  );

  // After search, go directly to generate
  graph.addEdge("search", "generate");

  // After generate, save the content
  graph.addEdge("generate", "save");

  // After save, end the workflow
  graph.addEdge("save", END);

  // Compile the workflow
  return graph.compile();
}

// Helper function to create enhanced initial state
export function createEnhancedInitialState(
  sessionId: string,
  prompt: string,
  userInputs: EnhancedWorkflowState["userInputs"] = []
): EnhancedWorkflowState {
  return {
    sessionId,
    prompt,
    contentType: "general",
    userInputs,
    needsSearch: false,
    searchResults: [],
    generatedContent: "",
    charts: [],
    status: "idle",
    error: undefined,
    metadata: {
      startTime: Date.now(),
      nodeHistory: [],
    },
  };
}

// Helper function to execute the enhanced workflow
export async function executeEnhancedWorkflow(
  sessionId: string,
  prompt: string,
  userInputs: EnhancedWorkflowState["userInputs"] = [],
  config?: WorkflowConfig
) {
  const workflow = createEnhancedWorkflow(config);
  const initialState = createEnhancedInitialState(
    sessionId,
    prompt,
    userInputs
  );

  try {
    const result = await workflow.invoke(initialState);
    return result;
  } catch (error) {
    console.error("Enhanced workflow execution error:", error);
    throw error;
  }
}

// Helper function to stream enhanced workflow execution
export async function* streamEnhancedWorkflow(
  sessionId: string,
  prompt: string,
  userInputs: EnhancedWorkflowState["userInputs"] = [],
  config?: WorkflowConfig
) {
  const workflow = createEnhancedWorkflow(config);
  const initialState = createEnhancedInitialState(
    sessionId,
    prompt,
    userInputs
  );

  try {
    const stream = await workflow.stream(initialState);
    for await (const chunk of stream) {
      // LangGraph streams chunks with node names as keys
      // Extract the actual state from the chunk
      console.log("[streamEnhancedWorkflow] Chunk keys:", Object.keys(chunk));

      // Get the first (and usually only) value from the chunk
      const nodeOutput = Object.values(chunk)[0];

      if (nodeOutput && typeof nodeOutput === "object") {
        // Yield the node output as EnhancedWorkflowState
        yield nodeOutput as EnhancedWorkflowState;
      }
    }
  } catch (error) {
    console.error("Enhanced workflow streaming error:", error);
    throw error;
  }
}
