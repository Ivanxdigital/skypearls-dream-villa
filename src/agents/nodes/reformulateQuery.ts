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

export async function reformulateQuery(state: ChatState) {
  const { question, documents } = state;
  
  console.log("[reformulateQuery] Original question:", question);
  
  // Initialize LLM for reformulation
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
  });
  
  // Create a prompt to reformulate the query
  let prompt = `
    Original question: ${question}
    
    The documents retrieved weren't highly relevant. Please reformulate the question 
    to be more specific and help retrieve better information about Skypearls Villas luxury properties
    in Siargao, Philippines.
  `;
  
  // If we have documents, include a summary in the prompt to help with reformulation
  if (documents && documents.length > 0) {
    prompt += `
    
    Here are the documents that were retrieved but weren't highly relevant:
    ${documents.map((doc, i) => `Document ${i+1}: ${doc.pageContent.slice(0, 200)}...`).join("\n\n")}
    
    Based on these documents and the original question, please provide a more specific reformulation.
    `;
  }
  
  prompt += `
    
    Reformulated question:
  `;
  
  try {
    // Get the reformulated question
    const response = await llm.invoke([
      { role: "user", content: prompt }
    ]);
    const reformulated = extractStringContent(response.content).trim();
    
    console.log("[reformulateQuery] Reformulated question:", reformulated);
    
    // Return the reformulated question
    return {
      question: reformulated
    };
  } catch (error) {
    console.error("[reformulateQuery] Error reformulating query:", error);
    // In case of error, return a slightly modified version of the original question
    // to avoid an infinite loop of the same question
    return {
      question: `Information about ${question} at Skypearls Villas in Siargao?`
    };
  }
} 