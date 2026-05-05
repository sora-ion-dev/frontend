"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, ThumbsUp, ThumbsDown, Copy, Download, RefreshCw, Send, Zap, Brain, ShieldCheck, Loader2, Crown, AlertCircle, ChevronUp, ChevronDown, MoreHorizontal, Sparkles, Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BACKEND_URL } from "@/lib/config";
import { useTheme } from "./ThemeProvider";
import { jsPDF } from "jspdf";

interface RankedModel {
    id: string;
    name: string;
    brand: string;
    logo: string;
    description?: string;
    isPremium?: boolean;
}

const SORA_CHAMPIONS: RankedModel[] = [
    {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini", "brand": "OpenAI", "logo": "/logos/gpt4o_mini.svg", "description": "Fast and intelligent for everyday tasks.", "isPremium": false},
    {"id": "nvidia/phi-4", "name": "Phi-4 Multimodal", "brand": "Microsoft", "logo": "/logos/microsoft.svg", "description": "Advanced multimodal reasoning and logic.", "isPremium": false},
    {"id": "openai/gpt-4o", "name": "GPT-5 Mini", "brand": "OpenAI", "logo": "/logos/gpt4o_pro.svg", "description": "Flagship next-gen intelligence for complex problems.", "isPremium": true},
    {"id": "meta-llama/llama-4-scout", "name": "Llama 4 Scout", "brand": "Meta", "logo": "/logos/llama33.svg", "description": "Next-gen open intelligence from Meta.", "isPremium": false},
    {"id": "qwen/qwen3-32b", "name": "Qwen 3-32B", "brand": "Qwen", "logo": "/logos/qwen.svg", "description": "Powerful reasoning and coding powerhouse.", "isPremium": false},
    {"id": "nvidia/deepseek-v32", "name": "DeepSeek V3.1 Terminus", "brand": "DeepSeek", "logo": "/logos/deepseek_chat.svg", "description": "Elite efficiency with superior knowledge base and reasoning.", "isPremium": false},
    {"id": "nvidia/falcon3-7b", "name": "Falcon 3-7B", "brand": "TII", "logo": "/logos/falcon.svg", "description": "Sleek and robust for creative outputs.", "isPremium": false},
    {"id": "google/gemini-3.1-flash-lite", "name": "Gemini 3.1 Flash Lite", "brand": "Google", "logo": "/logos/gemini_flash.svg", "description": "Lightweight and incredibly fast reasoning.", "isPremium": false},
    {"id": "arcee/trinity-large", "name": "Trinity Large", "brand": "Arcee AI", "logo": "/logos/trinity_large.svg", "description": "Domain-specific expertise and large context.", "isPremium": true},
    {"id": "huggingface/minimax-m2.7", "name": "MiniMax M2.7", "brand": "MiniMax AI", "logo": "/logos/minimax.svg", "description": "High-fidelity conversational intelligence via Hugging Face.", "isPremium": false},
    {"id": "liquid/lfm-2.5", "name": "Liquid LFM", "brand": "Liquid AI", "logo": "/logos/liquid.svg", "description": "Liquid Neural Network pioneer for precision.", "isPremium": false},
    {"id": "huggingface/glm-5.1", "name": "GLM 5.1 Reasoning", "brand": "Z-AI", "logo": "/logos/glm.svg", "description": "Next-gen reasoning and thinking capability via Together/HF.", "isPremium": false},
    {"id": "moonshot/kimi-k2", "name": "Kimi K2", "brand": "Moonshot", "logo": "/logos/moonshot.svg", "description": "Next-level context handling and deep insight.", "isPremium": false},
    {"id": "xai/mistral-small", "name": "Cohere Command A", "brand": "Cohere", "logo": "/logos/cohere.svg", "description": "High-performance reasoning and command execution.", "isPremium": true},
    {"id": "nvidia/mistral-large-3", "name": "Mistral Large 3", "brand": "Mistral AI", "logo": "/logos/mistral.svg", "description": "Mistral's flagship model with elite reasoning and 675B parameters.", "isPremium": true},
    {"id": "openrouter/nemotron-3-super", "name": "Nemotron-3 Super", "brand": "NVIDIA", "logo": "/logos/nvidia.svg", "description": "NVIDIA's supercharged 120B parameter powerhouse.", "isPremium": true},
    {"id": "xai/grok-3-mini", "name": "Grok-3 Mini", "brand": "xAI", "logo": "/logos/xai.svg", "description": "Hyper-intelligent and efficient assistant from xAI.", "isPremium": true}
];

interface SoraMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
    error?: boolean;
}

