"use client";

import { useState, useRef, useEffect } from "react";
import { User, Bot, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface AiChatProps {
  initialMessage?: string;
  className?: string;
}

export function AiChat({ initialMessage, className }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: initialMessage || "Hello. I am the Intelli-Credit AI Underwriter. I've analyzed this company's profile. What would you like to know about the credit decision?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMsg }
    ]);

    // Simulate AI thinking and responding
    setIsTyping(true);
    
    setTimeout(() => {
      let responseText = "";
      
      const lowerMsg = userMsg.toLowerCase();
      
      if (lowerMsg.includes("why") && (lowerMsg.includes("reject") || lowerMsg.includes("decline") || lowerMsg.includes("review"))) {
        responseText = "The application requires REVIEW because:\n\n1. **High Leverage**: Debt/Equity ratio is elevated at 3.2x.\n2. **Negative Media**: Sentiment analysis detected concerning regulatory probes (-0.23).\n3. **Sector Pressure**: The sector risk model output is elevated (0.65).\n\n**Recommendation**: Request updated cash flow projections and clarify the status of the ongoing SEC investigation before proceeding.";
      } 
      else if (lowerMsg.includes("fraud") || lowerMsg.includes("flag")) {
        responseText = "I detected three primary fraud/anomaly flags:\n\n- **High Leverage Risk**: Net Debt/EBITDA > 5x.\n- **Low DSCR**: Ratio is below the 1.25x safe threshold.\n- **Revenue-Cashflow Divergence**: Operating cash flow is unusually low compared to stated revenues (>10% gap).\n\nThese cross-validation failures indicate potential financial stress or aggressive accounting.";
      }
      else if (lowerMsg.includes("summary") || lowerMsg.includes("overview")) {
        responseText = "This borrower has a Risk Score of **72/100 (HIGH RISK)**.\n\nWhile revenues have grown, the high debt load and negative news sentiment (lawsuits) drag the score down. Maximum recommended exposure is limited to ₹100,000 at a high 11.5% premium rate.";
      }
      else {
        responseText = "Based on the Intelli-Credit AI model, the primary driver for this decision is the elevated debt-to-equity ratio combined with recent negative news headlines affecting the sector risk profile. Would you like me to break down the specific financial metrics?";
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: responseText }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={cn("flex flex-col h-full border border-[#3f3f46] rounded-xl bg-[#1D1D20] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-[#3f3f46] bg-[#27272a]/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A1C9F4] to-[#c299ff] flex items-center justify-center text-[#1D1D20]">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#fbfbff]">AI Credit Officer</h3>
          <p className="text-xs text-[#909094]">Powered by Intelli-Credit Intelligence</p>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
              msg.role === "user" ? "bg-[#3f3f46]" : "bg-[#27272a] border border-[#3f3f46]"
            )}>
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-[#fbfbff]" />
              ) : (
                <Bot className="w-4 h-4 text-[#A1C9F4]" />
              )}
            </div>
            
            <div className={cn(
              "p-3 rounded-2xl text-sm",
              msg.role === "user" 
                ? "bg-[#A1C9F4] text-[#1D1D20] rounded-tr-sm" 
                : "bg-[#27272a] text-[#fbfbff] border border-[#3f3f46] rounded-tl-sm whitespace-pre-wrap"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#27272a] border border-[#3f3f46]">
              <Bot className="w-4 h-4 text-[#A1C9F4]" />
            </div>
            <div className="p-3 rounded-2xl bg-[#27272a] border border-[#3f3f46] rounded-tl-sm flex items-center gap-1.5 h-10">
              <span className="w-2 h-2 rounded-full bg-[#909094] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-[#909094] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-[#909094] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#3f3f46] bg-[#27272a]/30">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the underwriting decision..."
            className="w-full bg-[#1D1D20] border border-[#3f3f46] text-[#fbfbff] placeholder:text-[#909094] rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#A1C9F4] transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 p-1.5 rounded-full bg-[#A1C9F4] text-[#1D1D20] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8ebbf0] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
