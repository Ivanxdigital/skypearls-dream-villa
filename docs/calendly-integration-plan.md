# Calendly Integration Implementation Plan for Skypearls Villas RAG

## Overview

This document provides a complete implementation plan for integrating Calendly booking functionality into the Skypearls Villas RAG chatbot using LangGraph tools and the Calendly V2 API.

## Prerequisites

- ✅ Calendly Personal Access Token obtained
- ✅ Environment variable: `CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here`
- ✅ Existing LangGraph setup in `src/agents/villa-graph.ts`

## Implementation Strategy

### Phase 1: Create Calendly API Client
**File to create:** `src/lib/calendly-client.ts`

**Purpose:** Centralized Calendly API interactions

**Key functions needed:**
- `getUser()` - Get current user info
- `getEventTypes()` - Get available meeting types
- `getEventTypeSchedulingUrl(eventTypeUuid)` - Get booking URL for specific event

**Cursor AI Prompt:**
```
Create src/lib/calendly-client.ts that exports functions to interact with Calendly V2 API using personal access token from environment. Include getUser(), getEventTypes(), and getEventTypeSchedulingUrl() functions. Use TypeScript with proper error handling and fetch API. Base URL is https://api.calendly.com
```

### Phase 2: Create Calendly LangGraph Tool
**File to create:** `src/agents/tools/calendly-tool.ts`

**Purpose:** LangGraph tool that can be invoked by the AI agent

**Integration pattern:** Follow existing `retriever-tool.ts` structure

**Tool responsibilities:**
- Detect booking intent keywords
- Fetch appropriate event type
- Return formatted booking information

**Cursor AI Prompt:**
```
Create src/agents/tools/calendly-tool.ts following the pattern in src/agents/tools/retriever-tool.ts. Make it a StructuredTool that detects villa consultation booking requests and returns Calendly scheduling URLs. Input should be user message, output should include booking link and event details. Import calendly client functions from src/lib/calendly-client.ts
```

### Phase 3: Enhance Document Grading
**File to modify:** `src/agents/nodes/gradeDocuments.ts`

**Changes needed:**
- Add booking intent detection alongside greeting detection
- Return `isBookingIntent: boolean` in state updates

**Intent keywords to detect:**
- schedule, book, meeting, call, consultation, tour, viewing, appointment, calendar, available, time

**Cursor AI Prompt:**
```
Modify src/agents/nodes/gradeDocuments.ts to detect booking intent alongside existing greeting detection. Add isBookingIntent detection for keywords: schedule, book, meeting, call, consultation, tour, viewing, appointment, calendar, available, time. Return isBookingIntent boolean in state updates similar to existing isGreeting pattern.
```

### Phase 4: Update State Management
**File to modify:** `src/lib/langgraph/state.ts`

**Changes needed:**
- Add `isBookingIntent?: boolean` to ChatState interface
- Add `bookingInfo?: { eventTypeUrl?: string; eventTypeName?: string }` to ChatState

**Cursor AI Prompt:**
```
Add booking-related state properties to src/lib/langgraph/state.ts ChatState interface: isBookingIntent boolean and optional bookingInfo object with eventTypeUrl and eventTypeName strings. Follow existing state pattern used for isGreeting and documentQuality.
```

### Phase 5: Create Booking Handler Node
**File to create:** `src/agents/nodes/handleBooking.ts`

**Purpose:** Dedicated node for booking flow responses

**Responsibilities:**
- Generate booking-focused responses
- Include Calendly link and context
- Personalize with user's firstName from leadInfo

**Cursor AI Prompt:**
```
Create src/agents/nodes/handleBooking.ts following the pattern of src/agents/nodes/handleGreeting.ts. Import calendly client, fetch villa consultation event type URL, generate personalized booking response including the scheduling link. Use leadInfo.firstName for personalization. Export async function handleBooking that takes ChatState and returns message with booking information.
```

### Phase 6: Update Graph Workflow
**File to modify:** `src/agents/villa-graph.ts`

**Changes needed:**
- Import new `handleBooking` node
- Add `handleBooking` to NodeNames type
- Add booking node to graph
- Update conditional edges to handle booking intent
- Add edge from booking node to end

