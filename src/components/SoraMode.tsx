"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, ThumbsUp, ThumbsDown, Copy, Download, RefreshCw, Send, Zap, Brain, ShieldCheck, Loader2, Image as ImageIcon, Crown, AlertCircle } from "lucide-react";

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
    image?: string; // Base64 image
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
    const [image, setImage] = useState<string | null>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    image: image,
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
                    content: "Neural link severed. This model could be temporarily offline.",
                    isStreaming: false,
                    error: true,
                    rankings: filteredRankings,
                    currentRankIndex: rankIndex
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

        setMessages((prev: SoraMessage[]) => [
            ...prev,
            { id: userMsgId, role: "user", content: currentPrompt, image: image || undefined },
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
        ]);

        const currentImage = image;
        setImage(null);

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
                    image: currentImage,
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
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-500 bg-background text-foreground">
            <div className="absolute inset-0 liquid-mesh opacity-10 pointer-events-none" />

            <div className="flex-1 overflow-y-auto w-full relative hide-scrollbar p-6 md:p-12 pb-64 flex flex-col items-center z-10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto space-y-8 animate-float">
                        <div className="w-20 h-20 rounded-3xl bg-accent/5 flex items-center justify-center border border-accent/10 shadow-2xl overflow-hidden p-3">
                            <img src="/logo.png" alt="Super AI Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-foreground tracking-tight uppercase tracking-widest">Sora Routing Engine</h2>
                            <p className="text-muted text-[10px] font-black leading-relaxed tracking-[0.3em] uppercase">
                                Dynamic AI Election • Neural Optimization • v4.0
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="p-6 glass-panel border border-panel-border rounded-3xl text-left space-y-2 hover:border-accent/20 transition-all group">
                                <Brain className="text-accent" size={20} />
                                <h3 className="font-black text-foreground text-xs uppercase">Intelligent Routing</h3>
                                <p className="text-[10px] text-muted font-bold leading-relaxed">Automatically analyzes your query to find the model with the highest success probability.</p>
                            </div>
                            <div className="p-6 glass-panel border border-panel-border rounded-3xl text-left space-y-2 hover:border-accent/20 transition-all group">
                                <ShieldCheck className="text-green-500" size={20} />
                                <h3 className="font-black text-foreground text-xs uppercase">Resilient Execution</h3>
                                <p className="text-[10px] text-muted font-bold leading-relaxed">If one AI sector fails, Sora immediately reroutes your request to a secondary core.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl space-y-12 mb-20 animate-in fade-in duration-700">
                        {messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                                {msg.role === 'user' ? (
                                    <div className="flex flex-col items-end gap-2 max-w-[95%] md:max-w-[85%]">
                                        {msg.image && (
                                            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-panel-border shadow-lg mb-2">
                                                <img src={msg.image} className="w-full h-full object-cover" alt="User upload" />
                                            </div>
                                        )}
                                        <div className={`transition-all duration-500 scale-in-center message-bubble message-bubble-user text-foreground font-bold px-6 py-4 rounded-[1.5rem] shadow-xl`}
                                             style={{ background: "var(--accent-faded)", border: "1px solid var(--accent)" }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full">
                                        {/* Winner Badge for 1st Answer */}
                                        {msg.currentRankIndex === 0 && !msg.isStreaming && !msg.error && (
                                            <div className="flex items-center gap-2 mb-2 ml-2">
                                                <Crown className="text-orange-400" size={16} />
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Sora Champion Recommendation</span>
                                            </div>
                                        )}
                                        <div className={`message-bubble message-bubble-ai text-foreground self-start w-full px-4 py-6 rounded-[2rem] border-2 ${msg.currentRankIndex === 0 ? 'border-orange-500/30 bg-orange-500/5' : 'border-panel-border bg-card/10'} relative overflow-hidden transition-all ${msg.isStreaming ? 'opacity-80' : ''}`}>
                                            {msg.isStreaming && !msg.content && (
                                                <div className="flex items-center gap-4 py-4 px-2">
                                                    <Loader2 size={24} className="animate-spin text-accent" />
                                                    <span className="text-sm font-black text-muted uppercase tracking-widest">Neural Sorting...</span>
                                                </div>
                                            )}
                                            {msg.content && (
                                                <div className="flex flex-col gap-3">
                                                    {msg.rankings && msg.currentRankIndex !== undefined && (
                                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent/80 mb-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                                            Active Route: {msg.rankings[msg.currentRankIndex].name}
                                                        </div>
                                                    )}
                                                    <div className={`transition-all duration-500 scale-in-center text-[16px] leading-relaxed whitespace-pre-wrap font-medium`}>
                                                        {msg.content}
                                                        {msg.isStreaming && <span className="inline-block w-2 h-5 bg-accent/50 animate-pulse ml-2 align-middle rounded-full"></span>}
                                                    </div>
                                                </div>
                                            )}
                                            {!msg.content && !msg.isStreaming && msg.error && (
                                                <div className="flex flex-col gap-2 py-4">
                                                    <div className="text-red-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                                        <AlertCircle size={14} />
                                                        Ranking Engine Alert
                                                    </div>
                                                    <div className="text-muted text-sm italic">
                                                        The top ranked model failed to respond. You can try rerouting below.
                                                    </div>
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
                                                                className="flex items-center gap-1.5 text-muted hover:text-orange-400 transition-all text-xs font-black uppercase tracking-widest border border-panel-border px-4 py-2 rounded-xl hover:bg-orange-500/5 hover:border-orange-500/20"
                                                            >
                                                                <RefreshCw size={12} className="animate-spin-slow" />
                                                                Reroute to Next AI (Rank #{msg.currentRankIndex + 2})
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

            <div className="absolute inset-x-0 bottom-0 pb-6 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent w-full flex flex-col items-center justify-center px-6 z-30 pointer-events-none">
                <div className="w-full max-w-4xl flex flex-col gap-3 pointer-events-auto">
                    {image && (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-accent/40 shadow-xl group ml-4 animate-in slide-in-from-bottom-2">
                            <img src={image} className="w-full h-full object-cover" alt="Pulse Preview" />
                            <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="rotate-45" size={14} />
                            </button>
                        </div>
                    )}
                    <div className={`w-full glass-panel shadow-2xl relative border ${isGlobalStreaming ? 'border-accent/40 shadow-accent/5' : 'border-panel-border focus-within:border-accent/40'} bg-background/40 backdrop-blur-3xl rounded-[2rem] p-3 pl-4 flex items-center gap-3 transition-all duration-500 group`}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-muted hover:text-accent transition-colors"
                        >
                            <ImageIcon size={22} />
                        </button>
                        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setImage(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} />
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            disabled={isGlobalStreaming}
                            placeholder={isGlobalStreaming ? "Sorting Neural Pathways..." : "Prompt Sora Engine..."}
                            className="flex-1 bg-transparent text-foreground placeholder-muted outline-none text-base font-bold py-3 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!prompt.trim() || isGlobalStreaming}
                            className={`p-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${prompt.trim() && !isGlobalStreaming ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-105' : 'bg-muted/10 text-muted opacity-50'}`}
                        >
                            {isGlobalStreaming ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <Send size={24} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
