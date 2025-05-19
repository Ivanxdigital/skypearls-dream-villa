import { ChatState } from "../../lib/langgraph/state.js";
import { getVectorStore } from "../../lib/vector-store.js";

export async function retrieveDocuments(state: ChatState) {
  // TODO: Ensure `state.question` is correctly populated from the input to the graph.
  const question = state.question;
  
  console.log("[retrieveDocuments] Retrieving documents for question:", question);

  const vectorStore = await getVectorStore();
  // Use the vectorStore to retrieve relevant documents
  // TODO: Make the number of documents (k=4) configurable if needed.
  const docs = await vectorStore.similaritySearch(question, 4);
  
  console.log("[retrieveDocuments] Retrieved", docs.length, "documents.");

  // Return the updates to the state
  return {
    documents: docs,
    lastRetrieval: new Date().toISOString()
  };
} 