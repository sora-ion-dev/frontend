"use client";

import React, { useState, useEffect } from "react";
import { 
    X, Settings, Brain, Sparkles, Briefcase, 
    Monitor, ShieldCheck, Download, Zap, 
    Gauge, Thermometer, Layers, Check,
    Smartphone, Moon, Sun, AlertTriangle, Menu
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { MODEL_BRANDS } from "@/types";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userStatus?: any;
    sessionImages?: any[];
}

type Tab = "general" | "models" | "advanced" | "history";

export default function SettingsModal({ isOpen, onClose, userStatus, sessionImages = [] }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>("general");
    
    // AI Parameters
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(4096);
    const [language, setLanguage] = useState("English (US)");

    // Enabled Models State (Local)
    const [enabledModels, setEnabledModels] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Load AI Settings
        const savedTemp = localStorage.getItem("superai_temperature");
        const savedTokens = localStorage.getItem("superai_max_tokens");
        if (savedTemp) setTemperature(parseFloat(savedTemp));
        if (savedTokens) setMaxTokens(parseInt(savedTokens));

        // Load Enabled Models
        const savedModels = localStorage.getItem("superai_enabled_models");
        if (savedModels) setEnabledModels(JSON.parse(savedModels));
        else {
            const initial: Record<string, boolean> = {};
            MODEL_BRANDS.forEach(b => initial[b.id] = true);
            setEnabledModels(initial);
        }

    }, [isOpen]);

    const toggleModel = (id: string) => {
        const next = { ...enabledModels, [id]: !enabledModels[id] };
        setEnabledModels(next);
        localStorage.setItem("superai_enabled_models", JSON.stringify(next));
        window.dispatchEvent(new Event("settingsChanged"));
    };

    const saveAdvanced = () => {
        localStorage.setItem("superai_temperature", temperature.toString());
        localStorage.setItem("superai_max_tokens", maxTokens.toString());
        window.dispatchEvent(new Event("settingsChanged"));
    };


    if (!isOpen) return null;

    const tokenUsage = userStatus?.tokens_used || 0;
    const tokenLimit = 3000000;
    const usagePercent = Math.min((tokenUsage / tokenLimit) * 100, 100);
    const isOverLimit = tokenUsage >= tokenLimit;

    const tabs = [
        { id: "general", label: "General", icon: Smartphone },
        { id: "models", label: "Models", icon: Layers },
        { id: "advanced", label: "Advanced", icon: Zap },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-sm h-[75vh] flex flex-col overflow-hidden rounded-[2.5rem] animate-scale-in border border-panel-border bg-panel shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-panel-border bg-foreground/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/20 rounded-xl text-accent">
                            <Settings size={18} />
                        </div>
                        <h2 className="text-sm font-black tracking-tight text-foreground uppercase italic">Neural Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-foreground/10 text-foreground/40 transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-2 py-1 gap-1 bg-foreground/5 border-b border-panel-border">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-2xl transition-all ${isActive ? "bg-foreground/10 text-accent font-black shadow-sm" : "text-foreground/40 hover:text-foreground/60"}`}
                            >
                                <Icon size={14} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                    {activeTab === "general" && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section>
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-3 block text-center">Protocol Appearance</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setTheme("dark")} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-foreground/5 border-panel-border text-foreground/40'}`}>
                                        <Moon size={16} className="mb-2" />
                                        <span className="text-[10px] font-bold">Dark Mode</span>
                                    </button>
                                    <button onClick={() => setTheme("light")} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${theme === 'light' ? 'bg-accent/10 border-accent/20 text-accent shadow-sm shadow-accent/5' : 'bg-foreground/5 border-panel-border text-foreground/40'}`}>
                                        <Sun size={16} className="mb-2" />
                                        <span className="text-[10px] font-bold">Light Mode</span>
                                    </button>
                                </div>
                            </section>

                            <section>
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-3 block text-center">Linguistic Engine</label>
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full bg-foreground/5 border border-panel-border rounded-2xl px-4 py-3 text-[11px] font-bold text-foreground outline-none focus:border-accent/40 text-center"
                                >
                                    <option>English (Universal)</option>
                                    <option>Hindi (Localized)</option>
                                </select>
                            </section>
                        </div>
                    )}

                    {activeTab === "models" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Active Chat Stack</label>
                                    <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">Live Control</span>
                                </div>
                                <div className="space-y-1.5">
                                    {MODEL_BRANDS.map(model => (
                                        <div key={model.id} className="flex items-center justify-between p-2.5 bg-foreground/5 rounded-2xl border border-panel-border hover:border-accent/20 transition-all">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 bg-white rounded-lg p-1 flex items-center justify-center shadow-lg border border-panel-border">
                                                    <img src={model.logo} alt={model.name} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-[11px] font-black text-foreground/80 tracking-tight">{model.name}</span>
                                            </div>
                                            <button 
                                                onClick={() => toggleModel(model.id)}
                                                className={`w-9 h-4.5 rounded-full flex items-center px-0.5 transition-all ${enabledModels[model.id] ? 'bg-accent' : 'bg-foreground/10'}`}
                                            >
                                                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all ${enabledModels[model.id] ? 'translate-x-[1.125rem]' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "advanced" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Gauge size={14} className="text-accent" />
                                        <label className="text-[9px] font-black text-foreground/40 uppercase">Global Capacity</label>
                                    </div>
                                    <span className="text-[9px] font-bold text-foreground/30">{tokenUsage.toLocaleString()} / 3M</span>
                                </div>
                                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-red-500' : 'bg-accent'}`} 
                                        style={{ width: `${usagePercent}%` }} 
                                    />
                                </div>
                                {isOverLimit && (
                                    <div className="mt-2 flex items-center gap-1.5 text-red-400">
                                        <AlertTriangle size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Capacity Limit Reached (Warning)</span>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-5">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest italic">Neural Variance</label>
                                        <span className="text-[10px] font-bold text-accent">{temperature}</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="1.5" step="0.1" 
                                        value={temperature} 
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full h-1 accent-accent bg-foreground/5 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest italic">Inference Depth</label>
                                        <span className="text-[10px] font-bold text-accent">{maxTokens}</span>
                                    </div>
                                    <input 
                                        type="range" min="256" max="8192" step="128" 
                                        value={maxTokens} 
                                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                        className="w-full h-1 accent-accent bg-foreground/5 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                                
                                <button 
                                    onClick={saveAdvanced}
                                    className="w-full py-3.5 bg-accent text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                                >
                                    Apply Optimization
                                </button>
                            </section>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex items-center justify-center border-t border-panel-border bg-panel">
                    <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] italic">Super AI • Core Engine v9.0</p>
                </div>
            </div>
        </div>
    );
}
