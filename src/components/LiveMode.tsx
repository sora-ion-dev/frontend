"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Zap, Sparkles, Volume2, Shield, Globe, MessageSquare } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

export default function LiveMode() {
    const [mode, setMode] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
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

    const speak = (text: string) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.onend = () => setMode("idle");
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="relative z-20 p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Live Mode</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Neural Link Active</p>
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10">
                    <X size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center relative overflow-hidden">
                {/* Globe Section */}
                <div className="h-[40%] flex items-center justify-center relative w-full pt-10">
                    <div className="relative w-64 h-64">
                        <AnimatePresence mode="wait">
                            <motion.div key={mode} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={`absolute inset-0 rounded-full blur-[40px] opacity-40 mix-blend-screen bg-gradient-to-tr ${
                                    mode === "listening" ? "from-blue-400 to-cyan-400" : 
                                    mode === "thinking" ? "from-purple-500 to-indigo-600" : 
                                    mode === "speaking" ? "from-emerald-400 to-teal-500" : "from-white/10 to-transparent"
                                }`} />
                                <div className="relative w-48 h-48 rounded-full border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-md">
                                    <div className="absolute inset-0 bg-white/5" />
                                    <div className="relative z-10">
                                        <AnimatePresence mode="wait">
                                            {mode === "idle" && <Globe size={48} className="text-white/20" />}
                                            {mode === "listening" && <div className="flex gap-1">
                                                {[1,2,3,4,5].map(i => <motion.div key={i} animate={{ height: [8, 32, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }} className="w-1 bg-blue-400 rounded-full" />)}
                                            </div>}
                                            {mode === "thinking" && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles size={48} className="text-blue-400" /></motion.div>}
                                            {mode === "speaking" && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Volume2 size={48} className="text-emerald-400" /></motion.div>}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Conversation Stream */}
                <div className="flex-1 w-full max-w-2xl px-6 pb-40 overflow-y-auto scroll-smooth scrollbar-hide">
                    <div className="space-y-6 pt-10">
                        {messages.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
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
                        {transcript && <div className="flex flex-col items-end opacity-40 italic text-xs">{transcript}</div>}
                        <div ref={chatEndRef} />
                    </div>
                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="max-w-md mx-auto flex items-center justify-center gap-12">
                    <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <MessageSquare size={24} />
                    </button>
                    <button onClick={mode === "idle" ? startListening : stopListening} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                        mode === "listening" ? "bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "bg-white text-black hover:scale-105"
                    }`}>
                        {mode === "listening" ? <X size={40} /> : <Mic size={40} />}
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full border border-white/10 transition-all ${isMuted ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white/60"}`}>
                        {isMuted ? <MicOff size={24}/> : <Volume2 size={24}/>}
                    </button>
                </div>
            </footer>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
