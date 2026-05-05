"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Zap, Sparkles, Volume2, Settings2, History, MessageSquare, ShieldCheck, Globe } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

// --- HELPERS ---
const useAudioVisualizer = (isListening: boolean, isSpeaking: boolean) => {
    const [volume, setVolume] = useState(0);
    
    useEffect(() => {
        if (!isListening && !isSpeaking) {
            setVolume(0);
            return;
        }

        const interval = setInterval(() => {
            // Simulate volume fluctuations for the orb
            setVolume(Math.random() * 100);
        }, 100);

        return () => clearInterval(interval);
    }, [isListening, isSpeaking]);

    return volume;
};

export default function LiveMode() {
    const [mode, setMode] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [history, setHistory] = useState<{role: string, text: string}[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    
    const volume = useAudioVisualizer(mode === "listening", mode === "speaking");
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const current = event.results[event.results.length - 1][0].transcript;
                setTranscript(current);
                if (event.results[event.results.length - 1].isFinal) {
                    handleUserQuery(current);
                }
            };

            recognitionRef.current.onend = () => {
                if (mode === "listening") {
                    setMode("thinking");
                }
            };
        }
    }, [mode]);

    const startListening = () => {
        setTranscript("");
        setAiResponse("");
        setMode("listening");
        recognitionRef.current?.start();
    };

    const stopListening = () => {
        setMode("idle");
        recognitionRef.current?.stop();
    };

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
                                if (data.chunk) {
                                    fullText += data.chunk;
                                    setAiResponse(fullText);
                                }
                            } catch (e) {}
                        }
                    }
                }
            }
            
            // Speak the response
            speak(fullText);
            setHistory(prev => [...prev, {role: "user", text: query}, {role: "assistant", text: fullText}]);
            
        } catch (e) {
            setAiResponse("Connection lost. Retrying neural link...");
            setMode("idle");
        }
    };

    const speak = (text: string) => {
        if (isMuted) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.onend = () => setMode("idle");
        window.speechSynthesis.speak(utterance);
    };

    const orbColors = useMemo(() => {
        switch (mode) {
            case "listening": return "from-blue-400 via-cyan-400 to-blue-600";
            case "thinking": return "from-purple-500 via-fuchsia-500 to-indigo-600 animate-pulse";
            case "speaking": return "from-emerald-400 via-teal-400 to-blue-500";
            default: return "from-gray-800 via-gray-900 to-black";
        }
    }, [mode]);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col font-sans overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />
            
            {/* Header */}
            <header className="relative z-10 p-8 flex items-center justify-between backdrop-blur-md bg-black/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                        <div className={`w-2 h-2 rounded-full ${mode !== "idle" ? "bg-red-500 animate-pulse" : "bg-white/20"}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Link: Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                        <Globe size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Region: IAD-1</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button className="text-white/40 hover:text-white transition-colors"><Settings2 size={20}/></button>
                    <button className="text-white/40 hover:text-white transition-colors"><History size={20}/></button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10" onClick={() => window.location.reload()}>
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Main Immersive Space */}
            <main className="flex-1 flex flex-col items-center justify-center relative px-8">
                
                {/* Central Orb */}
                <div className="relative flex items-center justify-center w-full h-full max-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="relative flex items-center justify-center"
                        >
                            {/* Layered Glows */}
                            <div className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${orbColors} blur-[80px] opacity-40 animate-slow-pan`} />
                            <div className={`absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br ${orbColors} blur-[40px] opacity-60`} />
                            
                            {/* The Real Orb */}
                            <motion.div 
                                animate={{ 
                                    scale: 1 + (volume / 200),
                                    rotate: mode === "thinking" ? 360 : 0
                                }}
                                transition={{ 
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 0.1 }
                                }}
                                className={`w-64 h-64 rounded-full bg-gradient-to-tr ${orbColors} shadow-[0_0_100px_rgba(59,130,246,0.5)] border border-white/20 relative z-10 flex items-center justify-center overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                                <div className="relative z-20">
                                    {mode === "idle" && <Zap size={60} className="text-white/20 fill-white/10" />}
                                    {mode === "thinking" && <Sparkles size={60} className="text-white animate-pulse" />}
                                    {mode === "listening" && <div className="flex gap-2">
                                        {[1,2,3].map(i => <motion.div key={i} animate={{ height: [10, 40, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }} className="w-2 bg-white rounded-full" />)}
                                    </div>}
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Captions / Subtitles Overlay */}
                    <div className="absolute bottom-10 left-0 right-0 text-center max-w-2xl mx-auto space-y-4">
                        <AnimatePresence>
                            {transcript && (
                                <motion.p 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-xl font-medium text-white/60 tracking-tight italic"
                                >
                                    "{transcript}"
                                </motion.p>
                            )}
                            {aiResponse && (
                                <motion.p 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-2xl font-bold text-white tracking-tight leading-snug"
                                >
                                    {aiResponse}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="relative z-10 p-12 flex flex-col items-center gap-8">
                <div className="flex items-center gap-12">
                    <button className={`p-4 rounded-full transition-all border border-white/10 ${isMuted ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white/60 hover:text-white"}`} onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <MicOff size={24}/> : <Volume2 size={24}/>}
                    </button>
                    
                    <button 
                        onClick={mode === "idle" ? startListening : stopListening}
                        className={`group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${mode === "listening" ? "bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "bg-white hover:scale-105"}`}
                    >
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                        {mode === "listening" ? <X size={40} className="text-white" /> : <Mic size={40} className="text-black" />}
                    </button>

                    <button className="p-4 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
                        <MessageSquare size={24}/>
                    </button>
                </div>
                
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <span className="flex items-center gap-2"><ShieldCheck size={12}/> Quantum Encrypted</span>
                    <span className="flex items-center gap-2"><Sparkles size={12}/> Gemini 3.1 Neural</span>
                </div>
            </footer>

            <style>{`
                @keyframes slow-pan {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-slow-pan {
                    background-size: 200% 200%;
                    animation: slow-pan 10s ease infinite;
                }
            `}</style>
        </div>
    );
}
