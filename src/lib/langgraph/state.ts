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

// Types for the different states our graph will manage
export interface ChatState {
  messages: Message[];
  question: string;
  documents?: Document[];
  lastRetrieval?: string;
  documentQuality?: number; // Added for the grading node
  isGreeting?: boolean; // Added for greeting detection
  leadInfo?: LeadInfo;
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
  leadInfo: Annotation<LeadInfo | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});

export type GraphState = StateType<typeof StateAnnotation.spec>; 