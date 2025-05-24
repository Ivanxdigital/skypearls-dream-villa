import { ChatState } from "../../lib/langgraph/state.js";
import { ChatOpenAI } from "@langchain/openai";

function extractStringContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(extractStringContent).join(" ");
  }
  if (typeof content === "object" && content !== null && "text" in content) {
    // For MessageContentComplex
    // @ts-ignore
    return content.text;
  }
  return "";
}

export async function generateResponse(state: ChatState) {
  const { question, documents, leadInfo } = state;
  
  console.log("[generateResponse] Generating response for question:", question);
  
  if (!documents || documents.length === 0) {
    console.warn("[generateResponse] No documents available for response generation.");
    
    const fallbackMessage = leadInfo 
      ? `Hi ${leadInfo.firstName}! I'm having trouble pulling up specific details right now, but I'd love to help you with Skypearls Villas. 

We have luxury villas in Siargao that are perfect for both personal use and investment. What specific information were you looking for? I can get you the details you need.`
      : `Hi there! I'm having a small technical issue, but I'm here to help with Skypearls Villas. 

We have beautiful luxury villas in Siargao for both personal use and investment. What would you like to know? I can get you the right information.`;

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
    temperature: 0.4, // Increased for more natural, varied responses
  });
  
  // Format the docs for the prompt
  const formattedDocs = documents?.map(doc => doc.pageContent).join("\n\n") || "";
  
  // Create a friendly, concise sales-focused prompt
  const promptTemplate = leadInfo 
    ? `You are Skye, a friendly villa consultant for Skypearls Villas in Siargao, Philippines. You're speaking with ${leadInfo.firstName}.

STYLE:
- Friendly and casual but professional
- Use simple, clear language
- Be concise and to the point
- Include key details without over-describing
- Subtly sales-focused

APPROACH:
- Give direct answers with relevant details
- Mention benefits briefly
- Suggest next steps when appropriate
- Ask ONE focused question to keep conversation going
- Use their name naturally but not excessively

CONTACT INFO:
You have ${leadInfo.firstName}'s details (email: ${leadInfo.email}, phone: ${leadInfo.phone}).
Offer to send info or arrange calls when they show interest.

Context: ${formattedDocs}

${leadInfo.firstName}'s question: ${question}

Keep it friendly, informative, and concise. End with one clear question or suggestion.`
    : `You are Skye, a friendly villa consultant for Skypearls Villas in Siargao, Philippines.

STYLE:
- Friendly and conversational
- Simple, clear language
- Concise and informative
- Subtly sales-focused

APPROACH:
- Answer directly with key details
- Mention main benefits briefly
- Suggest contact for serious inquiries
- Ask one focused question

Context: ${formattedDocs}

Question: ${question}

Keep it friendly, informative, and concise.`;
  
  try {
    // Generate the response
    const response = await llm.invoke([
      { role: "user", content: promptTemplate }
    ]);
    const answer = extractStringContent(response.content);
    
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
    
    // Simplified fallback with friendly tone
    const errorFallback = leadInfo
      ? `Hi ${leadInfo.firstName}, I'm having a technical issue right now, but I'm still here to help with Skypearls Villas! 

Could you try asking again? Or if you'd prefer, I can have someone call you directly to discuss our available villas.`
      : `Sorry about that - I'm having a small technical issue. I'm still here to help with Skypearls Villas though!

Could you try your question again? Or feel free to share your contact info and I'll have someone reach out with details about our villas.`;

    return {
      messages: [...state.messages, {
        role: "assistant",
        content: errorFallback
      }]
    };
  }
}