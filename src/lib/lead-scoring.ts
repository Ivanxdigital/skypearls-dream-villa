import { QualificationData, LeadScore, Message } from './langgraph/state.js';
import { ConversationContext, analyzeConversationContext } from './conversation-analysis.js';

// Weighted scoring system based on SkyPearls villa qualification priorities
const SCORING_WEIGHTS = {
  intent: {
    'investment': 25,
    'primary_residence': 20,
    'vacation_home': 15,
    'exploring': 5
  },
  timeline: {
    'immediate': 25,
    'next_3_months': 20,
    'next_6_months': 15,
    'next_year': 10,
    'just_looking': 2
  },
  budget: {
    'above_35m': 25,
    '25m_35m': 20,
    '15m_25m': 15,
    'under_15m': 10,
    'flexible': 12
  },
  authority: {
    'sole_decision': 25,
    'spouse_consultation': 18,
    'family_decision': 12,
    'business_partners': 8
  }
};

// Additional scoring factors
const ENGAGEMENT_SCORES = {
  previous_property_purchases: 10,
  siargao_familiarity: {
    'considering_relocation': 8,
    'regular_visitor': 6,
    'visited_before': 4,
    'first_time': 2
  },
  urgency_level: {
    'high': 8,
    'medium': 5,
    'low': 2
  }
};

export function calculateLeadScore(qualificationData: QualificationData): LeadScore {
  // Calculate individual dimension scores
  const intentScore = qualificationData.purchase_intent 
    ? SCORING_WEIGHTS.intent[qualificationData.purchase_intent] || 0 
    : 0;
    
  const timelineScore = qualificationData.timeline 
    ? SCORING_WEIGHTS.timeline[qualificationData.timeline] || 0 
    : 0;
    
  const budgetScore = qualificationData.budget_range 
    ? SCORING_WEIGHTS.budget[qualificationData.budget_range] || 0 
    : 0;
    
  const authorityScore = qualificationData.decision_authority 
    ? SCORING_WEIGHTS.authority[qualificationData.decision_authority] || 0 
    : 0;

  // Calculate engagement bonus
  let engagementBonus = 0;
  
  if (qualificationData.previous_property_purchases) {
    engagementBonus += ENGAGEMENT_SCORES.previous_property_purchases;
  }
  
  if (qualificationData.siargao_familiarity) {
    engagementBonus += ENGAGEMENT_SCORES.siargao_familiarity[qualificationData.siargao_familiarity] || 0;
  }
  
  if (qualificationData.urgency_level) {
    engagementBonus += ENGAGEMENT_SCORES.urgency_level[qualificationData.urgency_level] || 0;
  }

  // Calculate total score (max 100 from main dimensions + up to 26 from engagement)
  const totalScore = Math.min(100, intentScore + timelineScore + budgetScore + authorityScore + engagementBonus);
  
  // Determine qualification level
  const qualificationLevel = getQualificationLevel(totalScore);
  
  return {
    total_score: totalScore,
    intent_score: intentScore,
    timeline_score: timelineScore,
    budget_score: budgetScore,
    authority_score: authorityScore,
    qualification_level: qualificationLevel,
    last_updated: new Date().toISOString()
  };
}

function getQualificationLevel(totalScore: number): LeadScore['qualification_level'] {
  if (totalScore >= 90) return 'hot';
  if (totalScore >= 70) return 'high';
  if (totalScore >= 50) return 'medium';
  if (totalScore >= 30) return 'low';
  return 'unqualified';
}

export function getQualificationProgress(qualificationData: QualificationData): number {
  const totalFields = 11; // Main qualification fields we want to collect
  let filledFields = 0;
  
  // Core fields (higher weight)
  if (qualificationData.purchase_intent) filledFields += 2;
  if (qualificationData.timeline) filledFields += 2;
  if (qualificationData.budget_range) filledFields += 2;
  if (qualificationData.decision_authority) filledFields += 2;
  
  // Secondary fields (lower weight)
  if (qualificationData.siargao_familiarity) filledFields += 1;
  if (qualificationData.previous_property_purchases !== undefined) filledFields += 1;
  if (qualificationData.payment_preference) filledFields += 1;
  
  return Math.round((filledFields / totalFields) * 100);
}

