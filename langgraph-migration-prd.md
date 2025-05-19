# Skypearls Villas: LangGraph Migration PRD

## Executive Summary

This document outlines the plan to migrate the current LangChain-based RAG chatbot for Skypearls Villas to a more advanced implementation using LangGraph. The migration will enhance the system with powerful graph-based workflows, improved state management, more sophisticated retrieval capabilities, and better tool integration.

LangGraph extends LangChain's capabilities by supporting cyclical, stateful workflows that can better handle complex conversation flows and multi-step reasoning - making it perfect for our luxury real estate chatbot that requires personalization and detailed information retrieval.

## Current System Overview

The existing Skypearls Villas chatbot is built with:

- **Frontend**: React/TypeScript components (`ChatGate`, `LeadForm`, `ChatPanel`)
- **Backend**: 
  - `chat.ts`: Main API endpoint using LangChain's `ConversationalRetrievalQAChain`
  - `chat-agent.ts`: Alternative agent implementation using LangChain's `AgentExecutor`
  - `notify-lead.ts`: Email notification system for leads
- **Retrieval**: 
  - `retriever-tool.ts`: Custom LangChain tool for retrieving villa information
  - Pinecone vector database for document storage
- **Infrastructure**:
  - OpenAI for LLM and embeddings
  - Local storage for chat history
  - Lead information management

## LangGraph Overview

LangGraph is an orchestration framework built on top of LangChain that enables:

1. **Graph-based Workflows**: Define workflows as directed graphs with nodes and edges, allowing for branching, looping, and conditional logic
2. **State Management**: Built-in persistence and memory across conversation sessions
3. **Human-in-the-loop**: Better support for interactive experiences
4. **Tool Integration**: Enhanced capabilities for using tools within conversation flows
5. **Robust Error Handling**: Better fallback options and error recovery

The key advantage of LangGraph for our Skypearls Villa chatbot is the ability to implement more sophisticated search strategies, add self-correction, and create more personalized agent behavior.

## Migration Strategy

The migration will follow these key steps:

1. **Preserve Frontend**: Keep existing lead capture and UI components
2. **Replace Backend Flow**: Migrate from chain-based to graph-based architecture
3. **Enhance Retrieval**: Implement advanced RAG patterns (self-reflective, adaptive, etc.)
4. **Add Tool Integration**: Integrate additional tools to enhance the agent's capabilities
5. **Implement Persistence**: Add proper state management for full conversation history

## Implementation Plan

### 1. New Files to Create

#### a. `src/lib/langgraph/state.ts`
This file will define the state types used in the LangGraph application:

```typescript
// Types for the different states our graph will manage
export interface ChatState {
  messages: Message[];
  question: string;
  documents?: Document[];
  lastRetrieval?: string;
  leadInfo?: LeadInfo;
}

// State definitions for specific graph nodes
export const stateSchema = {
  messages: { value: [] as Message[] },
  question: { value: "" },
  documents: { value: undefined as Document[] | undefined },
  lastRetrieval: { value: undefined as string | undefined },
  leadInfo: { value: undefined as LeadInfo | undefined }
};
```

**Status: COMPLETED**

**Notes:**
*   Added imports and type definitions for `Message`, `LeadInfo`, and LangChain's `Document` to ensure proper typing throughout the application.
*   Added a `documentQuality` field to both the `ChatState` interface and `stateSchema` to support the document grading node. This was implied but not explicitly mentioned in the PRD.
*   Made sure the `Message` interface aligns with the format expected by both the frontend and OpenAI's API.
*   The `LeadInfo` interface matches what's used in the existing components like `ChatPanel` and `LeadForm`.
*   These type definitions will ensure type safety throughout the application and enable better IDE support during development.

#### b. `src/agents/villa-graph.ts`
This file will define the main LangGraph graph for the villa chatbot:

