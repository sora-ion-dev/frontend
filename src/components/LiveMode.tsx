"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Zap, Sparkles, Volume2, Settings2, Shield, Globe, Power } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

// --- AUDIO HELPERS ---
const base64ToUint8Array = (base64: string) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

export default function LiveMode() {
    const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
    const [mode, setMode] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueue = useRef<Uint8Array[]>([]);
    const isPlaying = useRef(false);

    // Initialize Audio Context
    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
    };

    // Play next chunk in queue
    const playNextChunk = async () => {
        if (audioQueue.current.length === 0 || isPlaying.current) return;
        isPlaying.current = true;
        setMode("speaking");

        const chunk = audioQueue.current.shift()!;
        try {
            const audioBuffer = await audioContextRef.current!.decodeAudioData(chunk.buffer as ArrayBuffer);
            const source = audioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current!.destination);
            source.onended = () => {
                isPlaying.current = false;
                if (audioQueue.current.length === 0) setMode("idle");
                playNextChunk();
            };
            source.start();
        } catch (e) {
            isPlaying.current = false;
            playNextChunk();
        }
    };

    const connectToLive = async () => {
        initAudio();
        setStatus("connecting");
        
        // We fetch the API key from backend to keep it secure
        try {
            const keyRes = await fetch(`${BACKEND_URL}/config/keys`);
            const { gemini_key } = await keyRes.json();
            
            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${gemini_key}`;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus("connected");
                // Send Setup Message
                const setup = {
                    setup: {
                        model: "models/gemini-1.5-flash-8b",
                        generation_config: {
                            response_modalities: ["audio", "text"],
                            speech_config: {
                                voice_config: { prebuilt_voice_config: { voice_name: "Aoide" } }
                            }
                        }
                    }
                };
                ws.send(JSON.stringify(setup));
            };

            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                
                if (data.serverContent?.modelTurn?.parts) {
                    for (const part of data.serverContent.modelTurn.parts) {
                        if (part.text) setAiResponse(prev => prev + part.text);
                        if (part.inlineData?.data) {
                            const audioData = base64ToUint8Array(part.inlineData.data);
                            audioQueue.current.push(audioData);
                            playNextChunk();
                        }
                    }
                }
            };

            ws.onclose = () => setStatus("disconnected");
            ws.onerror = () => setStatus("disconnected");

        } catch (e) {
            setStatus("disconnected");
        }
    };

    const disconnect = () => {
        wsRef.current?.close();
        setStatus("disconnected");
        setMode("idle");
    };

    const sendMessage = (text: string) => {
        if (status !== "connected") return;
        setTranscript(text);
        setAiResponse("");
        const message = {
            client_content: {
                turns: [{ role: "user", parts: [{ text }] }],
                turn_complete: true
            }
        };
        wsRef.current?.send(JSON.stringify(message));
        setMode("thinking");
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
            {/* Immersive Header */}
            <header className="relative z-20 p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${status === "connected" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Gemini Multimodal Live</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">
                            {status === "connected" ? "Neural Link Established" : "Disconnected"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {status === "disconnected" ? (
                        <button onClick={connectToLive} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                            <Power size={14} /> Establish Link
                        </button>
                    ) : (
                        <button onClick={disconnect} className="px-6 py-2 bg-red-600/20 text-red-500 border border-red-500/20 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                            Terminate
                        </button>
                    )}
                    <button onClick={() => window.location.reload()} className="p-2 bg-white/5 rounded-full border border-white/10"><X size={20}/></button>
                </div>
            </header>

            {/* Content Space */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
                
                {/* Immersive Visualizer */}
                <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
                    <AnimatePresence>
                        {status === "connected" && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative flex items-center justify-center">
                                {/* Plasma Layers */}
                                <div className={`absolute inset-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30 transition-colors duration-1000 ${
                                    mode === "speaking" ? "bg-blue-500" : mode === "thinking" ? "bg-purple-500" : "bg-indigo-500"
                                }`} />
                                
                                {/* Geometric Core */}
                                <motion.div 
                                    animate={{ rotate: 360 }} 
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="relative w-64 h-64 rounded-full border-2 border-white/10 flex items-center justify-center backdrop-blur-3xl overflow-hidden shadow-2xl shadow-blue-500/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                                    <Sparkles size={48} className={`transition-all duration-500 ${mode === "speaking" ? "text-blue-400 scale-125" : "text-white/20"}`} />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Subtitles / Captions */}
                <div className="absolute bottom-40 left-0 right-0 px-8 text-center space-y-6">
                    <p className="text-xl font-medium text-white/40 italic">{transcript}</p>
                    <p className="text-2xl font-bold text-white tracking-tight leading-snug max-w-3xl mx-auto">{aiResponse}</p>
                </div>
            </main>

            {/* Call Controls */}
            <footer className="relative z-20 p-12 bg-gradient-to-t from-black to-transparent">
                <div className="max-w-md mx-auto flex items-center justify-center gap-12">
                    <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Settings2 size={24} />
                    </button>
                    
                    <button 
                        disabled={status !== "connected"}
                        onMouseDown={() => setMode("listening")}
                        onMouseUp={() => { if(mode === "listening") sendMessage("Hello, tell me a quick fact."); }}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                            status !== "connected" ? "bg-white/5 opacity-50" : 
                            mode === "listening" ? "bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "bg-white text-black hover:scale-105"
                        }`}
                    >
                        {mode === "listening" ? <Mic size={40} /> : <Zap size={40} />}
                    </button>

                    <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Volume2 size={24} />
                    </button>
                </div>
                
                <div className="flex items-center justify-center gap-8 mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <span className="flex items-center gap-2"><Shield size={14}/> Neural Encrypted</span>
                    <span className="flex items-center gap-2"><Globe size={14}/> Gemini v1.5 Multimodal</span>
                </div>
            </footer>
        </div>
    );
}
