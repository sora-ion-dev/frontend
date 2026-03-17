"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Trophy, Send, RotateCcw, Brain, Zap, Swords, Merge, Loader2 } from "lucide-react";
import { AIBrand, ChatMessage, FIESTA_MODEL_BRANDS as MODEL_BRANDS } from "@/types";
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
    currentTier: "Flash" | "Moderate" | "Pro";
    toggleTier: (tier: "Flash" | "Moderate" | "Pro") => void;
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
    currentTier,
    toggleTier
}: AIFiestaModeProps) {
    const [prompt, setPrompt] = useState("");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!prompt.trim() || isStreaming) return;
        const enabledModelIds = MODEL_BRANDS.filter(b => enabledModels[b.brandId]).map(b => b.brandId);
        onSendPrompt(prompt, enabledModelIds);
        setPrompt("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-500 bg-black">
            <div className="absolute inset-0 liquid-mesh opacity-30 pointer-events-none" />
            
            {/* Vertical Scrollable AI Cards Grid */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto w-full relative hide-scrollbar p-6 md:p-10 pb-64 z-10"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-[650px] max-w-[2400px] mx-auto scale-in-center">
                    {MODEL_BRANDS.map(brand => (
                        <AIColumn
                            key={brand.brandId}
                            brand={brand}
                            messages={columnMessages[brand.brandId] || []}
                            selectedModelId={selectedModels[brand.brandId]}
                            onModelChange={(newId) => onModelChange(brand.brandId, newId)}
                            isEnabled={enabledModels[brand.brandId]}
                            onToggleEnabled={() => onToggleEnabled(brand.brandId)}
                            isStreaming={isStreaming}
                            rank={rankings.indexOf(brand.brandId) !== -1 ? rankings.indexOf(brand.brandId) + 1 : null}
                            onRegenerate={(msgId) => onRegenerate(brand.brandId, msgId)}
                            onClearColumn={() => onClearColumn(brand.brandId)}
                        />
                    ))}
                </div>
            </div>

            {/* Floating UI Elements */}
            <div className="absolute bottom-10 left-0 w-full flex flex-col items-center justify-center px-6 z-40 pointer-events-none gap-8">

                {/* Generate Consensus / AI Battle Buttons */}
                {!isStreaming && columnMessages[MODEL_BRANDS[0].brandId]?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4 pointer-events-auto animate-float">
                        {rankings.length === 0 && (
                            <button
                                onClick={onRank}
                                className="bg-accent text-white px-10 py-4 rounded-3xl font-semibold shadow-2xl active:scale-95 transition-all flex items-center gap-3 text-xs tracking-[0.2em] border border-white/10 hover:rotate-1"
                            >
                                <Swords size={20} /> Neural Battle Evaluation
                            </button>
                        )}
                        <button
                            onClick={onMerge}
                            className="px-10 py-4 rounded-3xl font-semibold shadow-2xl active:scale-95 transition-all flex items-center gap-3 text-xs tracking-[0.2em] border border-white/10 hover:-rotate-1 bg-white text-black"
                        >
                            <Merge size={20} /> Synthesize Consensus
                        </button>
                    </div>
                )}

                {/* Floating Question Box */}
                <div className="w-full max-w-4xl glass-panel rounded-[3rem] p-6 shadow-2xl border-2 border-panel-border pointer-events-auto transition-all backdrop-blur-3xl group">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                        {/* Fast/Moderate/Best Mode Toggle */}
                        <div className="flex bg-foreground/5 p-1.5 rounded-[2rem] border-2 border-panel-border shadow-inner pointer-events-auto">
                            <button
                                onClick={() => toggleTier("Pro")}
                                className={`px-8 py-2.5 rounded-[1.5rem] text-[10px] font-semibold tracking-widest transition-all ${currentTier === "Pro" ? "bg-accent text-white shadow-xl scale-105" : "text-muted hover:text-foreground"}`}
                            >
                                Intelligence
                            </button>
                            <button
                                onClick={() => toggleTier("Moderate")}
                                className={`px-8 py-2.5 rounded-[1.5rem] text-[10px] font-semibold tracking-widest transition-all ${currentTier === "Moderate" ? "bg-accent text-white shadow-xl scale-105" : "text-muted hover:text-foreground"}`}
                            >
                                Balanced
                            </button>
                            <button
                                onClick={() => toggleTier("Flash")}
                                className={`px-8 py-2.5 rounded-[1.5rem] text-[10px] font-semibold tracking-widest transition-all ${currentTier === "Flash" ? "bg-accent text-white shadow-xl scale-105" : "text-muted hover:text-foreground"}`}
                            >
                                Velocity
                            </button>
                        </div>
                        <div className="hidden md:flex flex-1 items-center gap-2 px-4 border-l border-panel-border">
                            <Brain size={16} className="text-accent" />
                            <span className="text-[10px] font-semibold text-muted tracking-[0.2em]">6x Parallel Processing Active</span>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                        <div className={`p-4 rounded-3xl transition-all ${isStreaming ? 'bg-accent/20 text-accent animate-pulse' : 'bg-foreground/5 text-muted'}`}>
                            <Zap size={24} />
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Initialize Multi-Model Uplink..."
                            className="w-full bg-transparent text-foreground placeholder-muted resize-none outline-none max-h-48 min-h-[60px] py-3 px-1 text-xl font-semibold leading-relaxed hide-scrollbar"
                            rows={1}
                            disabled={isStreaming}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!prompt.trim() || isStreaming}
                            className={`p-6 rounded-[2rem] transition-all duration-500 shadow-2xl active:scale-90 shrink-0 ${prompt.trim() && !isStreaming ? 'bg-accent text-white shadow-accent/40 scale-105' : 'bg-muted/20 text-muted grayscale'}`}
                        >
                            {isStreaming ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
