import { ChatState } from "../../lib/langgraph/state.js";
import { AIMessage } from "@langchain/core/messages";
import { 
  getVillaConsultationEventType, 
  CalendlyApiError,
  checkCalendlyHealth 
} from "../../lib/calendly-client.js";

/**
 * Handle booking intent by providing Calendly scheduling information
 * or falling back to WhatsApp contact if Calendly is unavailable
 */
export async function handleBooking(state: ChatState) {
  const { question, leadInfo } = state;
  const userName = leadInfo?.firstName;
  
  console.log("[handleBooking] Handling booking request for question:", question);

  try {
    // Check Calendly API health first
    const health = await checkCalendlyHealth();
    if (!health.healthy) {
      console.warn('[handleBooking] API unhealthy, falling back to WhatsApp');
      return generateWhatsAppFallbackResponse(userName);
    }

    // Get the villa consultation event type
    const eventType = await getVillaConsultationEventType();
    
    if (!eventType) {
      console.warn('[handleBooking] No suitable event type found, falling back to WhatsApp');
      return generateWhatsAppFallbackResponse(userName);
    }

    // Generate personalized booking response with Calendly link
    const responseContent = generateCalendlyResponse(eventType, userName);
    
    console.log("[handleBooking] Generated booking response with Calendly link");

    return {
      messages: [new AIMessage({ content: responseContent })],
      bookingInfo: {
        eventTypeUrl: eventType.scheduling_url,
        eventTypeName: eventType.name
      }
    };
  } catch (error) {
    console.error('[handleBooking] Error generating booking response:', error);
    return generateWhatsAppFallbackResponse(userName);
  }
}

/**
 * Generate booking response with Calendly link
 */
function generateCalendlyResponse(eventType: any, userName?: string): string {
  const greeting = userName ? `Hi ${userName}! ` : "";
  
  return `${greeting}I'd be delighted to schedule a villa viewing with you! 🏖️

**${eventType.name}** (${eventType.duration} minutes)
${eventType.description_plain ? `\n${eventType.description_plain}\n` : ''}

📅 **Schedule your villa viewing here:**
${eventType.scheduling_url}

**🚗 Property Location & Directions:**
Our property is located past the airport. Keep going straight and you'll see the airport's runway on your left-hand side. Continue straight for another 10 seconds and you'll see a blue fence with "Skypearls Realty" on the tarpaulin. After passing that blue fence, you'll find an off-road access on the right-hand side that leads to our property.

**📞 Questions Before Your Visit?**
Feel free to give us a call ahead of time if you have any questions you'd like to know about before your viewing. We're here to help!

During your villa viewing, we can show you:
• The property layout and luxury features
• Available units and their unique characteristics  
• Investment potential and pricing details
• The beautiful Siargao location and amenities

Alternatively, you can also reach out to us directly on WhatsApp at **+63 999 370 2550** for immediate assistance.

Looking forward to showing you our beautiful villas! 🌟`;
}

/**
 * Generate WhatsApp fallback response when Calendly is unavailable
 */
function generateWhatsAppFallbackResponse(userName?: string) {
  const greeting = userName ? `Hi ${userName}! ` : "";
  
  const responseContent = `${greeting}I'd love to help you schedule a villa viewing! 🏖️

While our online booking system is temporarily unavailable, you can reach out to us directly on WhatsApp for immediate assistance:

📱 **WhatsApp: +63 999 370 2550**

Our team is available to:
• Schedule a personalized villa viewing appointment
• Answer your questions about available properties
• Provide detailed pricing and investment information
• Give you directions to our property location

**🚗 Property Location & Directions:**
Our property is located past the airport. Keep going straight and you'll see the airport's runway on your left-hand side. Continue straight for another 10 seconds and you'll see a blue fence with "Skypearls Realty" on the tarpaulin. After passing that blue fence, you'll find an off-road access on the right-hand side that leads to our property.

We typically respond within minutes during business hours. Looking forward to showing you our beautiful villas! 🌟`;

  return {
    messages: [new AIMessage({ content: responseContent })],
  };
} 