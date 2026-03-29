"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Loader2, Send, Image as ImageIcon, Settings2, 
  ChevronRight, Search, Zap, Crown, MessageSquare, 
  Info, Shield, History, Plus, Brain, Mic, X
} from "lucide-react";
import { AIBrand, ChatMessage, MODEL_BRANDS } from "@/types";

export default function PlaySora() {
    const [selectedBrand, setSelectedBrand] = useState<AIBrand>(MODEL_BRANDS[0]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState("You are Super AI, a helpful and intelligent assistant.");
    const [image, setImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [requestMode, setRequestMode] = useState<"Single" | "Multiple" | "All">("Single");
    const [selectedMultipleBrands, setSelectedMultipleBrands] = useState<string[]>([MODEL_BRANDS[0].id, MODEL_BRANDS[1].id, MODEL_BRANDS[2].id]);
    const [showMultipleModal, setShowMultipleModal] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    
    const [params, setParams] = useState({
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const filteredBrands = MODEL_BRANDS.filter(b => 
        b.brandName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.realBrandName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const brandsToUse = requestMode === 'Single' ? [selectedBrand] : 
                            requestMode === 'All' ? MODEL_BRANDS : 
                            MODEL_BRANDS.filter(b => selectedMultipleBrands.includes(b.brandId));

        if (brandsToUse.length === 0) return;

        const userMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: "user", 
            content: input 
        };
        
        const newAssistantMsgs: ChatMessage[] = brandsToUse.map(b => ({
            id: `assistant-${b.brandId}-${Date.now()}`,
            role: "assistant",
            content: "",
            isStreaming: true,
            brand: b
        }));

        setMessages(prev => [...prev, userMsg, ...newAssistantMsgs]);
        setInput("");
        setIsStreaming(true);
        setHasStarted(true);

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

        await Promise.all(brandsToUse.map(async (brand, index) => {
            const currentModelId = brand.id;
            const assistantMsgId = newAssistantMsgs[index].id;
            
            try {
                const res = await fetch(`${BACKEND_URL}/chat/stream`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: input,
                        system_prompt: systemPrompt,
                        models: [brand.id],
                        image: image,
                        temperature: params.temperature,
                        max_tokens: params.maxTokens,
                        user_email: "public-user"
                    })
                });

                if (!res.ok) throw new Error("Stream failed");
                if (!res.body) throw new Error("No body");

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullText = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.chunk) {
                                    fullText += data.chunk;
                                    setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m));
                                }
                            } catch (e) {
                                console.error("Chunk parse error", e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(error);
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: "Error: Could not connect to the model.", isStreaming: false } : m));
            } finally {
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m));
            }
        }));

        setIsStreaming(false);
        setImage(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-1 flex h-full bg-black text-foreground overflow-hidden font-sans grid-bg-fiesta relative">
            {/* Initial Welcome Screen */}
            {!hasStarted && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-700 pointer-events-none">
                    <div className="w-24 h-24 mb-8 bg-accent/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                        <Brain className="w-12 h-12 text-accent" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Hii, User!</h1>
                    <p className="text-white/40 text-lg mb-12">How can I assist Sora AI today?</p>
                </div>
            )}

            {/* Left Sidebar: Model Selector */}
            <aside className={`w-80 border-r border-panel-border bg-[#050505]/50 backdrop-blur-xl flex flex-col hidden lg:flex ${requestMode !== 'Single' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <div className="p-4 border-b border-panel-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find AI Model..." 
                            className="w-full bg-background/50 border border-panel-border rounded-xl pl-10 pr-4 py-2 text-sm focus:border-accent/40 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredBrands.map(brand => (
                        <button 
                            key={brand.id}
                            onClick={() => setSelectedBrand(brand)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${selectedBrand.brandId === brand.id ? 'bg-accent text-white shadow-lg' : 'hover:bg-card/50 text-muted'}`}
                        >
                            <img src={brand.logo} alt={brand.name} className="w-6 h-6 rounded-md bg-white p-0.5" />
                            <div className="flex-1 text-left">
                                <p className="text-xs font-black uppercase tracking-tight">{brand.name}</p>
                                <p className="text-[9px] opacity-60 font-bold truncate">{brand.brand}</p>
                            </div>
                            {selectedBrand.brandId === brand.id && <ChevronRight size={14} />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Center Area: Chat & Input */}
            <main className="flex-1 flex flex-col relative min-w-0">
                <header className="h-16 border-b border-panel-border flex items-center justify-between px-6 bg-background/30 backdrop-blur-md z-10 transition-opacity duration-1000" style={{ opacity: hasStarted ? 1 : 0 }}>
                    <div className="flex items-center gap-4">
                        <img src={selectedBrand.logo} className="w-8 h-8 rounded-lg bg-white p-1" alt="Logo" />
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                {selectedBrand.brandName} 
                            </h2>
                            <p className="text-[10px] text-muted font-bold truncate">{selectedBrand.description}</p>
                        </div>
                    </div>
                </header>

                <div className={`flex-1 flex flex-col transition-all duration-1000 overflow-hidden ${hasStarted ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    {/* System Prompt Bar */}
                    <div className="px-6 py-2 border-b border-panel-border bg-card/10">
                        <div className="flex items-center gap-2 text-muted mb-1">
                            <Shield size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">System Architecture</span>
                        </div>
                        <textarea 
                            className="w-full bg-transparent text-[11px] font-bold text-foreground/80 outline-none resize-none hide-scrollbar"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows={1}
                            placeholder="Configure system behavior..."
                        />
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl ${m.role === 'user' ? 'bg-[#1a1a1a] border border-white/5 text-foreground px-5 py-3 shadow-xl' : 'bg-transparent text-foreground/90 w-full'}`}>
                                    <div className="flex items-center gap-3 mb-2 opacity-30">
                                        {m.role === 'user' ? <MessageSquare size={12} /> : <img src={m.brand?.logo || selectedBrand.logo} className="w-4 h-4 rounded ml-1 bg-white p-0.5" />}
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {m.role === 'user' ? 'User Sequence' : `${m.brand?.brandName || selectedBrand.brandName} Response`}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                    {m.isStreaming && (
                                        <div className="flex gap-1 mt-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Interaction Panel - Floating Transition */}
                <div className={`p-6 pb-12 transition-all duration-1000 ease-in-out ${hasStarted ? 'translate-y-0' : '-translate-y-[25vh]'}`}>
                    <div className="max-w-4xl mx-auto">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-accent/5 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                            <div className="relative flex flex-col bg-[#111] border border-white/[0.05] rounded-[2.5rem] focus-within:border-white/10 transition-all shadow-2xl p-2">
                                {image && (
                                    <div className="px-4 pt-2 mb-2">
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-accent/40 group">
                                            <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                            <button 
                                                onClick={() => setImage(null)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-100"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 px-2">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-white/20 hover:text-accent rounded-full transition-all"
                                    >
                                        <ImageIcon size={24} />
                                    </button>
                                    <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
                                    <textarea 
                                        placeholder="Message Sora AI..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white text-lg placeholder-white/20 py-3 resize-none max-h-48 hide-scrollbar"
                                        rows={1}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                    />
                                    <button className="p-3 text-white/20 hover:text-accent rounded-full transition-all">
                                        <Mic size={24} />
                                    </button>
                                    <button 
                                        onClick={handleSend}
                                        disabled={!input.trim() || isStreaming}
                                        className="p-4 bg-white text-black rounded-full hover:bg-white/90 transition-all disabled:opacity-20 active:scale-90"
                                    >
                                        {isStreaming ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                    </button>
                                </div>
                            </div>

                            {!hasStarted && (
                                <div className="mt-8 flex gap-3 justify-center">
                                    <button className="px-6 py-2.5 border border-white/5 rounded-full text-white/40 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                                        <Search size={14} /> Web Search
                                    </button>
                                    <button className="px-6 py-2.5 border border-white/5 rounded-full text-white/40 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                                        <History size={14} /> View History
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar: Params & Info */}
            <aside className="w-80 border-l border-panel-border bg-card/20 flex flex-col hidden xl:flex">
                <header className="p-4 border-b border-panel-border">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                        <Settings2 size={14} /> Hyperparameters
                    </h3>
                </header>
                <div className="p-6 space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest">Temperature</label>
                            <span className="text-[10px] font-bold text-accent">{params.temperature}</span>
                        </div>
                        <input 
                            type="range" min="0" max="2" step="0.1" 
                            className="w-full accent-accent"
                            value={params.temperature}
                            onChange={(e) => setParams(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
                        />
                        <p className="text-[9px] text-muted leading-relaxed font-bold italic">Adjusts randomness: Higher is more creative, lower is more focused.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest">Max Tokens</label>
                            <span className="text-[10px] font-bold text-accent">{params.maxTokens}</span>
                        </div>
                        <input 
                            type="range" min="256" max="8192" step="256" 
                            className="w-full accent-accent"
                            value={params.maxTokens}
                            onChange={(e) => setParams(p => ({ ...p, maxTokens: parseInt(e.target.value) }))}
                        />
                        <p className="text-[9px] text-muted leading-relaxed font-bold italic">Limits the length of the generated response.</p>
                    </div>

                    <div className="pt-6 border-t border-panel-border">
                        <div className="flex items-center gap-3 text-muted mb-4">
                            <Info size={14} />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Node Metadata</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[10px] text-muted font-bold">Context Window</span>
                                <span className="text-[10px] text-foreground font-black">128K</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] text-muted font-bold">Inference Speed</span>
                                <span className="text-[10px] text-foreground font-black">~120 tokens/s</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] text-muted font-bold">Vision Capability</span>
                                <span className="text-[10px] text-accent font-black">Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-auto p-6 bg-accent/5 border-t border-panel-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                            <History size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Session Log</p>
                            <p className="text-[9px] font-bold text-muted">0 sequences generated</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Multiple AIs Selection Modal */}
            {showMultipleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-panel-border rounded-[2rem] p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="text-accent" /> Select Models
                            </h3>
                            <button onClick={() => setShowMultipleModal(false)} className="px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent/80 transition-colors shadow-lg">
                                Done
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {MODEL_BRANDS.map(brand => {
                                const isSelected = selectedMultipleBrands.includes(brand.id);
                                return (
                                    <div key={brand.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isSelected ? 'border-accent bg-accent/5' : 'border-panel-border bg-background/50 hover:bg-card/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <img src={brand.logo} className="w-8 h-8 rounded-lg bg-white p-1" alt={brand.name} />
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">{brand.name}</p>
                                                <p className="text-[9px] text-muted font-bold">{brand.brand}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedMultipleBrands(prev => prev.filter(id => id !== brand.id));
                                                } else {
                                                    setSelectedMultipleBrands(prev => [...prev, brand.id]);
                                                }
                                            }}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${isSelected ? 'bg-accent' : 'bg-panel-border'}`}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isSelected ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