export function getNextBestQuestion(qualificationData: QualificationData, questionsAsked: string[]): string | null {
  // Priority order for qualification questions
  const questionPriority = [
    { field: 'purchase_intent', question: 'purchase_intent' },
    { field: 'timeline', question: 'timeline' },
    { field: 'budget_range', question: 'budget_range' },
    { field: 'decision_authority', question: 'decision_authority' },
    { field: 'siargao_familiarity', question: 'siargao_familiarity' },
    { field: 'payment_preference', question: 'payment_preference' },
    { field: 'previous_property_purchases', question: 'previous_property_purchases' }
  ];
  
  for (const { field, question } of questionPriority) {
    // Skip if we already have this data
    if (qualificationData[field as keyof QualificationData] !== undefined) continue;
    
    // Skip if we already asked this question
    if (questionsAsked.includes(question)) continue;
    
    return question;
  }
  
  return null; // All priority questions have been asked or answered
}

export function shouldTriggerQualification(
  qualificationData: QualificationData | undefined,
  questionsAsked: string[],
  conversationTurn: number
): boolean {
  // Don't qualify too early in conversation
  if (conversationTurn < 2) return false;
  
  // Don't qualify if we've asked too many questions recently
  const recentQuestions = questionsAsked.slice(-3);
  if (recentQuestions.length >= 2) return false;
  
  // Always try to qualify if we have very little data
  if (!qualificationData) return true;
  
  // Get current progress
  const progress = getQualificationProgress(qualificationData);
  
  // Trigger qualification if progress is low
  if (progress < 60) return true;
  
  // Check if we have the most important data
  const hasCore = qualificationData.purchase_intent && 
                  qualificationData.timeline && 
                  qualificationData.budget_range;
                  
  return !hasCore;
}

export function getActionTriggers(leadScore: LeadScore): {
  shouldNotifyTeam: boolean;
  shouldSuggestBooking: boolean;
  shouldShareWhatsApp: boolean;
  urgencyLevel: 'immediate' | 'same_day' | 'next_day' | 'routine';
} {
  const score = leadScore.total_score;
  
  return {
    shouldNotifyTeam: score >= 70,
    shouldSuggestBooking: score >= 50,
    shouldShareWhatsApp: score >= 30,
    urgencyLevel: score >= 90 ? 'immediate' : 
                  score >= 70 ? 'same_day' : 
                  score >= 50 ? 'next_day' : 'routine'
  };
}

// Enhanced Phase II: Intelligent lead scoring with conversation context
export async function calculateEnhancedLeadScore(
  qualificationData: QualificationData,
  messages: Message[],
  questionsAsked: string[] = []
): Promise<LeadScore & { context_score: number; conversation_insights: ConversationInsights }> {
  
  // Get base score from existing algorithm
  const baseScore = calculateLeadScore(qualificationData);
  
  // Analyze conversation context for additional insights
  const conversationContext = await analyzeConversationContext(messages, qualificationData, questionsAsked);
  
  // Calculate context-based score adjustments
  const contextAdjustments = calculateContextAdjustments(conversationContext);
  
  // Apply adjustments to base score
  const enhancedTotalScore = Math.min(100, Math.max(0, baseScore.total_score + contextAdjustments.total_adjustment));
  
  // Generate conversation insights
  const conversationInsights = generateConversationInsights(conversationContext, qualificationData);
  
  return {
    ...baseScore,
    total_score: enhancedTotalScore,
    qualification_level: getQualificationLevel(enhancedTotalScore),
    context_score: contextAdjustments.total_adjustment,
    conversation_insights: conversationInsights,
    last_updated: new Date().toISOString()
  };
}

// Phase II: Context-based scoring adjustments
interface ContextAdjustments {
  sentiment_adjustment: number;
  engagement_adjustment: number;
  stage_adjustment: number;
  intent_signals_adjustment: number;
  total_adjustment: number;
  reasoning: string[];
}

