import { StateGraph } from "@langchain/langgraph";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import { StateAnnotation, GraphState, StreamingConfig } from "../lib/langgraph/state.js";
import { retrieveDocuments } from "./nodes/retrieveDocuments.js";
import { generateResponse } from "./nodes/generateResponse.js";
import { gradeDocuments } from "./nodes/gradeDocuments.js";
import { reformulateQuery } from "./nodes/reformulateQuery.js";
import { handleGreeting } from "./nodes/handleGreeting.js";
import { handleBooking } from "./nodes/handleBooking.js";
import { handleImageRequest } from "./nodes/handleImageRequest.js";

// Explicitly type all node names for StateGraph
// This resolves TypeScript edge typing errors
// __start__ and __end__ are always required
// Add all your custom node names

type NodeNames = "__start__" | "__end__" | "retrieveDocuments" | "gradeDocuments" | "reformulateQuery" | "generateResponse" | "handleGreeting" | "handleBooking" | "handleImageRequest";

// Updated config interface to support streaming
interface VillaGraphConfig {
  checkpointer: BaseCheckpointSaver<number>;
  streaming?: boolean;
  onToken?: (token: string, messageId?: string) => void;
}

export function createVillaGraph(config: VillaGraphConfig) {
  // Explicitly type the StateGraph with your node names
  const graph = new StateGraph<typeof StateAnnotation.spec, GraphState, string, NodeNames>(StateAnnotation);
  
  // Store streaming config globally for use in nodes
  if (config.streaming && config.onToken) {
    const streamingConfig: StreamingConfig = {
      enabled: true,
      onToken: config.onToken,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Store in global context for nodes to access
    (globalThis as any)._streamingConfig = streamingConfig;
  }
  
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
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("handleBooking", handleBooking);
  // @ts-expect-error - LangGraph node typing incompatibility with current library version
  graph.addNode("handleImageRequest", handleImageRequest);
  
  // Set the entry point using __start__
  graph.addEdge("__start__", "retrieveDocuments");
  
  // Add conditional edge based on document quality, greeting detection, and booking intent
  graph.addConditionalEdges(
    "gradeDocuments",
    (state: GraphState) => {
      console.log("[villa-graph] Grading result - quality:", state.documentQuality, 
                  "isGreeting:", state.isGreeting, "isBookingIntent:", state.isBookingIntent,
                  "showImages:", state.showImages, "streaming:", state.streaming?.enabled);
      
      // Check for greeting intent first
      if (state.isGreeting) {
        return "handleGreeting";
      }
      
      // Check for booking intent second
      if (state.isBookingIntent) {
        return "handleBooking";
      }
      
      // Check for image requests third
      if (state.showImages) {
        return "handleImageRequest";
      }
      
      // Default document quality check
      if (state.documentQuality === undefined) {
        console.warn("[villa-graph] documentQuality is undefined, defaulting to reformulateQuery");
        return "reformulateQuery";
      }
      return state.documentQuality > 0.7 ? "generateResponse" : "reformulateQuery";
    },
    {
      generateResponse: "generateResponse",
      reformulateQuery: "reformulateQuery",
      handleGreeting: "handleGreeting",
      handleBooking: "handleBooking",
      handleImageRequest: "handleImageRequest"
    }
  );
  
  graph.addEdge("reformulateQuery", "retrieveDocuments");
  graph.addEdge("retrieveDocuments", "gradeDocuments");
  graph.addEdge("generateResponse", "__end__");
  graph.addEdge("handleGreeting", "__end__");
  graph.addEdge("handleBooking", "__end__");
  graph.addEdge("handleImageRequest", "__end__");
  
  // Compile the graph
  return graph.compile({ checkpointer: config.checkpointer });
} 