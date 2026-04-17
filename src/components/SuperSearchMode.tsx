"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Globe, Brain, Loader2, Link as LinkIcon, CheckCircle2, ChevronRight, Sparkles, Zap, Shield, Info, ArrowUp, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BACKEND_URL } from "@/lib/config";
import clsx from "clsx";

interface Source {
    title: string;
    url: string;
    snippet: string;
}


export default function SuperSearchMode() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [thoughtSteps, setThoughtSteps] = useState<string[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [answer, setAnswer] = useState("");
    const [isNeural, setIsNeural] = useState(false); // Toggle between Lite and Neural
    const [activeQuery, setActiveQuery] = useState("");
    
    const resultsEndRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || isSearching) return;

        // Reset state for new search
        const currentQuery = query;
        setActiveQuery(currentQuery);
        setQuery(""); // Clear input for follow-up style
        setIsSearching(true);
        setThoughtSteps([]);
        setSources([]);
        setAnswer("");

        try {
            const response = await fetch(`${BACKEND_URL}/chat/super-search`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-user-email": "public-user" 
                },
                body: JSON.stringify({
                    prompt: currentQuery,
                    models: [isNeural ? "google/gemini-2.5-flash-lite" : "groq/llama-3.3-70b-versatile"],
                    user_email: "public-user"
                })
            });

            if (!response.ok) throw new Error("Search failed");
            if (!response.body) throw new Error("No body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.type === "thought") {
                                setThoughtSteps(prev => [...prev, data.content]);
                            } else if (data.type === "sources") {
                                setSources(data.content);
                            } else if (data.type === "content") {
                                setAnswer(prev => prev + data.content);
                            } else if (data.error) {
                                setAnswer(prev => prev + `\n\n**Error:** ${data.error}`);
                            }
                        } catch (e) {
                            console.error("Parse error", e);
                        }
                    }
                }
            }
        } catch (err) {
            setAnswer("Failed to connect to Neural Search. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Transition Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <AnimatePresence mode="wait">
                {!activeQuery ? (
                    /* HERO STATE: Centered Search */
                    <motion.div 
                        key="hero"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 z-10"
                    >
                        <div className="w-full max-w-2xl space-y-8 text-center">
                            <div className="space-y-3">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-panel-border backdrop-blur-xl text-[8px] font-bold uppercase tracking-[0.15em] text-accent"
                                >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Next-gen Neural Search
                                </motion.div>
                                <h1 className="text-2xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                                     Explore <br/>
                                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-500 to-pink-500">Intelligence</span>
                                 </h1>
                                <p className="text-foreground/40 font-medium max-w-sm mx-auto text-[10px] tracking-wide leading-relaxed">
                                    Deep web grounding powered by Neural Clusters. <br/>Instant research & synthesis.
                                </p>
                            </div>

                            <div className="relative group max-w-lg mx-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 to-purple-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex flex-col bg-panel/60 backdrop-blur-3xl border border-panel-border rounded-[2rem] p-3 shadow-[0_24px_48px_rgba(0,0,0,0.15)] focus-within:border-accent/30 transition-all duration-500">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="p-2 bg-foreground/5 rounded-xl">
                                            <Globe className="w-4 h-4 text-foreground/20 group-focus-within:text-accent transition-all duration-500" />
                                        </div>
                                        <textarea
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                     e.preventDefault();
                                                     handleSearch();
                                                }
                                            }}
                                            placeholder="Research anything..."
                                            className="w-full bg-transparent border-none outline-none text-foreground placeholder-foreground/20 py-2 resize-none font-medium text-sm md:text-base min-h-[30px] md:min-h-[40px] selection:bg-accent/30"
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => handleSearch()}
                                            disabled={!query.trim() || isSearching}
                                            className="p-2 bg-accent text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                                        >
                                            <ArrowUp className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Lite/Neural Toggle */}
                                    <div className="flex items-center justify-between mt-2 px-2 pt-2 border-t border-panel-border/20">
                                        <div className="flex items-center gap-1 p-0.5 bg-foreground/5 rounded-full border border-panel-border/40">
                                            <button 
                                                onClick={() => setIsNeural(false)}
                                                className={clsx(
                                                    "flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold tracking-tight transition-all",
                                                    !isNeural ? "bg-accent text-white shadow-md" : "text-foreground/40 hover:text-foreground"
                                                )}
                                            >
                                                <Zap className="w-2.5 h-2.5" /> Lite
                                            </button>
                                            <button 
                                                onClick={() => setIsNeural(true)}
                                                className={clsx(
                                                    "flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold tracking-tight transition-all",
                                                    isNeural ? "bg-purple-500 text-white shadow-md" : "text-foreground/40 hover:text-foreground"
                                                )}
                                            >
                                                <Brain className="w-2.5 h-2.5" /> Neural
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-[8px] font-bold text-foreground/20 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                                {["Nvidia Earnings", "Best AI Laptops", "SpaceX Launch", "LLM Benchmarks"].map((s) => (
                                    <button 
                                        key={s}
                                        onClick={() => { setQuery(s); }}
                                        className="px-4 py-2 rounded-xl border border-panel-border hover:border-accent/40 bg-panel/30 text-[9px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground hover:bg-panel transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* RESULT STATE: Scrollable Results + Fixed Input */
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col h-full z-10"
                    >
                        {/* Header Branding */}
                        <div className="h-14 flex items-center justify-between px-6 border-b border-panel-border bg-background/50 backdrop-blur-xl shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-accent/10 rounded-lg">
                                    <Search className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <span className="text-[9px] font-bold tracking-tight opacity-40">Neural Search Intelligence</span>
                            </div>
                            <button 
                                onClick={() => { setActiveQuery(""); setQuery(""); }} 
                                className="px-3 py-1.5 bg-foreground/5 border border-panel-border rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all opacity-40 hover:opacity-100"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-12 scrollbar-hide no-scrollbar">
                            <div className="max-w-2xl mx-auto space-y-12">
                                {/* The Query */}
                                <h1 className="text-lg md:text-2xl font-semibold tracking-tight text-foreground leading-tight">
                                    {activeQuery}
                                </h1>

                                {/* Thinking Process */}
                                {thoughtSteps.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-foreground/20">
                                            <Brain className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-bold tracking-tight">Core Reasoning Flow</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {thoughtSteps.map((step, i) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i} 
                                                    className="flex items-center gap-4 group"
                                                >
                                                    <div className="w-1 h-1 rounded-full bg-accent/30 group-last:bg-accent group-last:animate-ping transition-all" />
                                                    <span className="text-[10px] md:text-[11px] font-medium text-foreground/40 group-last:text-foreground/70 transition-colors tracking-tight italic">{step}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Main Answer */}
                                {answer && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                        <div className="flex items-center gap-2 text-foreground/20">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-bold tracking-tight">Synthesized Insights</span>
                                        </div>
                                        <div className="prose prose-invert prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground max-w-none text-xs md:text-sm font-normal leading-[1.8] text-foreground/80 selection:bg-accent/30 tracking-tight">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {answer}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Corner Sources - Only after answer is done */}
                                        {!isSearching && sources.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-12 pt-8 border-t border-panel-border/30"
                                            >
                                                <div className="flex items-center gap-2 mb-4 text-foreground/20">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-bold tracking-tight">Verified Sources</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {sources.map((s, i) => (
                                                        <a 
                                                            href={s.url} 
                                                            target="_blank" 
                                                            key={i} 
                                                            className="flex items-center gap-3 p-3 bg-panel/30 border border-panel-border/40 rounded-xl hover:border-accent/40 hover:bg-panel/50 transition-all group overflow-hidden"
                                                        >
                                                            <div className="w-7 h-7 flex-shrink-0 bg-foreground/5 rounded-lg flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                                                <Globe className="w-3 h-3 text-foreground/20 group-hover:text-accent" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[9px] font-bold text-foreground/80 truncate group-hover:text-foreground">{s.title}</p>
                                                                <p className="text-[8px] font-medium text-foreground/20 truncate uppercase tracking-tighter">{s.url.split('/')[2] || 'Source'}</p>
                                                            </div>
                                                            <ChevronRight className="w-2.5 h-2.5 text-foreground/10 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {isSearching && (
                                    <div className="flex items-center gap-3 py-4 text-accent animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-[10px] font-bold tracking-tight">Synthesizing...</span>
                                    </div>
                                )}
                                
                                <div className="h-64" />
                            </div>
                        </div>

                        {/* Fixed Bottom Input Bar - Premium Pilled Transition */}
                        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-16 z-50 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
                            <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 pointer-events-auto">
                                <div className="w-full max-w-2xl relative group">
                                    <div className="absolute -inset-1 bg-accent/5 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative flex items-center bg-foreground/5 backdrop-blur-3xl border border-panel-border rounded-[2rem] px-6 py-2 transition-all duration-500 focus-within:border-accent/30 shadow-2xl">
                                        <input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }
                                            }}
                                            placeholder="Ask a follow-up query..."
                                            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-foreground/20 py-3.5 font-medium text-[14px] selection:bg-accent/30"
                                        />
                                        <button 
                                            onClick={() => handleSearch()}
                                            disabled={!query.trim() || isSearching}
                                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-accent text-white rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[8px] font-bold text-foreground/10 tracking-widest">
                                    {isNeural ? "Neural Core Active" : "Lite Engine Active"} • Super AI Network
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
