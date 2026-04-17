"use client";

import { useState, useRef } from "react";
import { Send, Plus, Mic, Loader2, ImageIcon, Sparkles, Wand2, Lock as LockIcon } from "lucide-react";
import { AIBrand } from "@/types";
import { IMAGE_FIESTA_BRAND_IDS, MODEL_BRANDS } from "@/types";
import ImageColumn from "./ImageColumn";

interface ImageResult {
    id: string;
    url: string;
    prompt: string;
    timestamp: number;
}

interface ImageFiestaModeProps {
    onGenerate: (prompt: string) => Promise<void>;
    results: Record<string, ImageResult[]>;
    isGenerating: boolean;
    enabledImageModels: Record<string, boolean>;
    onToggleEnabled: (brandId: string) => void;
    isAuthorized: boolean;
}

export default function ImageFiestaMode({ 
    onGenerate, 
    results, 
    isGenerating,
    enabledImageModels,
    onToggleEnabled,
    isAuthorized
}: ImageFiestaModeProps) {
    const [prompt, setPrompt] = useState("");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!prompt.trim() || isGenerating) return;
        onGenerate(prompt);
        setPrompt("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const imageBrands = MODEL_BRANDS.filter(b => IMAGE_FIESTA_BRAND_IDS.includes(b.brandId));

    return (
        <div className="h-full relative overflow-hidden font-sans bg-background">
            
            {/* Immersive Dynamic Background - Advanced Creative Pulsing */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#10b981]/10 rounded-full blur-[160px] animate-pulse pointer-events-none transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none transition-all duration-1000" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            {/* Grid display area */}
            <div
                ref={scrollContainerRef}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden px-4 md:px-6 pt-6 pb-2 custom-scrollbar"
                style={{ scrollSnapType: "x mandatory" }}
            >
                <div className="flex flex-row gap-4 min-w-max h-full">
                    {imageBrands.filter(b => enabledImageModels[b.brandId]).map((brand, bIndex) => {
                        const isLocked = !isAuthorized && bIndex >= 2;
                        return (
                            <div key={brand.brandId} className={`w-[85vw] md:w-[380px] flex-shrink-0 h-full scroll-snap-align-start transition-all duration-500 ${isLocked ? 'opacity-40 grayscale pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
                                <div className="relative h-full">
                                    {isLocked && (
                                        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center p-8 text-center bg-background/20 backdrop-blur-sm rounded-[2.5rem]">
                                            <div className="p-4 rounded-2xl bg-panel border border-panel-border shadow-2xl mb-4">
                                                <LockIcon className="w-8 h-8 text-foreground/40" />
                                            </div>
                                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 mb-1">Visual Gate Locked</h4>
                                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">Enter Access Key for Pro Multi-Synthesis</p>
                                        </div>
                                    )}
                                    <ImageColumn
                                        brand={brand}
                                        results={results[brand.brandId] || []}
                                        isGenerating={isGenerating}
                                        isEnabled={enabledImageModels[brand.brandId]}
                                        onToggleEnabled={() => onToggleEnabled(brand.brandId)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {imageBrands.filter(b => enabledImageModels[b.brandId]).length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
                            <Wand2 className="w-12 h-12 mb-4 text-[#10b981]" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Visual Core Offline</h3>
                            <p className="text-sm text-foreground/40 max-w-xs">All image models are currently disabled. Reactivate them in settings to resume synthesis.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Input Area - Premium Centered Pill */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-16 z-50 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-auto">
                    
                    <div className="w-full max-w-2xl relative">
                        {/* Status Indicator (Optional) */}
                        {isGenerating && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/20 backdrop-blur-md animate-bounce">
                                <Sparkles size={12} className="text-accent" />
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Generating 4x Visuals</span>
                            </div>
                        )}

                        <div className={`w-full relative flex items-center gap-3 px-6 py-2.5 rounded-[2rem] border transition-all duration-500 shadow-2xl backdrop-blur-3xl 
                            ${isGenerating 
                                ? 'border-[#10b981]/50 bg-[#10b981]/5 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                                : 'border-panel-border bg-foreground/5 hover:border-panel-border/60 focus-within:border-[#10b981]/40 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
                            
                            <button className="flex-shrink-0 p-1 text-foreground/40 hover:text-foreground transition-all transform hover:rotate-90">
                                <Plus className="w-5 h-5" />
                            </button>

                            <textarea
                                ref={textareaRef}
                                placeholder={isGenerating ? "Manifesting pixels..." : "Describe the image you want to create..."}
                                rows={1}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-foreground text-[15px] placeholder-foreground/20 resize-none py-2 max-h-48 leading-relaxed font-normal shadow-none"
                                value={prompt}
                                disabled={isGenerating}
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

                            <button className="flex-shrink-0 p-1 text-foreground/40 hover:text-foreground transition-all">
                                <Mic className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={!prompt.trim() || isGenerating}
                                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all ${prompt.trim() && !isGenerating ? 'text-foreground' : 'text-foreground/10'}`}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                ) : (
                                    <Send className="w-5 h-5 transition-transform group-focus-within:translate-x-1" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Scroll Indicator - Neural Beads */}
                    <div className="flex items-center gap-1.5 md:hidden">
                        {imageBrands.filter(b => enabledImageModels[b.brandId]).map((_, i) => (
                            <div 
                                key={i} 
                                className="w-1.5 h-1.5 rounded-full bg-foreground/10 transition-all duration-500"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
