# PRD · Pre‑Chat Lead Capture Enhancement  
*Skypearls Villas RAG Chatbot*  

---

## 1 · Objective  
Add a lightweight **lead‑capture gate** in front of the chat widget so we reliably collect a visitor’s **First name, Email, Phone** and an **opt‑in toggle** to receive a chat transcript via email.  
The chatbot must then greet the user by name and forward `sendTranscript` to `/api/notify‑lead.ts`.

---

## 2 · Success Metrics  
| Metric | Target | Notes |
|--------|--------|-------|
| Lead‑form completion rate | ≥ 75 % of chat opens | Measured by local `leadInfo.captured` flag |
| Transcript opt‑in rate | ≥ 50 % of completed forms | — |
| Production bugs | 0 P0 / P1 on release | Smoke‑test checklist below |

---

## 3 · Functional Requirements  
1. **Lead Form Modal**  
   - Fields: `firstName*`, `email*`, `phone*`, `sendTranscript (boolean)`  
   - All required except toggle.  
   - Validation inline (zod).  
2. **Persistent Gating**  
   - Chat only mounts after `leadInfo` is stored.  
   - Cache in `localStorage` (`skypearls_lead`) so repeat visitors skip the form.  
3. **Personalised Greeting**  
   - First assistant message: "Hi *{{firstName}}*, …"  
4. **Backend Update**  
   - `/api/notify‑lead.ts` accepts `sendTranscript`; if `true`, email the same transcript to the visitor.  
5. **No environment‑variable changes required**.

---

## 4 · Non‑Functional Requirements  
- **Performance**: Lead form bundle < 4 KB gzipped incremental.  
- **Accessibility**: WCAG 2.1 AA; keyboard / screen‑reader friendly.  
- **Security**: No API keys exposed; validate again server‑side.  
- **Design**: Matches shadcn / Tailwind style tokens (`bg-skypearl`, etc.).  

---

## 5 · Key Files / Touch Points  
| File | Action |
|------|--------|
| `src/components/LeadForm.tsx` | **NEW** |
| `src/components/ChatGate.tsx` | **NEW** wrapper |
| `src/components/ChatPanel.tsx` | Refactor greeting + remove regex lead capture |
| `api/notify-lead.ts` | Zod schema + resend visitor transcript |
| `types.ts` or similar | Add `LeadInfo { firstName; email; phone; sendTranscript }` |

---

## 6 · Task Manager  

### Legend  
- ☐ = to do ✓ = done  
- Owner defaults to **Cursor AI agent**  

| # | Area | Task | Micro‑tasks | Status |
|---|------|------|------------|--------|
| 1 | FE | **Create LeadForm.tsx** | ✓ Install `@hookform/resolvers` & import zod<br>✓ Build Radix Dialog modal<br>✓ Inputs + `Switch` toggle<br>✓ Tailwind styles, error states<br>✓ `onSubmit` passes `leadInfo` up | ✓ |
| 2 | FE | **Create ChatGate.tsx** | ✓ State: `leadInfo` / `setLeadInfo`<br>✓ Gate: show form → show chat<br>✓ Persist to `localStorage` | ✓ |
| 3 | FE | **Refactor ChatPanel.tsx** | ✓ Remove `extractLeadInfo` + related logic<br>✓ Accept `leadInfo` prop<br>✓ Insert personalised first message<br>✓ Forward `sendTranscript` in `notifyLead` fetch | ✓ |
| 4 | BE | **Extend notify-lead.ts** | ✓ Update Zod schema (`sendTranscript` optional bool)<br>✓ If `sendTranscript && lead.email` send email via Resend<br>✓ Escape HTML in transcript | ✓ |
| 5 | Types | **Update shared types** | ✓ Define `LeadInfo` interface in `types.ts`<br>✓ Import wherever needed | ✓ |
| 6 | QA | **Automated tests** | ✓ Jest unit test for Zod schema<br>☐ Render test for LeadForm validation<br>☐ Integration test: mock form → chat → notify | ☐ |
| 7 | QA | **Manual / smoke tests** | ☐ Form validation states<br>☐ Chat greets by name<br>☐ Email sent to business & visitor<br>☐ Opt‑out leaves visitor email blank | ☐ |
| 8 | Docs | **Update README / rag-chatbot.md** | ✓ Add lead‑form flow diagram<br>✓ Note new optional field in API contract | ✓ |
| 9 | Deploy | **Vercel preview** | ☐ Push branch → Vercel build<br>☐ Verify env vars present<br>☐ Approve production promote | ☐ |

---

## 7 · Smoke‑Test Checklist  
- [ ] Submit invalid email → inline error.  
- [ ] Toggle transcript off → only business email received.  
- [ ] Returning user skips form (data from `localStorage`).  
- [ ] Mobile Safari viewport no layout shift.  

---

## 8 · Out of Scope  
- CRM storage (Supabase)  
- Multi‑language localisation  
- GDPR consent banner  

---

## 9 · Appendix – Example API payload  

```json
{
  "lead": {
    "firstName": "Anna",
    "email": "anna@example.com",
    "phone": "+639171234567"
  },
  "sendTranscript": true,
  "transcript": "assistant: Hi Anna!…"
}
```

---

*Version 0.1 – May 7 2025*  
