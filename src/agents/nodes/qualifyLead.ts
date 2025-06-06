import { ChatState } from "../../lib/langgraph/state.js";
import { ChatOpenAI } from "@langchain/openai";
import { 
  calculateLeadScore, 
  getQualificationProgress, 
  getNextBestQuestion, 
  shouldTriggerQualification,
  getActionTriggers 
} from "../../lib/lead-scoring.js";
import { QualificationData, LeadScore } from "../../lib/langgraph/state.js";
import { 
  analyzeConversationContext,
  detectQualificationOpportunities,
  ConversationContext 
} from "../../lib/conversation-analysis.js";
import { 
  selectOptimalQuestion,
  QualificationStrategy,
  optimizeQuestionTiming 
} from "../../lib/qualification-strategy.js";

function extractStringContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(extractStringContent).join(" ");
  }
  if (typeof content === "object" && content !== null && "text" in content) {
    // @ts-expect-error - MessageContentComplex type not fully defined
    return content.text;
  }
  return "";
}

// Question templates for natural conversation integration
const QUALIFICATION_QUESTIONS = {
  purchase_intent: [
    "Are you looking at this as an investment property or for personal use?",
    "Would this be for your own use or as an investment opportunity?",
    "Are you considering this for personal enjoyment or as an investment?"
  ],
  timeline: [
    "What's your timeline for making a decision?",
    "Are you looking to move forward soon or just exploring options?",
    "When are you hoping to complete your purchase?"
  ],
  budget_range: [
    "What budget range are you working with?",
    "Do you have a budget range in mind?",
    "What price range fits your investment goals?"
  ],
  decision_authority: [
    "Are you the primary decision maker, or will others be involved in the decision?",
    "Who else would be involved in this decision?",
    "Will you be making this decision independently?"
  ],
  siargao_familiarity: [
    "Have you been to Siargao before?",
    "Are you familiar with the Siargao area?",
    "Is this your first time considering property in Siargao?"
  ],
  payment_preference: [
    "Do you prefer to pay in full or are you interested in our payment plans?",
    "Would you be paying cash or looking at financing options?",
    "Are you interested in our flexible payment terms?"
  ],
  previous_property_purchases: [
    "Have you purchased investment property before?",
    "Is this your first property investment?",
    "Do you have experience with property investments?"
  ]
};

// Context-aware question integration patterns
const QUESTION_INTEGRATION_PATTERNS = {
  purchase_intent: {
    triggers: ['price', 'cost', 'investment', 'roi', 'returns', 'rental'],
    integration: "This helps me recommend the best villa and payment plan for your specific needs."
  },
  timeline: {
    triggers: ['when', 'available', 'completion', 'ready', 'move in'],
    integration: "This helps me prioritize the information that's most relevant to your timeline."
  },
  budget_range: {
    triggers: ['price', 'cost', 'afford', 'expensive', 'cheap', 'payment'],
    integration: "This helps me show you options that fit your investment goals."
  },
  decision_authority: {
    triggers: ['family', 'spouse', 'partner', 'discuss', 'decide'],
    integration: "This helps me know who should be included in our communication."
  },
  siargao_familiarity: {
    triggers: ['location', 'area', 'siargao', 'where', 'never been'],
    integration: "This helps me provide the right level of area information."
  }
};

