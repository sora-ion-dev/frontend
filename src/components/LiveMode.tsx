"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Zap, Sparkles, Volume2, Settings2, History, MessageSquare, Shield, Globe, ChevronUp, Check } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

const useVoices = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);
    return voices;
};

export default function LiveMode() {
    const [mode, setMode] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [showVoiceSelect, setShowVoiceSelect] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<string>("");
    
    const voices = useVoices();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Filter to some "good" voices
    const filteredVoices = useMemo(() => {
        return voices.filter(v => v.lang.startsWith('en')).slice(0, 8);
    }, [voices]);

    useEffect(() => {
        if (!selectedVoice && filteredVoices.length > 0) {
            setSelectedVoice(filteredVoices[0].name);
        }
    }, [filteredVoices, selectedVoice]);

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
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, aiResponse]);

    const startListening = () => { setTranscript(""); setAiResponse(""); setMode("listening"); recognitionRef.current?.start(); };
    const stopListening = () => { setMode("idle"); recognitionRef.current?.stop(); };

    const handleUserQuery = async (query: string) => {
        if (!query.trim()) return;
        setMode("thinking");
        setMessages(prev => [...prev, {role: "user", text: query}]);
        
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
            setMessages(prev => [...prev, {role: "assistant", text: fullText}]);
            setAiResponse("");
        } catch (e) { setMode("idle"); }
    };

    const speak = (text: string, voiceName?: string) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.name === (voiceName || selectedVoice));
        if (voice) utterance.voice = voice;
        utterance.rate = 1.1;
        utterance.onend = () => { if (!voiceName) setMode("idle"); };
        window.speechSynthesis.speak(utterance);
    };

    const handleVoiceChange = (voiceName: string) => {
        setSelectedVoice(voiceName);
        setShowVoiceSelect(false);
        // Preview the new voice
        speak("Hello, this is my new voice.", voiceName);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
            {/* Background Ambient Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-[150px] opacity-20 rounded-full transition-colors duration-1000 ${
                mode === "listening" ? "bg-blue-600" : mode === "thinking" ? "bg-purple-600" : mode === "speaking" ? "bg-emerald-600" : "bg-white/5"
            }`} />

            {/* Header */}
            <header className="relative z-20 p-6 flex items-center justify-between backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Neural Link v3.1</h1>
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Active Session • Secure</p>
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10">
                    <X size={20} />
                </button>
            </header>

            {/* Main Immersive Area */}
            <main className="flex-1 flex flex-col items-center relative overflow-hidden">
                
                {/* Globe Section - Fixed at Top/Center */}
                <div className="h-[40%] flex items-center justify-center relative w-full pt-10">
                    <div className="relative w-64 h-64">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                {/* Liquid Plasma Layers */}
                                <motion.div 
                                    animate={{ 
                                        rotate: 360,
                                        scale: mode !== "idle" ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                                    className={`absolute inset-0 rounded-full blur-[40px] opacity-40 mix-blend-screen bg-gradient-to-tr ${
                                        mode === "listening" ? "from-blue-400 to-cyan-400" : 
                                        mode === "thinking" ? "from-purple-500 to-indigo-600" : 
                                        mode === "speaking" ? "from-emerald-400 to-teal-500" : "from-white/10 to-transparent"
                                    }`}
                                />
                                
                                {/* Geometric Core */}
                                <div className="relative w-48 h-48 rounded-full border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-md">
                                    <div className="absolute inset-0 bg-white/5" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Dynamic Waveform Ring */}
                                        <svg className="w-full h-full rotate-90">
                                            <motion.circle
                                                cx="50%" cy="50%" r="45%"
                                                fill="none" stroke="currentColor"
                                                strokeWidth="1" strokeDasharray="10 5"
                                                className="text-white/20"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            />
                                        </svg>
                                    </div>
                                    <div className="relative z-10">
                                        <AnimatePresence mode="wait">
                                            {mode === "idle" && <motion.div key="i"><Globe size={48} className="text-white/20" /></motion.div>}
                                            {mode === "listening" && <motion.div key="l" className="flex gap-1">
                                                {[1,2,3,4,5].map(i => <motion.div key={i} animate={{ height: [8, 32, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }} className="w-1 bg-blue-400 rounded-full" />)}
                                            </motion.div>}
                                            {mode === "thinking" && <motion.div key="t" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles size={48} className="text-blue-400" /></motion.div>}
                                            {mode === "speaking" && <motion.div key="s" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Volume2 size={48} className="text-emerald-400" /></motion.div>}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Conversation Stream - Scrolling Area Below Globe */}
                <div className="flex-1 w-full max-w-2xl px-6 pb-40 overflow-y-auto scroll-smooth scrollbar-hide">
                    <div className="space-y-6 pt-10">
                        {messages.map((m, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                            >
                                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                                    m.role === "user" ? "bg-white/10 text-white/80 rounded-tr-none" : "bg-blue-600/10 border border-blue-500/20 text-white rounded-tl-none"
                                }`}>
                                    {m.text}
                                </div>
                            </motion.div>
                        ))}
                        {aiResponse && (
                            <div className="flex flex-col items-start">
                                <div className="max-w-[85%] px-5 py-3 rounded-2xl text-sm font-semibold text-blue-400 bg-blue-400/5 border border-blue-400/20 rounded-tl-none">
                                    {aiResponse}
                                    <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse" />
                                </div>
                            </div>
                        )}
                        {transcript && (
                            <div className="flex flex-col items-end opacity-40 italic">
                                <div className="text-xs font-medium">{transcript}</div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>
            </main>

            {/* Floating Controls Area */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-30 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
                    
                    {/* Voice Selection Popover */}
                    <AnimatePresence>
                        {showVoiceSelect && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="w-full bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden mb-2 max-h-48 overflow-y-auto"
                            >
                                <div className="p-3 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">Select AI Voice</div>
                                {filteredVoices.map((v) => (
                                    <button 
                                        key={v.name} 
                                        onClick={() => handleVoiceChange(v.name)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-xs hover:bg-white/5 transition-all"
                                    >
                                        <span className={selectedVoice === v.name ? "text-blue-400 font-bold" : "text-white/60"}>{v.name}</span>
                                        {selectedVoice === v.name && <Check size={14} className="text-blue-400" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-8 w-full justify-center">
                        <button 
                            onClick={() => setShowVoiceSelect(!showVoiceSelect)}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all relative"
                        >
                            <Settings2 size={20} />
                            <ChevronUp size={12} className={`absolute -top-1 right-0 transition-transform ${showVoiceSelect ? "rotate-180" : ""}`} />
                        </button>

                        <button 
                            onClick={mode === "idle" ? startListening : stopListening}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                                mode === "listening" ? "bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "bg-white text-black hover:scale-105"
                            }`}
                        >
                            {mode === "listening" ? <X size={40} /> : <Mic size={40} />}
                        </button>

                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full border border-white/10 transition-all ${isMuted ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white/60"}`}
                        >
                            {isMuted ? <MicOff size={20}/> : <Volume2 size={20}/>}
                        </button>
                    </div>

                    <div className="flex items-center gap-6 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        <span className="flex items-center gap-1.5"><Shield size={12}/> Secure Link</span>
                        <span className="flex items-center gap-1.5"><Sparkles size={12}/> Gemini 3.1 Neural</span>
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
