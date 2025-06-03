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
});

export type GraphState = StateType<typeof StateAnnotation.spec>; 