// Explicitly configure the Node.js runtime for Vercel Serverless Functions <-- REMOVING as per Vercel guidance
// export const config = { runtime: 'nodejs' };
// // Use Vercel Edge runtime for lower latency <-- REMOVING this due to Node.js dependencies
// export const config = { runtime: 'edge' }; // <-- KEEP COMMENTED

export const config = { maxDuration: 30 };

import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from '@langchain/openai';

// --- Types ---
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});
const BodySchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
});

// --- Handler ---
export default async function handler(req: any, res: any) {
  try {
    // Load dotenv only once, inside the handler, for local dev
    if (process.env.NODE_ENV !== 'production' && !globalThis._envLoaded) {
      const dotenv = await import('dotenv');
      dotenv.config();
      globalThis._envLoaded = true;
      console.log('.env loaded for local development');
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    let body: unknown;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }

    const parse = BodySchema.safeParse(body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
      return;
    }
    const { messages } = parse.data;

    // --- Pinecone + LangChain global cache ---
    if (!globalThis._skypearlsVectorStore) {
      const pineconeApiKey = process.env.PINECONE_API_KEY;
      const pineconeEnv = process.env.PINECONE_ENV;
      const pineconeIndex = process.env.PINECONE_INDEX;
      if (!pineconeApiKey || !pineconeEnv || !pineconeIndex) {
        res.status(500).json({ error: 'Missing Pinecone configuration' });
        return;
      }
      // Pinecone client reads env vars for API key and environment
      const pinecone = new Pinecone();
      const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
      globalThis._skypearlsVectorStore = await PineconeStore.fromExistingIndex(
        embeddings,
        { pineconeIndex: pinecone.Index(pineconeIndex) }
      );
    }
    const vectorStore = globalThis._skypearlsVectorStore;

    // --- LangChain QA Chain ---
    const modelName = process.env.OPENAI_MODEL;
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('[CHAT API] Using model:', modelName);
    console.log('[CHAT API] Using OpenAI API key:', apiKey ? apiKey.slice(0, 8) + '...' : 'undefined');
    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelName,
      temperature: 0.2,
    });
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever({ k: 4 }),
      {
        returnSourceDocuments: false,
      }
    );

    // --- Run the chain ---
    const userMessages = messages.filter((m: ChatMessage) => m.role === 'user');
    const question = userMessages[userMessages.length - 1]?.content || '';
    const chatHistory = messages.slice(0, -1).map((m: ChatMessage) => [m.role, m.content]);
    const response = await chain.call({ question, chat_history: chatHistory });
    const reply = response.text || response.result || 'Sorry, I could not find an answer.';
    res.status(200).json({ reply });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[CHAT API] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
} 