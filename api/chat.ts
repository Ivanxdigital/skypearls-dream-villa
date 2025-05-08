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
import { PromptTemplate } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";

// Define an interface for our custom global properties
// Simply define the shape we expect on globalThis directly
interface CustomGlobalThis {
  _envLoaded?: boolean;
  _skypearlsVectorStore?: PineconeStore;
}

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
  if (process.env.NEXT_PUBLIC_AGENT_MODE === "on") {
    // 🕵️‍♂️ chat-agent invoked via proxy
    const url = new URL(req.url!, `http://${req.headers.host}`);
    url.pathname = url.pathname.replace(/\/api\/chat$/, '/api/chat-agent');
    const cleanBody =
      typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {});
    const { 'content-length': _cl, ...proxyHeaders } = req.headers as any;
    const agentRes = await fetch(url.toString(), {
      method: req.method,
      headers: proxyHeaders,
      body: cleanBody,
      redirect: 'manual',
    });
    res.status(agentRes.status);
    agentRes.headers.forEach((value, key) => res.setHeader(key, value));
    if (agentRes.body) {
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(agentRes.body as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
    return;
  }

  try {
    // Load dotenv only once, inside the handler, for local dev
    if (process.env.NODE_ENV !== 'production' && !(globalThis as CustomGlobalThis)._envLoaded) {
      const dotenv = await import('dotenv');
      dotenv.config();
      (globalThis as CustomGlobalThis)._envLoaded = true;
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
    if (!(globalThis as CustomGlobalThis)._skypearlsVectorStore) {
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
      (globalThis as CustomGlobalThis)._skypearlsVectorStore = await PineconeStore.fromExistingIndex(
        embeddings,
        { 
          pineconeIndex: pinecone.Index(pineconeIndex),
          namespace: "default",
        }
      );
    }
    const vectorStore = (globalThis as CustomGlobalThis)._skypearlsVectorStore;

    if (!vectorStore) {
      // This should ideally not happen if the above logic is correct and Pinecone initializes
      throw new Error("Vector store not initialized after cache check.");
    }

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

    const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;
    const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(condenseQuestionTemplate);

    const qaTemplate = `You are a helpful Skypearls Villas assistant. Your job is to answer questions about the luxury villas in Siargao, Philippines.
Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
When customers show interest, encourage them to provide their name, email, and phone for a viewing.
Context:
{context}

Question: {question}
Helpful Answer:`;
    const QA_PROMPT = PromptTemplate.fromTemplate(qaTemplate);
    
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever({ k: 4 }),
      {
        memory: new BufferMemory({
          memoryKey: "chat_history", 
          inputKey: "question",
          outputKey: "text",
          returnMessages: true, 
        }),
        questionGeneratorChainOptions: {
          template: condenseQuestionTemplate,
        },
        qaChainOptions: {
          type: "stuff",
          prompt: QA_PROMPT,
        },
        returnSourceDocuments: true,
      }
    );

    // --- Run the chain ---
    // The user's last message is the "question"
    const question = messages[messages.length - 1].content;
    
    console.log('[CHAT API] Question to chain:', question);
    
    const response = await chain.call({ question });
    const reply = response.text || 'Sorry, I could not find an answer.';
    const sourceDocuments = response.sourceDocuments || [];
    
    console.log('[CHAT API] Response from chain:', reply);
    console.log('[CHAT API] Retrieved Source Documents Count:', sourceDocuments.length);
    sourceDocuments.forEach((doc: any, index: number) => {
      console.log(`[CHAT API] Doc ${index + 1}:`, doc.pageContent.substring(0, 100) + "...");
      console.log(`[CHAT API] Doc ${index + 1} Metadata:`, doc.metadata);
    });

    res.status(200).json({ reply, sourceDocuments });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[CHAT API] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
} 