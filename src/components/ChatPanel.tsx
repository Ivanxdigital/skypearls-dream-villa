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

  /* Disable message animations when dialog is closing to prevent conflicts */
  .dialog-content[data-state="closed"] .message-animation {
    animation: none !important;
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
  images?: string[];  // New property for image URLs
  id?: string;  // For streaming message identification
  status?: 'pending' | 'streaming' | 'complete' | 'error';  // For streaming states
  timestamp?: number;  // For message ordering
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
  
  // Streaming state management
  const [streamingEnabled] = useState(import.meta.env.VITE_STREAMING_ENABLED !== 'false'); // Default to true
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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
    if (leadInfo && leadInfo.firstName) {
      // Generate a consistent thread ID based on the user's firstName and timestamp
      const timestamp = Date.now();
      setThreadId(`skypearls-${leadInfo.firstName}-${timestamp}`);
      console.log("[ChatPanel] Set thread ID:", `skypearls-${leadInfo.firstName}-${timestamp}`);
    }
  }, [leadInfo]);

  useEffect(() => {
    // Load chat history from localStorage when the component mounts and isOpen becomes true
    if (isOpen && leadInfo && leadInfo.firstName) {
      const savedMessages = localStorage.getItem(`skypearls_chat_history_${leadInfo.firstName}`); // Namespace history by firstName
      if (savedMessages) {
        try {
          const parsedHistory: ChatMessage[] = JSON.parse(savedMessages);
           // Ensure the first message still matches the current user context before loading.
          if (parsedHistory.length > 0 && parsedHistory[0].role === 'assistant' && parsedHistory[0].content.includes(leadInfo.firstName)) {
            setMessages(parsedHistory);
          } else {
            // If history doesn't match or is invalid, start fresh with greeting
            localStorage.removeItem(`skypearls_chat_history_${leadInfo.firstName}`);
            setMessages([
              {
                role: "assistant",
                content: `Hi ${leadInfo.firstName}! I'm your Skypearls Villas assistant. How can I help you with our luxury villas in Siargao today?`,
              },
            ]);
          }
        } catch (error) {
          console.error("Failed to parse saved chat history:", error);
          localStorage.removeItem(`skypearls_chat_history_${leadInfo.firstName}`);
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
    if (isOpen && messages.length > 1 && leadInfo && leadInfo.firstName) { // Only save if more than initial greeting
      localStorage.setItem(`skypearls_chat_history_${leadInfo.firstName}`, JSON.stringify(messages));
    }
  }, [messages, isOpen, leadInfo]);

  useEffect(() => {
    if (leadInfo) {
      console.log("[ChatPanel] leadInfo on mount/update:", leadInfo);
    }
  }, [leadInfo]);

  // Cleanup EventSource on component unmount or dialog close
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setCurrentStreamingMessageId(null);
    }
  }, [isOpen]);

  // Streaming utility function
  const handleStreamingResponse = async (updatedMessages: ChatMessage[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create placeholder message for streaming
      const streamingMessage: ChatMessage = {
        role: "assistant",
        content: "",
        id: messageId,
        status: 'streaming',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, streamingMessage]);
      setCurrentStreamingMessageId(messageId);

      // Prepare request body
      const requestBody = {
        messages: updatedMessages.map(m => ({role: m.role, content: m.content})),
        leadInfo,
      };

      // Create EventSource for streaming
      const eventSource = new EventSource(
        `/api/chat-stream?` + new URLSearchParams({
          body: JSON.stringify(requestBody),
          threadId: threadId,
        })
      );

      // Alternative approach: Use POST with EventSource (if supported by server)
      eventSource.close(); // Close the GET-based EventSource
      
      // Use fetch to POST data and then handle SSE manually
      fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Thread-ID': threadId,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (!response.body) {
          throw new Error('No response body for streaming');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              setCurrentStreamingMessageId(null);
              setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, status: 'complete' as const }
                  : msg
              ));
              resolve();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'token') {
                    setMessages(prev => prev.map(msg => 
                      msg.id === messageId 
                        ? { ...msg, content: msg.content + data.data }
                        : msg
                    ));
                  } else if (data.type === 'images') {
                    setMessages(prev => prev.map(msg => 
                      msg.id === messageId 
                        ? { ...msg, images: data.data.images }
                        : msg
                    ));
                  } else if (data.type === 'error') {
                    console.error('[ChatPanel] Streaming error:', data.data);
                    setMessages(prev => prev.map(msg => 
                      msg.id === messageId 
                        ? { ...msg, status: 'error' as const, content: msg.content || 'Error occurred during streaming.' }
                        : msg
                    ));
                    setCurrentStreamingMessageId(null);
                    
                    // Fallback to non-streaming if suggested
                    if (data.data.fallbackToSync) {
                      reject(new Error('FALLBACK_TO_SYNC'));
                    } else {
                      resolve();
                    }
                    return;
                  } else if (data.type === 'complete') {
                    setCurrentStreamingMessageId(null);
                    setMessages(prev => prev.map(msg => 
                      msg.id === messageId 
                        ? { ...msg, status: 'complete' as const }
                        : msg
                    ));
                    resolve();
                    return;
                  }
                } catch (error) {
                  console.error('[ChatPanel] Error parsing SSE data:', error);
                }
              }
            }

            processStream();
          }).catch(error => {
            console.error('[ChatPanel] Stream reading error:', error);
            setCurrentStreamingMessageId(null);
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: 'error' as const, content: msg.content || 'Streaming error occurred.' }
                : msg
            ));
            reject(error);
          });
        };

        processStream();
      })
      .catch(error => {
        console.error('[ChatPanel] Streaming fetch error:', error);
        setCurrentStreamingMessageId(null);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'error' as const, content: 'Failed to start streaming.' }
            : msg
        ));
        reject(error);
      });
    });
  };

  const handleInputFocus = () => {
    // Only scroll into view if dialog is open to prevent conflicts during closing
    if (isOpen) {
      setTimeout(() => {
        inputFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  };

  const handleEndChat = async () => {
    onOpenChange(false); // Close the chat panel
    onReset();
    // Optionally clear chat history from local storage upon explicit end chat
    // localStorage.removeItem(`skypearls_chat_history_${leadInfo.firstName}`);
    // setMessages([]); // Reset messages state for next opening, or rely on initial load logic
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    const userMessage: ChatMessage = { 
      role: "user" as const, 
      content: userInput,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'complete'
    };
    
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
        const botResponse: ChatMessage = { 
          role: "assistant" as const, 
          content: mockReply,
          id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          status: 'complete'
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Try streaming first if enabled
        if (streamingEnabled) {
          console.log("[ChatPanel] Attempting streaming response...");
          try {
            await handleStreamingResponse(updatedMessages);
            console.log("[ChatPanel] Streaming completed successfully");
          } catch (error) {
            console.log("[ChatPanel] Streaming failed, falling back to non-streaming:", error);
            
            // Remove the failed streaming message
            setMessages(prev => prev.filter(msg => msg.id !== currentStreamingMessageId));
            setCurrentStreamingMessageId(null);
            
            // Fall back to non-streaming mode only if it's a fallback error
            if (error instanceof Error && error.message === 'FALLBACK_TO_SYNC') {
              await handleNonStreamingResponse(updatedMessages);
            } else {
              throw error; // Re-throw other errors
            }
          }
        } else {
          // Use non-streaming mode
          await handleNonStreamingResponse(updatedMessages);
        }
      }
    } catch (error) {
      console.error("[ChatPanel] Error caught in handleSubmit:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, there was an error processing your request. Please try again later.",
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          status: 'error'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Non-streaming fallback function
  const handleNonStreamingResponse = async (updatedMessages: ChatMessage[]) => {
    console.log("[ChatPanel] Using non-streaming mode, fetching from /api/chat");
    
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
    const botResponse: ChatMessage = { 
      role: "assistant" as const, 
      content: data.reply,
      images: data.images || undefined,  // Include images if present
      id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'complete'
    };
    setMessages(prev => [...prev, botResponse]);
    
    // Log source documents if available for debugging
    if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
      console.log("[ChatPanel] Retrieved source documents:", data.sourceDocuments.length);
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
            sm:max-w-[380px] md:max-w-[450px] max-h-[70vh] 
            flex flex-col p-0 bg-skypearl-white border-skypearl-light shadow-xl z-50
            data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4
            duration-300 ease-out"
          onPointerDownOutside={(e) => {
            // Allow FAB interaction by preventing default dialog close behavior
            const target = e.target as Element;
            if (target.closest('[aria-label*="chat"]') || target.closest('.group')) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent escape key from closing the dialog to maintain consistent close behavior
            e.preventDefault();
          }}
        >
          <DialogHeader className="p-4 bg-white/80 backdrop-blur-sm flex flex-row justify-between items-center">
            <DialogTitle className="text-xl font-semibold text-gray-900">Chat with Skypearls Assistant</DialogTitle>
            {/* End Chat button in header for better visibility */}
             <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEndChat} 
                className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300"
                aria-label="End Chat"
              >
                End Chat
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
                    "text-xs text-gray-500/70 mb-1 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2",
                    message.role === "user" ? "text-right pr-4" : "text-left pl-4"
                  )}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Message Bubble */}
                  <div className="relative">
                    {/* Message Content */}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 shadow-sm relative',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-900',
                        'prose prose-sm max-w-none' +
                          (message.role === 'user'
                            ? ' prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:text-white prose-code:bg-white/20'
                            : ' prose-headings:text-gray-900 prose-p:text-gray-900')
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                      
                      {/* Streaming indicator */}
                      {message.status === 'streaming' && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full typing-dot"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full typing-dot"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full typing-dot"></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">Thinking...</span>
                        </div>
                      )}
                      
                      {/* Streaming cursor for active streaming message */}
                      {message.status === 'streaming' && message.content && (
                        <span className="inline-block w-2 h-4 bg-gray-500 ml-1 animate-pulse"></span>
                      )}
                      
                      {/* Image rendering */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.images.map((imageUrl, idx) => (
                            <div key={idx} className="rounded-lg overflow-hidden shadow-md">
                              <img 
                                src={imageUrl} 
                                alt={`Property image ${idx + 1}`}
                                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  // Open image in new tab for better viewing
                                  window.open(imageUrl, '_blank');
                                }}
                                onError={(e) => {
                                  console.error('Failed to load image:', imageUrl);
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
            
            {/* Enhanced Typing Indicator - Only show when not streaming */}
            {isLoading && !currentStreamingMessageId && (
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
                    {/* Typing Content */}
                    <div className="rounded-2xl px-4 py-3 bg-gray-50 text-gray-900 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">Skye is thinking</span>
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