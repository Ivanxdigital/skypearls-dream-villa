import { z } from 'zod';
import { StructuredTool } from 'langchain/tools';
import { 
  getVillaConsultationEventType, 
  CalendlyApiError,
  checkCalendlyHealth 
} from '../../lib/calendly-client.js';

/**
 * Tool for handling villa viewing booking requests
 * This tool detects booking intent in user messages and provides Calendly scheduling information
 */
export class CalendlyTool extends StructuredTool {
  name = 'villa_booking_scheduler';
  description = 'Returns villa viewing booking information and scheduling URLs when users express booking intent';
  schema = z.object({
    userMessage: z.string().describe('The user message to analyze for booking intent and respond with scheduling information')
  });

  constructor() {
    super();
  }

  /**
   * Detect booking intent keywords in user message
   */
  private detectBookingIntent(message: string): boolean {
    const bookingKeywords = [
      // Direct booking terms
      'schedule', 'book', 'booking', 'appointment', 'calendar',
      
      // Meeting/consultation terms
      'meeting', 'call', 'consultation', 'consult', 'discuss',
      
      // Viewing/tour terms
      'tour', 'viewing', 'visit', 'see', 'show',
      
      // Availability terms
      'available', 'availability', 'free', 'time', 'when',
      
      // Contact/communication terms
      'talk', 'speak', 'chat', 'connect', 'reach out',
      
      // Question patterns
      'can i', 'could i', 'would like to', 'want to',
      'how do i', 'where can i', 'is it possible'
    ];

    const lowerMessage = message.toLowerCase();
    
    // Check for direct keyword matches
    const hasKeyword = bookingKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // Check for question patterns about contact/meetings
    const questionPatterns = [
      /can\s+(i|we)\s+(schedule|book|meet|call|talk)/i,
      /how\s+(do|can)\s+(i|we)\s+(schedule|book|contact|reach)/i,
      /when\s+(are\s+you|is\s+someone)\s+available/i,
      /would\s+like\s+to\s+(schedule|book|meet|call|discuss)/i,
      /want\s+to\s+(schedule|book|meet|call|see)/i,
      /interested\s+in\s+(meeting|calling|scheduling|booking)/i,
      /need\s+to\s+(talk|speak|discuss|meet)/i
    ];
    
    const hasQuestionPattern = questionPatterns.some(pattern => 
      pattern.test(lowerMessage)
    );
    
    return hasKeyword || hasQuestionPattern;
  }

  /**
   * Generate booking response with Calendly link
   */
  private async generateBookingResponse(userMessage: string): Promise<string> {
    try {
      // Check Calendly API health first
      const health = await checkCalendlyHealth();
      if (!health.healthy) {
        console.warn('[Calendly Tool] API unhealthy, falling back to WhatsApp');
        return this.generateWhatsAppFallback();
      }

      // Get the villa consultation event type
      const eventType = await getVillaConsultationEventType();
      
      if (!eventType) {
        console.warn('[Calendly Tool] No suitable event type found, falling back to WhatsApp');
        return this.generateWhatsAppFallback();
      }

      // Generate personalized booking response
      const response = `I'd be delighted to schedule a villa viewing with you! 🏖️

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

      return response;
    } catch (error) {
      console.error('[Calendly Tool] Error generating booking response:', error);
      return this.generateWhatsAppFallback();
    }
  }

  /**
   * Generate WhatsApp fallback response when Calendly is unavailable
   */
  private generateWhatsAppFallback(): string {
    return `I'd love to help you schedule a villa viewing! 🏖️

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
  }

  /**
   * Generate non-booking response for general queries
   */
  private generateNonBookingResponse(): string {
    return `I'm here to help you with villa information! If you'd like to schedule a villa viewing to see our properties in person, I can help you book an appointment with our villa specialists.

You can also reach us directly on WhatsApp at **+63 999 370 2550** for immediate assistance. 📱`;
  }

  async _call({ userMessage }: z.infer<typeof this.schema>): Promise<string> {
    try {
      console.log('[Calendly Tool] Analyzing message for booking intent:', userMessage);
      
      // Detect booking intent
      const isBookingIntent = this.detectBookingIntent(userMessage);
      
      if (isBookingIntent) {
        console.log('[Calendly Tool] Booking intent detected, generating booking response');
        return await this.generateBookingResponse(userMessage);
      } else {
        console.log('[Calendly Tool] No booking intent detected, providing general response');
        return this.generateNonBookingResponse();
      }
    } catch (error) {
      console.error('[Calendly Tool] Error in _call:', error);
      
      // Always fall back to WhatsApp if there's any error
      if (error instanceof CalendlyApiError) {
        console.error('[Calendly Tool] Calendly API Error:', error.message);
      }
      
      return this.generateWhatsAppFallback();
    }
  }
}

// Export a singleton instance of the tool
export const calendlyTool = new CalendlyTool(); 