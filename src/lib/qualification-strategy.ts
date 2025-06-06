import { 
  ConversationContext, 
  QualificationOpportunity, 
  BuyingStage, 
  analyzeConversationContext,
  detectQualificationOpportunities 
} from './conversation-analysis.js';
import { QualificationData, Message } from './langgraph/state.js';

// Advanced question strategy interfaces
export interface StrategyQuestion {
  field: keyof QualificationData;
  question_text: string;
  approach: QuestionApproach;
  priority_score: number;
  timing: QuestionTiming;
  context_integration: ContextIntegration;
  fallback_questions: string[];
}

export interface QuestionApproach {
  style: 'direct' | 'indirect' | 'contextual' | 'conversational';
  tone: 'casual' | 'professional' | 'consultative';
  integration_method: 'standalone' | 'embedded' | 'follow_up';
}

export interface QuestionTiming {
  recommendation: 'immediate' | 'next_turn' | 'wait' | 'strategic_delay';
  confidence: number; // 0-1
  reasoning: string;
}

export interface ContextIntegration {
  conversation_hook: string;
  transition_phrase: string;
  relevance_connection: string;
  user_benefit_explanation: string;
}

export interface QualificationStrategy {
  primary_question: StrategyQuestion | null;
  backup_questions: StrategyQuestion[];
  conversation_approach: ConversationApproach;
  pacing_recommendation: PacingRecommendation;
  risk_assessment: RiskAssessment;
}

export interface ConversationApproach {
  session_goal: string;
  information_priority: Array<keyof QualificationData>;
  engagement_strategy: 'aggressive' | 'moderate' | 'conservative' | 'adaptive';
  relationship_building: boolean;
}

export interface PacingRecommendation {
  questions_per_session: number;
  wait_turns: number;
  natural_flow_priority: number; // 0-1 (1 = prioritize natural flow over data collection)
}

export interface RiskAssessment {
  user_fatigue_risk: number; // 0-1
  conversation_disruption_risk: number; // 0-1
  engagement_loss_risk: number; // 0-1
  overall_risk: 'low' | 'medium' | 'high';
  mitigation_strategies: string[];
}

export interface TimingRecommendation {
  should_ask_now: boolean;
  optimal_delay: number; // turns to wait
  confidence: number; // 0-1
  reasoning: string;
}

export interface UserBehavior {
  response_patterns: ResponsePattern[];
  engagement_trends: EngagementTrend[];
  information_sharing_comfort: number; // 0-1
  conversation_style: ConversationStyle;
}

export interface ResponsePattern {
  question_type: string;
  typical_response_length: number;
  information_richness: number; // 0-1
  emotional_tone: string;
}

export interface EngagementTrend {
  session_number: number;
  engagement_level: number; // 0-1
  question_tolerance: number; // 0-1
}

export type ConversationStyle = 'detailed' | 'brief' | 'question_heavy' | 'narrative';

// Main strategy engine function
export async function selectOptimalQuestion(
  messages: Message[],
  qualificationData: QualificationData = {},
  questionsAsked: string[] = []
): Promise<QualificationStrategy> {
  
  // Analyze conversation context using conversation intelligence
  const context = await analyzeConversationContext(messages, qualificationData, questionsAsked);
  
  // Detect qualification opportunities
  const opportunities = detectQualificationOpportunities(context, qualificationData, questionsAsked);
  
  // Assess risks and constraints
  const riskAssessment = assessQualificationRisks(context, questionsAsked);
  
  // Determine conversation approach
  const conversationApproach = determineConversationApproach(context, qualificationData);
  
  // Calculate pacing recommendation
  const pacingRecommendation = calculatePacingRecommendation(context, riskAssessment);
  
  // Select primary question if appropriate
  const primaryQuestion = opportunities.length > 0 && riskAssessment.overall_risk !== 'high'
    ? await createStrategyQuestion(opportunities[0], context, conversationApproach)
    : null;
  
  // Generate backup questions
  const backupQuestions = await Promise.all(
    opportunities.slice(1, 3).map(opp => createStrategyQuestion(opp, context, conversationApproach))
  );
  
  return {
    primary_question: primaryQuestion,
    backup_questions: backupQuestions,
    conversation_approach: conversationApproach,
    pacing_recommendation: pacingRecommendation,
    risk_assessment: riskAssessment
  };
}