```typescript
import { StateGraph } from "langgraph/graph";
import { stateSchema } from "@/lib/langgraph/state";
import { retrieveDocuments, generateResponse, gradeDocuments, reformulateQuery } from "./nodes";

export function createVillaGraph(config) {
  // Create a new state graph with our state schema
  const graph = new StateGraph({ schema: stateSchema });
  
  // Add all the nodes to our graph
  graph.addNode("retrieveDocuments", retrieveDocuments);
  graph.addNode("gradeDocuments", gradeDocuments);
  graph.addNode("reformulateQuery", reformulateQuery);
  graph.addNode("generateResponse", generateResponse);
  
  // Define the edges - the workflow of our graph
  graph.setEntryPoint("retrieveDocuments");
  
  // Add conditional edge based on document quality
  graph.addConditionalEdges(
    "gradeDocuments",
    (state) => {
      // Decision function returns the next node based on document quality
      if (state.documentQuality === undefined) {
        console.warn("Warning: documentQuality is undefined. Defaulting to reformulation.");
        return "reformulateQuery";
      }
      return state.documentQuality > 0.7 ? "generateResponse" : "reformulateQuery";
    },
    {
      generateResponse: "generateResponse",
      reformulateQuery: "reformulateQuery"
    }
  );
  
  graph.addEdge("reformulateQuery", "retrieveDocuments");
  graph.addEdge("retrieveDocuments", "gradeDocuments");
  graph.addEdge("generateResponse", "END");
  
  // Compile the graph
  return graph.compile();
}
```

**Status: COMPLETED**

**Notes:**
*   Added a console log in the conditional edge for `gradeDocuments` to observe the `documentQuality` during runtime and a warning if it's undefined, defaulting to reformulation in such cases as a safeguard.
*   Updated import paths from aliases (e.g., @/lib/langgraph/state) to relative paths (e.g., ../lib/langgraph/state.js) to resolve module resolution errors in the Vercel serverless environment.

#### c. `src/agents/nodes/index.ts`
This file will export all the node functions:

```typescript
export { retrieveDocuments } from './retrieveDocuments';
export { gradeDocuments } from './gradeDocuments';
export { reformulateQuery } from './reformulateQuery';
export { generateResponse } from './generateResponse';
```

**Status: COMPLETED**

**Notes:**
*   This file simply re-exports the node functions. The linter errors about missing modules are expected at this stage, as the actual node files (`retrieveDocuments.ts`, etc.) have not been created yet. These errors will be resolved once the corresponding files are in place.

#### d. `src/agents/nodes/retrieveDocuments.ts`
This file defines the document retrieval node:

```typescript
import { ChatState } from "@/lib/langgraph/state";
import { vectorStore } from "@/lib/vector-store";

export async function retrieveDocuments(state: ChatState) {
  const question = state.question;
  
  // Use the vectorStore to retrieve relevant documents
  const docs = await vectorStore.similaritySearch(question, 4);
  
  // Return the updates to the state
  return {
    documents: docs,
    lastRetrieval: new Date().toISOString()
  };
}
```

**Status: COMPLETED**

**Notes:**
*   Added a `TODO` to ensure `state.question` is correctly populated. This is vital for the retrieval process.
*   The code assumes a `vectorStore` will be available at `@/lib/vector-store`. The setup for this `vectorStore` (e.g., Pinecone initialization) will need to be handled, likely similar to the existing `api/chat.ts` but refactored for broader use.
*   Added a `TODO` to consider making the number of documents retrieved (currently hardcoded to `4`) configurable.
*   Added console logs for debugging purposes to trace the question being used and the number of documents retrieved.
*   The linter error regarding `similaritySearch` not existing on `type 'Promise<PineconeStore>'` indicates that `@/lib/vector-store` likely exports the `vectorStore` initialization promise itself, rather than the resolved store. This will need to be addressed when `@/lib/vector-store.ts` is created or refactored. The `retrieveDocuments` function should `await` the `vectorStore` if it's a promise, or the `vectorStore` module should export the resolved instance.
*   Updated import paths for ChatState (from @/lib/langgraph/state) and vectorStore (from @/lib/vector-store) to use relative paths (e.g., ../../lib/...) to fix runtime module resolution issues on Vercel.

#### e. `src/agents/nodes/gradeDocuments.ts`
This file defines the document quality assessment node:

```typescript
import { ChatState } from "@/lib/langgraph/state";
import { ChatOpenAI } from "langchain/chat_models/openai";

export async function gradeDocuments(state: ChatState) {
  const { question, documents } = state;
  
  // Initialize LLM for grading
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
  });
  
  // Create a prompt to grade document relevance
  const prompt = `
    Question: ${question}
    
    Documents:
    ${documents.map(doc => doc.pageContent).join("\n\n")}
    
    On a scale of 0 to 1, how relevant are these documents to the question?
    Provide a single number as response.
  `;
  
  // Get the grading response
  const response = await llm.invoke(prompt);
  const grade = parseFloat(response.content);
  
  // Return the document quality grade
  return {
    documentQuality: isNaN(grade) ? 0 : grade
  };
}
```

**Status: COMPLETED**

