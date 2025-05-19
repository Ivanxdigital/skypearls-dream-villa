# Skypearls Villas RAG Chatbot — Technical Documentation

## Overview

The Skypearls Villas RAG (Retrieval-Augmented Generation) Chatbot is a full-stack, production-grade conversational assistant for luxury real estate. It leverages OpenAI LLMs, Pinecone vector search, a **LangGraph-based agentic workflow for robust multi-step reasoning**, and a React/Tailwind UI to answer user questions, surface villa information, and capture qualified leads.

---

## System Architecture

The system now incorporates LangGraph for the primary chat processing, with a fallback to a LangChain agent if `NEXT_PUBLIC_AGENT_MODE` is enabled.

```mermaid
graph TD
    A[User] -- Interacts with --> APP(App.tsx)
    APP -- Manages Chat Toggle & State --> GT(ChatGate.tsx)

    subgraph Lead Capture Flow
        GT -- If no cached lead --> LF(LeadForm.tsx Modal)
        LF -- Submits LeadInfo --> GT
        GT -- Caches LeadInfo in localStorage --> LS[localStorage]
        GT -- Immediately notifies business --> API_NOTIFY_LEAD_FORM[api/notify-lead.ts]
    end

    GT -- If lead data exists --> CP(ChatPanel.tsx)

    subgraph Chat Interaction Flow
        A -- Chat UI (via ChatPanel) --> CP
        CP -- POST /api/chat (with X-Thread-ID & LeadInfo) --> API_CHAT[api/chat.ts]

        subgraph API Chat Logic (api/chat.ts)
            API_CHAT -- Checks NEXT_PUBLIC_AGENT_MODE --> AGENT_MODE_CHECK
            AGENT_MODE_CHECK -- If 'on' --> PROXY_TO_AGENT[Proxy to api/chat-agent.ts]
            AGENT_MODE_CHECK -- If 'off' or not set --> LG_WORKFLOW(LangGraph Workflow)

            subgraph LangGraph Workflow (src/agents/villa-graph.ts)
                LG_WORKFLOW -- Uses Checkpointer --> LG_CHECKPOINTER[src/lib/langgraph/checkpointer.ts]
                LG_WORKFLOW -- Manages State --> LG_STATE[src/lib/langgraph/state.ts]
                LG_WORKFLOW -- Entry --> N_RETRIEVE[retrieveDocuments Node]
                N_RETRIEVE -- Pinecone Query --> DB[Pinecone Vector DB]
                N_RETRIEVE --> N_GRADE[gradeDocuments Node]
                N_GRADE -- LLM for Grading --> LLM[OpenAI LLM]
                N_GRADE -- If relevant --> N_GENERATE[generateResponse Node]
                N_GRADE -- If not relevant --> N_REFORMULATE[reformulateQuery Node]
                N_REFORMULATE -- LLM for Reformulation --> LLM
                N_REFORMULATE --> N_RETRIEVE
                N_GENERATE -- LLM for Response --> LLM
                N_GENERATE --> LG_END(END)
            end
            LG_WORKFLOW -- Response --> API_CHAT
        end

        subgraph Fallback Agent Logic (api/chat-agent.ts)
            PROXY_TO_AGENT -- Initializes --> LC_AGENT[LangChain AgentExecutor]
            LC_AGENT -- Uses Retriever Tool --> RT[src/agents/retriever-tool.ts]
            RT -- Pinecone Query --> DB
            LC_AGENT -- LLM for Agent --> LLM
            LC_AGENT -- Response --> PROXY_TO_AGENT
        end
        API_CHAT -- Final Reply --> CP
    end

    subgraph Notification Flow (Triggered by ChatPanel or ChatGate)
        CP -- LeadInfo + Transcript + sendTranscript --> API_NOTIFY_CHAT[api/notify-lead.ts]
        API_NOTIFY_LEAD_FORM -- Emails Business --> BE[Business Email]
        API_NOTIFY_CHAT -- Emails Business --> BE
        API_NOTIFY_CHAT -- If sendTranscript=true --> VE[Visitor Email]
    end

    subgraph Data Stores & Services
        LS
        DB
        LLM
        BE
        VE
        LG_CHECKPOINTER
    end
```

