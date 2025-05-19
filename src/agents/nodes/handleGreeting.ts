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

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function handleGreeting(state: ChatState) {
  const { question, leadInfo } = state;
  const userName = leadInfo?.firstName;
  let responseContent = "";

  console.log("[handleGreeting] Handling greeting for question:", question);

  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("how are you") || lowerQuestion.includes("how's it going")) {
    responseContent = getRandomResponse(howAreYouResponses);
  } else {
    responseContent = getRandomResponse(greetingResponses);
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

  return {
    messages: [new AIMessage({ content: responseContent })],
  };
} 