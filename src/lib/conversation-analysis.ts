import { Message, QualificationData } from './langgraph/state.js';
import { ChatOpenAI } from "@langchain/openai";

// Core interfaces for conversation intelligence
export interface ConversationContext {
  stage: BuyingStage;
  intent_signals: IntentSignal[];
  sentiment_score: SentimentScore;
  engagement_level: EngagementLevel;
  conversation_depth: number;
  total_exchanges: number;
  user_responsiveness: number; // 0-1 scale
  question_fatigue: FatigueScore;
  topic_focus: TopicFocus[];
  qualification_readiness: number; // 0-1 scale
}

export interface IntentSignal {
  type: 'purchase_interest' | 'information_seeking' | 'price_inquiry' | 'timeline_hint' | 'budget_hint' | 'decision_authority_hint';
  confidence: number; // 0-1
  source_message: string;
  detected_value?: string;
}

export interface SentimentScore {
  overall: number; // -1 to 1 (negative to positive)
  receptiveness: number; // 0-1 (willingness to engage)
  urgency: number; // 0-1 (time sensitivity)
  trust_level: number; // 0-1 (comfort with questions)
}

export interface FatigueScore {
  level: number; // 0-1 (0 = no fatigue, 1 = high fatigue)
  recent_questions: number;
  time_since_last_question: number; // minutes
  recommendation: 'proceed' | 'wait' | 'avoid';
}

export interface TopicFocus {
  topic: string;
  relevance: number; // 0-1
  qualification_opportunity: boolean;
}

export type BuyingStage = 
  | 'awareness' // Just learning about villas
  | 'interest' // Showing genuine interest
  | 'consideration' // Comparing options, asking detailed questions
  | 'intent' // Strong signals of purchase intent
  | 'evaluation' // Ready to make decisions, needs final details
  | 'decision'; // Ready to commit/book

export type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface QualificationOpportunity {
  field: keyof QualificationData;
  opportunity_score: number; // 0-1
  suggested_approach: 'direct' | 'indirect' | 'contextual';
  timing_recommendation: 'immediate' | 'next_turn' | 'later';
  conversation_hook: string; // Natural way to introduce the question
}

// Core conversation analysis function
export async function analyzeConversationContext(
  messages: Message[],
  qualificationData?: QualificationData,
  questionsAsked: string[] = []
): Promise<ConversationContext> {
  
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  
  // Calculate basic metrics
  const conversationDepth = Math.min(userMessages.length, 10);
  const totalExchanges = Math.min(userMessages.length, assistantMessages.length);
  
  // Analyze sentiment and engagement
  const sentimentScore = await analyzeSentiment(userMessages);
  const engagementLevel = calculateEngagementLevel(userMessages, assistantMessages);
  const userResponsiveness = calculateResponsiveness(messages);
  
  // Detect buying stage and intent signals
  const stage = await detectBuyingStage(userMessages);
  const intentSignals = await detectIntentSignals(userMessages);
  
  // Calculate question fatigue
  const questionFatigue = calculateQuestionFatigue(questionsAsked, messages);
  
  // Analyze topic focus
  const topicFocus = await analyzeTopicFocus(userMessages);
  
  // Calculate qualification readiness
  const qualificationReadiness = calculateQualificationReadiness(
    stage, sentimentScore, questionFatigue, intentSignals
  );
  
  return {
    stage,
    intent_signals: intentSignals,
    sentiment_score: sentimentScore,
    engagement_level: engagementLevel,
    conversation_depth: conversationDepth,
    total_exchanges: totalExchanges,
    user_responsiveness: userResponsiveness,
    question_fatigue: questionFatigue,
    topic_focus: topicFocus,
    qualification_readiness: qualificationReadiness
  };
}

