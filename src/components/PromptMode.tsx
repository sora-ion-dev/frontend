"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Image as ImageIcon, X, Copy, Check, Brain, Wand2, Zap } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

interface PromptMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    image?: string;
    isStreaming?: boolean;
}

export default function PromptMode() {
    const [messages, setMessages] = useState<PromptMessage[]>([]);
    const [prompt, setPrompt] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tier, setTier] = useState<"Flash" | "Pro">("Flash");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;

        const currentPrompt = prompt;
        const currentImage = selectedImage;
        setPrompt("");
        setSelectedImage(null);
        setIsLoading(true);

        const userMsgId = Date.now().toString();
        const assistantMsgId = (Date.now() + 1).toString();

        setMessages(prev => [
            ...prev,
            { id: userMsgId, role: "user", content: currentPrompt, image: currentImage || undefined },
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
        ]);

        try {
            const res = await fetch(`${BACKEND_URL}/chat/prompt_ai`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    tier: tier,
                    image_base64: currentImage,
                    user_email: "public-user"
                })
            });

            if (!res.ok) throw new Error("Failed to generate prompt");
            const data = await res.json();

            setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: data.result, isStreaming: false } : m
            ));
        } catch (error) {
            setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: "Error: Failed to generate prompt. Please try again.", isStreaming: false } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-500 bg-black">
            <div className="absolute inset-0 liquid-mesh opacity-20 pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-48 hide-scrollbar relative z-10">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-float">
                        <div className="w-20 h-20 rounded-3xl bg-accent/5 flex items-center justify-center border border-accent/10 shadow-2xl overflow-hidden p-3">
                            <img src="/logo.png" alt="Super AI Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-semibold text-foreground tracking-tight">Prompt Architect</h2>
                            <p className="text-muted text-sm font-medium leading-relaxed tracking-wide">
                                Engineering Precision for Generative AI
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="p-6 glass-panel border border-panel-border rounded-3xl text-left space-y-2 hover:border-accent/20 transition-all cursor-pointer group">
                                <Wand2 className="text-accent" size={20} />
                                <h3 className="font-semibold text-foreground text-sm">Visual Synthesis</h3>
                                <p className="text-xs text-muted">Upload an image and I'll reverse-engineer the perfect generative prompt.</p>
                            </div>
                            <div className="p-6 glass-panel border border-panel-border rounded-3xl text-left space-y-2 hover:border-accent/20 transition-all cursor-pointer group">
                                <Brain className="text-indigo-400" size={20} />
                                <h3 className="font-semibold text-foreground text-sm">Semantic Optimization</h3>
                                <p className="text-xs text-muted">Describe a concept and I'll expand it with high-density keywords and styles.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-12">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                                <div className={`max-w-[95%] md:max-w-[90%] transition-all duration-500 ${msg.role === 'user' 
                                    ? 'message-bubble message-bubble-user text-white scale-in-center font-medium px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem]' 
                                    : 'message-bubble message-bubble-ai text-foreground self-start w-full px-0 py-4 relative'}`}>
                                    
                                    {msg.image && (
                                        <div className="mb-4 rounded-2xl overflow-hidden border-4 border-panel-border shadow-2xl max-w-md">
                                            <img src={msg.image} alt="Source Vector" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    
                                    <p className="whitespace-pre-wrap leading-relaxed font-medium text-[16px]">{msg.content}</p>
                                    
                                    {msg.isStreaming && (
                                        <div className="flex items-center gap-3 mt-4 text-accent">
                                            <Loader2 size={24} className="animate-spin" />
                                            <span className="text-[10px] font-semibold tracking-widest animate-pulse">Computing Sequence...</span>
                                        </div>
                                    )}
                                    
                                    {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                        <div className="mt-6 pt-6 border-t border-panel-border flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Zap size={14} className="text-accent" />
                                                <span className="text-[10px] font-semibold text-muted tracking-widest">Architected Result</span>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(msg.content, msg.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-xl text-[10px] font-semibold tracking-widest transition-all shadow-lg active:scale-95"
                                            >
                                                {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedId === msg.id ? 'Synced' : 'Copy Prompt'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-semibold tracking-[0.2em] px-2 ${msg.role === 'user' ? 'text-accent' : 'text-muted'}`}>
                                    {msg.role === 'user' ? 'Source Packet' : 'Architected Result'}
                                </span>
                            </div>
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-background via-background/90 to-transparent flex flex-col items-center z-20">
                <div className="w-full max-w-3xl scale-in-center">
                    {selectedImage && (
                        <div className="mb-4 relative inline-block animate-float">
                            <img src={selectedImage} alt="Neural Scan" className="w-24 h-24 object-cover rounded-3xl border-4 border-accent shadow-2xl" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 rounded-2xl text-white shadow-xl hover:scale-110 transition-all border border-white"
                            >
                                <X size={14} />
                            </button>
                            <div className="absolute inset-0 bg-accent/20 animate-pulse rounded-3xl pointer-events-none" />
                        </div>
                    )}
                    
                    <div className="glass-panel rounded-[1.8rem] p-2 pl-4 flex items-center gap-3 border border-panel-border focus-within:border-accent/20 shadow-2xl transition-all backdrop-blur-3xl group">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3.5 rounded-2xl text-muted hover:text-accent hover:bg-accent/5 transition-all shadow-inner border border-transparent hover:border-accent/20"
                            title="Neural Image Scan"
                        >
                            <ImageIcon size={22} />
                        </button>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Initialize prompt parameters..."
                            className="flex-1 bg-transparent text-foreground placeholder-muted outline-none resize-none py-3 text-base font-medium"
                            rows={1}
                        />
                        <div className="flex items-center gap-2 bg-panel-border/30 p-1 rounded-2xl border border-panel-border mr-1">
                            <button 
                                onClick={() => setTier("Flash")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tier === "Flash" ? "bg-accent text-white shadow-lg" : "text-muted hover:text-foreground"}`}
                            >
                                Flash
                            </button>
                            <button 
                                onClick={() => setTier("Pro")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tier === "Pro" ? "bg-orange-600 text-white shadow-lg" : "text-muted hover:text-foreground"}`}
                            >
                                Pro
                            </button>
                        </div>
                        <button 
                            onClick={handleSend}
                            disabled={(!prompt.trim() && !selectedImage) || isLoading}
                            className={`p-4 rounded-[1.8rem] transition-all duration-500 ${prompt.trim() || selectedImage ? 'bg-accent text-white shadow-xl shadow-accent/40 scale-105 rotate-0' : 'bg-muted/20 text-muted grayscale'}`}
                        >
                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
