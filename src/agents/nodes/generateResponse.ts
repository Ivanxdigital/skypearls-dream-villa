import { ChatState } from "../../lib/langgraph/state.js";
import { ChatOpenAI } from "@langchain/openai";
// import { PromptTemplate } from "langchain/prompts"; // Not used

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
    return {
      messages: [...state.messages, {
        role: "assistant",
        content: "I'm sorry, I couldn't find specific information to answer your question about our Skypearls Villas. Could you try asking in a different way, or perhaps I can help with another aspect of our luxury properties in Siargao?"
      }]
    };
  }
  
  // Initialize LLM for response generation
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
  });
  
  // Format the docs for the prompt
  const formattedDocs = documents?.map(doc => doc.pageContent).join("\n\n") || "";
  
  // Create a prompt with personalization if leadInfo exists
  const promptTemplate = leadInfo 
    ? `You are a helpful Skypearls Villas assistant talking to ${leadInfo.firstName}.
       Your primary goal is to answer their questions about luxury villas in Siargao, Philippines, using the provided context.
       You ALREADY HAVE their contact information (name: ${leadInfo.firstName}, email: ${leadInfo.email}, phone: ${leadInfo.phone}).
       DO NOT ask for their contact information again.
       
       Context: ${formattedDocs}
       
       Question: ${question}
       
       Based on the context and question, provide a helpful and informative answer.
       If the user explicitly asks for more information to be sent to them (e.g., "Can you email me the details?", "Send me the brochure"), or expresses strong interest in a specific villa or a viewing, you can then offer to use their existing contact details to fulfill their request. Otherwise, focus solely on answering their questions with the provided information.
       Avoid generic phrases like "Let me know if you need more information" if the answer is comprehensive. Instead, you can ask if they have questions about specific aspects of the villas or payment options.`
    : `You are a helpful Skypearls Villas assistant.
       Answer the question about luxury villas in Siargao, Philippines using the following context:
       
       Context: ${formattedDocs}
       
       Question: ${question}
       
       Provide a helpful and informative answer. Do not ask for contact information unless the user explicitly requests an action that requires it (e.g., "Can you email me something?").`;
  
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
    // Return a fallback message in case of error
    return {
      messages: [...state.messages, {
        role: "assistant",
        content: "I'm sorry, I encountered an issue while processing your request. Can you please try again or ask a different question about our Skypearls Villas?"
      }]
    };
  }
} 