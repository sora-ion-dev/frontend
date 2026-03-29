"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Loader2, Send, Mic, Copy, ThumbsUp, ThumbsDown, 
  Download, Plus, RefreshCw, Box
} from "lucide-react";
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
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
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
    <div className="flex flex-col h-full bg-[#111111] text-white font-sans overflow-hidden relative">
      {/* Top Header */}
      <header className="h-16 flex items-center px-6 bg-transparent shrink-0">
        <div className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-[15px]">Super Fiesta</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-[15%] pt-4 pb-32 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 relative top-[-5vh]">
            <Sparkles className="w-12 h-12 text-emerald-400 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Super Fiesta</h1>
            <p className="text-sm">Battle multiple AIs instantly and get the single best answer.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start w-full"}`}>
                
                {m.role === "user" ? (
                  <div className="bg-[#2a2a2a] text-[#ededed] px-5 py-3 rounded-3xl max-w-[85%] text-[15px] shadow-sm">
                    {m.content}
                  </div>
                ) : m.results && m.visibleCount !== undefined ? (
                  <div className="flex flex-col w-full text-[#ededed]">
                    {m.results.slice(0, m.visibleCount).map((res, idx) => {
                      const isLastVisible = idx === m.visibleCount! - 1;
                      const hasMore = m.visibleCount! < m.results!.length;
                      
                      return (
                        <div key={idx} className={idx > 0 ? "mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4" : ""}>
                          {/* Response Text */}
                          <div className="mb-2">
                            <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                              {res.content}
                            </div>
                          </div>
                          
                          {/* Metadata row under response */}
                          <div className="mt-3 flex flex-col gap-3">
                            <div className="flex items-center gap-4 text-[13px] font-medium text-white/60">
                              <div className="flex items-center gap-2">
                                <Box className={`w-4 h-4 ${idx === 0 ? 'text-blue-400' : 'text-purple-400'}`} />
                                <span>{res.brandId.toLowerCase()}</span>
                              </div>
                              
                              {/* Ask another AI button - only on the last visible item if there are more */}
                              {isLastVisible && hasMore && (
                                <button 
                                  onClick={() => handleAskAnother(m.id)}
                                  className="flex items-center gap-1.5 hover:text-white transition-colors text-emerald-400/80 hover:text-emerald-400"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Ask another AI</span>
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-white/40">
                                <button className="hover:text-white transition-colors"><Copy className="w-[14px] h-[14px]" /></button>
                                <button className="hover:text-white transition-colors"><ThumbsUp className="w-[14px] h-[14px]" /></button>
                                <button className="hover:text-white transition-colors"><ThumbsDown className="w-[14px] h-[14px]" /></button>
                                <button className="hover:text-white transition-colors"><Download className="w-[14px] h-[14px]" /></button>
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
        <div className="pointer-events-auto w-full max-w-2xl bg-[#1a1a1a] rounded-full border border-white/10 shadow-2xl flex items-center p-2 pl-4 transition-all focus-within:border-emerald-500/50">
          <button className="text-white/40 hover:text-white transition-colors p-1">
            <Plus className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent border-none text-[15px] text-white placeholder-white/40 focus:outline-none focus:ring-0 px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <button className="text-white/40 hover:text-white transition-colors p-2">
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
