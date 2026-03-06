import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";

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
    const { data: session } = useSession();
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
                    "x-user-email": session?.user?.email || "unknown"
                },
                body: JSON.stringify({
                    prompt: userPrompt,
                    models: [modelId],
                    personality: "normal",
                    user_email: session?.user?.email || "unknown"
                })
            });
            console.log("Sora Stream Res:", res.status);

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
            // If it fails, remove this model from the rankings entirely so it's skipped
            const filteredRankings = rankings.filter(r => r.id !== modelId);

            setMessages(prev => prev.map(m =>
                m.id === msgId ? {
                    ...m,
                    content: "This specific AI model failed to respond due to endpoint errors. Please click 'Ask another AI' to try the next best model.",
                    isStreaming: false,
                    error: true,
                    rankings: filteredRankings // Save the filtered list so the next click skips it
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
                    "x-user-email": session?.user?.email || "unknown"
                },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    user_email: session?.user?.email || "unknown"
                })
            });

            if (!rankRes.ok) throw new Error("Failed to get ranking");
            const data = await rankRes.json();
            const rankings: RankedModel[] = data.rankings || [];

            if (rankings.length > 0) {
                await streamAnswer(assistantMsgId, rankings[0].id, currentPrompt, rankings, 0);
            } else {
                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: "Failed to rank models.", isStreaming: false, error: true } : m
                ));
                setIsGlobalStreaming(false);
            }
        } catch (e) {
            setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: "Sora Engine is currently analyzing another request.", isStreaming: false, error: true } : m
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
        if (nextIndex >= msg.rankings.length) return; // Reached the end (5 items)

        setIsGlobalStreaming(true);
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, content: "", isStreaming: true, currentRankIndex: nextIndex } : m
        ));

        streamAnswer(msgId, msg.rankings[nextIndex].id, userMsg.content, msg.rankings, nextIndex);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-black/95">
            <div className="flex-1 overflow-y-auto w-full relative custom-scrollbar p-4 md:p-8 pb-64 flex flex-col items-center">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                            <Sparkles size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Sora Mode</h2>
                        <p className="text-[15px] leading-relaxed">
                            Ask a question and Super AI will automatically route it to the absolute best AI model on the planet for that specific query.
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-3xl space-y-8 mt-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'user' ? (
                                    <div className="bg-[#2a2a2a] text-white px-5 py-3 rounded-2xl max-w-[80%] text-[15px] leading-relaxed shadow-md">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className="flex gap-4 w-full relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                        <div className="flex-1 max-w-[90%] bg-transparent rounded-xl">
                                            {msg.rankings && msg.currentRankIndex !== undefined && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-1">
                                                        <img 
                                                            src={msg.rankings[msg.currentRankIndex].logo} 
                                                            className="w-4 h-4 rounded-sm object-contain bg-white/10 p-[1px]" 
                                                            alt={msg.rankings[msg.currentRankIndex].name} 
                                                        />
                                                        <span className="text-xs font-bold text-indigo-400">
                                                            {msg.rankings[msg.currentRankIndex].name}
                                                        </span>
                                                    </div>
                                                    {msg.currentRankIndex === 0 && (
                                                        <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                                                            #1 SORA PICK
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                                        {msg.rankings[msg.currentRankIndex].brand}
                                                    </span>
                                                </div>
                                            )}

                                            {msg.isStreaming && !msg.content && (
                                                <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium py-2">
                                                    <Loader2 size={16} className="animate-spin" /> Sora Evaluator is routing your request...
                                                </div>
                                            )}
                                            {msg.content && (
                                                <div className="text-gray-100 text-[15px] leading-relaxed pb-2 whitespace-pre-wrap font-medium">
                                                    {msg.content}
                                                    {msg.isStreaming && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1 align-middle"></span>}
                                                </div>
                                            )}

                                            {msg.rankings && msg.currentRankIndex !== undefined && !msg.isStreaming && !msg.error && (
                                                <div className="mt-4 flex flex-col gap-3">
                                                    {msg.currentRankIndex < msg.rankings.length - 1 && !isGlobalStreaming && (
                                                        <button
                                                            onClick={() => handleAskAnother(msg.id)}
                                                            className="flex items-center justify-center gap-2 w-fit px-6 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/10 group"
                                                        >
                                                            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                                            Ask another AI
                                                            <span className="text-[10px] opacity-50 font-normal ml-1">
                                                                (Try {msg.rankings[msg.currentRankIndex + 1].name})
                                                            </span>
                                                        </button>
                                                    )}
                                                    <div className="flex items-center gap-4 text-[10px] text-gray-600 font-medium border-t border-white/5 pt-3">
                                                        <span>Evaluation Complete</span>
                                                        <span>•</span>
                                                        <span className="uppercase">{msg.rankings[msg.currentRankIndex].id}</span>
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
            <div className="absolute inset-x-0 bottom-0 pb-8 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent w-full flex flex-col items-center justify-center px-4 z-30 pointer-events-none">
                <div className={`w-full max-w-3xl glass-panel shadow-2xl relative border ${isGlobalStreaming ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-white/10 hover:border-white/20'} bg-[#1a1a1a]/60 backdrop-blur-xl rounded-2xl p-2 pl-4 flex items-center gap-3 transition-all duration-300 pointer-events-auto`}>
                    <button className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full cursor-not-allowed">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                        disabled={isGlobalStreaming}
                        placeholder={isGlobalStreaming ? "Sora is answering..." : "Ask me anything..."}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-[15px] py-3 font-medium disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!prompt.trim() || isGlobalStreaming}
                        className="text-gray-400 hover:text-indigo-400 transition-colors pr-4 disabled:opacity-30 flex items-center justify-center"
                    >
                        {isGlobalStreaming ? (
                            <Loader2 size={20} className="animate-spin text-indigo-500" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
