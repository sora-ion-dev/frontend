"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Zap, Sparkles, Volume2, Settings2, History, MessageSquare, Shield, Globe } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

const useAudioVisualizer = (isActive: boolean) => {
    const [volume, setVolume] = useState(0);
    useEffect(() => {
        if (!isActive) { setVolume(0); return; }
        const interval = setInterval(() => setVolume(Math.random() * 100), 100);
        return () => clearInterval(interval);
    }, [isActive]);
    return volume;
};

export default function LiveMode() {
    const [mode, setMode] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [history, setHistory] = useState<{role: string, text: string}[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    
    const volume = useAudioVisualizer(mode === "listening" || mode === "speaking");
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event: any) => {
                const current = event.results[event.results.length - 1][0].transcript;
                setTranscript(current);
                if (event.results[event.results.length - 1].isFinal) handleUserQuery(current);
            };
            recognitionRef.current.onend = () => { if (mode === "listening") setMode("thinking"); };
        }
    }, [mode]);

    const startListening = () => { setTranscript(""); setAiResponse(""); setMode("listening"); recognitionRef.current?.start(); };
    const stopListening = () => { setMode("idle"); recognitionRef.current?.stop(); };

    const handleUserQuery = async (query: string) => {
        if (!query.trim()) return;
        setMode("thinking");
        try {
            const res = await fetch(`${BACKEND_URL}/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: query,
                    models: ["google/gemini-3.1-flash-live"],
                    user_email: "public-user",
                    personality: "normal"
                })
            });
            if (!res.ok) throw new Error("Connection failed");
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            setMode("speaking");
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.chunk) { fullText += data.chunk; setAiResponse(fullText); }
                            } catch (e) {}
                        }
                    }
                }
            }
            speak(fullText);
            setHistory(prev => [...prev, {role: "user", text: query}, {role: "assistant", text: fullText}]);
        } catch (e) { setAiResponse("Neural link disrupted..."); setMode("idle"); }
    };

    const speak = (text: string) => {
        if (isMuted) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setMode("idle");
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black pointer-events-none" />
            
            {/* Header */}
            <header className="relative z-10 p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <div className={`w-1.5 h-1.5 rounded-full ${mode !== "idle" ? "bg-blue-500 animate-pulse" : "bg-white/20"}`} />
                        <span className="text-[10px] font-medium tracking-wider text-white/60">Neural Link Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10" onClick={() => window.location.reload()}>
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* Immersive Space */}
            <main className="flex-1 flex flex-col items-center justify-center relative">
                
                {/* Perplexity-style Geometric Globe */}
                <div className="relative flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="relative flex items-center justify-center w-80 h-80"
                        >
                            {/* Outer Rings */}
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        rotateZ: 360,
                                        rotateX: [0, 45, 0],
                                        scale: 1 + (volume / 400)
                                    }}
                                    transition={{ 
                                        rotateZ: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                                        rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                        scale: { duration: 0.1 }
                                    }}
                                    className="absolute inset-0 border border-white/10 rounded-full"
                                    style={{ borderStyle: i % 2 === 0 ? 'dashed' : 'solid', opacity: 0.2 + (i * 0.1) }}
                                />
                            ))}

                            {/* Core Glow */}
                            <div className="absolute inset-10 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 blur-[60px] opacity-20 rounded-full animate-pulse" />
                            
                            {/* Inner Geometric Sphere */}
                            <motion.div 
                                animate={{ 
                                    scale: 1 + (volume / 200),
                                    rotateY: mode === "thinking" ? 360 : 0
                                }}
                                transition={{ 
                                    rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 0.1 }
                                }}
                                className="w-48 h-48 rounded-full border border-white/20 relative z-10 flex items-center justify-center backdrop-blur-sm"
                            >
                                <div className="absolute inset-0 bg-white/5 rounded-full" />
                                <div className="relative z-20">
                                    {mode === "idle" && <Globe size={40} className="text-white/20" />}
                                    {mode === "thinking" && <Sparkles size={40} className="text-blue-400 animate-pulse" />}
                                    {mode === "listening" && <div className="flex gap-1.5">
                                        {[1,2,3,4].map(i => <motion.div key={i} animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.6, delay: i*0.1 }} className="w-1 bg-blue-400 rounded-full" />)}
                                    </div>}
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Captions */}
                    <div className="absolute -bottom-40 left-0 right-0 text-center max-w-xl mx-auto px-4">
                        <AnimatePresence mode="wait">
                            {transcript && (
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-lg font-medium text-white/40 leading-relaxed">
                                    {transcript}
                                </motion.p>
                            )}
                            {aiResponse && (
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-semibold text-white leading-relaxed tracking-tight">
                                    {aiResponse}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-12 flex flex-col items-center gap-8">
                <div className="flex items-center gap-8">
                    <button className={`w-12 h-12 flex items-center justify-center rounded-full border border-white/10 transition-all ${isMuted ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/40"}`} onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <MicOff size={20}/> : <Volume2 size={20}/>}
                    </button>
                    
                    <button onClick={mode === "idle" ? startListening : stopListening} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${mode === "listening" ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.3)]" : "bg-white text-black hover:scale-105"}`}>
                        {mode === "listening" ? <X size={32} /> : <Mic size={32} />}
                    </button>

                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 transition-all">
                        <MessageSquare size={20}/>
                    </button>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">Gemini 3.1 Flash Lite</div>
                    <div className="flex items-center gap-4 text-[9px] font-medium text-white/10">
                        <span className="flex items-center gap-1.5"><Shield size={10}/> Encrypted Connection</span>
                        <span className="flex items-center gap-1.5"><Globe size={10}/> Global Nodes Active</span>
                    </div>
                </div>
            </footer>

            <style>{`
                main { perspective: 1000px; }
            `}</style>
        </div>
    );
}
