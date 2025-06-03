import { ChatState } from "../../lib/langgraph/state.js";
import { AIMessage } from "@langchain/core/messages";

export async function handleImageRequest(state: ChatState) {
  const { question, leadInfo, imageType } = state;
  const userName = leadInfo?.firstName;
  
  console.log("[handleImageRequest] Handling image request for type:", imageType);

  if (imageType === 'location') {
    return handleLocationRequest(userName);
  }
  
  // Future: handle other image types
  return handleLocationRequest(userName);
}

function handleLocationRequest(userName?: string) {
  const greeting = userName ? `${userName}, here's` : "Here's";
  
  const locationResponse = `${greeting} the exact location of our Skypearls Villas property:

**📍 Address:**
Skypearls Villas, Siargao Island, Surigao del Norte, Philippines

Our luxury villas are strategically located for easy access to the best beaches and attractions in Siargao. The map below shows our exact location with clear markers.

For easy navigation, you can also contact us directly via WhatsApp at **+63 999 370 2550** and we'll provide detailed directions or arrange pickup from the airport.

Would you like to schedule a viewing to see the property in person?`;

  const imageUrls = ['/images/location-maps/main-property-location.png'];
  
  return {
    messages: [new AIMessage({ content: locationResponse })],
    imageUrls,
    imageType: 'location' as const,
    imageContext: 'Property location map with markers'
  };
} 