// Optimize question timing based on conversation context
export function optimizeQuestionTiming(
  context: ConversationContext,
  opportunity: QualificationOpportunity
): TimingRecommendation {
  
  let shouldAskNow = true;
  let optimalDelay = 0;
  let confidence = 0.5;
  let reasoning = 'Default timing assessment';
  
  // Check qualification readiness
  if (context.qualification_readiness < 0.3) {
    shouldAskNow = false;
    optimalDelay = 2;
    confidence = 0.8;
    reasoning = 'User not ready for qualification questions yet';
  }
  
  // Check question fatigue
  else if (context.question_fatigue.level > 0.7) {
    shouldAskNow = false;
    optimalDelay = 3;
    confidence = 0.9;
    reasoning = 'High question fatigue detected - need to wait';
  }
  
  // Check conversation stage appropriateness
  else if (!isStageAppropriate(context.stage, opportunity.field)) {
    shouldAskNow = false;
    optimalDelay = 1;
    confidence = 0.7;
    reasoning = 'Current conversation stage not optimal for this question';
  }
  
  // High opportunity score with good conditions
  else if (opportunity.opportunity_score > 0.7 && context.sentiment_score.receptiveness > 0.6) {
    shouldAskNow = true;
    optimalDelay = 0;
    confidence = 0.9;
    reasoning = 'High opportunity score with positive user sentiment';
  }
  
  // Medium conditions
  else if (opportunity.opportunity_score > 0.5) {
    shouldAskNow = true;
    optimalDelay = 0;
    confidence = 0.6;
    reasoning = 'Moderate opportunity with acceptable conditions';
  }
  
  // Conservative approach
  else {
    shouldAskNow = false;
    optimalDelay = 1;
    confidence = 0.5;
    reasoning = 'Conservative approach - wait for better opportunity';
  }
  
  return {
    should_ask_now: shouldAskNow,
    optimal_delay: optimalDelay,
    confidence: confidence,
    reasoning: reasoning
  };
}

// Adapt questioning strategy based on user behavior
export function adaptQuestioningStrategy(
  userBehavior: UserBehavior,
  currentStrategy: QualificationStrategy
): QualificationStrategy {
  
  // Adapt based on information sharing comfort
  if (userBehavior.information_sharing_comfort < 0.3) {
    // User is hesitant - use more indirect approaches
    currentStrategy.conversation_approach.engagement_strategy = 'conservative';
    currentStrategy.pacing_recommendation.questions_per_session = 1;
    currentStrategy.pacing_recommendation.natural_flow_priority = 0.9;
  } else if (userBehavior.information_sharing_comfort > 0.7) {
    // User is open - can be more direct
    currentStrategy.conversation_approach.engagement_strategy = 'moderate';
    currentStrategy.pacing_recommendation.questions_per_session = 2;
  }
  
  // Adapt based on conversation style
  if (userBehavior.conversation_style === 'brief') {
    // Keep questions concise
    if (currentStrategy.primary_question) {
      currentStrategy.primary_question.approach.style = 'direct';
      currentStrategy.primary_question.approach.integration_method = 'standalone';
    }
  } else if (userBehavior.conversation_style === 'detailed') {
    // Can use more contextual approaches
    if (currentStrategy.primary_question) {
      currentStrategy.primary_question.approach.style = 'contextual';
      currentStrategy.primary_question.approach.integration_method = 'embedded';
    }
  }
  
  return currentStrategy;
}

// Generate contextual questions based on conversation context
export async function generateContextualQuestions(
  context: ConversationContext,
  targetField: keyof QualificationData
): Promise<ContextualQuestion[]> {
  
  const topicFocus = context.topic_focus.find(t => t.relevance > 0.5)?.topic || 'villas';
  const stage = context.stage;
  
  const questionTemplates = getQuestionTemplatesForField(targetField, stage, topicFocus);
  
  return questionTemplates.map(template => ({
    field: targetField,
    question: template.question,
    context_relevance: template.relevance,
    natural_integration: template.integration,
    effectiveness_score: calculateQuestionEffectiveness(template, context)
  }));
}

export interface ContextualQuestion {
  field: keyof QualificationData;
  question: string;
  context_relevance: number; // 0-1
  natural_integration: string;
  effectiveness_score: number; // 0-1
}

// Helper functions

