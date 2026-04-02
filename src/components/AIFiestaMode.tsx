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
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += e.deltaY;
        }
    };

    const fiestaBrands = MODEL_BRANDS.filter(b => FIESTA_BRAND_IDS.includes(b.brandId));

    return (
        <div className="h-full flex flex-col overflow-hidden font-sans relative bg-background">

            {/* Grid display area */}
            <div
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex-1 overflow-x-auto overflow-y-hidden px-4 md:px-6 pt-6 pb-4"
                style={{ scrollbarWidth: "thin", scrollbarColor: "var(--accent) transparent" }}
            >
                <div className="flex flex-row gap-4 min-w-max h-full">
                    {fiestaBrands.map((brand) => (
                        <div key={brand.brandId} className={`w-[400px] flex-shrink-0 h-full transition-all duration-500 ${!enabledModels[brand.brandId] ? 'opacity-30 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
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
                </div>
            </div>

            {/* Input Bar at Bottom */}
            <div className="px-6 pb-6 pt-3 border-t border-panel-border">
                <div className="max-w-5xl mx-auto flex flex-col gap-3">
                    {/* Merge Button - shows when there are messages */}
                    {hasStarted && (
                        <div className="flex justify-center">
                            <button
                                onClick={onMerge}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
                                style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
                            >
                                <Merge className="w-3.5 h-3.5" /> Generate Consensus
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl border border-panel-border bg-foreground/[0.03] backdrop-blur-3xl focus-within:border-accent group">
                        <button className="flex-shrink-0 p-2 text-foreground/20 hover:text-foreground/60 rounded-xl transition-all hover:bg-foreground/5">
                            <Plus className="w-5 h-5" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            placeholder="Ask anything to the world's most powerful AIs..."
                            rows={1}
                            className="w-full bg-transparent border-none focus:ring-0 text-foreground text-sm placeholder-foreground/20 resize-none py-1.5 max-h-32 leading-relaxed"
                            value={prompt}
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

                        <button className="flex-shrink-0 p-2 text-foreground/20 hover:text-foreground/60 rounded-xl transition-all hover:bg-foreground/5">
                            <Mic className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!prompt.trim() || isStreaming}
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-20 transition-all active:scale-90 hover:scale-105 text-white shadow-lg shadow-accent/10"
                            style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
                        >
                            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