// Detect qualification opportunities based on conversation context
export function detectQualificationOpportunities(
  context: ConversationContext,
  qualificationData: QualificationData = {},
  questionsAsked: string[] = []
): QualificationOpportunity[] {
  
  const opportunities: QualificationOpportunity[] = [];
  
  // Define qualification fields and their trigger patterns
  const qualificationFields: Array<{
    field: keyof QualificationData;
    triggers: string[];
    stage_preference: BuyingStage[];
  }> = [
    {
      field: 'purchase_intent',
      triggers: ['investment', 'personal', 'vacation', 'rent', 'live', 'buy'],
      stage_preference: ['interest', 'consideration', 'intent']
    },
    {
      field: 'timeline',
      triggers: ['when', 'soon', 'quickly', 'time', 'ready', 'looking'],
      stage_preference: ['consideration', 'intent', 'evaluation']
    },
    {
      field: 'budget_range',
      triggers: ['price', 'cost', 'afford', 'budget', 'expensive', 'cheap'],
      stage_preference: ['consideration', 'intent', 'evaluation', 'decision']
    },
    {
      field: 'decision_authority',
      triggers: ['family', 'spouse', 'partner', 'wife', 'husband', 'discuss', 'decide'],
      stage_preference: ['intent', 'evaluation', 'decision']
    },
    {
      field: 'siargao_familiarity',
      triggers: ['siargao', 'area', 'location', 'never', 'first time', 'visited'],
      stage_preference: ['awareness', 'interest', 'consideration']
    }
  ];
  
  for (const fieldInfo of qualificationFields) {
    // Skip if we already have this data
    if (qualificationData[fieldInfo.field] !== undefined) continue;
    
    // Skip if we already asked about this
    if (questionsAsked.includes(fieldInfo.field)) continue;
    
    // Check if current stage is preferred for this question
    const stageMatch = fieldInfo.stage_preference.includes(context.stage);
    
    // Check for conversation triggers
    const triggerMatch = context.intent_signals.some(signal => 
      fieldInfo.triggers.some(trigger => 
        signal.source_message.toLowerCase().includes(trigger)
      )
    );
    
    // Calculate opportunity score
    let opportunityScore = 0;
    
    if (stageMatch) opportunityScore += 0.4;
    if (triggerMatch) opportunityScore += 0.3;
    if (context.qualification_readiness > 0.6) opportunityScore += 0.2;
    if (context.sentiment_score.receptiveness > 0.7) opportunityScore += 0.1;
    
    if (opportunityScore > 0.3) {
      opportunities.push({
        field: fieldInfo.field,
        opportunity_score: opportunityScore,
        suggested_approach: opportunityScore > 0.7 ? 'direct' : 
                           opportunityScore > 0.5 ? 'contextual' : 'indirect',
        timing_recommendation: context.question_fatigue.level > 0.7 ? 'later' :
                              opportunityScore > 0.6 ? 'immediate' : 'next_turn',
        conversation_hook: generateConversationHook(fieldInfo.field, context)
      });
    }
  }
  
  // Sort by opportunity score
  return opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);
}

// Analyze sentiment from user messages
async function analyzeSentiment(userMessages: Message[]): Promise<SentimentScore> {
  if (userMessages.length === 0) {
    return { overall: 0, receptiveness: 0.5, urgency: 0, trust_level: 0.5 };
  }
  
  const recentMessages = userMessages.slice(-3).map(m => m.content).join(' ');
  
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.1,
  });
  
  try {
    const prompt = `Analyze the sentiment of these user messages about luxury villa purchases:

"${recentMessages}"

Return ONLY a JSON object with these scores (0-1 scale):
{
  "overall": 0.8,        // -1 to 1: overall sentiment
  "receptiveness": 0.7,  // 0-1: willingness to engage/answer questions
  "urgency": 0.3,        // 0-1: time sensitivity/urgency
  "trust_level": 0.8     // 0-1: comfort level with detailed questions
}

Consider:
- Positive words = higher overall score
- Detailed responses = higher receptiveness  
- Time-related words = higher urgency
- Openness to sharing info = higher trust_level`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    const sentimentData = JSON.parse(content);
    return {
      overall: Math.max(-1, Math.min(1, sentimentData.overall || 0)),
      receptiveness: Math.max(0, Math.min(1, sentimentData.receptiveness || 0.5)),
      urgency: Math.max(0, Math.min(1, sentimentData.urgency || 0)),
      trust_level: Math.max(0, Math.min(1, sentimentData.trust_level || 0.5))
    };
  } catch (error) {
    console.warn('[conversation-analysis] Sentiment analysis failed:', error);
    return { overall: 0, receptiveness: 0.5, urgency: 0, trust_level: 0.5 };
  }
}

