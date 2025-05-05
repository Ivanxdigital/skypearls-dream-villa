// Use Vercel Edge runtime for lower latency
// export const config = { runtime: 'edge' };

import { z } from 'zod';
// TODO: Use proper types for req/res if available in your framework
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
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Validate input - using req.json() for Web API
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    // Use Response object for error
    return new Response(JSON.stringify({ error: 'Invalid request', details: parse.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { messages } = parse.data;

  try {
    // Pinecone setup - Ensure environment variables are available in Edge runtime
    // Note: dotenv is typically NOT used in serverless/edge functions.
    // Ensure these variables are set directly in Vercel Environment Variables.
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!pineconeApiKey || !pineconeIndexName || !openaiApiKey) {
      console.error('Missing environment variables for Pinecone or OpenAI');
      return new Response(JSON.stringify({ error: 'Missing backend configuration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const pineconeIndex = pinecone.Index(pineconeIndexName);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: openaiApiKey });
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: 'default', // TODO: Consider making namespace dynamic if needed
    });

    // LangChain RAG setup
    const model = new ChatOpenAI({
      openAIApiKey: openaiApiKey,
      modelName: openaiModel,
      temperature: 0.2,
    });
    const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(4));

    // Prepare chat history (LangChain expects [user, assistant, user, ...])
    const chatHistory = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => [m.role, m.content] as [string, string]);
    const question = messages[messages.length - 1].content;

    const result = await chain.call({
      question,
      chat_history: chatHistory,
    });

    // Use Response object for success
    return new Response(JSON.stringify({ reply: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Chat endpoint error:', err);
    // Use Response object for internal error
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 