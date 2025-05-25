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
        if (parsedLead && parsedLead.firstName) {
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
    if (leadInfo?.firstName) {
      localStorage.removeItem(`skypearls_chat_history_${leadInfo.firstName}`);
    }
    setLeadInfo(null);
    setChatOpen(false);
  };

  return (
    <>
      {/* Luxury FAB Container with Tooltip */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-10 z-50 group">
        {/* Tooltip - Hidden on mobile to avoid touch issues */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg hidden md:block transform translate-y-1 group-hover:translate-y-0">
          Chat with Skye
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>

        <Button
          onClick={handleToggleFab}
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-skypearl via-skypearl to-skypearl-dark shadow-lg hover:shadow-skypearl/20 overflow-hidden p-0 focus:outline-none focus:ring-2 focus:ring-skypearl/40 focus:ring-offset-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 border border-white/10 pointer-events-auto"
          aria-label={chatOpen ? "Close chat" : "Open chat"}
          style={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(130, 180, 200, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          {chatOpen ? (
            <X className="h-6 w-6 text-white transition-all duration-200 ease-in-out group-hover:rotate-45 drop-shadow-sm" />
          ) : (
            <>
              <img
                src="/skye-assistant.png"
                alt="Skye assistant"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Notification Dot */}
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-sm">
                <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse opacity-40"></div>
              </div>
            </>
          )}
          
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
        </Button>
      </div>

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