"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Trophy, Send, RotateCcw } from "lucide-react";
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

    // The wheel scrolling logic has been moved to onWheelCapture on the div itself to ensure it always fires

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-black">
            {/* Vertical Scrollable AI Cards Grid */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto w-full relative custom-scrollbar p-4 md:p-6 pb-48"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[600px] max-w-[1800px] mx-auto">
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
            <div className="absolute bottom-10 left-0 w-full flex flex-col items-center justify-center px-4 z-40 pointer-events-none gap-6">

                {/* Generate Consensus / AI Battle Buttons */}
                {!isStreaming && columnMessages[MODEL_BRANDS[0].brandId]?.length > 0 && (
                    <div className="flex gap-4 pointer-events-auto">
                        {rankings.length === 0 && (
                            <button
                                onClick={onRank}
                                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2 active:scale-95 text-sm uppercase tracking-wider"
                            >
                                <Trophy size={18} /> AI Battle Evaluation
                            </button>
                        )}
                        <button
                            onClick={onMerge}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all flex items-center gap-3 active:scale-95 text-sm uppercase tracking-wider"
                        >
                            <Sparkles size={18} /> Generate Consensus
                        </button>
                    </div>
                )}

                {/* Floating Question Box */}
                <div className="w-full max-w-3xl glass-panel rounded-[24px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto transform transition-all hover:scale-[1.01]">
                    <div className="flex items-center gap-3">
                        {/* Fast/Moderate/Best Mode Toggle */}
                        <div className="flex bg-[#111] border border-white/10 p-1.5 rounded-full shadow-2xl pointer-events-auto">
                            <button
                                onClick={() => toggleTier("Pro")}
                                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${currentTier === "Pro" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-gray-500 hover:text-white"}`}
                            >
                                BEST
                            </button>
                            <button
                                onClick={() => toggleTier("Moderate")}
                                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${currentTier === "Moderate" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-gray-500 hover:text-white"}`}
                            >
                                MODERATE
                            </button>
                            <button
                                onClick={() => toggleTier("Flash")}
                                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${currentTier === "Flash" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-gray-500 hover:text-white"}`}
                            >
                                FAST
                            </button>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-3">
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask AI Fiesta anything..."
                            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none max-h-48 min-h-[50px] py-2 px-1 text-lg leading-relaxed hide-scrollbar"
                            rows={1}
                            disabled={isStreaming}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!prompt.trim() || isStreaming}
                            className="bg-[#ff4d4d] text-white p-3.5 rounded-2xl hover:bg-[#ff6666] transition-all shadow-[0_0_20px_rgba(255,77,77,0.3)] disabled:opacity-50 active:scale-90 shrink-0"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
