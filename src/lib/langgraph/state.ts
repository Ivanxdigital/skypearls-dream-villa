import { Annotation, type StateType } from "@langchain/langgraph";
import { Document } from "langchain/document";

// Define the Message type to match what we receive from the frontend
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Define LeadInfo type based on the existing frontend
export interface LeadInfo {
  firstName: string;
  email: string;
  phone: string;
  sendTranscript?: boolean;
}

// Qualification data interfaces for lead scoring system
export interface QualificationData {
  // Demographics
  location?: string;
  age_range?: string;
  
  // Purchase Intent
  purchase_intent?: 'primary_residence' | 'investment' | 'vacation_home' | 'exploring';
  timeline?: 'immediate' | 'next_3_months' | 'next_6_months' | 'next_year' | 'just_looking';
  
  // Financial
  budget_range?: 'under_15m' | '15m_25m' | '25m_35m' | 'above_35m' | 'flexible';
  payment_preference?: 'cash' | 'financing' | 'installment' | 'lease_to_own';
  
  // Decision Making
  decision_authority?: 'sole_decision' | 'spouse_consultation' | 'family_decision' | 'business_partners';
  decision_timeline?: 'ready_now' | 'need_time' | 'waiting_for_others';
  
  // Engagement
  previous_property_purchases?: boolean;
  siargao_familiarity?: 'first_time' | 'visited_before' | 'regular_visitor' | 'considering_relocation';
  
  // Contact Preferences
  preferred_contact?: 'whatsapp' | 'email' | 'phone' | 'in_person';
  follow_up_consent?: boolean;
  urgency_level?: 'high' | 'medium' | 'low';
}

export interface LeadScore {
  total_score: number; // 0-100
  intent_score: number; // 0-25
  timeline_score: number; // 0-25
  budget_score: number; // 0-25
  authority_score: number; // 0-25
  qualification_level: 'unqualified' | 'low' | 'medium' | 'high' | 'hot';
  last_updated: string;
}

export interface QualificationState {
  qualification_data?: QualificationData;
  lead_score?: LeadScore;
  questions_asked: string[];
  qualification_complete: boolean;
  next_qualification_opportunity?: string;
  qualification_progress: number; // 0-100%
}

// Streaming configuration interface
export interface StreamingConfig {
  enabled: boolean;
  onToken?: (token: string, messageId?: string) => void;
  messageId?: string;
}

// Types for the different states our graph will manage
export interface ChatState {
  messages: Message[];
  question: string;
  documents?: Document[];
  lastRetrieval?: string;
  documentQuality?: number; // Added for the grading node
  isGreeting?: boolean; // Added for greeting detection
  isBookingIntent?: boolean; // Added for booking intent detection
  bookingInfo?: { eventTypeUrl?: string; eventTypeName?: string }; // Added for booking information
  leadInfo?: LeadInfo;
  // Image functionality properties
  imageUrls?: string[];
  imageContext?: string;
  imageType?: 'location' | 'property' | 'amenity';
  showImages?: boolean;
  // Streaming properties
  streaming?: StreamingConfig;
  streamBuffer?: string;
  currentMessageId?: string;
  // Lead qualification properties
  qualificationData?: QualificationData;
  leadScore?: LeadScore;
  questionsAsked?: string[];
  qualificationComplete?: boolean;
  nextQualificationOpportunity?: string;
  qualificationProgress?: number;
  shouldQualify?: boolean; // Flag to trigger qualification
}

// State definitions for specific graph nodes using Annotation.Root
export const StateAnnotation = Annotation.Root({
  messages: Annotation<Message[]>({
    value: (x, y) => x.concat(y),
    default: () => [],
  }),
  question: Annotation<string>({
    value: (_, y) => y,
    default: () => "",
  }),
  documents: Annotation<Document[] | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  lastRetrieval: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  documentQuality: Annotation<number | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  isGreeting: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  isBookingIntent: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  bookingInfo: Annotation<{ eventTypeUrl?: string; eventTypeName?: string } | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  leadInfo: Annotation<LeadInfo | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  // Image functionality annotations
  imageUrls: Annotation<string[] | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  imageContext: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  imageType: Annotation<'location' | 'property' | 'amenity' | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  showImages: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  // Streaming annotations
  streaming: Annotation<StreamingConfig | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  streamBuffer: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  currentMessageId: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  // Lead qualification annotations
  qualificationData: Annotation<QualificationData | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  leadScore: Annotation<LeadScore | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  questionsAsked: Annotation<string[] | undefined>({
    value: (x, y) => y || x,
    default: () => [],
  }),
  qualificationComplete: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => false,
  }),
  nextQualificationOpportunity: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  qualificationProgress: Annotation<number | undefined>({
    value: (_, y) => y,
    default: () => 0,
  }),
  shouldQualify: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});

export type GraphState = StateType<typeof StateAnnotation.spec>; 