---

## Data Flow

1. **Villa Content Ingestion**
   - Markdown files in `docs/villas/` (e.g., `villa-anna.md`) contain property data.
   - `scripts/ingest.ts` splits, embeds (OpenAI), and upserts these documents into the Pinecone vector store (`src/lib/vector-store.ts`).

2. **Lead Capture (Pre-Chat)**
   - User clicks the chat toggle button in `App.tsx`.
   - `src/components/ChatGate.tsx` checks `localStorage` for existing lead information (`skypearls_lead`).
   - If no valid lead info is found, `src/components/LeadForm.tsx` is displayed.
   - User submits `firstName`, `email`, `phone`, and `sendTranscript` preference.
   - On submission, `LeadForm.tsx` passes data to `ChatGate.tsx`.
   - `ChatGate.tsx` stores the `LeadInfo` in `localStorage`.
   - **Crucially, `ChatGate.tsx` immediately calls `/api/notify-lead.ts` to inform the business of the new lead (without a transcript at this stage).**
   - `ChatGate.tsx` then mounts `src/components/ChatPanel.tsx`, passing the `LeadInfo`.
   - Returning visitors with valid `LeadInfo` in `localStorage` bypass the form.

3. **User Interaction (Chat)**
   - `src/components/ChatPanel.tsx` (receiving `LeadInfo`) provides the chat UI.
   - An initial greeting is personalized with the user's first name.
   - `ChatPanel.tsx` generates a `threadId` based on the user's email (e.g., `skypearls-user@example.com`).
   - User messages are sent to `/api/chat` with `{ messages: ChatMessage[], leadInfo: LeadInfo }` in the body and the `threadId` in the `X-Thread-ID` header.

4. **RAG Pipeline (`/api/chat.ts`)**
   - The `/api/chat.ts` endpoint first checks the `NEXT_PUBLIC_AGENT_MODE` environment variable.
   - **If `NEXT_PUBLIC_AGENT_MODE === 'on'`**:
       - The request is proxied to `/api/chat-agent.ts`.
       - `/api/chat-agent.ts` initializes a LangChain `AgentExecutor` with `ChatOpenAI` and a custom `retrieverTool` (from `src/agents/retriever-tool.ts`).
       - The `retrieverTool` queries Pinecone for relevant villa documents.
       - The agent processes the input and returns a response.
   - **If `NEXT_PUBLIC_AGENT_MODE` is not 'on' (Default LangGraph Flow)**:
       - It initializes the LangGraph-based system defined in `src/agents/villa-graph.ts`.
       - A `checkpointer` (from `src/lib/langgraph/checkpointer.ts`) is created using the `threadId` for state persistence (in-memory for dev, local file for prod).
       - The initial `GraphState` (from `src/lib/langgraph/state.ts`) is populated with `messages`, the latest `question`, and `leadInfo`.
       - The LangGraph workflow executes:
           1. `retrieveDocuments` node: Fetches documents from Pinecone via `src/lib/vector-store.ts`.
           2. `gradeDocuments` node: Uses an LLM to assess the relevance of retrieved documents to the question.
           3. Conditional Branching:
               - If documents are relevant (grade > 0.7), proceeds to `generateResponse`.
               - If not relevant, proceeds to `reformulateQuery`.
           4. `reformulateQuery` node (if needed): Uses an LLM to rephrase the question for better retrieval and loops back to `retrieveDocuments`.
           5. `generateResponse` node: Uses an LLM with the question and relevant documents (and `leadInfo` for personalization) to generate the final answer.
       - The final assistant message from the graph's state is returned to the client.

