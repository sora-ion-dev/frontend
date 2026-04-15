"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Image as ImageIcon, X, Copy, Check, Wand2, Zap, Download, ChevronDown, Monitor, Cpu, Plus, Mic, Send } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";
import { useTheme } from "./ThemeProvider";
import jsPDF from "jspdf";

interface PromptMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    image?: string;
    isStreaming?: boolean;
    generatedImage?: string;
    isGeneratingImage?: boolean;
    selectedModel?: string;
}

const GENERATOR_MODELS = [
    { id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1" },
    { id: "bytedance-seed/seedream-4.5", name: "Seedream 4.5" },
    { id: "sourceful/riverflow-v2-fast-preview", name: "Riverflow V2" },
    { id: "Qwen/Qwen-Image-2512", name: "Qwen-Image" },
    { id: "zai-org/CogView4-6B", name: "CogView4" }
];

export default function PromptMode() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<PromptMessage[]>([]);
    const [prompt, setPrompt] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tier, setTier] = useState<"Flash" | "Pro">("Flash");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showModelPicker, setShowModelPicker] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        if (textareaRef.current) textareaRef.current.style.height = "auto";

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
                m.id === assistantMsgId ? { ...m, content: "Error: Architecture sequence interrupted. Please re-initialize.", isStreaming: false } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const generateImage = async (messageId: string, modelId: string) => {
        const msg = messages.find(m => m.id === messageId);
        if (!msg) return;

        setShowModelPicker(null);
        setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, isGeneratingImage: true, selectedModel: modelId } : m
        ));

        // Use the exact prompt provided by the AI without aggressive line-stripping
        const engineeredPrompt = msg.content.trim();

        try {
            const res = await fetch(`${BACKEND_URL}/chat/image-generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: engineeredPrompt,
                    model_id: modelId,
                    user_email: "public-user"
                })
            });

            if (!res.ok) throw new Error("Generation failed");
            const data = await res.json();

            setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, generatedImage: data.image, isGeneratingImage: false } : m
            ));
        } catch (error) {
            setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, isGeneratingImage: false } : m
            ));
            alert("Image synthesis failed. Heavy model load detected.");
        }
    };

    const downloadImage = (url: string, format: 'png' | 'jpg' | 'pdf', prompt: string = "image") => {
        const safePrompt = prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `superai-${safePrompt}-${Date.now()}`;
        
        if (format === 'pdf') {
            const doc = new jsPDF();
            const img = new Image();
            img.src = url;
            img.onload = () => {
                const imgProps = doc.getImageProperties(img);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                doc.save(`${filename}.pdf`);
            };
            return;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPromptFile = (text: string) => {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `superai-prompt-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-500 bg-background font-sans text-foreground">
            
            {/* Background Blurs - Replicating Image Fiesta aesthetic */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-56 hide-scrollbar relative z-10 w-full">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto opacity-40 pointer-events-none select-none">
                         <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center border border-panel-border mb-6">
                            <Sparkles size={32} className="text-foreground/20" />
                         </div>
                         <p className="text-[12px] font-black uppercase tracking-[0.4em] text-foreground/40">Initialize Architect Flow</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-12">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                                <div className={`max-w-[95%] md:max-w-[90%] transition-all duration-500 ${msg.role === 'user' 
                                    ? 'bg-accent/10 border border-accent/20 text-foreground scale-in-center font-medium px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem]' 
                                    : 'message-bubble message-bubble-ai text-foreground self-start w-full px-0 py-4 relative'}`}>
                                    
                                    {msg.image && (
                                        <div className="mb-4 rounded-2xl overflow-hidden border-4 border-panel-border shadow-2xl max-w-sm">
                                            <img src={msg.image} alt="Source Vector" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    
                                    <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} prose-p:leading-relaxed prose-p:text-[16px] max-w-none text-foreground font-black`}>
                                        <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                    </div>
                                    
                                    {msg.isStreaming && (
                                        <div className="flex items-center gap-3 mt-4 text-accent">
                                            <Loader2 size={18} className="animate-spin" />
                                            <span className="text-[10px] font-semibold tracking-widest animate-pulse uppercase">Architecting Response...</span>
                                        </div>
                                    )}

                                    {msg.isGeneratingImage && (
                                        <div className="mt-6 aspect-square max-w-md bg-foreground/5 rounded-2xl flex flex-col items-center justify-center border border-dashed border-accent/30 animate-pulse">
                                            <Loader2 size={32} className="animate-spin text-accent mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">Synthesizing Visual...</span>
                                        </div>
                                    )}

                                    {msg.generatedImage && (
                                        <div className="mt-8 space-y-4">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-panel-border group relative">
                                                <img src={msg.generatedImage} alt="Generated result" className="w-full h-auto" />
                                                <div className="absolute top-4 left-4 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-panel-border flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-foreground/90 uppercase tracking-tighter">Result Flow</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => downloadImage(msg.generatedImage!, 'png', msg.content)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-2xl text-[11px] font-bold transition-all border border-panel-border">
                                                    <Download size={14} /> PNG
                                                </button>
                                                <button onClick={() => downloadImage(msg.generatedImage!, 'jpg', msg.content)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-2xl text-[11px] font-bold transition-all border border-panel-border">
                                                    <Download size={14} /> JPG
                                                </button>
                                                <button onClick={() => downloadImage(msg.generatedImage!, 'pdf', msg.content)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-2xl text-[11px] font-bold transition-all shadow-lg active:scale-95">
                                                    <Download size={14} /> PDF
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                        <div className="mt-6 pt-6 border-t border-panel-border space-y-4">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Zap size={14} className="text-accent" />
                                                    <span className="text-[10px] font-black uppercase text-muted tracking-widest">Architect Engine</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 relative">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(msg.content, msg.id);
                                                        }} 
                                                        className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-panel-border rounded-xl text-[10px] font-bold tracking-tight transition-all active:scale-95"
                                                    >
                                                        {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            downloadPromptFile(msg.content);
                                                        }} 
                                                        className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-panel-border rounded-xl text-[10px] font-bold tracking-tight transition-all active:scale-95"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowModelPicker(showModelPicker === msg.id ? null : msg.id);
                                                        }} 
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 group ${showModelPicker === msg.id ? 'bg-foreground text-background' : 'bg-accent text-white shadow-accent/20'}`}
                                                    >
                                                        <Sparkles size={14} className={showModelPicker === msg.id ? "" : "group-hover:rotate-12 transition-transform"} />
                                                        {showModelPicker === msg.id ? "Close Engine" : "Generate Image"}
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${showModelPicker === msg.id ? "rotate-180" : ""}`} />
                                                    </button>
                                                    
                                                    {showModelPicker === msg.id && (
                                                        <div className="absolute right-0 bottom-full mb-3 w-64 glass-panel border border-panel-border rounded-2xl p-3 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl bg-background/90"
                                                             onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-panel-border">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Synthesis Engine</span>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                {GENERATOR_MODELS.map(model => (
                                                                    <button 
                                                                        key={model.id} 
                                                                        onClick={() => generateImage(msg.id, model.id)} 
                                                                        className="w-full text-left p-3 hover:bg-foreground/5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-between group border border-transparent hover:border-panel-border"
                                                                    >
                                                                        <span className="group-hover:translate-x-1 transition-transform">{model.name}</span>
                                                                        <Wand2 size={12} className="opacity-0 group-hover:opacity-100 text-accent transition-all" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black tracking-[0.2em] px-2 ${msg.role === 'user' ? 'text-accent' : 'text-muted'}`}>
                                    {msg.role === 'user' ? 'PACKET_IN' : 'ARCHITECT_OUT'}
                                </span>
                            </div>
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                )}
            </div>

            {/* Premium Floating Input Area (Synchronized with Image Mode) */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-16 z-50 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-auto">
                    
                    <div className="w-full max-w-2xl relative">
                        {/* Status/Model Indicator */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 backdrop-blur-md px-3 py-1 rounded-full border border-panel-border bg-panel/50">
                            <Cpu size={10} className="text-accent" />
                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">GPT-OSS-20B Neural Architecture</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>

                        {selectedImage && (
                            <div className="absolute -top-24 left-0 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="relative group">
                                    <img src={selectedImage} alt="Neural Scan" className="w-20 h-20 object-cover rounded-2xl border-2 border-accent/20 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-xl text-white hover:scale-110 transition-all border border-white/20">
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="w-full relative flex items-center gap-3 px-6 py-2.5 rounded-[2rem] border border-panel-border bg-foreground/5 backdrop-blur-3xl shadow-xl focus-within:border-accent/30 transition-all font-medium">
                            
                            <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-1 text-foreground/40 hover:text-foreground transition-all transform hover:rotate-90">
                                <Plus className="w-5 h-5" />
                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            </button>

                            <textarea
                                ref={textareaRef}
                                placeholder={isLoading ? "Architecting logic..." : "Initialize architecture parameters..."}
                                rows={1}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-foreground text-[15px] placeholder-foreground/20 resize-none py-2 max-h-48 leading-relaxed font-normal shadow-none"
                                value={prompt}
                                disabled={isLoading}
                                onChange={(e) => {
                                    setPrompt(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />

                            <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-2xl border border-panel-border">
                                <button onClick={() => setTier("Flash")} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${tier === "Flash" ? "bg-accent text-white shadow-lg shadow-accent/30" : "text-foreground/20 hover:text-foreground"}`}>
                                    Flash
                                </button>
                                <button onClick={() => setTier("Pro")} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${tier === "Pro" ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" : "text-foreground/20 hover:text-foreground"}`}>
                                    Pro
                                </button>
                            </div>

                            <button onClick={handleSend} disabled={(!prompt.trim() && !selectedImage) || isLoading} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${prompt.trim() || selectedImage ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-105' : 'text-white/10'}`}>
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-0.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
