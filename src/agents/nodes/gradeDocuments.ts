import { ChatState } from "../../lib/langgraph/state.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

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

// Comprehensive greeting patterns (case-insensitive)
const greetingPatterns = [
  // Simple greetings
  /^hi\b/i,
  /^hello\b/i,
  /^hey\b/i,
  /^good morning\b/i,
  /^good afternoon\b/i,
  /^good evening\b/i,
  
  // Greeting combinations
  /^(hi|hello|hey)\s+(there|how are you|how's it going)/i,
  /^hello\s+how\s+are\s+you/i,
  /^hi\s+how\s+are\s+you/i,
  /^hey\s+how\s+are\s+you/i,
  
  // Standalone how are you
  /^how\s+are\s+you/i,
  /^how's\s+it\s+going/i,
  /^what's\s+up/i,
  /^sup\b/i,
  
  // Other casual greetings
  /^howdy\b/i,
  /^greetings\b/i,
  /^salutations\b/i,
  
  // Question-style greetings
  /^how\s+(is\s+)?everything/i,
  /^how\s+have\s+you\s+been/i,
  /^how\s+do\s+you\s+do/i,
  
  // Very short messages that are likely greetings
  /^\w{1,3}[!.]*$/i, // 1-3 character messages like "hi!", "yo", "sup"
];

// Booking intent detection - more precise to avoid false positives
function detectBookingIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Direct booking terms that are very specific
  const directBookingTerms = [
    'schedule', 'book', 'booking', 'appointment', 'calendar',
    'meeting', 'call', 'consultation', 'consult'
  ];
  
  // Viewing/tour terms that specifically indicate wanting to see property
  const viewingTerms = [
    'tour', 'viewing', 'visit property', 'see villa', 'show villa'
  ];
  
  // Check for direct booking patterns with action verbs
  const bookingPatterns = [
    /\b(schedule|book|arrange|set up)\s+(a\s+)?(meeting|call|consultation|appointment|viewing|tour)\b/i,
    /\b(can|could|would like to|want to|need to)\s+(schedule|book|meet|call|visit|see)\b/i,
    /\bwhen\s+(are you|is someone|can we)\s+(available|free|meet)\b/i,
    /\bhow\s+(do|can)\s+i\s+(schedule|book|contact|reach|arrange)\b/i,
    /\binterested in\s+(meeting|calling|scheduling|booking|visiting)\b/i,
    /\bneed to\s+(talk|speak|discuss|meet)\s+(with|to)\b/i,
    /\blet's\s+(schedule|meet|talk|discuss)\b/i,
    /\bwould you\s+(be available|have time)\b/i
  ];
  
  // Check direct patterns first
  const hasBookingPattern = bookingPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  // Check for viewing-specific requests
  const hasViewingRequest = viewingTerms.some(term => 
    lowerMessage.includes(term)
  ) && (lowerMessage.includes('can i') || lowerMessage.includes('want to') || lowerMessage.includes('would like'));
  
  // Check for direct booking terms only if they're in action context
  const hasDirectBooking = directBookingTerms.some(term => {
    if (!lowerMessage.includes(term)) return false;
    
    // Must be paired with action words
    return /\b(can|could|would|want|need|like|how|when)\b.*\b(schedule|book|booking|appointment|meeting|call|consultation)\b/i.test(lowerMessage) ||
           /\b(schedule|book|booking|appointment|meeting|call|consultation)\b.*\b(please|now|today|tomorrow|this week|available)\b/i.test(lowerMessage);
  });
  
  return hasBookingPattern || hasViewingRequest || hasDirectBooking;
}

export async function gradeDocuments(state: ChatState) {
  const { question, documents, leadInfo } = state;
  
  // Check for greetings first
  const isGreeting = greetingPatterns.some(pattern => pattern.test(question));

  if (isGreeting) {
    console.log("[gradeDocuments] Greeting detected for question:", question);
    return { documentQuality: -1, isGreeting: true }; // Special value for greetings
  }
  
  // Check for booking intent
  const isBookingIntent = detectBookingIntent(question);

  if (isBookingIntent) {
    console.log("[gradeDocuments] Booking intent detected for question:", question);
    return { documentQuality: -2, isGreeting: false, isBookingIntent: true }; // Special value for booking
  }
  
  if (!documents || documents.length === 0) {
    console.warn("[gradeDocuments] No documents to grade. Setting quality to 0.");
    return { documentQuality: 0, isGreeting: false, isBookingIntent: false };
  }
  
  console.log("[gradeDocuments] Grading relevance for question:", question);
  
  // Initialize LLM for grading
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
  });
  
  // Create a prompt to grade document relevance
  const prompt = `
    Question: ${question}
    
    Documents:
    ${documents?.map(doc => doc.pageContent).join("\n\n")}
    
    On a scale of 0 to 1, how relevant are these documents to the question?
    Provide a single number as response.
  `;
  
  try {
    // Get the grading response
    const response = await llm.invoke([
      new HumanMessage(prompt)
    ]);
    const gradeStr = extractStringContent(response.content);
    const grade = parseFloat(gradeStr);
    
    console.log("[gradeDocuments] Document quality grade:", grade);
    
    // Return the document quality grade
    return {
      documentQuality: isNaN(grade) ? 0 : grade,
      isGreeting: false,
      isBookingIntent: false
    };
  } catch (error) {
    console.error("[gradeDocuments] Error grading documents:", error);
    // Return a default low grade in case of error
    return { documentQuality: 0, isGreeting: false, isBookingIntent: false };
  }
} 