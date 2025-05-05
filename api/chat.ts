import { config } from 'dotenv';
config();

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
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate input
  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { messages } = parse.data;

  try {
    // Pinecone setup
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! });
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: 'default',
    });

    // LangChain RAG setup
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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

    return res.status(200).json({ reply: result.text });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 