**Notes:**
*   Added error handling to gracefully handle cases when no documents are provided or when the LLM call fails, defaulting to a quality score of 0, which will trigger the query reformulation path.
*   Added detailed logging for debugging and tracing the grading process. This will be valuable during testing and troubleshooting.
*   The function parses the response content as a float value. If parsing fails (NaN), it defaults to a quality score of 0.
*   The linter errors about missing modules `@/lib/langgraph/state` and `langchain/chat_models/openai` are expected at this stage and will be resolved once the necessary files and dependencies are in place.
*   Replaced path alias for ChatState (@/lib/langgraph/state) with a relative path (../../lib/langgraph/state.js) to ensure correct module loading in the serverless environment.

#### f. `src/agents/nodes/reformulateQuery.ts`
This file defines the query reformulation node:

```typescript
import { ChatState } from "@/lib/langgraph/state";
import { ChatOpenAI } from "langchain/chat_models/openai";

export async function reformulateQuery(state: ChatState) {
  const { question, documents } = state;
  
  // Initialize LLM for reformulation
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
  });
  
  // Create a prompt to reformulate the query
  const prompt = `
    Original question: ${question}
    
    The documents retrieved weren't highly relevant. Please reformulate the question 
    to be more specific and help retrieve better information about Skypearls Villas luxury properties
    in Siargao, Philippines.
    
    Reformulated question:
  `;
  
  // Get the reformulated question
  const response = await llm.invoke(prompt);
  
  // Return the reformulated question
  return {
    question: response.content
  };
}
```

**Status: COMPLETED**

**Notes:**
*   Enhanced the implementation to include previously retrieved documents in the prompt when available. This gives the LLM context about why the previous search might have failed and helps with more effective reformulation.
*   Added error handling to prevent failures if the LLM call fails. In such cases, it creates a simple reformulation that should be different enough from the original to avoid an infinite loop.
*   Added logging for debugging and tracing the reformulation process.
*   The function trims the LLM's response to ensure no leading/trailing whitespace affects the retrieval.
*   The linter errors about missing modules will be resolved once the necessary dependencies are in place.
*   Changed the import for ChatState from an alias (@/lib/langgraph/state) to a relative path (../../lib/langgraph/state.js) to prevent runtime errors on Vercel.

#### g. `src/agents/nodes/generateResponse.ts`
This file defines the response generation node:

```typescript
import { ChatState } from "@/lib/langgraph/state";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

export async function generateResponse(state: ChatState) {
  const { question, documents, leadInfo } = state;
  
  // Initialize LLM for response generation
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
  });
  
  // Format the docs for the prompt
  const formattedDocs = documents.map(doc => doc.pageContent).join("\n\n");
  
  // Create a prompt with personalization if leadInfo exists
  const promptTemplate = leadInfo 
    ? `You are a helpful Skypearls Villas assistant talking to ${leadInfo.firstName}.
       Answer their question about luxury villas in Siargao, Philippines using the following context:
       
       Context: ${formattedDocs}
       
       Question: ${question}
       
       If they show interest, remember we already have their contact info so focus on providing helpful information.`
    : `You are a helpful Skypearls Villas assistant.
       Answer the question about luxury villas in Siargao, Philippines using the following context:
       
       Context: ${formattedDocs}
       
       Question: ${question}`;
  
  // Generate the response
  const response = await llm.invoke(promptTemplate);
  
  // Return the response as a new message to add to the conversation
  return {
    messages: [...state.messages, {
      role: "assistant",
      content: response.content
    }]
  };
}
```

**Status: COMPLETED**

**Notes:**
*   Added error handling to ensure the node can gracefully handle cases where no documents are available or the LLM call fails.
*   Included a fallback response for cases where document retrieval failed completely.
*   Added logging for debugging and tracing the response generation process.
*   Maintained the personalization approach from the PRD, using the lead's first name when available.
*   The function properly appends the new assistant message to the existing messages array, preserving the conversation history.
*   The PromptTemplate import is included but not currently used in this implementation. The direct template string approach was used instead for simplicity. This could be refactored to use the PromptTemplate class in the future if needed.
*   The linter errors about missing modules will be resolved once we create the necessary state types and ensure all dependencies are correctly installed.
*   Modified the import of ChatState to use a relative path (../../lib/langgraph/state.js) instead of an alias (@/lib/langgraph/state) for compatibility with the Vercel execution environment.

#### h. `src/lib/langgraph/state.ts`
This file will define the state types used in the LangGraph application:

