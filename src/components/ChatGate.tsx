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
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [hasAutoShown, setHasAutoShown] = useState<boolean>(false);

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

  // Auto-show tooltip effect
  useEffect(() => {
    if (!hasAutoShown) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasAutoShown(true);
        
        // Hide after 8 seconds
        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 8000);
        
        return () => clearTimeout(hideTimer);
      }, 500); // Small delay to ensure component is mounted
      
      return () => clearTimeout(timer);
    }
  }, [hasAutoShown]);

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

  const handleMouseEnter = () => {
    if (hasAutoShown) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasAutoShown) {
      setShowTooltip(false);
    }
  };

  return (
    <>
      {/* Luxury FAB Container with Tooltip */}
      <div 
        className="fixed bottom-4 right-4 md:bottom-6 md:right-10 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Tooltip - Now shows on both desktop and mobile */}
        <div className={`absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg transition-all duration-300 ease-out pointer-events-none whitespace-nowrap shadow-lg transform ${
          showTooltip 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1'
        }`}>
          Chat with Skye
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>

        <Button
          onClick={handleToggleFab}
          className="relative h-16 w-16 rounded-full bg-skypearl shadow-md hover:shadow-lg overflow-hidden p-0 focus:outline-none focus:ring-2 focus:ring-skypearl/40 focus:ring-offset-1 transition-all duration-300 ease-out pointer-events-auto"
          aria-label={chatOpen ? "Close chat" : "Open chat"}
        >
          {chatOpen ? (
            <X className="h-6 w-6 text-white transition-all duration-300 ease-out" />
          ) : (
            <>
              <img
                src="/skye-assistant.png"
                alt="Skye assistant"
                className="h-full w-full object-cover"
              />
              {/* Notification Dot */}
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
            </>
          )}
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