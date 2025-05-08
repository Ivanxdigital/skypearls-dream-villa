// Explicitly configure the Node.js runtime for Vercel Serverless Functions <-- REMOVING as per Vercel guidance
// export const config = { runtime: 'nodejs' };
// // Use Vercel Edge runtime for lower latency <-- REMOVING this due to Node.js dependencies
// export const config = { runtime: 'edge' }; // <-- KEEP COMMENTED

// /api/chat-agent.ts
console.log("🕵️‍♂️ chat-agent invoked – AGENT_MODE =", process.env.NEXT_PUBLIC_AGENT_MODE);

import { config as runtimeConfig } from './chat.js';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { retrieverTool } from '../src/agents/retriever-tool.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const config = runtimeConfig;

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
  try {
    // Load dotenv only once, inside the handler, for local dev
    if (process.env.NODE_ENV !== 'production' && !(globalThis as CustomGlobalThis)._envLoaded) {
      const dotenv = await import('dotenv');
      dotenv.config();
      (globalThis as CustomGlobalThis)._envLoaded = true;
      console.log('.env loaded for local development');
    }

    const body = req.body; // already an object

    const parse = BodySchema.safeParse(body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
      return;
    }
    const { messages } = parse.data;
    const question = messages[messages.length - 1].content;

    console.log('[CHAT-AGENT API] Question:', question);

    // Initialize the LLM
    const modelName = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const apiKey = process.env.OPENAI_API_KEY;

    const llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelName,
      temperature: 0,
    });

    // Create the prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", 
        `You are a helpful Skypearls Villas assistant. Your job is to answer questions about the luxury villas in Siargao, Philippines.
        Use the villa_rag_search tool to find information when you don't know the answer.
        When customers show interest, encourage them to provide their name, email, and phone for a viewing.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.`
      ],
      ["human", "{input}"],
      ["assistant", "{agent_scratchpad}"],
    ]);

    // Create the agent with the retriever tool
    const agent = await createToolCallingAgent({
      llm,
      tools: [retrieverTool],
      prompt,
    });

    // Create the agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools: [retrieverTool],
    });

    // Execute the agent
    const result = await agentExecutor.invoke({
      input: question,
    });

    console.log('[CHAT-AGENT API] Response:', result.output);

    // Return the response in the same format as the original chat API
    res.status(200).json({ reply: result.output });
  } catch (err) {
    console.error('[CHAT-AGENT API] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
} 