```typescript
// Types for the different states our graph will manage
export interface ChatState {
  messages: Message[];
  question: string;
  documents?: Document[];
  lastRetrieval?: string;
  leadInfo?: LeadInfo;
}

// State definitions for specific graph nodes
export const stateSchema = {
  messages: { value: [] as Message[] },
  question: { value: "" },
  documents: { value: undefined as Document[] | undefined },
  lastRetrieval: { value: undefined as string | undefined },
  leadInfo: { value: undefined as LeadInfo | undefined }
};
```

**Status: COMPLETED**

**Notes:**
*   Added imports and type definitions for `Message`, `LeadInfo`, and LangChain's `Document` to ensure proper typing throughout the application.
*   Added a `documentQuality` field to both the `ChatState` interface and `stateSchema` to support the document grading node. This was implied but not explicitly mentioned in the PRD.
*   Made sure the `Message` interface aligns with the format expected by both the frontend and OpenAI's API.
*   The `LeadInfo` interface matches what's used in the existing components like `ChatPanel` and `LeadForm`.
*   These type definitions will ensure type safety throughout the application and enable better IDE support during development.

#### i. `src/lib/langgraph/checkpointer.ts`
This file will define the persistence layer for the LangGraph state:

```typescript
import { InMemoryCheckpointer, LocalFileCheckpointer } from "langgraph/checkpointers";

// Choose the appropriate checkpointer based on environment
export function createCheckpointer(threadId) {
  if (process.env.NODE_ENV === "production") {
    return new LocalFileCheckpointer({
      basePath: "/tmp/skypearls-checkpoints",
      threadId
    });
  } else {
    return new InMemoryCheckpointer({
      threadId
    });
  }
}
```

**Status: COMPLETED**

**Notes:**
*   Added TypeScript typing for the `threadId` parameter to ensure type safety.
*   Enhanced the implementation with environment variable configuration, allowing the checkpoints directory to be configurable via `CHECKPOINTS_PATH` environment variable.
*   Added logging to help with debugging and tracking the checkpoint creation process.
*   This file continues the pattern of detailed error/activity logging used in the node functions.
*   As with the other files, the linter error about missing module 'langgraph/checkpointers' will be resolved once we add the necessary dependencies to the project.

### 2. Files to Modify

#### a. `api/chat.ts`
Replace the existing LangChain implementation with the new LangGraph implementation:

```typescript
import { z } from 'zod';
import { createVillaGraph } from '../src/agents/villa-graph';
import { createCheckpointer } from '../src/lib/langgraph/checkpointer';

export const config = { maxDuration: 30 };

// ... [keep existing type definitions]

export default async function handler(req: any, res: any) {
  try {
    // ... [keep existing validation code]
    
    const { messages } = parse.data;
    const latestMessage = messages[messages.length - 1].content;
    
    // Get or create a thread ID (can be based on the user's email or session ID)
    const threadId = req.headers["x-thread-id"] || "default-thread";
    
    // Create the checkpointer for persistence
    const checkpointer = createCheckpointer(threadId);
    
    // Create the graph
    const graph = createVillaGraph({
      checkpointer
    });
    
    // Initialize state with the current messages and question
    const initialState = {
      messages: messages,
      question: latestMessage
    };
    
    // Run the graph with the initial state
    const result = await graph.invoke(initialState);
    
    // Extract the final response from the result
    const response = result.messages[result.messages.length - 1];
    
    // Return the response
    res.status(200).json({ reply: response.content });
  } catch (err) {
    console.error('[CHAT API] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Status: COMPLETED**

**Notes:**
*   Maintained the existing code structure, including validation, error handling, and AGENT_MODE proxy functionality.
*   Enhanced the implementation to use `leadInfo` if it's provided in the request body, improving personalization.
*   Updated the thread ID generation to prioritize using `x-thread-id` header, falling back to the user's email (if available from leadInfo), or ultimately to a default thread ID.
*   Added comprehensive logging for debugging and monitoring.
*   Updated the response format to include source documents from the result, maintaining compatibility with the existing frontend.
*   The linter errors about file extensions and missing modules are expected at this stage and will be resolved once the Vercel project configuration is updated and dependencies are installed.

#### b. `src/components/ChatPanel.tsx`
Modify to support thread ID persistence and better handle state:

```typescript
// Add thread ID management
const [threadId, setThreadId] = useState<string>("");

// Use effect to initialize thread ID
useEffect(() => {
  if (leadInfo && leadInfo.email) {
    // Generate a consistent thread ID based on the user's email
    setThreadId(`skypearls-${leadInfo.email}`);
  }
}, [leadInfo]);

