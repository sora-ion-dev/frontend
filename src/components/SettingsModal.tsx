"use client";

import React, { useState, useEffect } from "react";
import { 
    X, Settings, Brain, Key, Monitor, 
    Check, ExternalLink, ShieldCheck,
    Code, Sparkles, Briefcase, BarChart4, Globe,
    Sun, Moon
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = "general" | "ai" | "profile";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
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
        { id: "ai", label: "AI Preferences", icon: Sparkles },
        { id: "profile", label: "Profile", icon: Briefcase },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[80vh] flex overflow-hidden rounded-[2.5rem] animate-scale-in duration-500 shadow-3xl border border-white/5 bg-[#0a0a0a]">
                
                {/* Sidebar Navigation */}
                <div className="w-72 flex flex-col p-8 border-r border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                            <Brain size={24} />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Fiesta Pro</h2>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive ? "bg-white text-black font-black uppercase tracking-widest text-[10px]" : "hover:bg-white/5 text-muted font-bold text-[11px] uppercase tracking-widest"}`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto p-6 bg-accent/5 rounded-[2rem] border border-accent/10">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-accent tracking-widest">Neural Sync Optimized</span>
                        </div>
                    </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 flex flex-col bg-[#111111]">
                    <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/20">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 ml-4">Configuration Core</h3>
                        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-muted transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        {activeTab === "general" && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <h4 className="text-4xl font-black mb-4 tracking-tighter">General Params</h4>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">System-wide interface and neural protocol settings</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-xs uppercase tracking-widest mb-1">Appearance Mode</p>
                                            <p className="text-[10px] text-white/30 font-bold">Customize the visual theme of the neural interface</p>
                                        </div>
                                        <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
                                            {[
                                                { name: 'Light', icon: Sun, value: 'light' },
                                                { name: 'Dark', icon: Moon, value: 'dark' }
                                            ].map(m => (
                                                <button 
                                                    key={m.value} 
                                                    onClick={() => setTheme(m.value as any)}
                                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${theme === m.value ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    <m.icon size={12} />
                                                    {m.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-xs uppercase tracking-widest mb-1">Interface Language</p>
                                            <p className="text-[10px] text-white/30 font-bold">Primary localization for synthetic responses</p>
                                        </div>
                                        <select className="bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 outline-none text-white appearance-none cursor-pointer">
                                            <option>English (Global)</option>
                                            <option>Hindi (Localized)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "ai" && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <h4 className="text-4xl font-black mb-4 tracking-tighter">AI Preferences</h4>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Rank and prioritize your 15-model neural cluster</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { name: 'GPT-4o Pro', brand: 'OpenAI', toggle: true },
                                        { name: 'Claude 3.5 Sonnet', brand: 'Anthropic', toggle: true },
                                        { name: 'DeepSeek R1', brand: 'DeepSeek', toggle: false },
                                        { name: 'Moonshot Kimi K2', brand: 'Moonshot AI', toggle: true },
                                    ].map((m, i) => (
                                        <div key={m.name} className="p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-accent/20 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="text-white/20 group-hover:text-accent transition-colors">
                                                    <div className="grid grid-cols-2 gap-0.5">
                                                        <div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" />
                                                        <div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" />
                                                        <div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" />
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-white rounded-xl p-2 flex items-center justify-center">
                                                    <span className="text-black font-black text-xs">{m.name[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs uppercase tracking-widest leading-none mb-1">{m.name}</p>
                                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">{m.brand} • Distributed Link</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <select className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/40 outline-none border-b border-white/10 pb-1">
                                                    <option>v1.5 Pro</option>
                                                    <option>Turbo Flux</option>
                                                </select>
                                                <button className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${m.toggle ? 'bg-accent' : 'bg-white/10'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${m.toggle ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <h4 className="text-4xl font-black mb-4 tracking-tighter">Identity Core</h4>
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Manage your neural identity and authentication</p>
                                </div>

                                <div className="p-10 bg-black/40 border border-white/5 rounded-[3rem] flex items-center gap-8">
                                    <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-accent/20">
                                        JD
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-2xl font-black text-white mb-1">John Doe</h5>
                                        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mb-4">Pro Architect • ID: 7749-SX</p>
                                        <div className="flex gap-3">
                                            <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Edit ID</button>
                                            <button className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Revoke Access</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 flex justify-end bg-black/20">
                        <button onClick={onClose} className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5">
                            Update Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