async function createStrategyQuestion(
  opportunity: QualificationOpportunity,
  context: ConversationContext,
  approach: ConversationApproach
): Promise<StrategyQuestion> {
  
  const questionTemplates = getQuestionTemplatesForField(
    opportunity.field, 
    context.stage, 
    context.topic_focus.find(t => t.relevance > 0.5)?.topic || 'general'
  );
  
  // Select best template based on approach strategy
  const selectedTemplate = selectBestTemplate(questionTemplates, approach.engagement_strategy);
  
  const timing = optimizeQuestionTiming(context, opportunity);
  
  return {
    field: opportunity.field,
    question_text: selectedTemplate.question,
    approach: {
      style: opportunity.suggested_approach,
      tone: approach.engagement_strategy === 'conservative' ? 'casual' : 'consultative',
      integration_method: context.conversation_depth > 3 ? 'embedded' : 'standalone'
    },
    priority_score: opportunity.opportunity_score,
    timing: {
      recommendation: timing.should_ask_now ? 'immediate' : 'strategic_delay',
      confidence: timing.confidence,
      reasoning: timing.reasoning
    },
    context_integration: {
      conversation_hook: opportunity.conversation_hook,
      transition_phrase: generateTransitionPhrase(context, opportunity.field),
      relevance_connection: generateRelevanceConnection(context, opportunity.field),
      user_benefit_explanation: generateBenefitExplanation(opportunity.field)
    },
    fallback_questions: questionTemplates.slice(1, 3).map(t => t.question)
  };
}

function assessQualificationRisks(
  context: ConversationContext,
  questionsAsked: string[]
): RiskAssessment {
  
  const userFatigueRisk = context.question_fatigue.level;
  const conversationDisruptionRisk = context.stage === 'awareness' ? 0.8 : 
                                   context.stage === 'decision' ? 0.3 : 0.5;
  const engagementLossRisk = context.sentiment_score.receptiveness < 0.4 ? 0.8 : 
                            context.engagement_level === 'low' ? 0.6 : 0.2;
  
  const overallRiskScore = (userFatigueRisk + conversationDisruptionRisk + engagementLossRisk) / 3;
  
  const overallRisk = overallRiskScore > 0.7 ? 'high' : 
                     overallRiskScore > 0.4 ? 'medium' : 'low';
  
  const mitigationStrategies = [];
  if (userFatigueRisk > 0.6) mitigationStrategies.push('Reduce question frequency');
  if (conversationDisruptionRisk > 0.6) mitigationStrategies.push('Use contextual integration');
  if (engagementLossRisk > 0.6) mitigationStrategies.push('Focus on relationship building');
  
  return {
    user_fatigue_risk: userFatigueRisk,
    conversation_disruption_risk: conversationDisruptionRisk,
    engagement_loss_risk: engagementLossRisk,
    overall_risk: overallRisk,
    mitigation_strategies: mitigationStrategies
  };
}

function determineConversationApproach(
  context: ConversationContext,
  qualificationData: QualificationData
): ConversationApproach {
  
  // Calculate completion percentage
  const completedFields = Object.values(qualificationData).filter(v => v !== undefined).length;
  const totalFields = 11; // Total qualification fields
  const completionRate = completedFields / totalFields;
  
  // Determine engagement strategy
  let engagementStrategy: ConversationApproach['engagement_strategy'] = 'moderate';
  
  if (context.sentiment_score.receptiveness > 0.8 && context.qualification_readiness > 0.7) {
    engagementStrategy = 'aggressive';
  } else if (context.question_fatigue.level > 0.6 || context.sentiment_score.receptiveness < 0.4) {
    engagementStrategy = 'conservative';
  } else if (context.stage === 'decision' || context.stage === 'evaluation') {
    engagementStrategy = 'moderate';
  }
  
  // Determine session goal
  const sessionGoal = completionRate < 0.3 ? 'collect_core_data' :
                     completionRate < 0.7 ? 'complete_profile' :
                     'refine_and_score';
  
  // Priority order based on stage and current data
  const informationPriority = prioritizeQualificationFields(context.stage, qualificationData);
  
  return {
    session_goal: sessionGoal,
    information_priority: informationPriority,
    engagement_strategy: engagementStrategy,
    relationship_building: context.stage === 'awareness' || context.sentiment_score.trust_level < 0.5
  };
}