function calculateContextAdjustments(context: ConversationContext): ContextAdjustments {
  let sentimentAdjustment = 0;
  let engagementAdjustment = 0;
  let stageAdjustment = 0;
  let intentSignalsAdjustment = 0;
  const reasoning: string[] = [];
  
  // Sentiment-based adjustments
  if (context.sentiment_score.overall > 0.6) {
    sentimentAdjustment += 5;
    reasoning.push('Positive sentiment detected');
  } else if (context.sentiment_score.overall < -0.3) {
    sentimentAdjustment -= 3;
    reasoning.push('Negative sentiment detected');
  }
  
  if (context.sentiment_score.urgency > 0.7) {
    sentimentAdjustment += 3;
    reasoning.push('High urgency detected');
  }
  
  // Engagement-based adjustments
  if (context.engagement_level === 'very_high') {
    engagementAdjustment += 8;
    reasoning.push('Very high engagement level');
  } else if (context.engagement_level === 'high') {
    engagementAdjustment += 5;
    reasoning.push('High engagement level');
  } else if (context.engagement_level === 'low') {
    engagementAdjustment -= 5;
    reasoning.push('Low engagement level');
  }
  
  // Stage-based adjustments
  const stageBonus = {
    awareness: 0,
    interest: 2,
    consideration: 5,
    intent: 8,
    evaluation: 10,
    decision: 12
  };
  stageAdjustment = stageBonus[context.stage];
  reasoning.push(`Conversation stage: ${context.stage}`);
  
  // Intent signals adjustments
  const highValueSignals = context.intent_signals.filter(s => 
    ['purchase_interest', 'price_inquiry', 'timeline_hint'].includes(s.type) && s.confidence > 0.6
  );
  intentSignalsAdjustment = Math.min(highValueSignals.length * 2, 8);
  if (intentSignalsAdjustment > 0) {
    reasoning.push(`${highValueSignals.length} strong intent signals detected`);
  }
  
  const totalAdjustment = sentimentAdjustment + engagementAdjustment + stageAdjustment + intentSignalsAdjustment;
  
  return {
    sentiment_adjustment: sentimentAdjustment,
    engagement_adjustment: engagementAdjustment,
    stage_adjustment: stageAdjustment,
    intent_signals_adjustment: intentSignalsAdjustment,
    total_adjustment: totalAdjustment,
    reasoning
  };
}

// Phase II: Conversation insights for enhanced understanding
export interface ConversationInsights {
  buying_readiness: number; // 0-1 scale
  engagement_trend: 'increasing' | 'stable' | 'decreasing';
  primary_concerns: string[];
  decision_factors: string[];
  next_best_actions: string[];
  risk_factors: string[];
}

