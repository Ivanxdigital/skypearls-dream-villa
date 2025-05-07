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

// Add custom CSS for the scrollbar
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
  console.log("ChatPanel rendering with leadInfo:", leadInfo); // Debug log
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
          content: `Hi ${leadInfo.firstName}! I'm your Skypearls Villas assistant. How can I help you with our luxury villas in Siargao today?`,
        },
      ]);
    }     
  }, [leadInfo]); // Effect for initial message setup based on leadInfo

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        console.log("[ChatPanel] Attempting fetch to /api/chat with body:", JSON.stringify({ messages: updatedMessages.map(m => ({role: m.role, content: m.content})) }));
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({role: m.role, content: m.content})), // Send full history
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
        <DialogContent className="sm:max-w-[425px] md:max-w-[550px] max-h-[80vh] flex flex-col p-0 bg-skypearl-white border-skypearl-light shadow-xl">
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
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-skypearl-white/80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-skypearl text-white"
                      : "bg-skypearl-light text-skypearl-dark"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-lg px-4 py-2 bg-skypearl-light text-skypearl-dark animate-pulse">
                  Thinking...
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