function calculatePacingRecommendation(
  context: ConversationContext,
  riskAssessment: RiskAssessment
): PacingRecommendation {
  
  let questionsPerSession = 2;
  let waitTurns = 0;
  let naturalFlowPriority = 0.6;
  
  // Adjust based on risk
  if (riskAssessment.overall_risk === 'high') {
    questionsPerSession = 1;
    waitTurns = 2;
    naturalFlowPriority = 0.9;
  } else if (riskAssessment.overall_risk === 'low') {
    questionsPerSession = 3;
    waitTurns = 0;
    naturalFlowPriority = 0.4;
  }
  
  // Adjust based on conversation stage
  if (context.stage === 'awareness') {
    questionsPerSession = 1;
    naturalFlowPriority = 0.8;
  } else if (context.stage === 'decision') {
    questionsPerSession = 3;
    naturalFlowPriority = 0.3;
  }
  
  // Adjust based on engagement
  if (context.engagement_level === 'very_high') {
    questionsPerSession += 1;
  } else if (context.engagement_level === 'low') {
    questionsPerSession = Math.max(1, questionsPerSession - 1);
    naturalFlowPriority += 0.2;
  }
  
  return {
    questions_per_session: Math.min(questionsPerSession, 4), // Cap at 4
    wait_turns: waitTurns,
    natural_flow_priority: Math.min(naturalFlowPriority, 1)
  };
}

function isStageAppropriate(stage: BuyingStage, field: keyof QualificationData): boolean {
  const stageAppropriateFields = {
    awareness: ['siargao_familiarity'],
    interest: ['purchase_intent', 'siargao_familiarity'],
    consideration: ['purchase_intent', 'timeline', 'budget_range', 'siargao_familiarity'],
    intent: ['timeline', 'budget_range', 'decision_authority', 'payment_preference'],
    evaluation: ['budget_range', 'decision_authority', 'payment_preference', 'timeline'],
    decision: ['decision_authority', 'payment_preference', 'timeline']
  };
  
  return stageAppropriateFields[stage]?.includes(field) || false;
}

function getQuestionTemplatesForField(
  field: keyof QualificationData,
  stage: BuyingStage,
  topicContext: string
): Array<{ question: string; relevance: number; integration: string }> {
  
  const templates: { [key in keyof QualificationData]?: Array<{ question: string; relevance: number; integration: string }> } = {
    purchase_intent: [
      {
        question: `Are you looking at this as an investment property or for personal use?`,
        relevance: 0.9,
        integration: `This helps me recommend the best villa and payment plan for your specific needs.`
      },
      {
        question: `Would this be for your own enjoyment or as an investment opportunity?`,
        relevance: 0.8,
        integration: `Understanding your intent helps me focus on the most relevant information.`
      }
    ],
    timeline: [
      {
        question: `What's your timeline for making a decision?`,
        relevance: 0.9,
        integration: `This helps me prioritize the information that's most relevant to your timeline.`
      },
      {
        question: `Are you looking to move forward soon or just exploring options?`,
        relevance: 0.8,
        integration: `Understanding your timeline helps me provide the right level of urgency.`
      }
    ],
    budget_range: [
      {
        question: `What budget range are you working with?`,
        relevance: 0.9,
        integration: `This helps me show you options that fit your investment goals.`
      },
      {
        question: `Do you have a specific budget range in mind for your ${topicContext} investment?`,
        relevance: 0.8,
        integration: `Knowing your budget helps me focus on the most suitable villas.`
      }
    ],
    decision_authority: [
      {
        question: `Are you the primary decision maker, or will others be involved in the decision?`,
        relevance: 0.9,
        integration: `This helps me know who should be included in our communication.`
      },
      {
        question: `Who else would be involved in this investment decision?`,
        relevance: 0.8,
        integration: `Understanding the decision process helps me provide appropriate information.`
      }
    ],
    siargao_familiarity: [
      {
        question: `Have you been to Siargao before?`,
        relevance: 0.9,
        integration: `This helps me provide the right level of area information.`
      },
      {
        question: `Are you familiar with the Siargao area and what makes it special?`,
        relevance: 0.8,
        integration: `Understanding your familiarity helps me tailor the information.`
      }
    ]
  };
  
  return templates[field] || [
    {
      question: `Could you tell me more about your specific needs regarding ${field}?`,
      relevance: 0.5,
      integration: `This information helps me provide better recommendations.`
    }
  ];
}