5. **Lead Notification & Transcript Emailing (`/api/notify-lead.ts`)**
   - This endpoint can be called at two points:
       1. By `ChatGate.tsx` immediately after a new lead is submitted via `LeadForm.tsx` (sends lead details, no transcript).
       2. By `ChatPanel.tsx` (typically when a chat ends or a user requests it) if `leadInfo.sendTranscript` is true (sends lead details and the full chat transcript).
   - `/api/notify-lead.ts` validates the data.
   - It **always** emails lead details (and transcript, if provided in this call) to the business email (`LEAD_EMAIL_TO`).
   - If `sendTranscript` is true in the request *and* a transcript is provided, it also sends a copy of the transcript to the visitor's email.

---

## Key Files & Modules

- **Content**: `docs/villas/*.md` — Markdown villa data
- **Ingestion**: `scripts/ingest.ts` — Pinecone ingestion script
- **Vector Store**: `src/lib/vector-store.ts` — Initializes and exports Pinecone vector store

- **Primary Chat API (LangGraph)**:
  - `api/chat.ts` — Main entry point, handles `AGENT_MODE` and invokes LangGraph
  - `src/agents/villa-graph.ts` — Defines the LangGraph structure and flow
  - `src/lib/langgraph/state.ts` — Defines `ChatState` and `GraphState` for LangGraph
  - `src/lib/langgraph/checkpointer.ts` — Manages state persistence for LangGraph
  - `src/agents/nodes/index.ts` — Exports all graph nodes
  - `src/agents/nodes/retrieveDocuments.ts` — Node for document retrieval
  - `src/agents/nodes/gradeDocuments.ts` — Node for assessing document relevance
  - `src/agents/nodes/reformulateQuery.ts` — Node for query reformulation
  - `src/agents/nodes/generateResponse.ts` — Node for generating final LLM response

- **Fallback Chat API (LangChain Agent)**:
  - `api/chat-agent.ts` — Alternative RAG endpoint using LangChain AgentExecutor
  - `src/agents/retriever-tool.ts` — Custom LangChain tool for document retrieval used by `chat-agent.ts`

- **Lead Notification API**:
  - `api/notify-lead.ts` — Handles emailing lead details and transcripts

- **UI Components**:
  - `src/components/LeadForm.tsx` — Modal form for lead capture
  - `src/components/ChatGate.tsx` — Manages lead form display, lead persistence, initial lead notification, and `ChatPanel` rendering
  - `src/components/ChatPanel.tsx` — Floating chat widget, handles chat UI, history, `threadId`, and calls to `/api/chat` and `/api/notify-lead`

- **Integration & Types**:
  - `src/App.tsx` — Injects `<ChatGate />` globally
  - `src/types.ts` — Contains shared types like `LeadInfo` and `ChatMessage`

---

## API Contracts

### `/api/chat` (POST)
- **Request**: `{ messages: ChatMessage[], leadInfo: LeadInfo }`
  - `ChatMessage`: `{ role: 'user' | 'assistant' | 'system', content: string }`
  - `LeadInfo`: `{ firstName: string, email: string, phone: string, sendTranscript: boolean }`
- **Response**: `{ reply: string }`
- **Validation**: Zod schema, rejects invalid/missing fields

### `/api/notify-lead` (POST)
- **Request**: 
  ```json
  {
    "lead": {
      "firstName": "string",
      "email": "string (email format)",
      "phone": "string"
    },
    "transcript": "string",
    "sendTranscript": "boolean (optional)"
  }
  ```
- **Response**: `{ ok: true, message?: string }` or error object
- **Validation**: Zod schema. `lead.firstName`, `lead.email`, `lead.phone`, and `transcript` are required. `sendTranscript` is optional.

---

## Environment Variables

Required in `.env` and Vercel:

```
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Pinecone
PINECONE_API_KEY=pc-...
PINECONE_ENV=us-east-1
PINECONE_INDEX=skypearls-vectors

# Lead email (Resend)
RESEND_API_KEY=re_...
LEAD_EMAIL_TO=business_address@example.com
LEAD_EMAIL_FROM=noreply@yourdomain.com # Optional, defaults to ivanxdigital@gmail.com
LEAD_REPLY_TO=sales@yourdomain.com    # Optional, defaults to ivanxdigital@gmail.com
```

