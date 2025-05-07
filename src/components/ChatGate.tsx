import React, { useState, useEffect, ReactNode } from 'react';
import { LeadInfo } from '@/types';
import { LeadForm } from './LeadForm';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'skypearls_lead';

interface ChatGateProps {
  children: (
    leadInfo: LeadInfo,
    chatOpen: boolean,
    setChatOpen: (open: boolean) => void,
    resetChat: () => void
  ) => ReactNode;
}

export function ChatGate({ children }: ChatGateProps) {
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [showLeadForm, setShowLeadForm] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedLead = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedLead) {
        const parsedLead: LeadInfo = JSON.parse(storedLead);
        if (parsedLead && parsedLead.firstName && parsedLead.email && parsedLead.phone) {
          setLeadInfo(parsedLead);
          // Do not automatically show the form or chat on load, let user action decide
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
        }
      }
    } catch (error) {
      console.error('Failed to load lead info from localStorage:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleToggleFab = () => {
    if (leadInfo) {
      setChatOpen(o => !o);
      if (showLeadForm) setShowLeadForm(false); // Close form if chat is toggled
    } else {
      setShowLeadForm(true);
      setChatOpen(false); // Ensure chat is closed if form is opening
    }
  };

  const handleLeadSubmit = async (data: LeadInfo) => {
    setLeadInfo(data);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save lead info to localStorage:', error);
    }
    setShowLeadForm(false);
    setChatOpen(true); // Open chat after successful lead submission

    // Immediate lead notification to the business
    try {
      console.log('[ChatGate] Notifying business of new lead:', data);
      await fetch("/api/notify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: data,
          transcript: "", // No transcript at this stage, just lead info
          sendTranscript: false // Not sending transcript to visitor yet
        })
      });
      console.log('[ChatGate] Business notification for new lead sent.');
    } catch (error) {
      console.error('[ChatGate] Error sending immediate lead notification:', error);
      // Non-critical for chat opening, so just log error and continue
    }
  };

  const handleLeadFormOpenChange = (isOpen: boolean) => {
    setShowLeadForm(isOpen);
    if (!isOpen && !leadInfo) {
      // If the form is closed without submitting and we still don't have leadInfo,
      // ensure chat isn't open.
      setChatOpen(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (leadInfo?.email) {
      localStorage.removeItem(`skypearls_chat_history_${leadInfo.email}`);
    }
    setLeadInfo(null);
    setChatOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleToggleFab}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full bg-skypearl shadow-lg hover:bg-skypearl-dark overflow-hidden p-0 focus:outline-none focus:ring-2 focus:ring-skypearl-dark focus:ring-offset-2 z-50"
        aria-label={chatOpen ? "Close chat" : "Open chat"}
      >
        {chatOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <img
            src="/skye-assistant.png"
            alt="Skye assistant"
            className="h-full w-full object-cover"
          />
        )}
      </Button>

      {showLeadForm && !leadInfo && (
        <LeadForm
          isOpen={showLeadForm}
          onOpenChange={handleLeadFormOpenChange}
          onSubmit={handleLeadSubmit}
        />
      )}

      {leadInfo && children(leadInfo, chatOpen, setChatOpen, handleReset)}
    </>
  );
} 