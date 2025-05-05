# Skypearls Villas — RAG Chatbot Setup Guide  
*Pinecone + OpenAI Edition (Cursor‑ready)*  

---

## 1. Overview  
This guide walks Cursor's AI coding agent through adding a **Retrieval‑Augmented Generation (RAG) chatbot** to the existing Skypearls Villas React/Tailwind site.

Your Pinecone index (`skypearls-vectors`) is already live. The agent's job is to:

1. Store villa content in Pinecone.  
2. Expose a `/api/chat` endpoint that uses OpenAI + Pinecone to answer questions.  
3. Capture leads (name / phone / email + chat transcript) and email them to you.  
4. Render a floating chat widget on every page.

---

## 2. Prerequisites  

| Need | Where to get it | Notes |
|------|-----------------|-------|
| **OpenAI API key** | https://platform.openai.com/ | GPT‑4o or GPT‑4o‑mini |
| **Pinecone API key & env** | Pinecone > API Keys tab | Index already exists |
| **Resend API key** (or Nodemailer creds) | https://resend.com/ | For lead emails |
| Node 18+ & npm | local dev box | Cursor handles scripts |
| Git repo & Vercel | existing site | For deployment |

---

## 3. Environment Variables (`.env`)  

```bash
# OpenAI
OPENAI_API_KEY=sk‑…
OPENAI_MODEL=gpt-4o-mini   # or gpt-4o

# Pinecone
PINECONE_API_KEY=pc‑…
PINECONE_ENV=us-east-1
PINECONE_INDEX=skypearls-vectors

# Lead email (Resend)
RESEND_API_KEY=re_…
LEAD_EMAIL_TO=ivanxdigital@gmail.com
```

Add these to **Vercel > Project Settings > Environment Variables** too.

---

## 4. Folder Structure to Add  

```
/docs/                   # plain‑text villa data lives here
  └─ villas/
       └─ villa-anna.md
/scripts/
  └─ ingest.ts           # one‑time & repeatable ingest into Pinecone
/api/
  ├─ chat.ts             # RAG endpoint
  └─ notify-lead.ts      # sends captured lead via email
/src/components/
  └─ ChatPanel.tsx       # floating chat widget
```

---

## 5. Cursor Task Manager  
*(Feed the block below DIRECTLY to Cursor; it's formatted as a task list with micro‑tasks.)*

```task-manager
TASK 1 – Install dependencies
  - [x] Run: npm i langchain @langchain/openai @langchain/pinecone @pinecone-database/pinecone dotenv resend

TASK 2 – Create villa content file
  - [x] Make folder /docs/villas
  - [x] Add villa-anna.md with the markdown below:

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
    **Option 1:** 20% down, 80% bank financing (15–20 yrs)
    **Option 2:** 30% down, 70% bank financing (15–20 yrs)
    **Option 3:** 50% down + 10 % discount, 50% bank financing
    **Option 4:** 100% cash – 15 % discount
    **Option 5:** 40‑year lease; 30–50% down, 50–70% in‑house financing

TASK 3 – Add scripts/ingest.ts
  - [x] Use LangChain RecursiveCharacterTextSplitter (chunkSize 800, overlap 100)
  - [x] Embed with OpenAIEmbeddings
  - [x] Upsert to Pinecone index PINECONE_INDEX
  - [x] Log "✓ Ingestion complete"

TASK 4 – Run ingestion locally
  - [x] Execute: node scripts/ingest.ts
  - [x] Confirm record count > 0 in Pinecone console

TASK 5 – Add api/chat.ts (serverless)
  - [x] Import ChatOpenAI, ConversationalRetrievalQAChain, PineconeStore
  - [x] Accept POST { messages: ChatMessage[] }
  - [x] Set retriever k=4, temperature 0.2
  - [x] Return { reply }

TASK 6 – Add api/notify-lead.ts
  - [x] Accept POST { lead, transcript }
  - [x] Send email via Resend from bot@skypearlsvillas.com to LEAD_EMAIL_TO
  - [x] Respond 200

TASK 7 – Build ChatPanel.tsx
  - [ ] Floating button bottom‑right
  - [ ] Dialog with message list & input box
  - [ ] Keep client‑side chat history
  - [ ] Detect when bot asks for name/phone/email; store in leadInfo
  - [ ] When bot replies "✅ Lead captured", POST to /api/notify-lead with transcript

TASK 8 – Inject <ChatPanel /> into root layout
  - [ ] Import once in App.tsx

TASK 9 – Add .env.example for contributors

TASK 10 – Deploy
  - [ ] Push to GitHub
  - [ ] Vercel build should pass (allows /api routes)
  - [ ] ENV vars configured
```

---

## 6. Testing Checklist  

- **Local dev**: `npm run dev` then visit `http://localhost:5173`  
- Ask: "How much is the villa?" → expect accurate price reply.  
- Provide name/phone/email → bot replies ✅ and email arrives.  
- **Pinecone dashboard** shows record count & recent reads.  
- **Vercel logs** show chat & email endpoints executing.

---

## 7. Going Further  

* Add more villa/FAQ markdown files → re‑run `npm run ingest`.  
* Fine‑tune prompt in `api/chat.ts` systemMsg to control tone.  
* Store leads in Supabase instead of email for CRM reporting.  
* Cache OpenAI responses to save tokens (LangChain Memory + KV).  

---

*End of file.*