export async function qualifyLead(state: ChatState) {
  const { question, messages, leadInfo, qualificationData, questionsAsked, streaming } = state;
  
  console.log("[qualifyLead] Processing qualification with enhanced intelligence for question:", question);
  console.log("[qualifyLead] Current qualification data:", qualificationData);
  console.log("[qualifyLead] Questions asked:", questionsAsked);
  
  // Initialize qualification data and questions asked if not present
  const currentQualificationData = qualificationData || {};
  const currentQuestionsAsked = questionsAsked || [];
  
  // Enhanced Phase II: Use conversation intelligence to analyze context
  const conversationContext = await analyzeConversationContext(
    messages, 
    currentQualificationData, 
    currentQuestionsAsked
  );
  
  console.log("[qualifyLead] Conversation analysis:", {
    stage: conversationContext.stage,
    qualification_readiness: conversationContext.qualification_readiness,
    sentiment: conversationContext.sentiment_score,
    fatigue: conversationContext.question_fatigue
  });
  
  // Enhanced Phase II: Use strategic question selection
  const strategy = await selectOptimalQuestion(
    messages,
    currentQualificationData,
    currentQuestionsAsked
  );
  
  console.log("[qualifyLead] Question strategy:", {
    has_primary_question: !!strategy.primary_question,
    overall_risk: strategy.risk_assessment.overall_risk,
    engagement_strategy: strategy.conversation_approach.engagement_strategy
  });
  
  // Check if we should proceed with qualification based on intelligent analysis
  if (!strategy.primary_question || strategy.risk_assessment.overall_risk === 'high') {
    console.log("[qualifyLead] Strategy recommends not qualifying at this time");
    
    // Still extract data from current message if possible
    const updatedQualificationData = await extractQualificationFromMessage(
      question, 
      currentQualificationData
    );
    
    const leadScore = calculateLeadScore(updatedQualificationData);
    const qualificationProgress = getQualificationProgress(updatedQualificationData);
    
    return {
      qualificationData: updatedQualificationData,
      leadScore,
      qualificationProgress,
      shouldQualify: false
    };
  }
  
  // Extract qualification data from the user's latest message
  const updatedQualificationData = await extractQualificationFromMessage(
    question, 
    currentQualificationData
  );
  
  // Calculate updated lead score
  const leadScore = calculateLeadScore(updatedQualificationData);
  const qualificationProgress = getQualificationProgress(updatedQualificationData);
  
  console.log("[qualifyLead] Updated lead score:", leadScore);
  console.log("[qualifyLead] Qualification progress:", qualificationProgress);
  
  // Check if qualification is complete
  const isQualificationComplete = qualificationProgress >= 80 || 
    (conversationContext.stage === 'decision' && leadScore.total_score >= 70);
  
  if (isQualificationComplete) {
    console.log("[qualifyLead] Qualification complete based on progress and stage");
    const actionTriggers = getActionTriggers(leadScore);
    
    return {
      qualificationData: updatedQualificationData,
      leadScore,
      qualificationProgress,
      qualificationComplete: true,
      shouldQualify: false,
      // TODO: Add action triggers for notifications
    };
  }
  
  // Generate enhanced strategic response with qualification question
  const responseWithQuestion = await generateStrategicQualificationResponse(
    question,
    strategy.primary_question,
    conversationContext,
    updatedQualificationData,
    leadInfo,
    streaming
  );
  
  // Update questions asked with the strategic question field
  const updatedQuestionsAsked = [...currentQuestionsAsked, strategy.primary_question.field];
  
  console.log("[qualifyLead] Generated strategic qualification response with question:", strategy.primary_question.field);
  
  return {
    messages: [...state.messages, {
      role: "assistant",
      content: responseWithQuestion
    }],
    qualificationData: updatedQualificationData,
    leadScore,
    questionsAsked: updatedQuestionsAsked,
    qualificationProgress,
    qualificationComplete: false,
    shouldQualify: false
  };
}

