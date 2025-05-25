export interface LeadInfo {
  firstName: string;
  email?: string;        // Make optional for backward compatibility
  phone?: string;        // Make optional - nice to have but not required
  sendTranscript?: boolean; // Keep for compatibility, will be unused
}