---

## Implementation Notes

- **Type Safety**: All endpoints and UI use TypeScript strict mode. Zod is used for runtime validation.
- **Lead Capture Flow**:
  - The pre-chat lead capture ensures `firstName`, `email`, and `phone` are collected.
  - `ChatGate.tsx` sends an initial notification to the business as soon as a lead is captured.
- **LangGraph Integration**:
  - The primary chat logic is now handled by a stateful LangGraph agent defined in `src/agents/villa-graph.ts`.
  - State persistence is managed via `src/lib/langgraph/checkpointer.ts`, using `X-Thread-ID` from the client.
  - The graph includes nodes for retrieval, grading, query reformulation, and response generation, allowing for more sophisticated RAG.
- **Agent Mode Fallback**:
  - If `NEXT_PUBLIC_AGENT_MODE` is set to `'on'`, `api/chat.ts` proxies requests to `api/chat-agent.ts`, which uses a simpler LangChain AgentExecutor with a retriever tool. This allows for A/B testing or a fallback mechanism.
- **UI (`ChatPanel.tsx`)**:
  - Personalizes greetings using `LeadInfo`.
  - Manages local chat history, namespaced by user email.
  - Sends `X-Thread-ID` and `LeadInfo` to `/api/chat`.
- **Transcript Emailing (`/api/notify-lead.ts`)**:
  - Now explicitly handles two scenarios: initial lead notification (from `ChatGate`) and transcript sending (from `ChatPanel`).
  - Always emails the business; emails the visitor only if `sendTranscript` is true and a transcript is available.
- **Chunking & Retrieval**: Unchanged from previous system (Pinecone top-4, ~800 char chunks).
- **Vercel Deployment**: Path aliases were updated to relative paths in backend files for Vercel compatibility.

---

## Extension Points

- **Add More Villas**: Drop new `.md` files in `docs/villas/` and re-run `node scripts/ingest.ts`.
- **Custom Prompts**: Adjust system prompt or chain config in `api/chat.ts` for tone/behavior.
- **CRM Integration**: Extend `/api/notify-lead.ts` to store leads in Supabase or another backend.
- **UI Customization**: Refine `LeadForm.tsx` or `ChatPanel.tsx` for branding or advanced features.

---

## Example Villa Markdown

```
# Villa Anna – Skypearls Villas
**Total Contract Price:** ₱21,000,000
## Property Details
- Lot Area: 100 sqm
- Floor Area: 140 sqm
- Bedrooms: 2
- Bathrooms: 2 shower + 1 outdoor shower
- Private swimming pool
- Rooftop outdoor kitchen
- 1-car garage
- Fully furnished
## Smart Home Features
- Solar powered with backup generator
- Smart toilets
- Alexa voice commands
- Smart lock systems
- 24/7 security guards
- Homeowners Insurance included
## Payment Options
**Option 1:** 20% down, 80% bank financing (15–20 yrs)
**Option 2:** 30% down, 70% bank financing (15–20 yrs)
**Option 3:** 50% down + 10 % discount, 50% bank financing
**Option 4:** 100% cash – 15  % discount
**Option 5:** 40‑year lease; 30–50% down, 50–70% in‑house financing
```

---

## FAQ

- **How do I update villa info?**
  - Edit or add markdown files in `docs/villas/` and re-run the ingestion script.
- **How do I test the chatbot?**
  - Run `npm run dev`, open the site. New users will see the lead form. Interact with the chat widget. See `skypearls-rag-setup.md` for test cases.
- **How do I change the lead email recipient?**
  - Update `LEAD_EMAIL_TO` in your environment variables.
- **How do I change the sender/reply-to for lead emails?**
  - Update `LEAD_EMAIL_FROM` and `LEAD_REPLY_TO` in your environment variables.

---

## References
- See `skypearls-rag-setup.md` for setup and task breakdown.
- See `project-brief.md` for overall project context. 
- See `docs/pre-chat-lead-prd.md` for the Product Requirements Document for this feature. 