interface SoraModeProps {
    enabledModels: Record<string, boolean>;
    isAuthorized: boolean;
    onOpenLive?: () => void;
}

export default function SoraMode({ enabledModels = {}, isAuthorized, onOpenLive }: SoraModeProps) {
    const { theme } = useTheme();
    const sessionEmail = "public-user";
    const [messages, setMessages] = useState<SoraMessage[]>([]);
    const [prompt, setPrompt] = useState("");
    const [isGlobalStreaming, setIsGlobalStreaming] = useState(false);
    const [selectedModel, setSelectedModel] = useState<RankedModel>(SORA_CHAMPIONS[0]);
    
    // Filter available champions based on global settings and Pro status
    const availableChampions = SORA_CHAMPIONS.filter(c => {
        const isEnabled = enabledModels[c.id] !== false;
        const isAllowed = isAuthorized || !c.isPremium;
        return isEnabled && isAllowed;
    });

    useEffect(() => {
        if (enabledModels && !enabledModels[selectedModel.id]) {
            const fallback = availableChampions[0];
            if (fallback) setSelectedModel(fallback);
        }
    }, [enabledModels, selectedModel.id, availableChampions]);

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectorRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setIsSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const streamAnswer = async (msgId: string, modelId: string, userPrompt: string) => {
        try {
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
                                        m.id === msgId ? { ...m, content: fullText, isStreaming: true } : m
                                    ));
                                }
                            } catch (e) { }
                        }
                    }
                }
            }

            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, isStreaming: false } : m
            ));
        } catch (error) {
            console.error("Model stream failed:", modelId, error);
            setMessages(prev => prev.map(m =>
                m.id === msgId ? {
                    ...m,
                    content: "Neural link severed. This model could be temporarily offline.",
                    isStreaming: false,
                    error: true
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
            { id: userMsgId, role: "user", content: currentPrompt },
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
        ]);
        await streamAnswer(assistantMsgId, selectedModel.id, currentPrompt);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background text-foreground font-semibold">
            {/* Subtle Gradient background elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Headers removed as per user request */}

            <div className="flex-1 overflow-y-auto w-full relative hide-scrollbar p-6 md:p-12 pb-64 flex flex-col items-center z-10">
                <div className="w-full max-w-4xl space-y-12 mb-20">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="relative mb-10 group">
                                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-all duration-700" />
                                <div className="relative p-6 rounded-[2.5rem] bg-panel border border-panel-border shadow-2xl">
                                    <img src={selectedModel.logo} alt={selectedModel.name} className="w-20 h-20 object-contain" />
                                </div>
                            </div>
                            <div className="space-y-4 max-w-lg">
                                <h1 className="text-4xl font-bold text-foreground tracking-tight">Sora Targeted Mode</h1>
                                <p className="text-foreground/40 text-sm font-medium leading-relaxed">
                                    Experience the pure potential of {selectedModel.name}. This dedicated channel is optimized for high-fidelity responses and deep reasoning.
                                </p>
                                <div className="flex items-center justify-center gap-3 pt-4">
                                    <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] text-accent">Real-time Stream</div>
                                    <div className="px-3 py-1 bg-foreground/5 border border-panel-border rounded-full text-[10px] text-foreground/40">Handoff Enabled</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`w-full flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                                    <div className={`relative px-4 py-3 ${msg.role === 'user' 
                                        ? 'bg-accent/10 text-foreground border border-accent/20 rounded-[1.5rem] max-w-[85%] text-[15px]' 
                                        : 'w-full text-foreground text-[16px] leading-[1.7] font-normal py-2'}`}>
                                        
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-3 text-foreground/40">
                                                <div className="w-6 h-6 rounded-lg overflow-hidden border border-panel-border p-1 bg-foreground/5">
                                                    <img src={selectedModel.logo} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-[12px] font-bold">{selectedModel.name}</span>
                                            </div>
                                        )}

                                        <div className="whitespace-pre-wrap">
                                            {msg.error ? (
                                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/80 italic text-sm flex items-center gap-3">
                                                    <AlertCircle size={16} />
                                                    Neural link interrupted.
                                                </div>
                                            ) : (
                                                <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} prose-sm max-w-none`}>
                                                    {msg.content.includes("<thought>") || msg.content.includes("[Thinking]") || msg.content.includes("[Thought]") ? (
                                                        <div className="space-y-4">
                                                            <details className="group bg-panel-border/10 rounded-[1.5rem] overflow-hidden border border-panel-border/30 transition-all hover:bg-panel-border/20">
                                                                <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-1.5 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                                                                            <Sparkles size={12} className="text-accent" />
                                                                        </div>
                                                                        <span className="text-[11px] font-black uppercase tracking-widest text-accent">Internal Thinking Process</span>
                                                                    </div>
                                                                    <div className="text-accent/40 group-open:rotate-180 transition-transform duration-300">
                                                                        <ChevronDown size={14} />
                                                                    </div>
                                                                </summary>
                                                                <div className="px-5 pb-5 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                    <div className="text-[13px] text-foreground/40 font-medium italic leading-relaxed pl-4 border-l-2 border-accent/20 whitespace-pre-wrap">
                                                                        {(() => {
                                                                            const thoughtRegex = /(?:<thought>|\[Thinking\]|\[Thought\])([\s\S]*?)(?:<\/thought>|\[\/Thinking\]|\[\/Thought\]|$)/gi;
                                                                            const matches = Array.from(msg.content.matchAll(thoughtRegex));
                                                                            return matches.map(m => m[1]).join("").trim() || "Deep reasoning analysis...";
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            </details>
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content.replace(/(?:<thought>|\[Thinking\]|\[Thought\])[\s\S]*?(?:<\/thought>|\[\/Thinking\]|\[\/Thought\]|$)/gi, "").trim()}
                                                            </ReactMarkdown>
                                                            {msg.isStreaming && <span className="inline-block w-2 h-2 bg-accent/40 animate-pulse rounded-full"></span>}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                            {msg.isStreaming && <span className="inline-block w-2 h-2 bg-accent/40 animate-pulse rounded-full"></span>}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                        <div className="flex items-center gap-4 mt-2 ml-1 text-foreground/30">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                                className="hover:text-foreground transition-colors p-1"
                                                title="Copy"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button className="hover:text-foreground transition-colors p-1">
                                                <ThumbsUp size={16} />
                                            </button>
                                            <button className="hover:text-foreground transition-colors p-1">
                                                <ThumbsDown size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    console.log("PDF Generation Triggered for Sora Response");
                                                    const doc = new jsPDF();
                                                    const pageWidth = doc.internal.pageSize.getWidth();
                                                    const pageHeight = doc.internal.pageSize.getHeight();
                                                    const margin = 15;
                                                    const maxWidth = pageWidth - (margin * 2);
                                                    
                                                    doc.setFont("helvetica", "bold");
                                                    doc.setFontSize(16);
                                                    doc.text("SUPER AI - SORA EXPORT", margin, 20);
                                                    
                                                    doc.setFontSize(10);
                                                    doc.setFont("helvetica", "normal");
                                                    doc.text(`Model: ${selectedModel.name}`, margin, 28);
                                                    doc.text(`Date: ${new Date().toLocaleString()}`, margin, 34);
                                                    
                                                    doc.setLineWidth(0.5);
                                                    doc.line(margin, 38, pageWidth - margin, 38);
                                                    
                                                    doc.setFontSize(11);
                                                    const lines = doc.splitTextToSize(msg.content, maxWidth);
                                                    
                                                    let cursorY = 48;
                                                    lines.forEach((line: string) => {
                                                        if (cursorY > pageHeight - 20) {
                                                            doc.addPage();
                                                            cursorY = 20;
                                                        }
                                                        doc.text(line, margin, cursorY);
                                                        cursorY += 7;
                                                    });
                                                    
                                                    doc.save(`sora-response-${Date.now()}.pdf`);
                                                }}
                                                className="hover:text-foreground transition-colors p-1"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>

            {/* Input Section */}
            <div className="absolute inset-x-0 bottom-0 pb-10 pt-16 bg-gradient-to-t from-background via-background/95 to-transparent w-full flex flex-col items-center justify-center px-6 z-30 pointer-events-none">
                <div className="w-full max-w-4xl flex flex-col gap-4 pointer-events-auto relative">
                    {/* Model Selector Dropdown - Re-styled for Pill Integration */}
                    {isSelectorOpen && (
                        <div 
                            ref={selectorRef}
                            className="absolute bottom-full left-0 mb-6 w-72 border border-panel-border rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-3xl bg-panel/80 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 z-50 p-2 max-h-[400px] overflow-y-auto hide-scrollbar"
                        >
                            <div className="p-3 border-b border-panel-border mb-2">
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Select Model</p>
                            </div>
                            <div className="space-y-1">
                                {availableChampions.map((champ) => (
                                    <button
                                        key={champ.id}
                                        onClick={() => {
                                            setSelectedModel(champ);
                                            setIsSelectorOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${selectedModel.id === champ.id ? 'bg-foreground/10 border border-panel-border' : 'hover:bg-foreground/5 border border-transparent'}`}
                                    >
                                        <div className="w-8 h-8 rounded-xl p-1.5 bg-foreground/5 overflow-hidden">
                                            <img src={champ.logo} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground/90">{champ.name}</span>
                                    </button>
                                ))}
                                {availableChampions.length === 0 && (
                                    <div className="p-4 text-center text-xs text-foreground/20 italic">
                                        No models enabled in settings.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    
                    <div className={`w-full relative flex items-center gap-3 px-6 py-2.5 rounded-[2rem] border border-panel-border bg-foreground/5 backdrop-blur-3xl transition-all duration-500 shadow-xl focus-within:border-accent/30`}>
                        <button 
                            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                            className="flex-shrink-0 p-1 text-foreground/40 hover:text-foreground transition-all transform hover:rotate-90"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            disabled={isGlobalStreaming}
                            placeholder={isGlobalStreaming ? "Processing..." : `Ask me anything...`}
                            className="flex-1 bg-transparent text-foreground placeholder-foreground/20 outline-none focus:ring-0 border-none text-[15px] py-1 font-normal shadow-none"
                        />

                        {onOpenLive && (
                            <button 
                                onClick={onOpenLive}
                                className="flex-shrink-0 p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 group"
                            >
                                <Activity className="w-4 h-4 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Live</span>
                            </button>
                        )}
                        
                        <button className="flex-shrink-0 p-1 text-foreground/40 hover:text-foreground transition-all">
                            <Mic className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!prompt.trim() || isGlobalStreaming}
                            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all ${prompt.trim() && !isGlobalStreaming ? 'text-foreground' : 'text-foreground/20'}`}
                        >
                            {isGlobalStreaming ? (
                                <Loader2 size={18} className="animate-spin text-accent" />
                            ) : (
                                <Send size={18} className="transform hover:scale-110 active:scale-95" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
