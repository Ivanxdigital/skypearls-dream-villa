# Calendly Integration Task Manager 📅

## Project Overview
Integrating Calendly booking functionality into the Skypearls Villas RAG chatbot using LangGraph tools and the Calendly V2 API.

---

## Progress Tracker
- ⏳ **Status**: In Progress
- 📅 **Started**: December 2024
- 🎯 **Target Completion**: TBD
- 📊 **Overall Progress**: 7/8 phases complete

---

## Task Phases

### ✅ Phase 0: Pre-Implementation Setup (COMPLETE)
- [x] **Task 0.1**: Read and understand integration plan
- [x] **Task 0.2**: Analyze existing codebase structure
- [x] **Task 0.3**: Create task manager (this document)
- [x] **Task 0.4**: Set up environment variables

**Dependencies**: None  
**Files**: `.env.local`, `.env.example`  
**Success Criteria**: ✅ CALENDLY_PERSONAL_ACCESS_TOKEN configured

---

### ✅ Phase 1: Calendly API Client (COMPLETE)
- [x] **Task 1.1**: Create Calendly API client module
  - **File**: `src/lib/calendly-client.ts`
  - **Functions**: `getUser()`, `getEventTypes()`, `getEventTypeSchedulingUrl()`
  - **Dependencies**: Environment setup
  - **Patterns**: Follow `src/lib/vector-store.ts` structure
  - **Success Criteria**: ✅ All API functions work with proper TypeScript types and error handling
  - **Bonus**: Added `getVillaConsultationEventType()`, caching, health checks

### ✅ Phase 2: Calendly LangGraph Tool (COMPLETE)
- [x] **Task 2.1**: Create Calendly tool for LangGraph
  - **File**: `src/agents/tools/calendly-tool.ts`
  - **Dependencies**: ✅ Phase 1 complete
  - **Patterns**: Follow `src/agents/retriever-tool.ts` structure
  - **Success Criteria**: ✅ StructuredTool that detects booking intent and returns scheduling URLs
  - **Bonus**: Advanced intent detection, health checks, WhatsApp fallbacks

### ✅ Phase 3: Enhanced Document Grading (COMPLETE)
- [x] **Task 3.1**: Add booking intent detection to document grading
  - **File**: `src/agents/nodes/gradeDocuments.ts`
  - **Changes**: ✅ Added comprehensive `isBookingIntent` detection logic with keywords and regex patterns
  - **Keywords**: ✅ Implemented comprehensive detection including schedule, book, meeting, call, consultation, tour, viewing, appointment, calendar, available, time
  - **Dependencies**: None
  - **Patterns**: ✅ Followed existing `isGreeting` detection pattern
  - **Success Criteria**: ✅ Returns `isBookingIntent: boolean` in state updates with special documentQuality value (-2)

### ✅ Phase 4: State Management Updates (COMPLETE)
- [x] **Task 4.1**: Update ChatState interface
  - **File**: `src/lib/langgraph/state.ts`
  - **Changes**: ✅ Added `isBookingIntent?: boolean` and `bookingInfo?: { eventTypeUrl?: string; eventTypeName?: string }`
  - **Dependencies**: None
  - **Patterns**: ✅ Followed existing `isGreeting` and `documentQuality` patterns
  - **Success Criteria**: ✅ State properly typed and accessible across nodes with Annotation definitions

### ✅ Phase 5: Booking Handler Node (COMPLETE)
- [x] **Task 5.1**: Create booking response handler
  - **File**: `src/agents/nodes/handleBooking.ts`
  - **Dependencies**: ✅ Phases 1, 4 complete
  - **Patterns**: ✅ Followed `src/agents/nodes/handleGreeting.ts` structure
  - **Success Criteria**: ✅ Generates personalized booking responses with Calendly links, health checks, WhatsApp fallbacks, and sets bookingInfo in state

