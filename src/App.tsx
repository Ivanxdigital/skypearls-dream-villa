import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import { ChatPanel } from "./components/ChatPanel"; // ChatPanel is now rendered by ChatGate
import { ChatGate } from "./components/ChatGate";
import { ChatPanel } from "./components/ChatPanel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  // const [isChatOpen, setIsChatOpen] = useState(false);
  // const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatGate>
          {(leadInfo, chatOpen, setChatOpen, resetChat) => (
            <ChatPanel 
              leadInfo={leadInfo} 
              isOpen={chatOpen} 
              onOpenChange={setChatOpen} 
              onReset={resetChat}
            />
          )}
        </ChatGate>
        {/* Removed duplicate floating chat toggle button. ChatGate now manages the FAB and chat state. */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
