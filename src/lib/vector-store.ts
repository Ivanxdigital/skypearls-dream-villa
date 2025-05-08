import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

// Define an interface for our custom global properties
interface CustomGlobalThis {
  _skypearlsVectorStore?: PineconeStore;
}

/**
 * Initialize and return the Pinecone vector store
 * Uses a global cache to avoid recreating the store on every request
 */
export async function getVectorStore(): Promise<PineconeStore> {
  // Check if we already have a cached instance
  if ((globalThis as CustomGlobalThis)._skypearlsVectorStore) {
    return (globalThis as CustomGlobalThis)._skypearlsVectorStore;
  }

  // Initialize a new vector store
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const pineconeEnv = process.env.PINECONE_ENV;
  const pineconeIndex = process.env.PINECONE_INDEX;
  
  if (!pineconeApiKey || !pineconeEnv || !pineconeIndex) {
    throw new Error('Missing Pinecone configuration');
  }
  
  // Pinecone client reads env vars for API key and environment
  const pinecone = new Pinecone();
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    { 
      pineconeIndex: pinecone.Index(pineconeIndex),
      namespace: "default",
    }
  );

  // Cache the vector store globally
  (globalThis as CustomGlobalThis)._skypearlsVectorStore = vectorStore;
  
  return vectorStore;
}

// Export a singleton promise that will resolve to the vector store
export const vectorStore = getVectorStore(); 