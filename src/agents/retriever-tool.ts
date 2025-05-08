import { z } from 'zod';
import { StructuredTool } from 'langchain/tools';
import { vectorStore } from '../lib/vector-store.js';

/**
 * Tool for retrieving relevant villa information from the vector store
 * This tool wraps the existing Pinecone retriever functionality
 */
export class RetrieverTool extends StructuredTool {
  name = 'villa_rag_search';
  description = 'Returns relevant villa context paragraphs for a user question';
  schema = z.object({
    question: z.string().describe('The user question to search for relevant villa information')
  });

  constructor() {
    super();
  }

  async _call({ question }: z.infer<typeof this.schema>): Promise<string> {
    try {
      // Await the vectorStore promise to get the actual store instance
      const store = await vectorStore;
      
      // Use similarity search to find relevant documents
      const docs = await store.similaritySearch(question, 4);
      
      // Format the results as a string with separators
      return docs.map(d => d.pageContent).join('\n---\n');
    } catch (error) {
      console.error('[Retriever Tool] Error:', error);
      return 'Sorry, I encountered an error while searching for villa information.';
    }
  }
}

// Export a singleton instance of the tool
export const retrieverTool = new RetrieverTool(); 