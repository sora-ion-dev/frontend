"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Loader2, Send, Mic, Copy, ThumbsUp, ThumbsDown, 
  Download, Plus, RefreshCw, Box
} from "lucide-react";
import { BACKEND_URL } from "@/lib/config";
import { ChatMessage } from "@/types";

interface BattleResult {
  brandId: string;
  logo: string;
  content: string;
  score: number;
}

interface SoraMessage {
  id: string;
  role: "user" | "assistant";
  content: string; // Used for user prompt or error messages
  results?: BattleResult[];
  visibleCount?: number;
}

export default function PlaySora() {
  const [messages, setMessages] = useState<SoraMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: SoraMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setInput("");

    try {
      const res = await fetch(`${BACKEND_URL}/sora/battle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          user_email: "public-user",
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) throw new Error("Battle request failed");
      const data = await res.json();
      const results = data.results || [];

      if (results.length === 0) {
        throw new Error("No results returned");
      }

      const asstMsg: SoraMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        results: results,
        visibleCount: 1, // Show the best one first
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (e) {
      console.error(e);
      const errMsg: SoraMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error: Could not connect to the battle engine.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAnother = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId && msg.results && msg.visibleCount !== undefined && msg.visibleCount < msg.results.length
          ? { ...msg, visibleCount: msg.visibleCount + 1 }
          : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden relative transition-colors duration-500">
      {/* Top Header */}
      <header className="h-16 flex items-center px-6 bg-transparent shrink-0">
        <div className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-semibold text-[15px]">Super AI Battle</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-[15%] pt-4 pb-32 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 relative top-[-5vh]">
            <Sparkles className="w-12 h-12 text-accent mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Sora Battle Engine</h1>
            <p className="text-sm">Battle multiple AIs instantly and get the single best answer.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start w-full"}`}>
                
                {m.role === "user" ? (
                  <div className="bg-accent/10 border border-accent/20 text-foreground px-5 py-3 rounded-3xl max-w-[85%] text-[15px] shadow-sm">
                    {m.content}
                  </div>
                ) : m.results && m.visibleCount !== undefined ? (
                  <div className="flex flex-col w-full text-foreground">
                    {m.results.slice(0, m.visibleCount).map((res, idx) => {
                      const isLastVisible = idx === m.visibleCount! - 1;
                      const hasMore = m.visibleCount! < m.results!.length;
                      
                      return (
                        <div key={idx} className={idx > 0 ? "mt-8 pt-8 border-t border-panel-border animate-in fade-in slide-in-from-top-4" : ""}>
                          {/* Response Text */}
                          <div className="mb-2">
                            <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                              {res.content}
                            </div>
                          </div>
                          
                          {/* Metadata row under response */}
                          <div className="mt-3 flex flex-col gap-3">
                            <div className="flex items-center gap-4 text-[13px] font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                {res.logo ? (
                                  <img src={res.logo} alt={res.brandId} className="w-4 h-4 object-contain opacity-80" />
                                ) : (
                                  <Box className={`w-4 h-4 ${idx === 0 ? 'text-blue-500' : 'text-purple-500'}`} />
                                )}
                                <span className="opacity-80">{res.brandId.toLowerCase()}</span>
                              </div>
                              
                              {/* Ask another AI button - only on the last visible item if there are more */}
                              {isLastVisible && hasMore && (
                                <button 
                                  onClick={() => handleAskAnother(m.id)}
                                  className="flex items-center gap-1.5 transition-colors text-emerald-600/80 hover:text-emerald-600 font-bold"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Ask another AI</span>
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-foreground/70">
                                <button className="hover:text-foreground transition-colors"><Copy className="w-[14px] h-[14px]" /></button>
                                <button className="hover:text-foreground transition-colors"><ThumbsUp className="w-[14px] h-[14px]" /></button>
                                <button className="hover:text-foreground transition-colors"><ThumbsDown className="w-[14px] h-[14px]" /></button>
                                <button className="hover:text-foreground transition-colors"><Download className="w-[14px] h-[14px]" /></button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col w-full text-[#ededed]">
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-red-400">
                      {m.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start opacity-70">
                <Loader2 className="w-5 h-5 animate-spin mt-1" />
                <span className="ml-3 text-[15px]">Battling AIs...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Floating Input Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl bg-panel rounded-full border border-panel-border shadow-2xl flex items-center p-2 pl-4 transition-all focus-within:border-emerald-500/50">
          <button className="text-foreground/60 hover:text-foreground transition-colors p-1">
            <Plus className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent border-none text-[15px] text-foreground placeholder-foreground/40 focus:outline-none focus:ring-0 px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <button className="text-foreground/60 hover:text-foreground transition-colors p-2">
            <Mic className="w-[18px] h-[18px]" />
          </button>
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-colors ml-1 ${!input.trim() || isLoading ? 'bg-transparent text-white/20' : 'text-black bg-emerald-400 hover:bg-emerald-300'}`}
          >
            {isLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Send className="w-[18px] h-[18px] -ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
