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

// Simple greeting patterns (case-insensitive)
const greetingPatterns = [
  /^hi$/i,
  /^hello$/i,
  /^hey$/i,
  /^good morning$/i,
  /^good afternoon$/i,
  /^good evening$/i,
  /^how are you$/i,
  /^how's it going$/i,
  /^what's up$/i,
  /^sup$/i,
];

export async function gradeDocuments(state: ChatState) {
  const { question, documents, leadInfo } = state;
  
  // Check for greetings first
  const isGreeting = greetingPatterns.some(pattern => pattern.test(question));

  if (isGreeting) {
    console.log("[gradeDocuments] Greeting detected for question:", question);
    return { documentQuality: -1, isGreeting: true }; // Special value for greetings
  }
  
  if (!documents || documents.length === 0) {
    console.warn("[gradeDocuments] No documents to grade. Setting quality to 0.");
    return { documentQuality: 0, isGreeting: false };
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
      isGreeting: false
    };
  } catch (error) {
    console.error("[gradeDocuments] Error grading documents:", error);
    // Return a default low grade in case of error
    return { documentQuality: 0, isGreeting: false };
  }
} 