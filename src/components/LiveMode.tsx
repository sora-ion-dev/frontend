"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Send, Zap, Shield, Sparkles, Activity, Volume2, Maximize2, Info } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";
import { ChatMessage } from "@/types";

export default function LiveMode() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: prompt };
    const assistantMsgId = `live-${Date.now()}`;
    const assistantMsg: ChatMessage = { id: assistantMsgId, role: "assistant", content: "", isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setPrompt("");
    setIsStreaming(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          models: ["google/gemini-3.1-flash-live"],
          user_email: "public-user",
          personality: "normal"
        })
      });

      if (!res.ok) throw new Error("Connection failed");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.chunk) {
                  fullText += data.chunk;
                  setMessages(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(m => m.id === assistantMsgId);
                    if (idx !== -1) {
                      next[idx] = { ...next[idx], content: fullText };
                    }
                    return next;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {
      setMessages(prev => {
        const next = [...prev];
        const idx = next.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          next[idx] = { ...next[idx], content: "Live connection lost. Please try again.", isStreaming: false };
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
      setMessages(prev => {
        const next = [...prev];
        const idx = next.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
            next[idx] = { ...next[idx], isStreaming: false };
        }
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-8 border-b border-white/5 backdrop-blur-md bg-black/40 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>
          <h2 className="text-sm font-black tracking-[0.2em] uppercase">Gemini 3.1 Live</h2>
        </div>
        <div className="flex items-center gap-6 text-white/40">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Shield size={14} className="text-green-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Secure Node</span>
            </div>
            <Activity size={18} className="hover:text-blue-400 transition-colors cursor-pointer" />
            <Maximize2 size={18} className="hover:text-purple-400 transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group hover:scale-110 transition-transform duration-500 cursor-pointer">
              <Zap size={40} className="text-white fill-white group-hover:animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">READY FOR LIVE INPUT</h3>
              <p className="text-white/40 text-sm font-medium tracking-wide">Ultra-low latency reasoning powered by Gemini 3.1 Flash Live</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md w-full pt-8">
                {["System Analysis", "Real-time Coding", "Deep Research", "Live Strategy"].map(t => (
                    <button key={t} onClick={() => setPrompt(t)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:border-blue-500/50 transition-all text-left">
                        {t}
                    </button>
                ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[80%] p-6 rounded-3xl ${m.role === "user" ? "bg-blue-600 text-white shadow-xl shadow-blue-600/10" : "bg-white/5 border border-white/10 backdrop-blur-xl"}`}>
                <div className="flex items-center gap-3 mb-3 opacity-40">
                    {m.role === "assistant" ? <Sparkles size={14} /> : <Zap size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.role === "assistant" ? "Super AI Live" : "Command Input"}</span>
                </div>
                <div className="text-sm font-medium leading-relaxed tracking-wide whitespace-pre-wrap">
                  {m.content}
                  {m.isStreaming && <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse" />}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Live Waveform (Always visible at bottom when active) */}
      <div className={`h-16 flex items-center justify-center gap-1 transition-opacity duration-500 ${isStreaming || isListening ? "opacity-100" : "opacity-20"}`}>
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
            style={{ 
              height: `${Math.random() * (isStreaming || isListening ? 40 : 10) + 5}px`,
              animation: isStreaming || isListening ? `wave 1s ease-in-out infinite ${i * 0.05}s` : "none"
            }}
          />
        ))}
      </div>

      {/* Input Area */}
      <div className="p-8 z-10">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
          <div className="relative flex items-center gap-3 p-2 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[1.8rem] transition-all focus-within:border-white/20">
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`p-4 rounded-2xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-white/40 hover:text-white"}`}
            >
              <Mic size={20} />
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Send a live command..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold tracking-wide placeholder-white/20 p-2"
            />
            <button
              onClick={handleSend}
              disabled={!prompt.trim() || isStreaming}
              className="p-4 bg-white text-black rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-6">
            Neural link active • 3.1 Flash Live • Zero Latency Mode
        </p>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.5); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
