"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Zap, Sparkles, Volume2, Shield, Globe, MessageSquare, Waves } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { BACKEND_URL } from "@/lib/config";

// --- 3D PARTICLE FIELD ---
function ParticleField({ count = 500 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, [count]);

    const pointsRef = useRef<any>(null);
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={pointsRef}>
            <Points positions={points}>
                <PointMaterial transparent color="#ffffff" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.3} />
            </Points>
        </group> group>
    );
}

// --- 3D NEURAL ORB COMPONENT ---
function NeuralOrb({ mode }: { mode: string }) {
    const meshRef = useRef<any>(null);
    const color = useMemo(() => {
        if (mode === "listening") return "#60a5fa";
        if (mode === "thinking") return "#a855f7";
        if (mode === "speaking") return "#34d399";
        return "#ffffff";
    }, [mode]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
        meshRef.current.rotation.y = time * 0.1;
        
        const targetDistort = mode === "listening" ? 0.6 : mode === "thinking" ? 0.3 : mode === "speaking" ? 0.7 : 0.2;
        meshRef.current.distort = THREE.MathUtils.lerp(meshRef.current.distort, targetDistort, 0.1);
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color={color} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.8}>
                    <MeshDistortMaterial
                        color={color}
                        attach="material"
                        distort={0.4}
                        speed={3}
                        roughness={0}
                        metalness={0.9}
                        transparent
                        opacity={0.7}
                        emissive={color}
                        emissiveIntensity={0.6}
                    />
                </Sphere>
            </Float>
            <ParticleField />
        </>
    );
}

export default function LiveMode() {
    const [mode, setMode] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

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

    // Audio Visualizer Logic
    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            
            const update = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setVolume(avg / 128);
                requestAnimationFrame(update);
            };
            update();
        } catch (e) {}
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, aiResponse]);

    const startListening = () => { 
        setTranscript(""); 
        setAiResponse(""); 
        setMode("listening"); 
        recognitionRef.current?.start(); 
        startVisualizer();
    };
    
    const stopListening = () => { 
        setMode("idle"); 
        recognitionRef.current?.stop(); 
        setVolume(0);
    };

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
                    models: ["google/gemini-3.1-flash-lite"],
                    user_email: "public-user",
                    personality: "normal"
                })
            });
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
        <div className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            {/* BACKGROUND ATMOSPHERE */}
            <div className="absolute inset-0 z-0">
                <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] blur-[150px] rounded-full transition-all duration-1000 ${
                    mode === "listening" ? "bg-blue-600/10" : mode === "thinking" ? "bg-purple-600/10" : "bg-white/5"
                }`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
            </div>

            {/* Header */}
            <header className="relative z-20 p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl bg-black/20">
                <div className="flex items-center gap-4">
                    <motion.div animate={{ rotate: mode === "thinking" ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
                        <Zap size={20} className={mode === "speaking" ? "text-emerald-400 fill-emerald-400" : "text-white/60"} />
                    </motion.div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tighter uppercase italic">Gemini Live Pro</h1>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === "connected" ? "bg-emerald-500" : "bg-blue-500"}`} />
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Neural Interface v2.0</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 group">
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center relative z-10 overflow-hidden">
                
                {/* 3D GLOBE AREA */}
                <div className="h-[35%] md:h-[45%] w-full relative flex items-center justify-center cursor-pointer group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full">
                        <Suspense fallback={null}>
                            <NeuralOrb mode={mode} isMobile={window.innerWidth < 768} />
                        </Suspense>
                    </Canvas>
                    
                    {/* Status Floating Badge */}
                    <AnimatePresence mode="wait">
                        <motion.div key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute bottom-2 md:bottom-6 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/40 flex items-center gap-2 md:gap-3">
                            <span className={`w-1 h-1 rounded-full ${mode !== "idle" ? "bg-emerald-400 animate-ping" : "bg-white/20"}`} />
                            {mode === "idle" ? "Standby" : mode}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Conversation Stream */}
                <div className="flex-1 w-full max-w-2xl px-4 md:px-6 pb-40 overflow-y-auto scroll-smooth scrollbar-hide mask-fade-top">
                    <div className="space-y-6 md:space-y-8 pt-4">
                        {messages.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[90%] md:max-w-[85%] px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl text-sm leading-relaxed ${
                                    m.role === "user" ? "bg-white/5 text-white/60 border border-white/5" : "bg-blue-600/10 border border-blue-500/20 text-white shadow-[0_0_40px_rgba(59,130,246,0.03)]"
                                }`}>
                                    {m.text}
                                </div>
                            </motion.div>
                        ))}
                        {aiResponse && (
                            <div className="flex flex-col items-start">
                                <div className="max-w-[90%] md:max-w-[85%] px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl text-sm font-semibold text-blue-400 bg-blue-400/5 border border-blue-400/20">
                                    {aiResponse}
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-4 bg-blue-400 ml-2 align-middle" />
                                </div>
                            </div>
                        )}
                        {transcript && <div className="flex flex-col items-end text-white/20 text-[9px] md:text-[10px] uppercase tracking-widest mt-4 font-black pr-2">{transcript}</div>}
                        <div ref={chatEndRef} />
                    </div>
                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-30">
                
                {/* LIVE WAVEFORM VISUALIZER */}
                <div className="flex items-center justify-center gap-0.5 md:gap-1 h-8 md:h-12 mb-6 md:mb-8">
                    {Array.from({ length: window.innerWidth < 768 ? 25 : 40 }).map((_, i) => (
                        <motion.div 
                            key={i} 
                            animate={{ 
                                height: mode === "listening" ? [4, volume * (window.innerWidth < 768 ? 40 : 64) * Math.random() + 4, 4] : 4,
                                opacity: mode === "listening" ? 0.8 : 0.1
                            }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                            className={`w-1 rounded-full ${mode === "listening" ? "bg-blue-400" : "bg-white"}`}
                        />
                    ))}
                </div>

                <div className="max-w-md mx-auto flex items-center justify-between gap-4 md:gap-8">
                    <button className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <MessageSquare size={window.innerWidth < 768 ? 20 : 24} />
                    </button>
                    
                    <button onClick={mode === "idle" ? startListening : stopListening} className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500 relative group overflow-hidden ${
                        mode === "listening" ? "bg-red-500 scale-110 shadow-[0_0_60px_rgba(239,68,68,0.4)]" : "bg-white text-black hover:scale-105 shadow-2xl shadow-blue-500/10"
                    }`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {mode === "listening" ? <X size={window.innerWidth < 768 ? 32 : 40} className="relative z-10" /> : <Mic size={window.innerWidth < 768 ? 32 : 40} className="relative z-10" />}
                    </button>

                    <button 
                        onClick={() => {
                            const newMuted = !isMuted;
                            setIsMuted(newMuted);
                            if (newMuted) window.speechSynthesis.cancel();
                        }} 
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border transition-all flex items-center justify-center ${
                            isMuted ? "bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                        {isMuted ? <MicOff size={window.innerWidth < 768 ? 20 : 24}/> : <Volume2 size={window.innerWidth < 768 ? 20 : 24}/>}
                    </button>
                </div>
                
                <div className="hidden md:flex items-center justify-center gap-8 mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-white/10">
                    <span className="flex items-center gap-2"><Shield size={12}/> Encrypted Link</span>
                    <span className="flex items-center gap-2"><Globe size={12}/> Global Neural Network</span>
                </div>
            </footer>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-fade-top {
                    mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </div>
    );
}