**Integration pattern:**
```typescript
// Add to conditional edges in gradeDocuments
if (state.isBookingIntent) {
  return "handleBooking";
}
```

**Cursor AI Prompt:**
```
Modify src/agents/villa-graph.ts to integrate booking functionality. Import handleBooking from nodes, add "handleBooking" to NodeNames type, add booking node to graph, update gradeDocuments conditional edges to check for isBookingIntent and route to handleBooking, add edge from handleBooking to __end__. Follow existing pattern used for handleGreeting integration.
```

### Phase 7: Enhance Response Generation
**File to modify:** `src/agents/nodes/generateResponse.ts`

**Changes needed:**
- Add booking context awareness
- Include subtle booking suggestions in relevant responses
- Detect secondary booking intent in responses

**Integration points:**
- When users ask about pricing → mention consultation availability
- When users show serious interest → suggest scheduling call
- Add booking suggestions to WhatsApp sharing triggers

**Cursor AI Prompt:**
```
Enhance src/agents/nodes/generateResponse.ts to include booking awareness. When users show serious interest (pricing, investment questions), subtly suggest villa consultation availability. Add booking suggestions to existing WhatsApp trigger logic. Keep it natural and not pushy - mention "happy to schedule a detailed consultation" when appropriate.
```

### Phase 8: Environment Configuration
**File to modify:** `.env.local` and `.env.example`

**Add:**
```
CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here
```

**For production:** Add to Vercel environment variables

## Testing Strategy

### Manual Testing Checklist
1. **Test booking intent detection:**
   - "Can I schedule a call?"
   - "When are you available?"
   - "I'd like to book a meeting"

2. **Test response integration:**
   - Pricing questions should include booking suggestions
   - Booking responses should include actual Calendly links
   - Personalization with firstName should work

3. **Test error handling:**
   - Invalid Calendly token
   - Network failures
   - Missing event types

### Cursor AI Test Prompt:
```
Create test cases in src/agents/nodes/__tests__/handleBooking.test.ts following the pattern in src/agents/nodes/retrieveDocuments.test.ts. Mock the calendly client and test booking response generation with different leadInfo scenarios.
```

## Integration Points with Existing System

### WhatsApp Integration
- Booking responses should still include WhatsApp contact as backup
- Format: "Schedule directly via [Calendly link] or reach us on WhatsApp +63 999 370 2550"

### Lead Capture
- Booking intent should be captured in chat transcripts
- High-value signal for lead scoring

### Error Fallbacks
- If Calendly API fails, gracefully fall back to WhatsApp contact
- Always provide alternative contact method

## File Structure After Implementation

```
src/
├── lib/
│   ├── calendly-client.ts          [NEW]
│   └── langgraph/
│       └── state.ts                [MODIFIED]
├── agents/
│   ├── tools/
│   │   └── calendly-tool.ts        [NEW]
│   ├── nodes/
│   │   ├── gradeDocuments.ts       [MODIFIED]
│   │   ├── generateResponse.ts     [MODIFIED]
│   │   ├── handleBooking.ts        [NEW]
│   │   └── __tests__/
│   │       └── handleBooking.test.ts [NEW]
│   └── villa-graph.ts              [MODIFIED]
```

## Environment Variables Required

```bash
# Existing
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=

# New for Calendly
CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here
```

## Deployment Checklist

1. ✅ Add Calendly token to Vercel environment variables
2. ✅ Test API connectivity in production
3. ✅ Verify booking flow end-to-end
4. ✅ Monitor for API rate limits
5. ✅ Set up error alerting for Calendly API failures

## Future Enhancements

1. **Webhook Integration:** Real-time booking notifications
2. **Calendar Availability:** Show available time slots in chat
3. **Booking Confirmation:** Automatic follow-up messages
4. **CRM Integration:** Sync bookings with lead management

## Success Metrics

- **Booking conversion rate:** Chat interactions → scheduled calls
- **User experience:** Reduction in steps from interest → meeting
- **Lead quality:** Pre-qualified leads through chat context

---

*This implementation maintains the luxury real estate focus while adding friction-free booking capability to the RAG chatbot experience.*