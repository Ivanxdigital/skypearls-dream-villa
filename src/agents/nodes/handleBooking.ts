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
  const { question, leadInfo, streaming } = state;
  const userName = leadInfo?.firstName;
  
  console.log("[handleBooking] Handling booking request for question:", question);
  console.log("[handleBooking] Streaming enabled:", streaming?.enabled);

  try {
    // Check Calendly API health first
    const health = await checkCalendlyHealth();
    if (!health.healthy) {
      console.warn('[handleBooking] API unhealthy, falling back to WhatsApp');
      return await generateWhatsAppFallbackResponse(userName, state);
    }

    // Get the villa consultation event type
    const eventType = await getVillaConsultationEventType();
    
    if (!eventType) {
      console.warn('[handleBooking] No suitable event type found, falling back to WhatsApp');
      return await generateWhatsAppFallbackResponse(userName, state);
    }

    // Generate personalized booking response with Calendly link
    const responseContent = generateCalendlyResponse(eventType, userName);
    
    console.log("[handleBooking] Generated booking response with Calendly link");

    // Check if streaming is enabled and handle accordingly
    const globalStreamingConfig = (globalThis as any)._streamingConfig;
    const effectiveStreaming = streaming || globalStreamingConfig;
    
    if (effectiveStreaming?.enabled && effectiveStreaming.onToken) {
      console.log("[handleBooking] Streaming booking response");
      // Stream the response word by word
      const words = responseContent.split(' ');
      for (let i = 0; i < words.length; i++) {
        const token = i === words.length - 1 ? words[i] : words[i] + ' ';
        effectiveStreaming.onToken(token, effectiveStreaming.messageId);
        // Add a small delay to simulate natural typing
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    return {
      messages: [...state.messages, {
        role: "assistant",
        content: responseContent
      }],
      bookingInfo: {
        eventTypeUrl: eventType.scheduling_url,
        eventTypeName: eventType.name
      }
    };
  } catch (error) {
    console.error('[handleBooking] Error generating booking response:', error);
    return await generateWhatsAppFallbackResponse(userName, state);
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
async function generateWhatsAppFallbackResponse(userName?: string, state?: ChatState) {
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

  // Handle streaming if available
  if (state) {
    const globalStreamingConfig = (globalThis as any)._streamingConfig;
    const effectiveStreaming = state.streaming || globalStreamingConfig;
    
    if (effectiveStreaming?.enabled && effectiveStreaming.onToken) {
      console.log("[handleBooking] Streaming WhatsApp fallback response");
      // Stream the response word by word
      const words = responseContent.split(' ');
      for (let i = 0; i < words.length; i++) {
        const token = i === words.length - 1 ? words[i] : words[i] + ' ';
        effectiveStreaming.onToken(token, effectiveStreaming.messageId);
        // Add a small delay to simulate natural typing
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }
  }

  return {
    messages: state ? [...state.messages, {
      role: "assistant",
      content: responseContent
    }] : [new AIMessage({ content: responseContent })],
  };
} 