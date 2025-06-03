import { ChatState } from "../../lib/langgraph/state.js";
import { AIMessage } from "@langchain/core/messages";

// Predefined friendly greeting responses
const greetingResponses = [
  "Hello! How can I help you today?",
  "Hi there! What can I do for you?",
  "Hey! Nice to meet you. What brings you here?",
  "Greetings! How may I assist you?",
  "Good day! What information are you looking for?"
];

const howAreYouResponses = [
  "I'm doing well, thank you for asking! I'm here to help you with any questions about Skypearls Villas.",
  "I'm great, thanks! Ready to assist you with your queries about our luxury villas.",
  "I'm functioning optimally! How can I help you explore Skypearls Villas today?"
];

// Enhanced greetings that sometimes include WhatsApp info
const enhancedGreetings = [
  "Hello! I'm here to help you learn about our luxury villas in Siargao. What would you like to know?",
  "Hi there! I can tell you about our beautiful Skypearls Villas. What interests you most?",
  "Welcome! I'm here to assist with any questions about our premium villas. How can I help?",
  "Greetings! Ready to explore our luxury villa offerings in Siargao? What can I tell you?",
  "Hello! I'm your villa consultant for Skypearls. For detailed inquiries, we're also available on WhatsApp at +63 999 370 2550. What would you like to know today?"
];

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function handleGreeting(state: ChatState) {
  const { question, leadInfo, streaming } = state;
  const userName = leadInfo?.firstName;
  let responseContent = "";

  console.log("[handleGreeting] Handling greeting for question:", question);
  console.log("[handleGreeting] Streaming enabled:", streaming?.enabled);

  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("how are you") || lowerQuestion.includes("how's it going")) {
    responseContent = getRandomResponse(howAreYouResponses);
  } else {
    // 30% chance to use enhanced greeting (which may include WhatsApp)
    if (Math.random() < 0.3) {
      responseContent = getRandomResponse(enhancedGreetings);
    } else {
      responseContent = getRandomResponse(greetingResponses);
    }
  }

  if (userName) {
    if (lowerQuestion.includes("how are you") || lowerQuestion.includes("how's it going")) {
      // Already incorporates a greeting, so just prepend name for some
      if (Math.random() < 0.5) { // Add name sometimes
         responseContent = `Hi ${userName}! ${responseContent.charAt(0).toLowerCase() + responseContent.slice(1)}`;
      }
    } else {
       responseContent = `Hello ${userName}! ${responseContent.charAt(0).toLowerCase() + responseContent.slice(1)}`;
    }
  }

  console.log("[handleGreeting] Generated greeting response:", responseContent);

  // Check if streaming is enabled and handle accordingly
  const globalStreamingConfig = (globalThis as any)._streamingConfig;
  const effectiveStreaming = streaming || globalStreamingConfig;
  
  if (effectiveStreaming?.enabled && effectiveStreaming.onToken) {
    console.log("[handleGreeting] Streaming greeting response");
    // Stream the response word by word
    const words = responseContent.split(' ');
    for (let i = 0; i < words.length; i++) {
      const token = i === words.length - 1 ? words[i] : words[i] + ' ';
      effectiveStreaming.onToken(token, effectiveStreaming.messageId);
      // Add a small delay to simulate natural typing
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  return {
    messages: [...state.messages, {
      role: "assistant",
      content: responseContent
    }]
  };
}