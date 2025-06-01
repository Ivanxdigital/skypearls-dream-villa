import { ChatState } from "../../lib/langgraph/state.js";
import { ChatOpenAI } from "@langchain/openai";
import { getVillaConsultationEventType } from "../../lib/calendly-client.js";

function extractStringContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(extractStringContent).join(" ");
  }
  if (typeof content === "object" && content !== null && "text" in content) {
    // For MessageContentComplex
    // @ts-expect-error - MessageContentComplex type not fully defined in current types
    return content.text;
  }
  return "";
}

// WhatsApp contact sharing triggers
const WHATSAPP_TRIGGERS = [
  'contact', 'call', 'phone', 'reach out', 'get in touch', 'talk to',
  'price', 'pricing', 'cost', 'how much', 'afford', 'budget',
  'schedule', 'visit', 'viewing', 'tour', 'see the villa', 'show me',
  'buy', 'purchase', 'invest', 'interested', 'serious about',
  'more information', 'details', 'brochure', 'specifics',
  'availability', 'book', 'reserve', 'when can', 'meeting'
];

// Enhanced booking suggestion triggers (subset of WhatsApp triggers that indicate consultation readiness)
const BOOKING_SUGGESTION_TRIGGERS = [
  'price', 'pricing', 'cost', 'how much', 'budget', 'afford',
  'invest', 'investment', 'roi', 'returns',
  'serious about', 'interested in buying', 'ready to buy',
  'more information', 'details', 'specifics', 'brochure',
  'schedule', 'visit', 'viewing', 'tour', 'see the villa',
  'when can', 'availability', 'available',
  'consultation', 'consult', 'discuss', 'talk about'
];

function shouldShareWhatsApp(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  return WHATSAPP_TRIGGERS.some(trigger => lowerQuestion.includes(trigger));
}

function shouldSuggestBooking(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  return BOOKING_SUGGESTION_TRIGGERS.some(trigger => lowerQuestion.includes(trigger));
}

function getWhatsAppMessage(leadInfo: { firstName?: string } | undefined): string {
  const firstName = leadInfo?.firstName || '';
  const personalGreeting = firstName ? `${firstName}, ` : '';
  
  return `\n\n💬 **For detailed information, pricing, and villa viewings, please contact us directly on WhatsApp at +63 999 370 2550.** Our team can provide personalized assistance and answer all your questions about Skypearls Villas!`;
}

async function getBookingSuggestion(leadInfo: { firstName?: string } | undefined): Promise<string> {
  try {
    // Try to get the villa consultation event type
    const eventType = await getVillaConsultationEventType();
    
    if (eventType?.scheduling_url) {
      return `\n\n📅 **Ready to see the villas in person?** I'd be happy to schedule a villa viewing where you can explore the properties, see the luxury features, and discuss your specific needs: ${eventType.scheduling_url}`;
    }
  } catch (error) {
    console.warn('[generateResponse] Could not fetch booking link for suggestion:', error);
  }
  
  // Fallback to WhatsApp if Calendly is unavailable
  return `\n\n📅 **Ready to see the villas in person?** I'd be happy to schedule a villa viewing where you can explore the properties, see the luxury features, and discuss your specific needs. Please reach out on WhatsApp at +63 999 370 2550 to schedule.`;
}