### ✅ Phase 6: Graph Workflow Updates (COMPLETE)
- [x] **Task 6.1**: Integrate booking node into villa graph
  - **File**: `src/agents/villa-graph.ts`
  - **Changes**: ✅ 
    - Added "handleBooking" to NodeNames type
    - Added booking node to graph
    - Updated conditional edges in gradeDocuments to check for isBookingIntent
    - Added edge from handleBooking to __end__
    - Added proper logging for booking intent detection
  - **Dependencies**: ✅ Phases 3, 5 complete
  - **Patterns**: ✅ Followed existing handleGreeting integration pattern perfectly
  - **Success Criteria**: ✅ Booking flow properly routed in graph workflow with priority: isGreeting → isBookingIntent → documentQuality

### ✅ Phase 7: Enhanced Response Generation (COMPLETE)
- [x] **Task 7.1**: Add booking awareness to response generation
  - **File**: `src/agents/nodes/generateResponse.ts`
  - **Changes**: ✅ Enhanced with comprehensive booking suggestion logic:
    - Added `BOOKING_SUGGESTION_TRIGGERS` array for consultation readiness detection
    - Imported `getVillaConsultationEventType` from Calendly client
    - Created `shouldSuggestBooking()` and `getBookingSuggestion()` functions
    - Updated prompt instructions with villa consultation strategy
    - Integrated booking suggestions into all response paths (normal, fallback, error)
    - Graceful fallback to WhatsApp if Calendly unavailable
  - **Dependencies**: ✅ Phase 1 complete
  - **Patterns**: ✅ Followed existing WhatsApp integration logic perfectly
  - **Success Criteria**: ✅ Natural booking suggestions appear when users show serious interest (pricing, investment, viewing, detailed info)

### 🔄 Phase 8: Environment & Testing (CURRENT)
- [ ] **Task 8.1**: Configure environment variables
  - **Files**: `.env.local`, `.env.example`
  - **Changes**: Add CALENDLY_PERSONAL_ACCESS_TOKEN
  - **Dependencies**: None
  - **Success Criteria**: Environment properly configured for local and production

- [ ] **Task 8.2**: Create tests for booking functionality
  - **File**: `src/agents/nodes/__tests__/handleBooking.test.ts`
  - **Dependencies**: Phase 5 complete
  - **Patterns**: Follow `src/agents/nodes/retrieveDocuments.test.ts`
  - **Success Criteria**: Comprehensive test coverage for booking flow

- [ ] **Task 8.3**: End-to-end testing
  - **Scope**: Full booking flow from intent detection to Calendly link
  - **Dependencies**: Phases 1-7 complete
  - **Success Criteria**: Booking flow works seamlessly in development

---

## Implementation Notes

### Key Patterns to Follow
1. **State Management**: Use Annotation pattern like existing `isGreeting`
2. **Node Structure**: Follow `handleGreeting.ts` pattern for new nodes
3. **Tool Structure**: Follow `retriever-tool.ts` pattern for Calendly tool
4. **Error Handling**: Graceful fallbacks to WhatsApp contact
5. **TypeScript**: Strict typing throughout, no `any` types

### Integration Points
- **WhatsApp Fallback**: If Calendly fails, fall back to WhatsApp +63 999 370 2550
- **Lead Personalization**: Use `leadInfo.firstName` for personalized responses
- **Response Enhancement**: Natural booking suggestions in relevant contexts

### Testing Strategy
- Unit tests for each new function
- Integration tests for booking flow
- Manual testing with various booking intent phrases
- Error scenario testing (API failures, network issues)

---

## Environment Variables Required

```bash
# Existing
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name

# New for Calendly Integration
CALENDLY_PERSONAL_ACCESS_TOKEN=your_calendly_token
```

---

## Success Metrics
- [ ] Booking intent detection accuracy > 90%
- [ ] Calendly API calls successful
- [ ] Natural integration with existing conversation flow
- [ ] Graceful error handling and fallbacks
- [ ] No regression in existing functionality

---

## Risk Mitigation
- **API Rate Limits**: Implement caching and error handling
- **Network Failures**: Always provide WhatsApp fallback
- **Token Expiry**: Clear error messages and admin notifications
- **User Experience**: Keep booking suggestions natural, not pushy

---

*Last Updated: December 2024*
*Next Review: After each phase completion* 