// Detect buying stage from conversation
async function detectBuyingStage(userMessages: Message[]): Promise<BuyingStage> {
  if (userMessages.length === 0) return 'awareness';
  
  const allUserContent = userMessages.map(m => m.content).join(' ').toLowerCase();
  
  // Stage indicators
  const stageIndicators = {
    decision: ['ready to buy', 'want to purchase', 'book now', 'when can i sign', 'deposit', 'contract'],
    evaluation: ['compare', 'final decision', 'details about', 'specifications', 'payment plans', 'financing'],
    intent: ['serious about', 'interested in buying', 'planning to purchase', 'investment opportunity'],
    consideration: ['price', 'cost', 'how much', 'what options', 'different villas', 'which villa'],
    interest: ['tell me more', 'sounds interesting', 'like this', 'looks good', 'beautiful'],
    awareness: ['what is', 'never heard', 'first time', 'don\'t know much']
  };
  
  // Score each stage
  const scores: { [key in BuyingStage]: number } = {
    awareness: 0, interest: 0, consideration: 0, intent: 0, evaluation: 0, decision: 0
  };
  
  for (const [stage, indicators] of Object.entries(stageIndicators)) {
    for (const indicator of indicators) {
      if (allUserContent.includes(indicator)) {
        scores[stage as BuyingStage] += 1;
      }
    }
  }
  
  // Add conversation length bias (longer conversations = higher stages)
  const lengthBias = Math.min(userMessages.length / 5, 1);
  scores.consideration += lengthBias * 0.5;
  scores.intent += lengthBias * 0.3;
  
  // Return stage with highest score
  const maxStage = Object.entries(scores).reduce((a, b) => scores[a[0] as BuyingStage] > scores[b[0] as BuyingStage] ? a : b);
  return maxStage[0] as BuyingStage;
}

// Detect intent signals in conversation
async function detectIntentSignals(userMessages: Message[]): Promise<IntentSignal[]> {
  const signals: IntentSignal[] = [];
  
  const intentPatterns = [
    { type: 'purchase_interest' as const, patterns: ['buy', 'purchase', 'invest', 'own', 'acquire'] },
    { type: 'price_inquiry' as const, patterns: ['price', 'cost', 'expensive', 'cheap', 'afford', 'budget'] },
    { type: 'timeline_hint' as const, patterns: ['when', 'soon', 'quickly', 'immediately', 'next month', 'this year'] },
    { type: 'budget_hint' as const, patterns: ['million', 'budget', 'can afford', 'willing to spend'] },
    { type: 'decision_authority_hint' as const, patterns: ['family', 'spouse', 'partner', 'discuss', 'ask my'] }
  ];
  
  for (const message of userMessages.slice(-5)) { // Check recent messages
    const content = message.content.toLowerCase();
    
    for (const intentType of intentPatterns) {
      for (const pattern of intentType.patterns) {
        if (content.includes(pattern)) {
          const confidence = content.split(' ').filter(word => intentType.patterns.some(p => word.includes(p))).length / content.split(' ').length;
          
          signals.push({
            type: intentType.type,
            confidence: Math.min(confidence * 2, 1), // Boost confidence but cap at 1
            source_message: message.content,
            detected_value: pattern
          });
        }
      }
    }
  }
  
  return signals;
}

// Calculate engagement level
function calculateEngagementLevel(userMessages: Message[], assistantMessages: Message[]): EngagementLevel {
  if (userMessages.length === 0) return 'low';
  
  const avgUserMessageLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  const responseRate = assistantMessages.length > 0 ? userMessages.length / assistantMessages.length : 0;
  
  let score = 0;
  
  // Message length indicates engagement
  if (avgUserMessageLength > 100) score += 2;
  else if (avgUserMessageLength > 50) score += 1;
  
  // Response consistency
  if (responseRate > 0.8) score += 2;
  else if (responseRate > 0.6) score += 1;
  
  // Question asking (shows interest)
  const questionCount = userMessages.filter(m => m.content.includes('?')).length;
  if (questionCount > 2) score += 1;
  
  if (score >= 5) return 'very_high';
  if (score >= 3) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
}

// Calculate user responsiveness
function calculateResponsiveness(messages: Message[]): number {
  if (messages.length < 2) return 0.5;
  
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  
  if (assistantMessages.length === 0) return 0.5;
  
  return Math.min(userMessages.length / assistantMessages.length, 1);
}

