# Skypearls Villas — RAG → Agent Upgrade (PRD)

> Purpose: Guide the Cursor IDE coding AI agent (Context7 MCP-aware) to evolve the existing RAG chatbot into a flag-gated LangChain Agent Executor, using only the retriever tool initially, without breaking production.

---

## 1 · Objectives

| # | Goal                                                                                 | Success Metric                                                                      |
| - | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 1 | Keep current chat functionality and lead-capture flow 100% intact                    | All existing chat, lead form, and email flows continue working without code changes |
| 2 | Introduce a new `/api/chat-agent.ts` endpoint behind a `NEXT_PUBLIC_AGENT_MODE` flag | Agent code deployed but inactive until flag is on                                   |
| 3 | Use only the `retrieverTool` initially, deferring booking/CRM tools to future phases | Agent executor imports only `retrieverTool` and falls back to legacy chain          |

---

## 2 · Architecture

```
/api
  ├─ chat.ts           ← current RAG endpoint (unchanged)
  ├─ chat-agent.ts     ← new flag-gated agent endpoint
/agents
  └─ retriever-tool.ts ← exports `retrieverTool` (wraps existing Pinecone retriever)
/lib
  ├─ vector-store.ts  ← re-export existing Pinecone vector store
  └─ supabase.ts       ← (optional) Supabase client for future persistence
```

* The `chat-agent.ts` should:

  1. Check `process.env.NEXT_PUBLIC_AGENT_MODE === 'on'`
  2. If **off**, dynamically import and call the legacy `/api/chat` handler
  3. If **on**, initialize a LangChain Agent Executor with only `retrieverTool`
  4. Pass the last user message (`body.messages[-1]`) as `input` and return `result.output` as `{ reply }`

---

## 3 · Feature Flag Rollout

1. **Preview**: Deploy `chat-agent.ts` with `NEXT_PUBLIC_AGENT_MODE=off` (default) → no change for users.
2. **Testing**: Enable flag in Preview environment → fully test agent behavior against existing chain.
3. **Production**: Deploy to main with flag still **off** → zero production impact.
4. **Gradual Enable**: Flip flag to 10% of users via Vercel Edge Config → monitor errors/logs.
5. **Full Enable**: After 24 h stable → 100% rollout → legacy code can be deprecated later.

---

## 4 · Micro‑Tasks

### 4.0 Setup

* Create `NEXT_PUBLIC_AGENT_MODE` environment variable in Vercel (default `off`).
* Copy `chat.ts` → `chat-agent.ts` for isolated development.

### 4.1 Retriever Tool

**File:** `/agents/retriever-tool.ts`

```ts
import { z } from 'zod';
import { vectorStore } from '@/lib/vector-store';

export const retrieverTool = {
  name: 'villa_rag_search',
  description: 'Returns relevant villa context paragraphs for a user question',
  parameters: z.object({ question: z.string() }).parse,
  func: async ({ question }) => {
    const docs = await vectorStore.similaritySearch(question, 4);
    return docs.map(d => d.pageContent).join('
---
');
  }
};
```

### 4.2 Agent Endpoint

**File:** `/api/chat-agent.ts`

```ts
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';
import { retrieverTool } from '@/agents/retriever-tool';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (process.env.NEXT_PUBLIC_AGENT_MODE !== 'on') {
    const { default: legacy } = await import('./chat');
    return legacy(req);
  }

  const { messages } = await req.json();
  const question = messages.at(-1).content;

  const executor = await initializeAgentExecutorWithOptions(
    [retrieverTool],
    new ChatOpenAI({ modelName: process.env.OPENAI_MODEL, temperature: 0 }),
    { agentType: 'openai-functions' }
  );

  const result = await executor.call({ input: question });
  return new Response(JSON.stringify({ reply: result.output }), { status: 200 });
}
```

### 4.3 Client Integration

* **No changes** to `ChatPanel.tsx` or existing front‑end code.
* Ensure Vercel rewrite rules route `/api/chat` to `chat-agent.ts` or handle fallback via flag.

### 4.4 Streaming Support (Optional)

* **Server**: Switch to `executor.stream()` and send SSE (`text/event-stream`).
* **Client**: Use `res.body.getReader()` to append tokens to the assistant bubble in real time.

### 4.5 Context7 MCP Usage

* Before generating any new code or edits, the agent **must** call Context7 MCP to fetch up‑to‑date library docs or code snippets.

  ```ts
  const docs = await context7.mcp.getDocs('langchain/agents');
  ```
* This ensures alignment with the latest library versions and reduces outdated code errors.
* Before implementing any code changes or new features, the agent **must** use the web search tool to research the latest information and best practices relevant to the task.

---

## 5 · Future Phases

* **Phase 2**: Add `checkAvailability`, `bookViewing`, `saveLeadToCRM` as separate tools.
* **Phase 3**: Integrate Facebook Messenger webhook into the same agent executor.
* **Phase 4**: Persist chat history & leads in Supabase with real‑time dashboard.
* **Phase 5**: Build satellite agents (lead scrapers, email drip, ad optimizer).

---

Prepared for Cursor IDE coding AI agent. Use Context7 MCP to fetch real‑time documentation and code examples, ensuring generated code aligns with the latest library versions.

## 5 · Major Tasks Checklist

A live, tickable checklist for the AI coding agent. As each phase completes, tick the box and move to the next.

* [x] **Phase 0 · Prep**:

  * Create and configure Vercel feature flag `NEXT_PUBLIC_AGENT_MODE=off`.
  * Duplicate `/api/chat.ts` to `/api/chat-agent.ts`.
* [x] **Phase 1 · Retriever Tool**:

  * Implement `src/agents/retriever-tool.ts` with `retrieverTool` export.
* [x] **Phase 2 · Agent Endpoint**:

  * Scaffold `/api/chat-agent.ts` to import `retrieverTool` and fallback to `/api/chat.ts` when flag is off.
* [x] **Phase 3 · Response Parity**:

  * Ensure `/api/chat-agent.ts` returns `{ reply }` JSON matching existing API.
  * No front‑end code changes required in `ChatPanel.tsx` or routing.
* [ ] **Phase 4 · Web Search Integration**:

  * Add invocation of the web search tool before code generation steps.
* [ ] **Phase 5 · Context7 MCP Usage**:

  * Validate that Context7 MCP calls are present for real‑time docs/code examples.
* [ ] **Phase 6 · Preview Deployment & Testing**:

  * Deploy to Preview with flag **on**. Verify chat and fallback behaviors.
* [ ] **Phase 7 · Gradual Rollout**:

  * Enable agent for 10% of production users. Monitor logs and error rates.
* [ ] **Phase 8 · Full Enable & Cleanup**:

  * Flip flag to 100%. Deprecate or remove legacy `/api/chat.ts` after stability.

> **Tip:** Keep each phase small to respect 200 k token limits. Once done, commit and update this checklist.