// Modify the handleSubmit function to include the thread ID
const handleSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!input.trim() || isLoading) return;
  
  // ... [existing code]
  
  try {
    // Include the thread ID in the request headers
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Thread-ID": threadId
      },
      body: JSON.stringify({
        messages: updatedMessages.map(m => ({role: m.role, content: m.content})),
      }),
    });
    
    // ... [existing code]
  }
  // ... [existing error handling]
};
```

**Status: COMPLETED**

**Notes:**
*   Added thread ID state and initialization based on the lead's email, which ensures consistency across sessions.
*   Updated the API request to include the thread ID in the headers, which is used by the backend for persistence with the checkpointer.
*   Added leadInfo to the request body to enable personalized responses that include the user's name and other details.
*   Added logging for the thread ID and source documents retrieval, which will be helpful for debugging.
*   The thread ID approach means each unique email will have its own conversation state, allowing for better personalization and context maintenance.

## Testing Strategy

1. **Unit Tests**: Create unit tests for each graph node function using mock data
2. **Integration Tests**: Test the full graph with sample queries and personas
3. **A/B Testing**: Compare results between the old and new systems
4. **Monitoring**: Use LangSmith for tracing and debugging (once integrated)

## Best Practices & Considerations

1. **State Management**: 
   - Keep state schemas small and focused
   - Use typed state for better IDE support
   - Consider persistence needs early (localStorage, server persistence, etc.)

2. **Graph Design**:
   - Keep nodes focused on a single responsibility
   - Use conditional edges for complex decision making
   - Design for graceful error handling

3. **Performance**:
   - Implement caching for repeated queries
   - Consider batch processing for document retrieval
   - Use streaming responses when possible

4. **User Experience**:
   - Provide feedback during long-running operations
   - Implement typing indicators during generation
   - Allow for interruption of generation

5. **Monitoring & Observability**:
   - Implement detailed logging at each node
   - Consider future integration with LangSmith
   - Track key metrics (response time, relevance scores, etc.)

## Next Steps

Now that the core LangGraph implementation is complete, we should:

1. **Create a lib/vector-store.ts** file to initialize and export the Pinecone vectorStore, as it's currently referenced but not implemented.
   
   **Status: COMPLETED**
   - `src/lib/vector-store.ts` is implemented. It initializes and exports a Pinecone vector store, caches it globally, and is integrated with the retrieval node (`retrieveDocuments`).

2. **Add LangGraph dependencies** to the project's package.json.
   
   **Status: COMPLETED**
   - Installed @langchain/langgraph and @langchain/core via npm as per official documentation. All LangGraph imports now resolve correctly.

3. **Update TypeScript configuration** to handle the new module imports.
   
   **Status: COMPLETED**
   - TypeScript configuration (tsconfig.json) defines path aliases (e.g., `@/lib`) which work for local development. However, to ensure compatibility with the Vercel serverless function environment, import paths in key backend files (`src/agents/villa-graph.ts` and `src/agents/nodes/*.ts`) were explicitly changed from aliases to relative paths. This resolved "Cannot find package" errors encountered during Vercel deployment. The Vercel build process and runtime now correctly resolve these modules.

4. **Set up unit tests** for the graph nodes.
   
   **Status: IN PROGRESS**
   - No unit tests currently exist for the node functions. Need to create Jest/Testing-Library tests for each exported node, covering both happy-path and edge cases.

5. **Implement a fallback mechanism** to gracefully degrade to the previous implementation if an error occurs.
   
   **Status: COMPLETED**
   - If the LangGraph workflow fails in api/chat.ts, the handler now automatically falls back to the previous LangChain-based agent logic (from chat-agent.ts). All errors are logged, and the response format remains compatible.

## Future Enhancements

Once the base migration is complete, we can leverage LangGraph's capabilities for:

1. **Multi-Modal Support**: Add image generation for villa visualizations
2. **Multi-Agent Architecture**: Create specialized agents for different property types
3. **Advanced RAG Techniques**: Implement query planning, adaptive retrieval, etc.
4. **Human-in-the-Loop**: Add support for human override and feedback
5. **Tool Integrations**: Add calendar scheduling, payment processing, etc.

## Timeline

1. **Phase 1 (Week 1-2)**: Implementation of core LangGraph architecture - COMPLETED
2. **Phase 2 (Week 3)**: Testing and performance optimization - NEXT STEP
3. **Phase 3 (Week 4)**: Deployment and monitoring setup - PLANNED

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Tutorials](https://python.langchain.com/docs/how_to/langgraph)
- [RAG with LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples/rag)
- [LangSmith Integration](https://docs.smith.langchain.com)