// Calculate question fatigue
function calculateQuestionFatigue(questionsAsked: string[], messages: Message[]): FatigueScore {
  const recentQuestions = questionsAsked.slice(-3);
  const recentMessages = messages.slice(-6);
  
  // Count questions in recent conversation
  const questionsInRecentConversation = recentMessages.filter(m => 
    m.role === 'assistant' && m.content.includes('?')
  ).length;
  
  let fatigueLevel = 0;
  
  // More questions = higher fatigue
  fatigueLevel += recentQuestions.length * 0.3;
  fatigueLevel += questionsInRecentConversation * 0.2;
  
  // Conversation length affects tolerance
  if (messages.length < 4) fatigueLevel += 0.3; // Early conversation = less tolerance
  
  fatigueLevel = Math.min(fatigueLevel, 1);
  
  return {
    level: fatigueLevel,
    recent_questions: recentQuestions.length,
    time_since_last_question: 0, // Would need timestamp data
    recommendation: fatigueLevel > 0.7 ? 'avoid' : fatigueLevel > 0.4 ? 'wait' : 'proceed'
  };
}

// Analyze topic focus
async function analyzeTopicFocus(userMessages: Message[]): Promise<TopicFocus[]> {
  if (userMessages.length === 0) return [];
  
  const allContent = userMessages.map(m => m.content).join(' ').toLowerCase();
  
  const topics = [
    { topic: 'pricing', keywords: ['price', 'cost', 'expensive', 'cheap', 'budget', 'afford'] },
    { topic: 'location', keywords: ['siargao', 'location', 'area', 'where', 'place'] },
    { topic: 'investment', keywords: ['investment', 'roi', 'return', 'rental', 'income', 'profit'] },
    { topic: 'amenities', keywords: ['pool', 'beach', 'facilities', 'amenities', 'features'] },
    { topic: 'timeline', keywords: ['when', 'ready', 'available', 'completion', 'move in'] },
    { topic: 'financing', keywords: ['payment', 'financing', 'loan', 'installment', 'terms'] }
  ];
  
  return topics.map(topic => {
    const matches = topic.keywords.filter(keyword => allContent.includes(keyword)).length;
    const relevance = Math.min(matches / topic.keywords.length, 1);
    
    return {
      topic: topic.topic,
      relevance,
      qualification_opportunity: ['pricing', 'investment', 'timeline', 'financing'].includes(topic.topic) && relevance > 0.3
    };
  }).filter(topic => topic.relevance > 0);
}

// Calculate qualification readiness score
function calculateQualificationReadiness(
  stage: BuyingStage,
  sentiment: SentimentScore,
  fatigue: FatigueScore,
  signals: IntentSignal[]
): number {
  let readiness = 0;
  
  // Stage readiness
  const stageScores = {
    awareness: 0.2, interest: 0.4, consideration: 0.6, 
    intent: 0.8, evaluation: 0.9, decision: 1.0
  };
  readiness += stageScores[stage] * 0.4;
  
  // Sentiment readiness
  readiness += sentiment.receptiveness * 0.3;
  readiness += sentiment.trust_level * 0.2;
  
  // Fatigue penalty
  readiness -= fatigue.level * 0.3;
  
  // Intent signals boost
  const signalBoost = Math.min(signals.length * 0.1, 0.3);
  readiness += signalBoost;
  
  return Math.max(0, Math.min(1, readiness));
}

// Generate conversation hook for natural question integration
function generateConversationHook(field: keyof QualificationData, context: ConversationContext): string {
  const hooks = {
    purchase_intent: `Since you're interested in ${context.topic_focus.find(t => t.relevance > 0.5)?.topic || 'the villas'}, I'd love to understand if you're considering this as an investment opportunity or for personal use.`,
    timeline: `To help prioritize the information that's most relevant to you, what's your timeline for making a decision?`,
    budget_range: `To recommend the best villa options for you, what budget range are you working with?`,
    decision_authority: `This helps me know who should be included in our communications - are you the primary decision maker, or will others be involved?`,
    siargao_familiarity: `To provide the right level of area information, have you been to Siargao before?`,
    payment_preference: `To show you the most suitable options, do you prefer to pay in full or are you interested in our flexible payment plans?`,
    previous_property_purchases: `This helps me tailor my recommendations - have you purchased investment property before?`
  };
  
  return hooks[field] || `I'd like to better understand your needs to provide the most relevant information.`;
}