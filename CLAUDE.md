# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run ingest` - Process and upload villa documentation to Pinecone vector store

## Architecture Overview

This is a React/TypeScript application for SkyPearls Dream Villa with an integrated RAG chatbot system. The project uses:

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui components
- **AI/Chat**: LangGraph-based chatbot with OpenAI integration and Pinecone vector store
- **State Management**: LangGraph StateGraph for conversation flow
- **API**: Vercel serverless functions in `/api` directory

### Key Architecture Components

**Chat System Flow:**
1. `ChatGate` component manages chat state and lead capture
2. `ChatPanel` renders the chat interface
3. API routes in `/api` handle chat requests
4. `villa-graph.ts` defines the LangGraph conversation flow with nodes for:
   - Document retrieval from Pinecone
   - Document quality grading
   - Query reformulation
   - Response generation
   - Greeting handling
   - Booking intent detection
   - Image request handling
   - Lead qualification

**LangGraph Conversation Flow:**
```
START → retrieveDocuments → gradeDocuments → [Conditional Routing]
                                          ├── handleGreeting (if greeting detected)
                                          ├── handleBooking (if booking intent detected)  
                                          ├── handleImageRequest (if location/image request)
                                          ├── qualifyLead (if qualification triggered)
                                          ├── generateResponse (if high document quality > 0.7)
                                          └── reformulateQuery → [back to retrieveDocuments]
```

**Vector Store & RAG:**
- Villa documentation stored in `/docs/villas/`
- `scripts/ingest.ts` processes markdown files and uploads to Pinecone
- Vector retrieval integrated into chat graph nodes
- Document quality grading with 0.7 threshold for high-quality responses

**Agent Mode:**
- Environment variable `NEXT_PUBLIC_AGENT_MODE=on` enables agent-based responses
- Uses `/api/chat-agent.ts` instead of standard chat flow

### API Architecture

**Core Endpoints:**
- `/api/chat.ts` - Main chat endpoint with dual-mode support
- `/api/chat-agent.ts` - Agent-based chat implementation
- `/api/chat-stream.ts` - Server-Sent Events streaming chat
- `/api/notify-lead.ts` - Lead notification system (Edge Runtime)

**Serverless Configuration:**
- 30-second timeout for chat operations
- Edge runtime for lead notifications
- CORS handling for streaming endpoints

### Important File Patterns

- **Components**: Located in `src/components/`, uses shadcn/ui patterns
- **Graph Nodes**: In `src/agents/nodes/`, each handles specific conversation intents
- **State Management**: `src/lib/langgraph/state.ts` defines conversation state schema
- **API Handlers**: `/api` directory contains serverless functions
- **Villa Data**: Static data in `src/data/`, documentation in `docs/villas/`

### Environment Requirements

**Required Variables:**
- `OPENAI_API_KEY` - OpenAI API access
- `OPENAI_MODEL` - Model selection (default: gpt-4o-mini)
- `PINECONE_API_KEY` - Pinecone vector database
- `PINECONE_ENV` - Pinecone environment
- `PINECONE_INDEX` - Pinecone index name
- `RESEND_API_KEY` - Email service for lead notifications
- `LEAD_EMAIL_TO` - Recipient email for lead notifications

**Optional Variables:**
- `NEXT_PUBLIC_AGENT_MODE` - "on" to enable agent mode
- `VITE_DEBUG_MODE` - Frontend debug mode
- `VITE_STREAMING_ENABLED` - Enable streaming chat responses
- `CALENDLY_PERSONAL_ACCESS_TOKEN` - For scheduling functionality
- `LANGCHAIN_TRACING_V2` - LangSmith tracing for debugging

### Testing Configuration

- **Framework**: Jest with jsdom environment
- **Setup**: `jest.config.js` with TypeScript support
- **Coverage**: API endpoints, graph nodes, email integration
- **Mocking**: External services (Resend, Pinecone, OpenAI)

### TypeScript Configuration

- Uses path aliases: `@/*` maps to `src/*`
- Relaxed strictness for rapid development (noImplicitAny: false)
- NodeNext module resolution for compatibility

When working with the graph nodes, be aware of the `@ts-expect-error` comments which suppress LangGraph typing incompatibilities with the current library version.