function selectBestTemplate(
  templates: Array<{ question: string; relevance: number; integration: string }>,
  strategy: ConversationApproach['engagement_strategy']
): { question: string; relevance: number; integration: string } {
  
  if (strategy === 'aggressive') {
    return templates[0]; // Most direct question
  } else if (strategy === 'conservative') {
    return templates[templates.length - 1]; // Most gentle question
  } else {
    return templates[Math.floor(templates.length / 2)]; // Middle ground
  }
}

function generateTransitionPhrase(context: ConversationContext, field: keyof QualificationData): string {
  const transitions = {
    purchase_intent: "To better understand your goals,",
    timeline: "To help prioritize our discussion,",
    budget_range: "To show you the most relevant options,",
    decision_authority: "To ensure clear communication,",
    siargao_familiarity: "To provide the right context,"
  };
  
  return transitions[field] || "To better assist you,";
}

function generateRelevanceConnection(context: ConversationContext, field: keyof QualificationData): string {
  const focusTopic = context.topic_focus.find(t => t.relevance > 0.5)?.topic || 'your interests';
  
  const connections = {
    purchase_intent: `Since you're interested in ${focusTopic}, understanding your primary intent helps me focus on the most relevant benefits.`,
    timeline: `Given your interest in ${focusTopic}, knowing your timeline helps me prioritize the right information.`,
    budget_range: `Based on your ${focusTopic} questions, understanding your budget helps me recommend the best-fit options.`,
    decision_authority: `For ${focusTopic} decisions of this magnitude, it's helpful to know the decision-making process.`,
    siargao_familiarity: `To properly explain ${focusTopic} in context, it helps to know your familiarity with the area.`
  };
  
  return connections[field] || `This helps me tailor my recommendations to your specific situation.`;
}

function generateBenefitExplanation(field: keyof QualificationData): string {
  const benefits = {
    purchase_intent: "This allows me to highlight the most relevant financial projections and usage scenarios.",
    timeline: "This ensures I provide information that matches your decision-making schedule.",
    budget_range: "This helps me focus on villas and payment plans within your comfort zone.",
    decision_authority: "This ensures all stakeholders receive appropriate information and communication.",
    siargao_familiarity: "This helps me provide the right amount of location context and local insights."
  };
  
  return benefits[field] || "This helps me provide more personalized and relevant assistance.";
}

function prioritizeQualificationFields(
  stage: BuyingStage,
  qualificationData: QualificationData
): Array<keyof QualificationData> {
  
  // Get missing fields
  const allFields: Array<keyof QualificationData> = [
    'purchase_intent', 'timeline', 'budget_range', 'decision_authority', 
    'siargao_familiarity', 'payment_preference', 'previous_property_purchases'
  ];
  
  const missingFields = allFields.filter(field => qualificationData[field] === undefined);
  
  // Stage-based prioritization
  const stagePriorities = {
    awareness: ['siargao_familiarity', 'purchase_intent'],
    interest: ['purchase_intent', 'siargao_familiarity', 'timeline'],
    consideration: ['purchase_intent', 'timeline', 'budget_range'],
    intent: ['timeline', 'budget_range', 'decision_authority'],
    evaluation: ['budget_range', 'decision_authority', 'payment_preference'],
    decision: ['decision_authority', 'timeline', 'payment_preference']
  };
  
  const currentStagePriority = stagePriorities[stage] || allFields;
  
  // Sort missing fields by stage priority
  return missingFields.sort((a, b) => {
    const aIndex = currentStagePriority.indexOf(a);
    const bIndex = currentStagePriority.indexOf(b);
    const aPos = aIndex === -1 ? 999 : aIndex;
    const bPos = bIndex === -1 ? 999 : bIndex;
    return aPos - bPos;
  });
}

function calculateQuestionEffectiveness(
  template: { question: string; relevance: number; integration: string },
  context: ConversationContext
): number {
  let effectiveness = template.relevance * 0.4;
  
  // Adjust based on context
  if (context.sentiment_score.receptiveness > 0.7) effectiveness += 0.2;
  if (context.question_fatigue.level < 0.3) effectiveness += 0.2;
  if (context.qualification_readiness > 0.6) effectiveness += 0.2;
  
  return Math.min(effectiveness, 1);
}