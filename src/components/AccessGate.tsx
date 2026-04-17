"use client";

import { useState, useEffect } from "react";
import { Shield, Sparkles, Zap, Lock as LockIcon, ArrowRight, Info } from "lucide-react";

interface AccessGateProps {
    onAuthorized: () => void;
}

export default function AccessGate({ onAuthorized }: AccessGateProps) {
    const [key, setKey] = useState("");
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        setTimeout(() => {
            if (key === "2103") {
                localStorage.setItem("superai_authorized", "true");
                onAuthorized();
            } else {
                setError(true);
                setIsLoading(false);
            }
        }, 800);
    };

    const handleFreeAccess = () => {
        localStorage.setItem("superai_authorized", "false");
        onAuthorized();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden font-sans">
            {/* Immersive Atmospheric Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
            
            <div className="relative w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-700">
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 mx-auto bg-panel border border-panel-border rounded-3xl flex items-center justify-center shadow-2xl">
                        <Shield className="w-10 h-10 text-accent" />
                    </div>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">SUPER AI</h1>
                <p className="text-sm text-foreground/40 font-medium mb-8 uppercase tracking-widest">Quantum Access Protocol</p>

                <div className="glass-panel p-8 rounded-[2.5rem] relative group border-panel-border/40">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="text-left space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Encryption Key</label>
                            <div className="relative">
                                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 w-4 h-4" />
                                <input
                                    type="password"
                                    placeholder="••••"
                                    className={`w-full bg-foreground/5 border ${error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-panel-border'} rounded-2xl pl-12 pr-4 py-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-accent/40 transition-all placeholder:tracking-normal placeholder:text-[10px]`}
                                    value={key}
                                    onChange={(e) => { setKey(e.target.value); setError(false); }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!key || isLoading}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-foreground text-background rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl"
                        >
                            {isLoading ? "Deciphering..." : "UNLOCK ACCESS"}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-panel-border/40 flex flex-col gap-4">
                        <button 
                            onClick={handleFreeAccess}
                            className="text-xs font-bold text-foreground/40 hover:text-accent transition-colors flex items-center justify-center gap-2 group"
                        >
                            Don't have access? Use limited free mode
                            <Sparkles className="w-3.5 h-3.5 group-hover:animate-spin" />
                        </button>
                    </div>
                </div>

                {/* Restricted Features List */}
                <div className="mt-12 grid grid-cols-2 gap-3 opacity-30">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-panel-border bg-panel/50">
                        <Zap size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Unlimited Messages</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-panel-border bg-panel/50">
                        <Shield size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Pro AI Models</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
