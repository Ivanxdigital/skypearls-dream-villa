// Explicitly configure the Node.js runtime for Vercel Serverless Functions <-- REMOVING as per Vercel guidance
// export const config = { runtime: 'nodejs' };
// // Use Vercel Edge runtime for lower latency <-- REMOVING this due to Node.js dependencies
// export const config = { runtime: 'edge' }; // <-- KEEP COMMENTED

export const config = { maxDuration: 30 };

import { z } from 'zod';
import { createVillaGraph } from '../src/agents/villa-graph.js';
import { createCheckpointer } from '../src/lib/langgraph/checkpointer.js';
import { StateAnnotation, GraphState } from '../src/lib/langgraph/state.js';

// Define an interface for our custom global properties
// Simply define the shape we expect on globalThis directly
interface CustomGlobalThis {
  _envLoaded?: boolean;
  _skypearlsVectorStore?: unknown;
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
  leadInfo: z.object({
    firstName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    sendTranscript: z.boolean().optional(),
  }).optional(),
});

// Define the schema for request validation
const schema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  leadInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
});

// --- Handler ---
export default async function handler(req: any, res: any) {
  // Check if AGENT_MODE is enabled, if so, proxy to chat-agent.ts
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

    // Validate request body
    const parse = schema.safeParse(body);
    if (!parse.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { messages, leadInfo } = parse.data;
    const latestMessage = messages[messages.length - 1].content;
    // Get or create a thread ID (can be based on the user's email or session ID)
    const threadId = req.headers["x-thread-id"] || (leadInfo?.email ? `skypearls-${leadInfo.email}` : "default-thread");
    // Create the checkpointer for persistence
    const checkpointer = createCheckpointer(threadId);
    // Create the graph
    const graph = createVillaGraph({
      checkpointer
    });
    // Map incoming messages to the correct Message type
    const mappedMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
    // Only include leadInfo if all required fields are present
    let safeLeadInfo: GraphState["leadInfo"] = undefined;
    if (leadInfo && leadInfo.firstName && leadInfo.email && (leadInfo as any).phone) {
      safeLeadInfo = {
        firstName: leadInfo.firstName,
        email: leadInfo.email,
        phone: (leadInfo as any).phone,
        sendTranscript: (leadInfo as any).sendTranscript,
      };
    }
    // Initialize state with the current messages and question
    const initialState: GraphState = {
      messages: mappedMessages,
      question: latestMessage,
      documents: undefined,
      lastRetrieval: undefined,
      documentQuality: undefined,
      isGreeting: undefined,
      isBookingIntent: undefined,
      bookingInfo: undefined,
      leadInfo: safeLeadInfo,
    };
    // Run the graph with the initial state
    const result = await graph.invoke(initialState, { configurable: { thread_id: threadId } }) as GraphState;
    // Extract the final response from the result
    const response = result.messages[result.messages.length - 1];
    // Return the response
    res.status(200).json({ reply: response.content });
  } catch (err) {
    console.error('[CHAT API] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
} 