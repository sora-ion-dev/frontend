"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Trophy, Send, RotateCcw, Brain, Zap, Swords, Merge, Loader2, Plus, Mic, Image as ImageIcon } from "lucide-react";
import { AIBrand, ChatMessage } from "@/types";
import { MODEL_BRANDS, FIESTA_BRAND_IDS } from "@/types";
import AIColumn from "./AIColumn";

interface AIFiestaModeProps {
    onSendPrompt: (prompt: string, models: string[]) => Promise<void>;
    columnMessages: Record<string, ChatMessage[]>;
    selectedModels: Record<string, string>;
    onModelChange: (brandId: string, modelId: string) => void;
    isStreaming: boolean;
    rankings: string[];
    onRank: () => Promise<void>;
    onMerge: () => Promise<void>;
    onRegenerate: (brandId: string, msgId: string) => void;
    onClearColumn: (brandId: string) => void;
    enabledModels: Record<string, boolean>;
    onToggleEnabled: (brandId: string) => void;
    // Removed tier props as per 31-model architecture
}

export default function AIFiestaMode({
    onSendPrompt,
    columnMessages,
    selectedModels,
    onModelChange,
    isStreaming,
    rankings,
    onRank,
    onMerge,
    onRegenerate,
    onClearColumn,
    enabledModels,
    onToggleEnabled,
}: AIFiestaModeProps) {
    const [prompt, setPrompt] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!prompt.trim() || isStreaming) return;
        setHasStarted(true);
        const fiestaBrands = MODEL_BRANDS.filter(b => FIESTA_BRAND_IDS.includes(b.brandId));
        const enabledModelIds = fiestaBrands.filter(b => enabledModels[b.brandId]).map(b => b.brandId);
        onSendPrompt(prompt, enabledModelIds);
        setPrompt("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleWheel = (e: React.WheelEvent) => {
        // Only scroll horizontally if NOT over a column that can scroll vertically
        // Or remove entirely as per user request to decouple them.
        // I will remove it to ensure vertical scrolling works inside columns as expected.
    };

    const fiestaBrands = MODEL_BRANDS.filter(b => FIESTA_BRAND_IDS.includes(b.brandId));

    return (
        <div className="h-full relative overflow-hidden font-sans bg-background group">

            {/* Grid display area */}
            <div
                ref={scrollContainerRef}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden px-4 md:px-6 pt-6 pb-2 custom-scrollbar"
                style={{ scrollSnapType: "x mandatory" }}
            >
                <div className="flex flex-row gap-4 min-w-max h-full">
                    {fiestaBrands.filter(b => enabledModels[b.brandId]).map((brand, bIndex) => (
                        <div key={brand.brandId} className="w-[85vw] md:w-[400px] flex-shrink-0 h-full scroll-snap-align-start transition-all duration-500 opacity-100 scale-100">
                            <AIColumn
                                brand={brand}
                                messages={columnMessages[brand.brandId] || []}
                                selectedModelId={selectedModels[brand.brandId]}
                                onModelChange={(mid) => onModelChange(brand.brandId, mid)}
                                onRegenerate={(mid) => onRegenerate(brand.brandId, mid)}
                                isStreaming={isStreaming}
                                rank={null}
                                onClearColumn={() => onClearColumn(brand.brandId)}
                                isEnabled={enabledModels[brand.brandId]}
                                onToggleEnabled={() => onToggleEnabled(brand.brandId)}
                            />
                        </div>
                    ))}
                        {/* Status Indicator */}
                        {/* Status Indicator */}
                        {isStreaming && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/20 backdrop-blur-md animate-bounce">
                                <Sparkles size={12} className="text-accent" />
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Generating 4x Neural Paths</span>
                            </div>
                        )}
                    {fiestaBrands.filter(b => enabledModels[b.brandId]).length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
                            <Brain className="w-12 h-12 mb-4 text-accent" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Neural Stack Empty</h3>
                            <p className="text-sm text-foreground/40 max-w-xs">All chat models are currently disabled in settings. Reactive your architecture to start comparing.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Input Area with Glassmorphism */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-12 z-50 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-auto">

                    {/* Input Bar - high transparency glass style */}
                    <div className="w-full max-w-2xl relative flex items-center gap-3 px-6 py-2.5 rounded-[2rem] border border-panel-border bg-foreground/5 backdrop-blur-3xl shadow-xl focus-within:border-accent/30 transition-all font-medium">
                        <button className="flex-shrink-0 p-1 text-foreground/40 hover:text-foreground transition-all">
                            <Plus className="w-5 h-5" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            placeholder={isStreaming ? "Synthesizing intelligence..." : "Enter unified neural prompt..."}
                            rows={1}
                            className="w-full bg-transparent border-none focus:ring-0 outline-none text-foreground text-[15px] placeholder-foreground/20 resize-none py-2 max-h-48 leading-relaxed font-normal shadow-none"
                            value={prompt}
                            disabled={isStreaming}
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
                            disabled={!prompt.trim() || isStreaming}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center disabled:opacity-20 transition-all hover:text-foreground text-foreground/40"
                        >
                            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 transition-transform group-focus-within:translate-x-1" />}
                        </button>
                    </div>

                    {/* Mobile Scroll Indicator - Neural Beads */}
                    <div className="flex items-center gap-1.5 md:hidden">
                        {fiestaBrands.filter(b => enabledModels[b.brandId]).map((_, i) => (
                            <div 
                                key={i} 
                                className="w-1.5 h-1.5 rounded-full bg-foreground/10 transition-all duration-500"
                                id={`bead-${i}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
