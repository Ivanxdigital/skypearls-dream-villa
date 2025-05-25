# Skypearls Villas RAG Chatbot Architecture

## TL;DR

A full-stack RAG-based AI assistant combining a React/Tailwind frontend, a Node/Vercel backend, Pinecone for vector retrieval, OpenAI for LLM calls, and LangGraph/LangChain for orchestration. **Recently refactored** to use WhatsApp contact sharing instead of email-based lead capture for a simpler, more direct user experience.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Backend Endpoints](#backend-endpoints)

   * [`api/chat.ts`](#apichatts)
   * [`api/chat-agent.ts`](#apichat-agentts)
   * [`api/notify-lead.ts`](#apinotify-leadts) _(legacy)_
4. [Agents & Workflow](#agents--workflow)

   * [`villa-graph.ts`](#villa-graphts)
   * Node details: retrieve, grade, reformulate, generate, greeting
   * [`retriever-tool.ts`](#retriever-toolts)
5. [Frontend Components](#frontend-components)

   * [`ChatGate.tsx`](#chatgatetsx)
   * [`LeadForm.tsx`](#leadformtsx)
   * [`ChatPanel.tsx`](#chatpaneltsx)
6. [Frontend–Backend Interaction](#frontend–backend-interaction)
7. [External Services & Libraries](#external-services--libraries)
8. [Docs Folder](#docs-folder)
9. [Key Notes & Gotchas](#key-notes--gotchas)
10. [Recent WhatsApp Refactor Changes](#recent-whatsapp-refactor-changes)
11. [Extensibility & Refactoring Tips](#extensibility--refactoring-tips)
12. [Environment & Deployment](#environment--deployment)
13. [Future Improvements](#future-improvements)

---

## Architecture Overview

* **Frontend**: React + Tailwind + shadcn/ui. Core components live in `src/components/`.
* **Backend**: Next.js API routes under `api/` deployed on Vercel.
* **RAG Pipeline**: Orchestrated via LangGraph (`src/agents/villa-graph.ts`).
* **Fallback Agent**: LangChain AgentExecutor (`api/chat-agent.ts`) with a custom retriever tool.
* **Vector Store**: Pinecone accessed via `src/lib/vector-store.ts`.
* **Contact Strategy**: **WhatsApp-first approach** - AI proactively shares +63 999 370 2550 for direct contact.
* **Email Notifications**: ~~Resend.com via `api/notify-lead.ts`~~ _(disabled in current flow)_.

All chat state persists via thread IDs (`X-Thread-ID` header) and `localStorage` on the client.

---

## Data Flow

**🔄 Updated Flow (Post-WhatsApp Refactor):**

1. **User opens chat** → `ChatGate.tsx` checks `localStorage` for lead info.
2. **Lead capture** (simplified) → `LeadForm.tsx` → ~~POST `/api/notify-lead`~~ _(removed)_.
3. **ChatPanel** mounts → loads greeting & history from `localStorage`.
4. **User message** → POST `/api/chat` with `{ messages, leadInfo }` + `X-Thread-ID`.
5. **LangGraph** (or Agent) retrieves docs, grades, loops, and generates reply **with WhatsApp sharing**.
6. **Response** → JSON `{ reply }` → `ChatPanel` displays and saves to `localStorage`.
7. **Chat end** → ~~POST `/api/notify-lead`~~ _(no longer sends transcripts)_.

---

## Backend Endpoints

### `api/chat.ts`

* Entry for chat requests.
* Validates JSON via Zod.
* Checks `NEXT_PUBLIC_AGENT_MODE`:

  * **off**: invokes LangGraph (`villaGraph`) with `checkpointer`.
  * **on**: proxies to `api/chat-agent.ts`.
* Extracts final assistant reply and returns `{ reply }`.

#### Key Snippet

```ts
const graph = createVillaGraph({ checkpointer });
const result = await graph.invoke(initialState, { configurable: { thread_id } });
return res.json({ reply: result.messages.slice(-1)[0].content });
```

### `api/chat-agent.ts`

* Active when `NEXT_PUBLIC_AGENT_MODE="on"`.
* Sets up `ChatOpenAI` and LangChain `AgentExecutor` with `retrieverTool`.
* Constructs a prompt instructing the agent to call the tool for RAG search.
* Invokes agent on last user message and returns `{ reply }`.

#### Key Snippet

```ts
const executor = await AgentExecutor.fromAgentAndTools({ agent, tools: [retrieverTool] });
const result = await executor.invoke({ input: question });
res.json({ reply: result.output });
```

### `api/notify-lead.ts` _(Legacy - Not Used)_

* ⚠️ **Status**: Not called by current frontend flow.
* Previously validated `{ lead, sendTranscript, transcript }` via Zod.
* Previously emailed business with lead data and sent transcripts to visitors.
* Uses `resend.emails.send()` with HTML templates.

---

## Agents & Workflow

### `src/agents/villa-graph.ts`

* Defines a LangGraph `StateGraph` with nodes:

  1. **retrieveDocuments**
  2. **gradeDocuments**
  3. **reformulateQuery** (if quality < threshold)
  4. **generateResponse** 🆕 _Now includes WhatsApp sharing logic_
  5. **handleGreeting** 🆕 _Enhanced with occasional WhatsApp mentions_
* Branch logic based on `state.documentQuality` (0–1) and `state.isGreeting`.

#### Workflow Diagram

```
__start__
  ↓
retrieveDocuments → gradeDocuments → [isGreeting?] → handleGreeting → __end__
                             ↓                            ↓
              (quality > 0.7) → generateResponse → __end__ (may include WhatsApp)
                             ↓
             (quality ≤ 0.7) → reformulateQuery ─┐
                                                  ↓
                                          retrieveDocuments (loop)
```

#### Nodes

* **retrieveDocuments** (`villa-graph.ts`): Pinecone similaritySearch(question, 4).
* **gradeDocuments**: Detect greeting via regex, else LLM rates relevance (0–1).
* **reformulateQuery**: LLM rewrites question for better retrieval.
* **generateResponse** 🆕: LLM crafts answer using top docs as context; **automatically includes WhatsApp (+63 999 370 2550) when users show interest** (pricing, contact, viewing, purchase intent, etc.).
* **handleGreeting** 🆕: Random greetings personalized by `leadInfo.firstName`; 30% chance to include WhatsApp mention.

### `src/agents/retriever-tool.ts`

* LangChain `StructuredTool` wrapping Pinecone search.
* `_call(question)`: runs `vectorStore.similaritySearch(…,4)` and concatenates `pageContent`.

---

## Frontend Components

### `ChatGate.tsx` 🆕

* Stateful component managing lead capture and chat toggle.
* **On mount**: loads `leadInfo` from `localStorage` (`skypearls_lead`).
* **LeadForm**: modal to collect **only `firstName`** _(email/phone optional)_.
* **Lead submit**: saves to state+`localStorage`, opens chat, ~~POST `/api/notify-lead`~~ _(removed)_.
* **Reset**: clears storage and state (debugging) using `firstName` as key.

### `LeadForm.tsx` 🆕

* Radix Dialog + React Hook Form + Zod for validation.
* **Simplified fields**: 
  * `firstName` _(required)_
  * `email` _(optional - backward compatibility)_
  * `phone` _(optional - backward compatibility)_
  * ~~`sendTranscript` switch~~ _(removed)_
* **Updated copy**: Mentions WhatsApp contact sharing approach.
* Calls `onSubmit(LeadInfo)`.

### `ChatPanel.tsx` 🆕

* Manages `messages: {role,content}[]` and UI.
* **Init**: greeting message, loads `skypearls_chat_history_<firstName>` from `localStorage` _(changed from email)_.
* **Send**: on user submit, append message, POST `/api/chat`, append assistant reply.
* **Loading**: displays "Thinking…" bubble.
* **End Chat**: ~~if `sendTranscript`, POST `/api/notify-lead`~~ _(removed transcript functionality)_.
* **Thread ID**: Now uses `firstName` + timestamp instead of email.
* **UI**: uses shadcn Dialog, ReactMarkdown for rendering messages.

---

## Frontend–Backend Interaction

1. **Chat open** → simplified lead capture (firstName only).
2. **Message send**:

   ```js
   fetch('/api/chat', {
     method: 'POST',
     headers: { 'Content-Type':'application/json', 'X-Thread-ID': threadId },
     body: JSON.stringify({ messages, leadInfo })
   })
   ```
3. **Backend** invokes LangGraph or Agent → returns `{ reply }` with potential WhatsApp sharing.
4. **Frontend** updates UI + persists to `localStorage`.
5. **Chat end** → ~~triggers transcript email~~ _(no longer applicable)_.

---

## External Services & Libraries

* **OpenAI API**: LLM calls (grading, rewriting, response gen).
* **Pinecone**: vector store for retrieval (via `OpenAIEmbeddings`).
* **LangGraph**: custom RAG orchestration.
* **LangChain**: agent executor & tools.
* **WhatsApp**: Direct contact via +63 999 370 2550 _(shared by AI)_.
* ~~**Resend.com**: transactional emails~~ _(not used in current flow)_.
* **React/Tailwind/Shadcn UI**: frontend styling & components.

---

## Docs Folder

* **`docs/rag-chatbot.md`**: up-to-date flow diagram & summary.
* **`docs/refactor_plan_RAG_lead.md`**: WhatsApp refactor plan and implementation guide.
* Other PRDs (`langgraph-migration-prd.md`, etc.) are **outdated** but provide design rationale.

---

## Key Notes & Gotchas

* **Env vars**: `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`, ~~`RESEND_API_KEY`, `LEAD_EMAIL_TO`~~ _(legacy)_.
* **Agent flag**: `NEXT_PUBLIC_AGENT_MODE` toggles between LangGraph & LangChain agent.
* **Storage keys**: `skypearls_lead`, `skypearls_chat_history_<firstName>` _(changed from email)_.
* **Streaming**: none; calls await full response.
* **Error handling**: 500s return generic error; consider retry logic.
* **Checkpointer**: LangGraph uses file-based storage by thread ID; ensure write access or swap to DB.
* **WhatsApp Number**: +63 999 370 2550 _(hardcoded in agent responses)_.

---

## Recent WhatsApp Refactor Changes

### 🔄 **What Changed (December 2024)**

#### **Data Structure**
- `LeadInfo` interface: `email`, `phone`, `sendTranscript` now optional
- Only `firstName` required for chat initiation

#### **Frontend Components**
- **LeadForm**: Simplified to firstName-only requirement with WhatsApp context
- **ChatGate**: Removed automatic email notifications on lead submission
- **ChatPanel**: 
  - Removed transcript email functionality
  - Updated localStorage keys from email-based to firstName-based
  - Updated thread ID generation

#### **AI Behavior**
- **generateResponse**: Added automatic WhatsApp sharing triggers:
  - Contact terms: "contact", "call", "phone", "reach out"
  - Pricing: "price", "cost", "how much", "budget"
  - Viewing: "schedule", "visit", "tour", "viewing"
  - Purchase intent: "buy", "purchase", "invest", "interested"
  - Info requests: "details", "information", "brochure"
- **handleGreeting**: 30% chance to naturally mention WhatsApp availability

#### **Contact Flow**
- **Before**: Email capture → Chat → Optional transcript email
- **After**: Name capture → Chat with proactive WhatsApp sharing → Direct WhatsApp contact

### 🎯 **Benefits**
- Simpler user onboarding (no email/phone required)
- Direct communication channel via WhatsApp
- Reduced technical dependencies (no email service issues)
- More natural conversation flow with proactive contact sharing

---

## Extensibility & Refactoring Tips

* Add new LangGraph nodes or branches in `villa-graph.ts` for specialized intents.
* Swap LLM models by updating `OPENAI_MODEL` env.
* Implement streaming responses by switching to OpenAI streaming APIs.
* Enhance error paths in `api/chat.ts` for graceful degradation.
* Replace file-based checkpointer with Redis/Mongo for horizontal scaling.
* Add analytics middleware to log query/timing data.
* **WhatsApp Integration**: Consider WhatsApp Business API for automated responses.

---

## Environment & Deployment

* **Local**: `.env.local` for dev; uses file-based checkpointer.
* **Prod**: Vercel; env vars set in project settings.
* **Pinecone**: ensure network access from Vercel.
* ~~**Resend**: verify sender domain~~ _(not required for current flow)_.

---

## Future Improvements

* Streaming chat with partial tokens.
* Client-side caching for repeated queries.
* Multi-language support for chatbot.
* WhatsApp Business API integration for seamless handoff.
* Integration with booking/calendar tools via new LangChain tools.
* UI refresh: add typing indicators, quick-reply buttons.
* Analytics tracking for WhatsApp conversion rates.

---

*Generated for AI coding agents — include this doc in your prompt to enable high-context refactoring, debugging, or feature development. Last updated: December 2024 (WhatsApp Refactor).*