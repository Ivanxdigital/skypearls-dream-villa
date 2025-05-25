# Skypearls Villas RAG Chatbot Refactor Plan
**Objective**: Replace email-based lead capture with WhatsApp contact sharing

## Context & Background

The current RAG chatbot collects user emails and sends transcripts via Resend email service. Since Resend isn't properly configured, we're switching to a simpler approach: the AI assistant will proactively share our WhatsApp number (+63 999 370 2550) when users show interest or ask for contact details.

## Pre-Refactor Intelligence Gathering

Before starting, the AI agent should read these files to understand the current architecture:

### Core Files to Analyze First
```
/docs/rag-chatbot-context-guide-for-AI.md  # Complete architecture overview
/project-brief.md                          # Project context and design system
/src/types.ts                             # Current data structures
/src/components/LeadForm.tsx              # Current lead capture form
/src/components/ChatGate.tsx              # Lead capture orchestration
/src/components/ChatPanel.tsx             # Chat interface and transcript logic
/src/agents/villa-graph.ts                # Main AI agent workflow
/api/notify-lead.ts                       # Email notification endpoint
```

### Key Understanding Points
- Current flow: LeadForm → ChatGate → ChatPanel → Email notifications
- Target flow: Simplified form → Direct WhatsApp sharing in chat
- WhatsApp number: +63 999 370 2550
- Keep the luxury UX and design system (colors: #D4B883, #2C2C2C, #E5DDD0, #F8F8F5)

## Refactor Plan

### Phase 1: Data Structure Updates ✅ **COMPLETED**

#### 1.1 Update Types Interface ✅
**File**: `/src/types.ts`
**Status**: ✅ **COMPLETED** - Successfully updated LeadInfo interface
**Changes Made**:
```typescript
// BEFORE
export interface LeadInfo {
  firstName: string;
  email: string;
  phone: string;
  sendTranscript: boolean;
}

// AFTER  
export interface LeadInfo {
  firstName: string;
  email?: string;        // Make optional for backward compatibility
  phone?: string;        // Make optional - nice to have but not required
  sendTranscript?: boolean; // Keep for compatibility, will be unused
}
```

### Phase 2: Frontend Form Simplification ✅ **COMPLETED**

#### 2.1 Simplify LeadForm Component ✅
**File**: `/src/components/LeadForm.tsx`
**Status**: ✅ **COMPLETED** - Form simplified to firstName-only with WhatsApp context
**Changes Made**:
- ✅ Removed email field requirement
- ✅ Removed phone field requirement  
- ✅ Removed sendTranscript toggle
- ✅ Only firstName required now
- ✅ Updated validation schema (Zod)
- ✅ Updated form title/description to reflect WhatsApp approach
- ✅ Added WhatsApp context info box
- ✅ Maintained luxury styling and animations

**New Form Purpose**: ✅ Captures name for personalization, mentions WhatsApp for contact

#### 2.2 Update ChatGate Logic ✅
**File**: `/src/components/ChatGate.tsx`
**Status**: ✅ **COMPLETED** - Removed email dependencies
**Changes Made**:
- ✅ Removed the `fetch("/api/notify-lead")` call in `handleLeadSubmit`
- ✅ Updated localStorage validation to only require `firstName`
- ✅ Updated reset function to use firstName for localStorage keys
- ✅ Simplified the lead submission flow
- ✅ Kept all UI/UX animations and styling

#### 2.3 Update ChatPanel Component ✅
**File**: `/src/components/ChatPanel.tsx`
**Status**: ✅ **COMPLETED** - Email functionality completely removed
**Changes Made**:
- ✅ Removed `notifyLead` function entirely
- ✅ Removed `handleEndChat` email transcript logic
- ✅ Removed transcript-related localStorage operations
- ✅ Updated thread ID generation to use firstName + timestamp
- ✅ Updated chat history localStorage keys to use firstName
- ✅ Kept all UI/UX elements and styling

### Phase 3: AI Assistant Behavior Updates ✅ **COMPLETED**

#### 3.1 Update AI Agent to Share WhatsApp ✅
**Files**: `/src/agents/nodes/generateResponse.ts`, `/src/agents/nodes/handleGreeting.ts`
**Status**: ✅ **COMPLETED** - AI now proactively shares WhatsApp contact
**Research Completed**: ✅ Analyzed `handleGreeting` and `generateResponse` nodes

**Changes Made**:
- ✅ Added WhatsApp contact sharing logic with automatic triggers
- ✅ Implemented smart detection for user interest/intent
- ✅ AI now proactively shares WhatsApp number (+63 999 370 2550) when appropriate
- ✅ Enhanced prompts to include WhatsApp sharing instructions
- ✅ Added comprehensive trigger keywords detection:
  - ✅ "contact", "call", "phone", "reach out", "get in touch", "talk to"
  - ✅ "price", "pricing", "cost", "how much", "afford", "budget" 
  - ✅ "schedule", "visit", "viewing", "tour", "see the villa", "show me"
  - ✅ "buy", "purchase", "invest", "interested", "serious about"
  - ✅ "more information", "details", "brochure", "specifics"
  - ✅ "availability", "book", "reserve", "when can", "meeting"

#### 3.2 Update Agent Prompts/Instructions ✅
**Files**: `/src/agents/nodes/generateResponse.ts`, `/src/agents/nodes/handleGreeting.ts`
**Status**: ✅ **COMPLETED** - Enhanced AI behavior and prompts
**Changes Made**:
- ✅ Added WhatsApp number (+63 999 370 2550) to agent's knowledge base
- ✅ Included instructions for proactive WhatsApp sharing
- ✅ Enhanced greeting responses (30% chance to mention WhatsApp naturally)
- ✅ Maintained helpful, luxury-focused tone
- ✅ Agent still answers general questions but guides toward WhatsApp for specific inquiries
- ✅ Added fallback WhatsApp sharing for error cases

### Phase 4: Backend Cleanup 🔄 **OPTIONAL/PENDING**

#### 4.1 Disable Email Notifications (Optional)
**File**: `/api/notify-lead.ts`
**Status**: 🔄 **PENDING** - Currently unused by frontend (safe to leave as-is)
**Changes**: 
- Either disable the endpoint entirely
- Or modify to just log lead info without sending emails
- This is low priority since frontend won't call it anymore
- **Current Status**: Endpoint exists but is not called by the refactored frontend

### Phase 5: Testing & Validation ✅ **COMPLETED**

#### 5.1 Test New Flow ✅
**Status**: ✅ **COMPLETED** - All core functionality verified
- ✅ Verified lead form only asks for name
- ✅ Confirmed chat works without email dependencies
- ✅ Tested AI assistant WhatsApp sharing triggers
- ✅ Verified localStorage works with firstName-based keys
- ✅ Confirmed luxury styling is maintained
- ✅ **Build Test**: Successfully compiled with `npm run build`

#### 5.2 Backward Compatibility ✅ 
**Status**: ✅ **COMPLETED** - Graceful handling implemented
- ✅ Existing localStorage data handled gracefully
- ✅ Old LeadInfo structure with email/phone still works
- ✅ Optional fields in interface ensure compatibility
- ✅ Thread ID generation updated but backwards compatible

## Implementation Notes

### Preserve These Elements
- All luxury styling and animations
- Scroll reveal animations and microinteractions  
- Color scheme and typography (Playfair Display + Montserrat)
- Mobile responsiveness
- Chat persistence functionality
- AI agent quality and context awareness

## Key Success Criteria ✅ **ALL COMPLETED**

1. ✅ **COMPLETED** - Form only asks for first name
2. ✅ **COMPLETED** - No email functionality or dependencies
3. ✅ **COMPLETED** - AI assistant proactively shares WhatsApp: +63 999 370 2550
4. ✅ **COMPLETED** - Chat works seamlessly without email capture
5. ✅ **COMPLETED** - Maintains all luxury UX elements
6. ✅ **COMPLETED** - Mobile and desktop responsive

## 📊 **Refactor Status: 95% COMPLETE**

### ✅ **What's Working:**
- Simplified firstName-only lead capture
- WhatsApp-first AI assistant with smart triggers
- Removed email dependencies across frontend
- Maintained premium UX/UI design
- Backwards compatibility with existing data
- Successful build compilation

### 🔄 **Optional Remaining:**
- Phase 4: Backend cleanup (non-critical)
- Enhanced analytics for WhatsApp conversion tracking

## ✅ **Refactor Implementation Summary**

### **Successfully Completed (December 2024):**

1. ✅ **Intelligence Gathering** - Analyzed all core architecture files
2. ✅ **Incremental Implementation** - Completed phases 1-3 systematically  
3. ✅ **Continuous Testing** - Verified functionality after each major change
4. ✅ **Preserved Premium UX** - Maintained all Tailwind classes, animations, and luxury design
5. ✅ **User Experience Focus** - Created smoother, more direct user flow

### **Key Achievements:**
- ✅ **Simplified Onboarding**: From email/phone requirement to firstName-only
- ✅ **Smart AI Integration**: Proactive WhatsApp sharing with 15+ trigger keywords
- ✅ **Technical Excellence**: Clean code, backwards compatibility, successful build
- ✅ **Premium Experience**: Maintained luxury feel while improving usability

### **Result:**
🎯 **Goal Achieved**: A simpler, more direct path to connecting potential buyers with the sales team via WhatsApp (+63 999 370 2550), while maintaining the premium feel and AI assistant quality.

## 🚀 **Ready for Production**
The refactored system is now ready for deployment with the WhatsApp-first contact strategy fully implemented.