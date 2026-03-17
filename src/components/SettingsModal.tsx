"use client";

import React, { useState, useEffect } from "react";
import { 
    X, Settings, Brain, Key, Monitor, 
    Check, ExternalLink, ShieldCheck,
    Code, Sparkles, Briefcase, BarChart4, Globe
} from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = "general" | "appearance" | "intelligence" | "keys";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [persona, setPersona] = useState("Professional");
    const [webSearch, setWebSearch] = useState(false);
    const [language, setLanguage] = useState("English (US)");

    // load from localStorage on mount
    useEffect(() => {
        const savedPersona = localStorage.getItem("superai_persona");
        const savedWebSearch = localStorage.getItem("superai_websearch") === "true";
        const savedLanguage = localStorage.getItem("superai_language");

        if (savedPersona) setPersona(savedPersona);
        setWebSearch(savedWebSearch);
        if (savedLanguage) setLanguage(savedLanguage);
    }, []);

    // save to localStorage on change
    const updatePersona = (p: string) => {
        setPersona(p);
        localStorage.setItem("superai_persona", p);
        window.dispatchEvent(new Event("settingsChanged"));
    };

    const toggleWebSearch = () => {
        const newState = !webSearch;
        setWebSearch(newState);
        localStorage.setItem("superai_websearch", String(newState));
        window.dispatchEvent(new Event("settingsChanged"));
    };

    const updateLanguage = (l: string) => {
        setLanguage(l);
        localStorage.setItem("superai_language", l);
        window.dispatchEvent(new Event("settingsChanged"));
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "intelligence", label: "AI Intelligence", icon: Brain },
        { id: "keys", label: "API Keys", icon: Key },
    ];

    const personas = [
        { id: "Coding Expert", icon: Code, desc: "Technical, precise, and logic-driven" },
        { id: "Creative Spark", icon: Sparkles, desc: "Imaginative, poetic, and boundary-pushing" },
        { id: "Professional", icon: Briefcase, desc: "Balanced, formal, and efficient" },
        { id: "Deep Analyst", icon: BarChart4, desc: "Research-heavy and multi-perspective" }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl h-[700px] flex overflow-hidden glass-panel rounded-[3rem] animate-scale-in duration-500 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-2 border-panel-border bg-black/90">
                
                {/* Sidebar */}
                <div className="w-72 flex flex-col p-8 border-r-2 border-white/5 bg-white/5">
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="p-3 bg-accent/20 rounded-2xl text-accent shadow-lg shadow-accent/20">
                            <Settings size={24} className="animate-spin-slow" />
                        </div>
                        <h2 className="font-black text-2xl tracking-tighter uppercase italic">Control</h2>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {[
                            { id: "general", label: "General", icon: Settings },
                            { id: "intelligence", label: "AI Intelligence", icon: Brain },
                            { id: "keys", label: "API Keys", icon: Key },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-xs font-black uppercase tracking-widest ${
                                        isActive 
                                        ? "bg-accent text-white shadow-2xl shadow-accent/40 scale-105" 
                                        : "hover:bg-white/5 text-muted"
                                    }`}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto px-4 py-6 rounded-3xl bg-accent/5 border border-accent/10">
                        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-accent mb-3">Neural Status</p>
                        <div className="flex items-center gap-3 text-[10px] text-foreground font-black uppercase tracking-tighter">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            Core Link Optimal
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    <div className="p-6 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="p-3 rounded-2xl transition-all duration-300 active:scale-90 hover:bg-white/5 text-muted hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto hide-scrollbar p-12 pt-0">
                        {activeTab === "general" && (
                            <div className="space-y-10 animate-fade-in">
                                <div>
                                    <h3 className="text-4xl font-black mb-3 tracking-tighter uppercase">General Params</h3>
                                    <p className="text-muted text-sm font-bold uppercase tracking-widest leading-relaxed">System architecture and local configurations</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="p-6 rounded-[2rem] glass-thin border-2 border-panel-border flex items-center justify-between group hover:border-accent/30 transition-all">
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-widest mb-1">UI Language</p>
                                            <p className="text-xs text-muted font-bold">Localization protocol for neural interface</p>
                                        </div>
                                        <select 
                                            value={language}
                                            onChange={(e) => updateLanguage(e.target.value)}
                                            className="bg-foreground/5 p-3 px-6 rounded-2xl text-xs font-black uppercase tracking-widest border-none outline-none cursor-pointer focus:ring-2 ring-accent/20 transition-all text-white"
                                        >
                                            <option>English (US)</option>
                                            <option>Hindi (Beta)</option>
                                            <option>Español</option>
                                            <option>日本語</option>
                                        </select>
                                    </div>
                                    <div className="p-6 rounded-[2rem] glass-thin border-2 border-panel-border flex items-center justify-between group hover:border-accent/30 transition-all">
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-widest mb-1">Entity Synchronization</p>
                                            <p className="text-xs text-muted font-bold">Current account authority level</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-5 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-accent/20">Pro Architect</span>
                                            <span className="text-[10px] font-black text-green-500 uppercase">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "intelligence" && (
                            <div className="space-y-10 animate-fade-in">
                                <div>
                                    <h3 className="text-4xl font-black mb-3 tracking-tighter uppercase">AI Persona</h3>
                                    <p className="text-muted text-sm font-bold uppercase tracking-widest leading-relaxed">Cognitive personality frameworks and data access</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 rounded-[2.5rem] glass-thin border-2 border-panel-border space-y-6">
                                        <p className="font-black text-xs uppercase tracking-[0.3em] text-accent">Personality Matrix</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {personas.map((p) => {
                                                const Icon = p.icon;
                                                const isActive = persona === p.id;
                                                return (
                                                    <button 
                                                        key={p.id} 
                                                        onClick={() => updatePersona(p.id)}
                                                        className={`flex flex-col gap-3 p-6 rounded-3xl transition-all duration-300 text-left border-2 group ${
                                                            isActive 
                                                            ? "bg-accent/10 border-accent shadow-xl" 
                                                            : "bg-foreground/5 border-transparent hover:border-panel-border"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className={`p-3 rounded-xl transition-all ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-foreground/10 text-muted group-hover:text-foreground'}`}>
                                                                <Icon size={20} />
                                                            </div>
                                                            {isActive && <Check size={16} className="text-accent" />}
                                                        </div>
                                                        <div>
                                                            <p className={`font-black text-xs uppercase tracking-tight mb-1 ${isActive ? 'text-accent' : 'text-foreground'}`}>{p.id}</p>
                                                            <p className="text-[10px] text-muted font-bold leading-tight">{p.desc}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div 
                                        onClick={toggleWebSearch}
                                        className={`p-8 rounded-[2.5rem] glass-thin border-2 flex items-center justify-between cursor-pointer group transition-all duration-500 ${webSearch ? 'border-accent shadow-2xl shadow-accent/10' : 'border-panel-border hover:border-accent/20'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`p-5 rounded-[1.5rem] transition-all duration-500 ${webSearch ? 'bg-accent text-white shadow-2xl shadow-accent/40 rotate-12 scale-110' : 'bg-foreground/10 text-muted grayscale'}`}>
                                                <Globe size={28} className={webSearch ? 'animate-spin-slow' : ''} />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg uppercase tracking-widest mb-1">Global Web Insight</p>
                                                <p className="text-xs text-muted font-bold uppercase tracking-tighter">Real-time data fetching via Tavily Neural Network</p>
                                            </div>
                                        </div>
                                        <div className={`w-16 h-8 rounded-full flex items-center px-1.5 transition-all duration-500 ${webSearch ? 'bg-accent shadow-lg shadow-accent/40' : 'bg-foreground/10'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-xl ${webSearch ? 'translate-x-8' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "keys" && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-4xl font-black mb-3 tracking-tighter uppercase">Neural Keys</h3>
                                        <p className="text-muted text-sm font-bold uppercase tracking-widest leading-relaxed">Secure protocol access to AI distributed clusters</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        <ShieldCheck size={18} />
                                        Hardware Level Encryption
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { name: "Groq LPU Interface", status: "Validated" },
                                        { name: "NVIDIA NIM Core", status: "Active" },
                                        { name: "Tavily Search Engine", status: "Synced" }
                                    ].map((k) => (
                                        <div key={k.name} className="p-8 rounded-[2.5rem] glass-thin border-2 border-panel-border group hover:border-accent/30 transition-all space-y-5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <p className="font-black text-xs uppercase tracking-[0.2em] group-hover:text-accent transition-all">{k.name}</p>
                                                <span className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">{k.status}</p>
                                                </span>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 relative group/key">
                                                    <input 
                                                        type="password" 
                                                        value="x-superai-neural-protocol-key-shielded-x" 
                                                        readOnly
                                                        className="w-full bg-foreground/5 p-4 pl-6 rounded-2xl text-[10px] font-mono border-2 border-panel-border outline-none tracking-[0.5em] focus:border-accent transition-all" 
                                                    />
                                                </div>
                                                <button className="px-8 py-4 bg-foreground/10 hover:bg-accent hover:text-white rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-widest shadow-xl active:scale-95">
                                                    Update Identity
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