async function extractQualificationFromMessage(
  message: string, 
  currentData: QualificationData
): Promise<QualificationData> {
  
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.1,
  });
  
  const extractionPrompt = `
You are analyzing a user's message to extract qualification information for a luxury villa sales lead.

Current qualification data: ${JSON.stringify(currentData)}

User message: "${message}"

Extract any qualification information from this message and return ONLY a JSON object with the relevant fields. If no new information is found, return an empty object {}.

Available fields:
- purchase_intent: "primary_residence" | "investment" | "vacation_home" | "exploring"
- timeline: "immediate" | "next_3_months" | "next_6_months" | "next_year" | "just_looking"
- budget_range: "under_15m" | "15m_25m" | "25m_35m" | "above_35m" | "flexible"
- payment_preference: "cash" | "financing" | "installment" | "lease_to_own"
- decision_authority: "sole_decision" | "spouse_consultation" | "family_decision" | "business_partners"
- siargao_familiarity: "first_time" | "visited_before" | "regular_visitor" | "considering_relocation"
- previous_property_purchases: true | false
- urgency_level: "high" | "medium" | "low"

Examples:
"I'm looking for an investment property" → {"purchase_intent": "investment"}
"We need to discuss this as a family" → {"decision_authority": "family_decision"}
"I've never been to Siargao" → {"siargao_familiarity": "first_time"}
"I'm looking to buy in the next few months" → {"timeline": "next_3_months"}

Return only valid JSON:`;

  try {
    const response = await llm.invoke([{ role: "user", content: extractionPrompt }]);
    const extractedDataStr = extractStringContent(response.content);
    
    // Parse the JSON response
    let extractedData = {};
    try {
      extractedData = JSON.parse(extractedDataStr);
    } catch (parseError) {
      console.warn("[qualifyLead] Failed to parse extraction response:", extractedDataStr);
      return currentData;
    }
    
    // Merge with current data
    const updatedData = { ...currentData, ...extractedData };
    console.log("[qualifyLead] Extracted qualification data:", extractedData);
    
    return updatedData;
  } catch (error) {
    console.error("[qualifyLead] Error extracting qualification data:", error);
    return currentData;
  }
}

