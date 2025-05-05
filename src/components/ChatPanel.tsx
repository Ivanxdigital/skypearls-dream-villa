import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

type LeadInfo = {
  name?: string;
  email?: string;
  phone?: string;
  captured?: boolean;
};

export function ChatPanel() {
  console.log("ChatPanel rendering"); // Debug log
  
  const [isOpen, setIsOpen] = useState(false); // Keep it closed by default
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Skypearls Villas assistant. How can I help you with our luxury villas in Siargao today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputFormRef = useRef<HTMLFormElement>(null); // Ref for the input form
  const [debugMode] = useState(process.env.NODE_ENV === 'development'); // Use NODE_ENV for debug mode

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat history to local storage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("skypearls_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Load chat history from local storage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem("skypearls_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse saved chat history:", error);
      }
    }
  }, []);

  // Check if the bot is asking for lead information
  const checkForLeadRequest = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // More specific check for lead request phrases
    return (
      (lowerMessage.includes("name") && lowerMessage.includes("email")) ||
      lowerMessage.includes("phone number") ||
      lowerMessage.includes("contact information")
    );
  };

  // Function to handle scrolling input into view on focus (for mobile)
  const handleInputFocus = () => {
    // Add a small delay to allow the virtual keyboard to potentially appear
    setTimeout(() => {
      inputFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300); // Adjust delay as needed
  };

  // Extract lead information from user message
  const extractLeadInfo = (message: string) => {
    let updatedInfo = { ...leadInfo };
    const lowerMessage = message.toLowerCase();

    // Very basic name extraction (avoid capturing emails/phones)
    if (!updatedInfo.name && message.length > 2 && !message.includes("@") && !message.match(/\d{3,}/) && !lowerMessage.includes("price")) {
      updatedInfo.name = message.trim();
    }
    
    // Email extraction
    const emailMatch = message.match(/\S+@\S+\.\S+/);
    if (!updatedInfo.email && emailMatch) {
      updatedInfo.email = emailMatch[0];
    }
    
    // Phone extraction
    const phoneMatch = message.match(/\+?[\d\s-()]{7,20}/);
    if (!updatedInfo.phone && phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
        updatedInfo.phone = phoneMatch[0].replace(/\D/g, ''); // Store digits only
    }
    
    return updatedInfo;
  };

  // Notify backend about captured lead
  const notifyLead = async () => {
    // Only notify if all required fields are captured
    if (!leadInfo.name || !leadInfo.email || !leadInfo.phone || leadInfo.captured) return;
    
    try {
      console.log("Attempting to notify about lead:", leadInfo);
      
      if (debugMode) {
        console.log("MOCK API CALL: Notifying about lead");
        setLeadInfo(prev => ({ ...prev, captured: true }));
        return;
      }
      
      const response = await fetch("/api/notify-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead: leadInfo, // Sending potentially partial lead info
          transcript: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to notify about lead");
      }
      
      console.log("Successfully notified lead");
      setLeadInfo(prev => ({ ...prev, captured: true }));
    } catch (error) {
      console.error("Error notifying about lead:", error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    const userMessage = { role: "user" as const, content: userInput };
    const currentMessages = [...messages, userMessage];
    
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    const updatedLeadInfo = extractLeadInfo(userInput);
    setLeadInfo(updatedLeadInfo);
    
    // Determine if the last bot message was a lead request
    const lastBotMessage = messages.filter(m => m.role === 'assistant').pop();
    const wasLeadRequest = lastBotMessage ? checkForLeadRequest(lastBotMessage.content) : false;
    
    // Check if lead is complete *after* extracting from current input
    const leadComplete = !!updatedLeadInfo.name && !!updatedLeadInfo.email && !!updatedLeadInfo.phone;

    try {
      console.log("Sending message to API");
      
      if (debugMode) {
        console.log("MOCK API CALL: Sending chat message");
        let mockReply = "I'm sorry, I didn't understand that. Can you rephrase?"; // Default mock
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
          mockReply = "Hi there! How can I assist you with Skypearls Villas today?";
        } else if (lowerInput.includes("price") || lowerInput.includes("how much")) {
          mockReply = "Our Skypearls villas are priced at ₱21,000,000, which includes luxury smart features and furnishings. Would you like to know more about payment options?";
        } else if (lowerInput.includes("features") || lowerInput.includes("smart home")) {
          mockReply = "The villas include solar power, smart toilets, Alexa integration, smart locks, and 24/7 security. Is there a specific feature you're interested in?";
        } else if (wasLeadRequest && leadComplete) {
           mockReply = "Thank you for providing your contact information! ✅ Lead captured. Our team will contact you shortly to arrange your private villa viewing.";
        } else if (wasLeadRequest && !leadComplete) {
           mockReply = `Thanks! Just need a bit more info. Could you please provide your ${!updatedLeadInfo.name ? 'name' : !updatedLeadInfo.email ? 'email' : 'phone number'}?`;
        } else if (lowerInput.includes("viewing") || lowerInput.includes("schedule") || lowerInput.includes("visit")) {
           mockReply = "I'd be happy to help you schedule a viewing! Could I get your full name, email, and phone number to arrange this?";
        } 

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const botResponse = { 
          role: "assistant" as const, 
          content: mockReply
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        if (botResponse.content.includes("✅ Lead captured")) {
          // Ensure notifyLead has the latest state
          await notifyLead(); 
        }
        
        setIsLoading(false);
        return;
      }
      
      // Actual API call (remains the same)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botResponse = { role: "assistant" as const, content: data.reply };
      
      setMessages(prev => [...prev, botResponse]);
      
      if (botResponse.content.includes("✅ Lead captured")) {
         await notifyLead(); // Ensure notifyLead has the latest state
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
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

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <>
      <style>{scrollbarStyles}</style>

      {/* Chat Toggle Button - RESTORED */}
      {!isOpen && (
        <Button
          variant="default"
          size="icon"
          className="fixed top-auto left-auto bottom-4 right-4 z-[999] rounded-full bg-skypearl text-white shadow-lg hover:bg-skypearl-dark w-14 h-14"
          onClick={handleToggle}
          aria-label="Toggle chat panel"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[550px] max-h-[80vh] flex flex-col p-0 bg-skypearl-white border-skypearl-light shadow-xl">
          <DialogHeader className="p-4 border-b border-skypearl-light">
            <DialogTitle className="text-skypearl-dark font-playfair text-lg">Chat with Skypearls Assistant</DialogTitle>
          </DialogHeader>
          
          {/* Message List */}
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
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-lg px-4 py-2 bg-skypearl-light text-skypearl-dark animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
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