function generateConversationInsights(
  context: ConversationContext,
  qualificationData: QualificationData
): ConversationInsights {
  
  // Calculate buying readiness
  let buyingReadiness = 0;
  buyingReadiness += context.qualification_readiness * 0.4;
  buyingReadiness += (context.stage === 'decision' ? 1 : context.stage === 'evaluation' ? 0.8 : context.stage === 'intent' ? 0.6 : 0.3) * 0.3;
  buyingReadiness += context.sentiment_score.receptiveness * 0.3;
  
  // Determine engagement trend (simplified - would need historical data for accuracy)
  const engagementTrend = context.engagement_level === 'very_high' || context.engagement_level === 'high' ? 'increasing' : 'stable';
  
  // Identify primary concerns based on topic focus
  const primaryConcerns = context.topic_focus
    .filter(t => t.relevance > 0.4)
    .map(t => t.topic)
    .slice(0, 3);
  
  // Determine decision factors based on conversation stage and intent signals
  const decisionFactors: string[] = [];
  if (context.intent_signals.some(s => s.type === 'price_inquiry')) decisionFactors.push('pricing');
  if (context.intent_signals.some(s => s.type === 'timeline_hint')) decisionFactors.push('timing');
  if (qualificationData.decision_authority) decisionFactors.push('decision_process');
  if (context.topic_focus.some(t => t.topic === 'investment' && t.relevance > 0.5)) decisionFactors.push('roi_potential');
  
  // Generate next best actions
  const nextBestActions: string[] = [];
  if (context.stage === 'decision' && buyingReadiness > 0.7) {
    nextBestActions.push('Schedule immediate consultation');
  } else if (context.stage === 'evaluation') {
    nextBestActions.push('Provide detailed pricing and payment options');
  } else if (context.stage === 'intent') {
    nextBestActions.push('Share investment projections and villa comparison');
  } else {
    nextBestActions.push('Continue building trust and providing information');
  }
  
  // Identify risk factors
  const riskFactors: string[] = [];
  if (context.question_fatigue.level > 0.6) riskFactors.push('Question fatigue - reduce qualification intensity');
  if (context.sentiment_score.trust_level < 0.4) riskFactors.push('Low trust level - focus on relationship building');
  if (context.engagement_level === 'low') riskFactors.push('Low engagement - improve interaction quality');
  if (!qualificationData.timeline && context.stage !== 'awareness') riskFactors.push('Unknown timeline - may not convert soon');
  
  return {
    buying_readiness: Math.min(buyingReadiness, 1),
    engagement_trend: engagementTrend,
    primary_concerns: primaryConcerns,
    decision_factors: decisionFactors,
    next_best_actions: nextBestActions,
    risk_factors: riskFactors
  };
}

// Enhanced Phase II: Intelligent qualification triggering with context awareness
export async function shouldTriggerQualificationEnhanced(
  messages: Message[],
  qualificationData: QualificationData | undefined,
  questionsAsked: string[]
): Promise<{
  should_qualify: boolean;
  confidence: number;
  reasoning: string;
  recommended_approach: 'immediate' | 'gentle' | 'wait' | 'abort';
}> {
  
  // Get conversation context
  const context = await analyzeConversationContext(messages, qualificationData, questionsAsked);
  
  let shouldQualify = false;
  let confidence = 0;
  let reasoning = '';
  let recommendedApproach: 'immediate' | 'gentle' | 'wait' | 'abort' = 'wait';
  
  // Check basic conditions first
  if (context.conversation_depth < 2) {
    return {
      should_qualify: false,
      confidence: 0.9,
      reasoning: 'Too early in conversation - need to build rapport first',
      recommended_approach: 'wait'
    };
  }
  
  // Check question fatigue
  if (context.question_fatigue.level > 0.8) {
    return {
      should_qualify: false,
      confidence: 0.9,
      reasoning: 'High question fatigue detected - user needs a break from questions',
      recommended_approach: 'abort'
    };
  }
  
  // Check qualification readiness
  if (context.qualification_readiness > 0.7) {
    shouldQualify = true;
    confidence = 0.8;
    reasoning = 'User shows high qualification readiness';
    recommendedApproach = context.sentiment_score.receptiveness > 0.7 ? 'immediate' : 'gentle';
  } else if (context.qualification_readiness > 0.4 && context.sentiment_score.trust_level > 0.6) {
    shouldQualify = true;
    confidence = 0.6;
    reasoning = 'Moderate readiness with good trust level';
    recommendedApproach = 'gentle';
  } else if (context.stage === 'intent' || context.stage === 'evaluation') {
    shouldQualify = true;
    confidence = 0.7;
    reasoning = 'Conversation stage indicates readiness for qualification';
    recommendedApproach = 'gentle';
  } else {
    shouldQualify = false;
    confidence = 0.6;
    reasoning = 'User not sufficiently ready for qualification questions';
    recommendedApproach = 'wait';
  }
  
  // Override if we have strong intent signals
  const strongIntentSignals = context.intent_signals.filter(s => s.confidence > 0.7);
  if (strongIntentSignals.length >= 2) {
    shouldQualify = true;
    confidence = Math.min(confidence + 0.2, 1);
    reasoning += ' + Strong intent signals detected';
    recommendedApproach = 'immediate';
  }
  
  return {
    should_qualify: shouldQualify,
    confidence,
    reasoning,
    recommended_approach: recommendedApproach
  };
}