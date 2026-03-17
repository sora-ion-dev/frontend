"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, ThumbsUp, ThumbsDown, Copy, Download, RefreshCw, Send, Zap, Brain, ShieldCheck, Loader2 } from "lucide-react";

interface RankedModel {
    id: string;
    name: string;
    brand: string;
    logo: string;
}

interface SoraMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    rankings?: RankedModel[];
    currentRankIndex?: number;
    isStreaming?: boolean;
    error?: boolean;
}

export default function SoraMode() {
    const sessionEmail = "public-user";
    const [messages, setMessages] = useState<SoraMessage[]>([]);
    const [prompt, setPrompt] = useState("");
    const [isGlobalStreaming, setIsGlobalStreaming] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const streamAnswer = async (msgId: string, modelId: string, userPrompt: string, rankings: RankedModel[], rankIndex: number) => {
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const res = await fetch(`${BACKEND_URL}/chat/stream`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-user-email": sessionEmail
                },
                body: JSON.stringify({
                    prompt: userPrompt,
                    models: [modelId],
                    personality: "normal",
                    user_email: sessionEmail
                })
            });

            if (!res.ok) throw new Error("Network response was not ok");
            if (!res.body) throw new Error("No body in response");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let fullText = "";
            let buffer = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split("\n\n");
                    buffer = parts.pop() || "";

                    for (const line of parts) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.chunk) {
                                    fullText += data.chunk;
                                    setMessages(prev => prev.map(m =>
                                        m.id === msgId ? {
                                            ...m,
                                            content: fullText,
                                            rankings,
                                            currentRankIndex: rankIndex,
                                            isStreaming: true
                                        } : m
                                    ));
                                }
                            } catch (e) {
                                // Ignore partial json
                            }
                        }
                    }
                }
            }

            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, isStreaming: false } : m
            ));
        } catch (error) {
            console.error("Model stream failed:", modelId, error);
            const filteredRankings = rankings.filter(r => r.id !== modelId);

            setMessages(prev => prev.map(m =>
                m.id === msgId ? {
                    ...m,
                    content: "Neural link severed. Attempting to reroute through secondary AI core. Please select 'Reroute to Next AI'.",
                    isStreaming: false,
                    error: true,
                    rankings: filteredRankings 
                } : m
            ));
        } finally {
            setIsGlobalStreaming(false);
        }
    };

    const handleSend = async () => {
        if (!prompt.trim() || isGlobalStreaming) return;
        const currentPrompt = prompt;
        setPrompt("");
        setIsGlobalStreaming(true);

        const userMsgId = Date.now().toString();
        const assistantMsgId = (Date.now() + 1).toString();

        setMessages(prev => [
            ...prev,
            { id: userMsgId, role: "user", content: currentPrompt },
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
        ]);

        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const rankRes = await fetch(`${BACKEND_URL}/chat/sora_rank`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-user-email": sessionEmail
                },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    user_email: sessionEmail
                })
            });

            if (!rankRes.ok) throw new Error("Failed to get ranking");
            const data = await rankRes.json();
            const rankings: RankedModel[] = data.rankings || [];

            if (rankings.length > 0) {
                await streamAnswer(assistantMsgId, rankings[0].id, currentPrompt, rankings, 0);
            } else {
                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: "Sora Logic Engine failed to find a valid route.", isStreaming: false, error: true } : m
                ));
                setIsGlobalStreaming(false);
            }
        } catch (e) {
            setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: "Neural Interface busy. Sora is currently optimizing another sector.", isStreaming: false, error: true } : m
            ));
            setIsGlobalStreaming(false);
        }
    };

    const handleAskAnother = (msgId: string) => {
        if (isGlobalStreaming) return;

        const msgIndex = messages.findIndex(m => m.id === msgId);
        if (msgIndex <= 0) return;

        const msg = messages[msgIndex];
        const userMsg = messages[msgIndex - 1];

        if (!msg.rankings || msg.currentRankIndex === undefined) return;

        const nextIndex = msg.currentRankIndex + 1;
        if (nextIndex >= msg.rankings.length) return;

        setIsGlobalStreaming(true);
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, content: "", isStreaming: true, currentRankIndex: nextIndex } : m
        ));

        streamAnswer(msgId, msg.rankings[nextIndex].id, userMsg.content, msg.rankings, nextIndex);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-500 bg-black">
            <div className="absolute inset-0 liquid-mesh opacity-20 pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto w-full relative hide-scrollbar p-6 md:p-12 pb-64 flex flex-col items-center z-10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto space-y-8 animate-float">
                        <div className="w-20 h-20 rounded-3xl bg-accent/5 flex items-center justify-center border border-accent/10 shadow-2xl">
                            <Zap size={40} className="text-accent" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-semibold text-foreground tracking-tight">Sora Routing Engine</h2>
                            <p className="text-muted text-sm font-medium leading-relaxed tracking-wide">
                                Dynamic AI Election • 100% Free • Global Optimization
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="p-6 glass-panel border border-panel-border rounded-3xl text-left space-y-2 hover:border-accent/20 transition-all group">
                                <Brain className="text-accent" size={20} />
                                <h3 className="font-semibold text-foreground text-sm">Intelligent Routing</h3>
                                <p className="text-xs text-muted">Automatically analyzes your query to find the model with the highest success probability.</p>
                            </div>
                            <div className="p-6 glass-panel border border-panel-border rounded-3xl text-left space-y-2 hover:border-accent/20 transition-all group">
                                <ShieldCheck className="text-green-500" size={20} />
                                <h3 className="font-semibold text-foreground text-sm">Resilient Execution</h3>
                                <p className="text-xs text-muted">If one AI sector fails, Sora immediately reroutes your request to a secondary core.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl space-y-12">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                                {msg.role === 'user' ? (
                                    <div className={`max-w-[95%] md:max-w-[85%] transition-all duration-500 scale-in-center message-bubble message-bubble-user text-white font-bold px-6 py-4 rounded-[1.5rem] shadow-xl`}>
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full max-w-4xl">
                                        <div className={`message-bubble message-bubble-ai text-foreground self-start w-full px-0 py-2 relative overflow-hidden transition-all ${msg.isStreaming ? 'opacity-80' : ''}`}>
                                            {msg.isStreaming && !msg.content && (
                                                <div className="flex items-center gap-4 py-4">
                                                    <Loader2 size={24} className="animate-spin text-accent" />
                                                    <span className="text-sm font-medium text-muted">Routing...</span>
                                                </div>
                                            )}
                                            {msg.content && (
                                                <div className={`max-w-[95%] md:max-w-[85%] transition-all duration-500 scale-in-center text-[16px] leading-relaxed whitespace-pre-wrap font-medium`}>
                                                    {msg.content}
                                                    {msg.isStreaming && <span className="inline-block w-2 h-5 bg-accent/50 animate-pulse ml-2 align-middle rounded-full"></span>}
                                                </div>
                                            )}

                                            {!msg.isStreaming && msg.rankings && msg.currentRankIndex !== undefined && (
                                                <div className="mt-6 flex flex-col gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-default">
                                                            <img 
                                                                src={msg.rankings[msg.currentRankIndex].logo} 
                                                                className="w-4 h-4 object-contain opacity-80" 
                                                                alt={msg.rankings[msg.currentRankIndex].brand} 
                                                            />
                                                            <span className="text-xs font-medium tracking-tight">
                                                                {msg.rankings[msg.currentRankIndex].id}
                                                            </span>
                                                        </div>

                                                        {msg.currentRankIndex < msg.rankings.length - 1 && !isGlobalStreaming && (
                                                            <button
                                                                onClick={() => handleAskAnother(msg.id)}
                                                                className="flex items-center gap-1.5 text-muted hover:text-foreground transition-all text-xs font-medium border border-panel-border px-2 py-1 rounded-lg hover:bg-white/5"
                                                            >
                                                                <RefreshCw size={12} />
                                                                Ask another AI
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <button className="p-1.5 text-muted hover:text-foreground transition-colors" title="Copy"><Copy size={16} /></button>
                                                        <button className="p-1.5 text-muted hover:text-foreground transition-colors" title="Like"><ThumbsUp size={16} /></button>
                                                        <button className="p-1.5 text-muted hover:text-foreground transition-colors" title="Dislike"><ThumbsDown size={16} /></button>
                                                        <button className="p-1.5 text-muted hover:text-foreground transition-colors" title="Download"><Download size={16} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="absolute inset-x-0 bottom-0 pb-12 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent w-full flex flex-col items-center justify-center px-6 z-30 pointer-events-none">
                <div className={`w-full max-w-4xl glass-panel shadow-2xl relative border ${isGlobalStreaming ? 'border-accent/40 shadow-accent/5' : 'border-panel-border focus-within:border-accent/20'} bg-background/40 backdrop-blur-3xl rounded-[1.8rem] p-2 pl-4 flex items-center gap-3 transition-all duration-500 pointer-events-auto group`}>
                    <button className="p-2 text-muted hover:text-foreground transition-colors">
                        <Plus size={22} />
                    </button>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                        disabled={isGlobalStreaming}
                        placeholder={isGlobalStreaming ? "Thinking..." : "Ask me anything..."}
                        className="flex-1 bg-transparent text-foreground placeholder-muted outline-none text-base font-medium py-3 disabled:opacity-50"
                    />
                    <button className="p-2 text-muted hover:text-foreground transition-colors">
                        <Mic size={22} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!prompt.trim() || isGlobalStreaming}
                        className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${prompt.trim() && !isGlobalStreaming ? 'text-accent scale-110' : 'text-muted grayscale opacity-50'}`}
                    >
                        {isGlobalStreaming ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : (
                            <Send size={22} />
                        )}
                    </button>
                </div>
                <div className="mt-4 flex gap-6 animate-fade-in opacity-30">
                    <span className="text-[10px] font-medium text-muted tracking-wide">Groq Fast</span>
                    <span className="text-[10px] font-medium text-muted tracking-wide">NVIDIA Scale</span>
                    <span className="text-[10px] font-medium text-muted tracking-wide">Open Source</span>
                </div>
            </div>
        </div>
    );
}