// Enhanced Phase II: Strategic qualification response generation
async function generateStrategicQualificationResponse(
  userQuestion: string,
  strategyQuestion: import("../../lib/qualification-strategy.js").StrategyQuestion,
  conversationContext: ConversationContext,
  qualificationData: QualificationData,
  leadInfo: { firstName?: string } | undefined,
  streaming: { enabled?: boolean; onToken?: (token: string, messageId?: string) => void; messageId?: string } | undefined
): Promise<string> {
  
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    streaming: streaming?.enabled || false,
    callbacks: streaming?.enabled && streaming.onToken ? [
      {
        handleLLMNewToken: async (token: string) => {
          if (streaming.onToken) {
            streaming.onToken(token, streaming.messageId);
          }
        },
      }
    ] : undefined,
  });
  
  const userName = leadInfo?.firstName || '';
  const personalTouch = userName ? `${userName}, ` : '';
  
  // Use strategic context for enhanced response
  const responsePrompt = `
You are Skye, a friendly villa consultant for Skypearls Villas. You need to answer the user's question and strategically include a qualification question based on conversation intelligence.

CONVERSATION CONTEXT:
- User's current question: "${userQuestion}"
- Conversation stage: ${conversationContext.stage}
- User engagement level: ${conversationContext.engagement_level}
- User sentiment (receptiveness): ${conversationContext.sentiment_score.receptiveness}/1
- Question fatigue level: ${conversationContext.question_fatigue.level}/1

STRATEGIC QUESTION TO INCLUDE:
- Field: ${strategyQuestion.field}
- Question: "${strategyQuestion.question_text}"
- Approach style: ${strategyQuestion.approach.style}
- Integration method: ${strategyQuestion.approach.integration_method}
- Conversation hook: "${strategyQuestion.context_integration.conversation_hook}"
- Transition: "${strategyQuestion.context_integration.transition_phrase}"
- User benefit: "${strategyQuestion.context_integration.user_benefit_explanation}"

STRATEGIC GUIDELINES:
1. Answer their question directly and helpfully first
2. Use the conversation hook to naturally transition: "${strategyQuestion.context_integration.transition_phrase}"
3. Include the strategic question: "${strategyQuestion.question_text}"
4. Explain the benefit: "${strategyQuestion.context_integration.user_benefit_explanation}"
5. Match the approach style (${strategyQuestion.approach.style}) and tone (${strategyQuestion.approach.tone})
6. ${strategyQuestion.approach.integration_method === 'embedded' ? 'Weave the question seamlessly into your response' : 'Present the question as a natural follow-up'}
7. Use their name (${personalTouch}) if appropriate
8. Keep it conversational based on their engagement level (${conversationContext.engagement_level})

CONVERSATION STAGE ADAPTATION:
${conversationContext.stage === 'awareness' ? '- Keep questions gentle and educational' :
  conversationContext.stage === 'interest' ? '- Show genuine interest in understanding their needs' :
  conversationContext.stage === 'consideration' ? '- Focus on helping them evaluate options' :
  conversationContext.stage === 'intent' ? '- Be more direct and solution-focused' :
  conversationContext.stage === 'evaluation' ? '- Help them with decision-making details' :
  '- Support their decision-making process'}

Keep it natural and conversational. The question should feel like a natural part of helping them, not an interrogation.`;

  try {
    const response = await llm.invoke([{ role: "user", content: responsePrompt }]);
    const responseContent = extractStringContent(response.content);
    
    console.log("[qualifyLead] Generated strategic response:", responseContent.slice(0, 100) + "...");
    return responseContent;
    
  } catch (error) {
    console.error("[qualifyLead] Error generating strategic response:", error);
    
    // Fallback to basic approach with strategic question
    const fallbackResponse = `Great question! ${strategyQuestion.context_integration.transition_phrase} ${strategyQuestion.question_text} ${strategyQuestion.context_integration.user_benefit_explanation}`;
    
    if (streaming?.enabled && streaming.onToken) {
      const words = fallbackResponse.split(' ');
      for (const word of words) {
        streaming.onToken(word + ' ', streaming.messageId);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return fallbackResponse;
  }
}

// Legacy function maintained for backward compatibility
async function generateQualificationResponse(
  userQuestion: string,
  qualificationQuestion: string,
  qualificationData: QualificationData,
  leadInfo: { firstName?: string } | undefined,
  streaming: { enabled?: boolean; onToken?: (token: string, messageId?: string) => void; messageId?: string } | undefined
): Promise<string> {
  
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    streaming: streaming?.enabled || false,
    callbacks: streaming?.enabled && streaming.onToken ? [
      {
        handleLLMNewToken: async (token: string) => {
          if (streaming.onToken) {
            streaming.onToken(token, streaming.messageId);
          }
        },
      }
    ] : undefined,
  });
  
  // Get question template
  const questionTemplates = QUALIFICATION_QUESTIONS[qualificationQuestion as keyof typeof QUALIFICATION_QUESTIONS] || [
    "Could you tell me more about your specific needs?"
  ];
  const questionTemplate = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
  
  // Get integration pattern if available
  const integrationPattern = QUESTION_INTEGRATION_PATTERNS[qualificationQuestion as keyof typeof QUESTION_INTEGRATION_PATTERNS];
  const integrationText = integrationPattern ? integrationPattern.integration : "This helps me provide better recommendations.";
  
  const userName = leadInfo?.firstName || '';
  const personalTouch = userName ? `${userName}, ` : '';
  
  const responsePrompt = `
You are Skye, a friendly villa consultant for Skypearls Villas. You need to answer the user's question and naturally include a qualification question.

User's question: "${userQuestion}"
Qualification question to include: "${questionTemplate}"
Integration explanation: "${integrationText}"

Guidelines:
1. First answer their question directly and helpfully
2. Then naturally transition to the qualification question
3. Use the integration explanation to show why you're asking
4. Keep it conversational and not form-like
5. Use their name (${personalTouch}) if appropriate
6. Make it feel like you're trying to help them better

Example structure:
"[Answer to their question]... [Natural transition]... ${questionTemplate} ${integrationText}"

Keep it concise and natural. Don't make it feel like an interrogation.`;

  try {
    const response = await llm.invoke([{ role: "user", content: responsePrompt }]);
    const responseContent = extractStringContent(response.content);
    
    console.log("[qualifyLead] Generated qualification response:", responseContent.slice(0, 100) + "...");
    return responseContent;
    
  } catch (error) {
    console.error("[qualifyLead] Error generating qualification response:", error);
    
    // Fallback response
    const fallbackResponse = `Great question! ${integrationText.includes('This') ? integrationText : `This helps me ${integrationText.toLowerCase()}`} ${questionTemplate}`;
    
    if (streaming?.enabled && streaming.onToken) {
      const words = fallbackResponse.split(' ');
      for (const word of words) {
        streaming.onToken(word + ' ', streaming.messageId);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return fallbackResponse;
  }
}