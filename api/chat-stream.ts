// SSE streaming chat endpoint for Skypearls Villa RAG
export const config = { maxDuration: 30 };

import { z } from 'zod';
import { createVillaGraph } from '../src/agents/villa-graph.js';
import { createCheckpointer } from '../src/lib/langgraph/checkpointer.js';
import { StateAnnotation, GraphState } from '../src/lib/langgraph/state.js';

// Define an interface for our custom global properties
interface CustomGlobalThis {
  _envLoaded?: boolean;
  _skypearlsVectorStore?: unknown;
}

// --- Types ---
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Streaming event types
export interface StreamEvent {
  type: 'token' | 'error' | 'complete' | 'images';
  data: string | ImageData | ErrorData;
  messageId?: string;
}

interface ImageData {
  images: string[];
  imageType?: 'location' | 'property' | 'amenity';
  imageContext?: string;
}

interface ErrorData {
  code: 'network' | 'timeout' | 'rate_limit' | 'internal';
  message: string;
  retryable: boolean;
  fallbackToSync?: boolean;
}

// Request validation schema
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const StreamRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  leadInfo: z.object({
    firstName: z.string(),
    email: z.union([z.string().email(), z.literal("")]).optional(),  // Allow valid email or empty string
    phone: z.string().optional(),
    sendTranscript: z.boolean().optional(),
  }).optional(),
});

// SSE helper functions
function createSSEResponse(res: any): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Thread-ID',
  });
}

function sendSSEEvent(res: any, event: StreamEvent): void {
  const eventData = JSON.stringify(event);
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${eventData}\n\n`);
}

function endSSEStream(res: any): void {
  res.write('event: complete\n');
  res.write('data: {"type":"complete"}\n\n');
  res.end();
}

// --- Handler ---
export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Thread-ID');
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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

    // Setup SSE response headers
    createSSEResponse(res);

    // Parse and validate request body
    let body: unknown;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      sendSSEEvent(res, {
        type: 'error',
        data: {
          code: 'internal',
          message: 'Invalid JSON body',
          retryable: false,
        }
      });
      endSSEStream(res);
      return;
    }

    // Validate request body
    const parseResult = StreamRequestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('[CHAT-STREAM] Request validation failed:', parseResult.error.issues);
      sendSSEEvent(res, {
        type: 'error',
        data: {
          code: 'internal',
          message: `Invalid request body: ${parseResult.error.issues.map(i => i.message).join(', ')}`,
          retryable: false,
        }
      });
      endSSEStream(res);
      return;
    }

    const { messages, leadInfo } = parseResult.data;
    const latestMessage = messages[messages.length - 1].content;
    
    console.log('[CHAT-STREAM] Received request with leadInfo:', JSON.stringify(leadInfo, null, 2));
    console.log('[CHAT-STREAM] Messages count:', messages.length);
    
    // Get or create a thread ID (updated to use firstName instead of email after WhatsApp refactor)
    const threadId = req.headers["x-thread-id"] || 
      (leadInfo?.firstName ? `skypearls-${leadInfo.firstName}` : "default-thread");

    console.log(`[CHAT-STREAM] Processing streaming request for thread: ${threadId}`);

    // Create the checkpointer for persistence
    const checkpointer = createCheckpointer(threadId);
    
    // Create the graph with streaming capabilities
    const graph = createVillaGraph({
      checkpointer,
      streaming: true, // Enable streaming mode
      onToken: (token: string, messageId?: string) => {
        // Send each token as it arrives
        sendSSEEvent(res, {
          type: 'token',
          data: token,
          messageId,
        });
      }
    });

    // Map incoming messages to the correct Message type
    const mappedMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // Only include leadInfo if firstName is present (email and phone are optional after WhatsApp refactor)
    let safeLeadInfo: GraphState["leadInfo"] = undefined;
    if (leadInfo && leadInfo.firstName) {
      safeLeadInfo = {
        firstName: leadInfo.firstName,
        email: leadInfo.email || "",  // Provide default empty string for backward compatibility
        phone: leadInfo.phone || "",  // Provide default empty string for backward compatibility
        sendTranscript: leadInfo.sendTranscript,
      };
    }

    // Initialize state with streaming properties
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
      imageUrls: undefined,
      imageContext: undefined,
      imageType: undefined,
      showImages: undefined,
      streaming: {
        enabled: true,
        onToken: (token: string, messageId?: string) => {
          // Send each token as it arrives
          sendSSEEvent(res, {
            type: 'token',
            data: token,
            messageId,
          });
        }
      },
      streamBuffer: undefined,
      currentMessageId: undefined,
    };

    // Run the graph with streaming enabled
    const result = await graph.invoke(initialState, { 
      configurable: { 
        thread_id: threadId,
        streaming: true 
      } 
    }) as GraphState;

    // Send images if available
    if (result.imageUrls && result.imageUrls.length > 0) {
      sendSSEEvent(res, {
        type: 'images',
        data: {
          images: result.imageUrls,
          imageType: result.imageType,
          imageContext: result.imageContext,
        }
      });
    }

    // Complete the stream
    endSSEStream(res);

  } catch (error) {
    console.error('[CHAT-STREAM] Error:', error);
    
    // Send error event
    sendSSEEvent(res, {
      type: 'error',
      data: {
        code: 'internal',
        message: 'Internal server error during streaming',
        retryable: true,
        fallbackToSync: true,
      }
    });
    
    endSSEStream(res);
  }
} 