export async function generateResponse(state: ChatState) {
  const { question, documents, leadInfo, messages } = state;
  
  console.log("[generateResponse] Generating response for question:", question);
  
  // Check if this is an ongoing conversation (has previous assistant messages)
  const isOngoingConversation = messages.some(msg => msg.role === "assistant");
  
  // Check for WhatsApp and booking suggestions
  const includeWhatsApp = shouldShareWhatsApp(question);
  const includeBookingSuggestion = shouldSuggestBooking(question);
  
  if (!documents || documents.length === 0) {
    console.warn("[generateResponse] No documents available for response generation.");
    
    const whatsappInfo = includeWhatsApp ? getWhatsAppMessage(leadInfo) : '';
    const bookingSuggestion = includeBookingSuggestion && !includeWhatsApp ? await getBookingSuggestion(leadInfo) : '';
    
    const fallbackMessage = isOngoingConversation 
      ? (leadInfo 
        ? `I'm having trouble pulling up specific details right now, but I'd love to help you with Skypearls Villas. 

We have luxury villas in Siargao that are perfect for both personal use and investment. What specific information were you looking for? I can get you the details you need.${whatsappInfo}${bookingSuggestion}`
        : `I'm having a small technical issue, but I'm here to help with Skypearls Villas. 

We have beautiful luxury villas in Siargao for both personal use and investment. What would you like to know? I can get you the right information.${whatsappInfo}${bookingSuggestion}`)
      : (leadInfo 
        ? `Hi ${leadInfo.firstName}! I'm having trouble pulling up specific details right now, but I'd love to help you with Skypearls Villas. 

We have luxury villas in Siargao that are perfect for both personal use and investment. What specific information were you looking for? I can get you the details you need.${whatsappInfo}${bookingSuggestion}`
        : `Hi there! I'm having a small technical issue, but I'm here to help with Skypearls Villas. 

We have beautiful luxury villas in Siargao for both personal use and investment. What would you like to know? I can get you the right information.${whatsappInfo}${bookingSuggestion}`);

    return {
      messages: [...state.messages, {
        role: "assistant",
        content: fallbackMessage
      }]
    };
  }
  
  // Initialize LLM for response generation
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
  });
  
  // Format the docs for the prompt
  const formattedDocs = documents?.map(doc => doc.pageContent).join("\n\n") || "";
  
  // Enhanced instructions for WhatsApp and booking suggestions
  const whatsappInstruction = includeWhatsApp ? `

IMPORTANT: Since the user is asking about ${question.toLowerCase().includes('price') || question.toLowerCase().includes('cost') ? 'pricing' : question.toLowerCase().includes('contact') || question.toLowerCase().includes('call') ? 'contact' : question.toLowerCase().includes('visit') || question.toLowerCase().includes('tour') ? 'viewing' : 'detailed information'}, you MUST include our WhatsApp contact information at the end of your response:

"For detailed information, pricing, and villa viewings, please contact us directly on WhatsApp at +63 999 370 2550. Our team can provide personalized assistance and answer all your questions about Skypearls Villas!"` : '';

  const bookingInstruction = includeBookingSuggestion && !includeWhatsApp ? `

BOOKING SUGGESTION: Since the user is showing serious interest in ${question.toLowerCase().includes('price') || question.toLowerCase().includes('cost') ? 'pricing details' : question.toLowerCase().includes('invest') ? 'investment opportunities' : question.toLowerCase().includes('visit') || question.toLowerCase().includes('tour') ? 'villa viewings' : 'villa information'}, naturally suggest a villa viewing. Mention that we can schedule a personalized villa viewing where they can see the properties in person and discuss their specific needs.` : '';
  
  // Create a friendly, concise sales-focused prompt
  const conversationContext = isOngoingConversation 
    ? "This is an ongoing conversation. Continue naturally without greeting the user again. Focus on answering their question directly."
    : "This is the start of the conversation. You may greet the user if appropriate.";

  const promptTemplate = leadInfo 
    ? `You are Skye, a friendly villa consultant for Skypearls Villas in Siargao, Philippines. You're speaking with ${leadInfo.firstName}.

CONVERSATION CONTEXT:
${conversationContext}

STYLE:
- Friendly and casual but professional
- Use simple, clear language
- Be concise and to the point
- Include key details without over-describing
- Subtly sales-focused
- ${isOngoingConversation ? "DO NOT start with greetings like 'Hello', 'Hi there', etc. Continue the conversation naturally." : ""}

APPROACH:
- Give direct answers with relevant details
- Mention benefits briefly
- Suggest next steps when appropriate
- Ask ONE focused question to keep conversation going
- Use their name naturally but not excessively

CONTACT & BOOKING STRATEGY:
Our WhatsApp number is +63 999 370 2550. Share this when users show genuine interest, ask about pricing, want to schedule viewings, or need detailed information.

VILLA VIEWING SUGGESTIONS:
When users show serious interest (pricing, investment, viewing requests), naturally suggest we can schedule a villa viewing where they can see the properties in person and discuss their specific needs. Keep it natural and helpful, not pushy.${whatsappInstruction}${bookingInstruction}

Context: ${formattedDocs}

${leadInfo.firstName}'s question: ${question}

Keep it friendly, informative, and concise. End with one clear question or suggestion.`
    : `You are Skye, a friendly villa consultant for Skypearls Villas in Siargao, Philippines.

CONVERSATION CONTEXT:
${conversationContext}

STYLE:
- Friendly and conversational
- Simple, clear language
- Concise and informative
- Subtly sales-focused
- ${isOngoingConversation ? "DO NOT start with greetings like 'Hello', 'Hi there', etc. Continue the conversation naturally." : ""}

APPROACH:
- Answer directly with key details
- Mention main benefits briefly
- Suggest contact for serious inquiries
- Ask one focused question

CONTACT & BOOKING STRATEGY:
Our WhatsApp number is +63 999 370 2550. Share this when users show genuine interest, ask about pricing, want to schedule viewings, or need detailed information.

VILLA VIEWING SUGGESTIONS:
When users show serious interest (pricing, investment, viewing requests), naturally suggest we can schedule a villa viewing where they can see the properties in person and discuss their specific needs. Keep it natural and helpful, not pushy.${whatsappInstruction}${bookingInstruction}

Context: ${formattedDocs}

Question: ${question}

Keep it friendly, informative, and concise.`;
  
  try {
    // Generate the response
    const response = await llm.invoke([
      { role: "user", content: promptTemplate }
    ]);
    let answer = extractStringContent(response.content);
    
    // Ensure WhatsApp info is included if needed and not already present
    if (includeWhatsApp && !answer.includes('+63 999 370 2550')) {
      answer += getWhatsAppMessage(leadInfo);
    }
    
    // Add booking suggestion if needed and WhatsApp not already included
    if (includeBookingSuggestion && !includeWhatsApp && !answer.toLowerCase().includes('viewing') && !answer.toLowerCase().includes('schedule')) {
      const bookingSuggestion = await getBookingSuggestion(leadInfo);
      answer += bookingSuggestion;
    }
    
    console.log("[generateResponse] Generated response:", answer.slice(0, 100) + "...");
    
    // Return the response as a new message to add to the conversation
    return {
      messages: [...state.messages, {
        role: "assistant",
        content: answer
      }]
    };
  } catch (error) {
    console.error("[generateResponse] Error generating response:", error);
    
    const whatsappInfo = includeWhatsApp ? getWhatsAppMessage(leadInfo) : '';
    const bookingSuggestion = includeBookingSuggestion && !includeWhatsApp ? await getBookingSuggestion(leadInfo) : '';
    
    // Simplified fallback with friendly tone
    const errorFallback = isOngoingConversation
      ? (leadInfo
        ? `I'm having a technical issue right now, but I'm still here to help with Skypearls Villas! 

Could you try asking again? Or if you'd prefer, I can have someone call you directly to discuss our available villas.${whatsappInfo}${bookingSuggestion}`
        : `Sorry about that - I'm having a small technical issue. I'm still here to help with Skypearls Villas though!

Could you try your question again? Or feel free to share your contact info and I'll have someone reach out with details about our villas.${whatsappInfo}${bookingSuggestion}`)
      : (leadInfo
        ? `Hi ${leadInfo.firstName}, I'm having a technical issue right now, but I'm still here to help with Skypearls Villas! 

Could you try asking again? Or if you'd prefer, I can have someone call you directly to discuss our available villas.${whatsappInfo}${bookingSuggestion}`
        : `Sorry about that - I'm having a small technical issue. I'm still here to help with Skypearls Villas though!

Could you try your question again? Or feel free to share your contact info and I'll have someone reach out with details about our villas.${whatsappInfo}${bookingSuggestion}`);

    return {
      messages: [...state.messages, {
        role: "assistant",
        content: errorFallback
      }]
    };
  }
}