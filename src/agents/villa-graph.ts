import { StateGraph } from "@langchain/langgraph";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import { StateAnnotation, GraphState } from "../lib/langgraph/state.js";
import { retrieveDocuments } from "./nodes/retrieveDocuments.js";
import { generateResponse } from "./nodes/generateResponse.js";
import { gradeDocuments } from "./nodes/gradeDocuments.js";
import { reformulateQuery } from "./nodes/reformulateQuery.js";
import { handleGreeting } from "./nodes/handleGreeting.js";

// Explicitly type all node names for StateGraph
// This resolves TypeScript edge typing errors
// __start__ and __end__ are always required
// Add all your custom node names

type NodeNames = "__start__" | "__end__" | "retrieveDocuments" | "gradeDocuments" | "reformulateQuery" | "generateResponse" | "handleGreeting";

export function createVillaGraph(config: { checkpointer: BaseCheckpointSaver<number> }) {
  // Explicitly type the StateGraph with your node names
  const graph = new StateGraph<typeof StateAnnotation.spec, GraphState, string, NodeNames>(StateAnnotation);
  
  // Add all the nodes to our graph
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("retrieveDocuments", retrieveDocuments);
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("gradeDocuments", gradeDocuments);
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("reformulateQuery", reformulateQuery);
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("generateResponse", generateResponse);
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("handleGreeting", handleGreeting);
  
  // Set the entry point using __start__
  graph.addEdge("__start__", "retrieveDocuments");
  
  // Add conditional edge based on document quality and greeting detection
  graph.addConditionalEdges(
    "gradeDocuments",
    (state: GraphState) => {
      console.log("[villa-graph] Grading documents, quality:", state.documentQuality, "isGreeting:", state.isGreeting);
      if (state.isGreeting) {
        return "handleGreeting";
      }
      if (state.documentQuality === undefined) {
        console.warn("[villa-graph] documentQuality is undefined, defaulting to reformulateQuery");
        return "reformulateQuery";
      }
      return state.documentQuality > 0.7 ? "generateResponse" : "reformulateQuery";
    },
    {
      generateResponse: "generateResponse",
      reformulateQuery: "reformulateQuery",
      handleGreeting: "handleGreeting"
    }
  );
  
  graph.addEdge("reformulateQuery", "retrieveDocuments");
  graph.addEdge("retrieveDocuments", "gradeDocuments");
  graph.addEdge("generateResponse", "__end__");
  graph.addEdge("handleGreeting", "__end__");
  
  // Compile the graph
  return graph.compile(config);
} 