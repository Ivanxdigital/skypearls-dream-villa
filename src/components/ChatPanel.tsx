import { useState, useEffect, useRef } from "react";
import { Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LeadInfo } from "@/types"; // Import shared LeadInfo
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Add custom CSS for the scrollbar and new animations
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #E5DDD0;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #D4B883;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #c4a973;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #D4B883 #E5DDD0;
  }

  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-animation {
    animation: messageSlideIn 0.3s ease-out;
  }

  @keyframes typingBounce {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .typing-dot {
    animation: typingBounce 1.4s infinite ease-in-out;
  }

  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  .typing-dot:nth-child(3) { animation-delay: 0s; }

  .dialog-content .absolute.right-4.top-4 {
    display: none !important;
  }
`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface ChatPanelProps {
  leadInfo: LeadInfo;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onReset: () => void;
}

export function ChatPanel({ leadInfo, isOpen, onOpenChange, onReset }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>(""); // Add thread ID state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputFormRef = useRef<HTMLFormElement>(null);
  const [debugMode] = useState(import.meta.env.VITE_DEBUG_MODE === 'true');

  useEffect(() => {
    // Initialize with personalized greeting when the component mounts or leadInfo changes
    // This now correctly depends on leadInfo.firstName for re-initialization if that unlikely scenario occurs.
    if (leadInfo && leadInfo.firstName) {
      setMessages([
        {
          role: "assistant",
          content: `Hi ${leadInfo.firstName}! I'm Skye, your virtual assistant. How can I help you with our luxury villas in Siargao today?`,
        },
      ]);
    }     
  }, [leadInfo]); // Effect for initial message setup based on leadInfo

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize thread ID based on leadInfo
  useEffect(() => {
    if (leadInfo && leadInfo.email) {
      // Generate a consistent thread ID based on the user's email
      setThreadId(`skypearls-${leadInfo.email}`);
      console.log("[ChatPanel] Set thread ID:", `skypearls-${leadInfo.email}`);
    }
  }, [leadInfo]);

  useEffect(() => {
    // Load chat history from localStorage when the component mounts and isOpen becomes true
    if (isOpen && leadInfo && leadInfo.firstName) {
      const savedMessages = localStorage.getItem(`skypearls_chat_history_${leadInfo.email}`); // Namespace history by email
      if (savedMessages) {
        try {
          const parsedHistory: ChatMessage[] = JSON.parse(savedMessages);
           // Ensure the first message still matches the current user context before loading.
          if (parsedHistory.length > 0 && parsedHistory[0].role === 'assistant' && parsedHistory[0].content.includes(leadInfo.firstName)) {
            setMessages(parsedHistory);
          } else {
            // If history doesn't match or is invalid, start fresh with greeting
            localStorage.removeItem(`skypearls_chat_history_${leadInfo.email}`);
            setMessages([
              {
                role: "assistant",
                content: `Hi ${leadInfo.firstName}! I'm your Skypearls Villas assistant. How can I help you with our luxury villas in Siargao today?`,
              },
            ]);
          }
        } catch (error) {
          console.error("Failed to parse saved chat history:", error);
          localStorage.removeItem(`skypearls_chat_history_${leadInfo.email}`);
          setMessages([
            {
              role: "assistant",
              content: `Hi ${leadInfo.firstName}! I'm your Skypearls Villas assistant. How can I help you with our luxury villas in Siargao today?`,
            },
          ]);
        }
      } else {
         // No saved history, set initial greeting (already handled by the first useEffect, but good to be explicit)
         setMessages([
            {
              role: "assistant",
              content: `Hi ${leadInfo.firstName}! I'm your Skypearls Villas assistant. How can I help you with our luxury villas in Siargao today?`,
            },
          ]);
      }
    }
  }, [isOpen, leadInfo]); // Rerun when isOpen changes or leadInfo updates

  useEffect(() => {
    // Save chat history to localStorage whenever messages change, if chat is open and leadInfo exists
    if (isOpen && messages.length > 1 && leadInfo && leadInfo.email) { // Only save if more than initial greeting
      localStorage.setItem(`skypearls_chat_history_${leadInfo.email}`, JSON.stringify(messages));
    }
  }, [messages, isOpen, leadInfo]);

  useEffect(() => {
    if (leadInfo) {
      console.log("[ChatPanel] leadInfo on mount/update:", leadInfo);
    }
  }, [leadInfo]);

  const handleInputFocus = () => {
    setTimeout(() => {
      inputFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  };

  const notifyLead = async (currentMessages: ChatMessage[]) => {
    if (!leadInfo || !leadInfo.sendTranscript) return; // Only proceed if transcript sending is enabled
    
    try {
      console.log("Attempting to notify about lead (for transcript):", leadInfo);
      
      if (debugMode) {
        console.log("MOCK API CALL: Notifying about lead for transcript sending.");
        return;
      }
      
      const response = await fetch("/api/notify-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead: {
            firstName: leadInfo.firstName,
            email: leadInfo.email,
            phone: leadInfo.phone,
          },
          sendTranscript: leadInfo.sendTranscript,
          transcript: currentMessages.map(m => `${m.role}: ${m.content}`).join("\n"),
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to notify about lead (transcript):", response.status, errorText);
        throw new Error(`Failed to notify about lead (transcript). Status: ${response.status}. Body: ${errorText}`);
      }
      
      console.log("Successfully notified lead (transcript sent/handled by backend).");
    } catch (error) {
      console.error("Error notifying about lead (transcript):", error);
      // Optionally inform user of failure, but don't block UI flow.
    }
  };

  const handleEndChat = async () => {
    if (leadInfo.sendTranscript) {
      await notifyLead(messages); // Pass current messages to notifyLead
    }
    onOpenChange(false); // Close the chat panel
    onReset();
    // Optionally clear chat history from local storage upon explicit end chat
    // localStorage.removeItem(`skypearls_chat_history_${leadInfo.email}`);
    // setMessages([]); // Reset messages state for next opening, or rely on initial load logic
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    const userMessage = { role: "user" as const, content: userInput };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      if (debugMode) {
        console.log("MOCK API CALL: Sending chat message");
        let mockReply = "I'm sorry, I didn't understand that. Can you rephrase?";
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
          mockReply = `Hi ${leadInfo.firstName}! How can I assist you further?`;
        } else if (lowerInput.includes("price") || lowerInput.includes("how much")) {
          mockReply = "Our Skypearls villas are priced at ₱21,000,000. More details available!";
        } else if (lowerInput.includes("features") || lowerInput.includes("smart home")) {
          mockReply = "Villas include solar power, smart toilets, Alexa, smart locks, and 24/7 security.";
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        const botResponse = { role: "assistant" as const, content: mockReply };
        setMessages(prev => [...prev, botResponse]);
      } else {
        console.log("[ChatPanel] Attempting fetch to /api/chat with body:", JSON.stringify({ 
          messages: updatedMessages.map(m => ({role: m.role, content: m.content})),
          leadInfo, // Include leadInfo in the request for personalization
        }));
        
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Thread-ID": threadId, // Include thread ID in headers for persistence
          },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({role: m.role, content: m.content})),
            leadInfo, // Include leadInfo for personalization
          }),
        });

        if (!response.ok) {
          let errorBody = 'No error details available';
          try { errorBody = await response.text(); } catch {/*ignore*/}
          throw new Error(`Failed to get response. Status: ${response.status}. Body: ${errorBody}`);
        }

        const data = await response.json();
        const botResponse = { role: "assistant" as const, content: data.reply };
        setMessages(prev => [...prev, botResponse]);
        
        // Log source documents if available for debugging
        if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
          console.log("[ChatPanel] Retrieved source documents:", data.sourceDocuments.length);
        }
      }
    } catch (error) {
      console.error("[ChatPanel] Error caught in handleSubmit:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, there was an error processing your request. Please try again later." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed the early return if !leadInfo, as ChatGate ensures leadInfo is present when ChatPanel is rendered.

  return (
    <>
      <style>{scrollbarStyles}</style>

      {/* Chat Dialog. isOpen and onOpenChange are now props */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent 
          className="
            dialog-content dock-chat w-full max-w-full
            sm:max-w-[425px] md:max-w-[550px] max-h-[80vh] 
            flex flex-col p-0 bg-skypearl-white border-skypearl-light shadow-xl z-[9999]
            animate-in fade-in data-[state=open]:duration-150
            data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-150"
        >
          <DialogHeader className="p-4 border-b border-skypearl-light flex flex-row justify-between items-center">
            <DialogTitle className="text-skypearl-dark font-playfair text-lg">Chat with Skypearls Assistant</DialogTitle>
            {/* End Chat button in header for better visibility */}
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEndChat} 
                className="text-skypearl-dark hover:bg-skypearl-light/50"
                aria-label="End Chat"
              >
                <XCircle className="h-5 w-5 mr-1" /> End Chat
              </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-skypearl-white/80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 group message-animation",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {/* Assistant Avatar - Left Side */}
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative">
                      <img 
                        src="/skye-assistant.png" 
                        alt="Skye Assistant" 
                        className="w-10 h-10 rounded-full shadow-lg border-2 border-white"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          const target = e.currentTarget as HTMLImageElement;
                          const nextElement = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (nextElement) nextElement.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-skypearl to-skypearl-dark flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white"
                        style={{ display: 'none' }}
                      >
                        S
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                )}

                {/* Message Container */}
                <div className="relative max-w-[75%] min-w-[100px]">
                  {/* Timestamp - appears on hover */}
                  <div className={cn(
                    "text-xs text-gray-500/70 mb-1 transition-all duration-200 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2",
                    message.role === "user" ? "text-right pr-4" : "text-left pl-4"
                  )}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Message Bubble */}
                  <div className="relative">
                    {/* Chat bubble tail */}
                    <div
                      className={cn(
                        "absolute top-4 w-0 h-0 z-10",
                        message.role === "user"
                          ? "right-[-10px] border-l-[12px] border-l-blue-500 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"
                          : "left-[-10px] border-r-[12px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"
                      )}
                    />
                    
                    {/* Message Content */}
                    <div
                      className={cn(
                        'rounded-2xl px-5 py-4 shadow-lg relative backdrop-blur-sm transition-all duration-200 hover:shadow-xl',
                        message.role === 'user'
                          ? 'bg-blue-500 text-white border border-blue-600/20'
                          : 'bg-white/95 border border-skypearl-light/40 text-skypearl-dark hover:bg-white',
                        'prose prose-sm max-w-none' +
                          (message.role === 'user'
                            ? ' prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:text-white prose-code:bg-white/20'
                            : ' prose-headings:text-skypearl-dark prose-p:text-skypearl-dark')
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* User Avatar - Right Side */}
                {message.role === "user" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
                      {leadInfo.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Enhanced Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 message-animation">
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  <div className="relative">
                    <img 
                      src="/skye-assistant.png" 
                      alt="Skye Assistant" 
                      className="w-10 h-10 rounded-full shadow-lg border-2 border-white"
                                             onError={(e) => {
                         const target = e.currentTarget as HTMLImageElement;
                         const nextElement = target.nextElementSibling as HTMLElement;
                         target.style.display = 'none';
                         if (nextElement) nextElement.style.display = 'flex';
                       }}
                    />
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-skypearl to-skypearl-dark flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white"
                      style={{ display: 'none' }}
                    >
                      S
                    </div>
                    {/* Pulsing indicator when typing */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                </div>

                {/* Typing Bubble */}
                <div className="relative max-w-[75%]">
                  <div className="relative">
                    {/* Chat bubble tail */}
                    <div className="absolute left-[-10px] top-4 w-0 h-0 z-10 border-r-[12px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
                    
                    {/* Typing Content */}
                    <div className="rounded-2xl px-5 py-4 bg-white/95 border border-skypearl-light/40 text-skypearl-dark shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-skypearl-dark">Skye is thinking</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-skypearl rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-skypearl rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-skypearl rounded-full typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form ref={inputFormRef} onSubmit={handleSubmit} className="p-4 border-t border-skypearl-light flex items-center space-x-2 bg-skypearl-white">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Type your message..."
              className="flex-1 resize-none focus:ring-skypearl focus:border-skypearl bg-white border-skypearl-light/50"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-skypearl hover:bg-skypearl-dark text-white"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 