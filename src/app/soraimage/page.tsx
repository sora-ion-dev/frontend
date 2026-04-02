"use client";
import React, { useState, useRef, useEffect } from 'react';
import { BACKEND_URL } from "@/lib/config";

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    imageUrl?: string;
    model?: string;
    provider?: string;
    status?: 'generating' | 'done' | 'error';
    error?: string;
};

export default function SoraImagePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [isGenerating, setIsGenerating] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [cfgScale, setCfgScale] = useState(7.5);
    
    // Auth fallback for demo purposes
    const userEmail = "test_user@superai.example.com"; 

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (cooldown === 0 && isGenerating) {
            // Unblock if cooldown finishes and we are artificially locked 
            // but generate is usually blocking anyway.
        }
    }, [cooldown]);

    const handleGenerate = async () => {
        if (!prompt.trim() || cooldown > 0 || isGenerating) return;

        const newMessageId = Date.now().toString();
        const userMsg: Message = { id: newMessageId + 'u', role: 'user', content: prompt };
        const aiMsg: Message = { id: newMessageId + 'a', role: 'assistant', status: 'generating' };
        
        setMessages(prev => [...prev, userMsg, aiMsg]);
        setIsGenerating(true);
        setCooldown(80); // Start 80s cooldown

        try {
            const res = await fetch('http://localhost:7860/chat/soraimage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    style: style,
                    aspect_ratio: aspectRatio,
                    cfg_scale: cfgScale,
                    user_email: userEmail
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(()=>({}));
                throw new Error(errData.detail || `Server error: ${res.status}`);
            }

            const data = await res.json();
            
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsg.id ? { 
                    ...msg, 
                    status: 'done', 
                    imageUrl: data.image_url, 
                    model: data.model,
                    provider: data.provider
                } : msg
            ));
        } catch (error: any) {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsg.id ? { ...msg, status: 'error', error: error.message } : msg
            ));
        } finally {
            setIsGenerating(false);
            setPrompt(''); // Clear input
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-['Outfit']">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-thin p-4 flex justify-between items-center border-b border-[var(--panel-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg glow-pulse">
                        <span className="animate-float">S</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">SoraImage Mode</h1>
                        <p className="text-xs text-[var(--text-muted)]">Powered by FLUX & OpenRouter</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full pb-32">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] mt-20">
                        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-[var(--glass-border)]">
                            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">What do you want to see?</h2>
                        <p className="max-w-md">Type a description below. Our Llama-3 AI will safely expand it and generate a masterpiece.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'user' ? (
                                <div className="max-w-[80%] p-4 rounded-2xl message-bubble-user">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="max-w-[100%] md:max-w-[80%] flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">S</div>
                                        <span className="text-sm font-semibold text-purple-400">SoraImage UI</span>
                                        {msg.model && <span className="text-xs bg-[var(--card-bg)] px-2 py-1 rounded-full border border-[var(--glass-border)] text-gray-400">{msg.provider} • {msg.model.split('/').pop()}</span>}
                                    </div>
                                    
                                    {msg.status === 'generating' && (
                                        <div className="relative w-full md:w-[600px] aspect-video rounded-2xl overflow-hidden glass-panel flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm font-medium text-purple-300 animate-pulse">Llama is enhancing & generating...</p>
                                            </div>
                                        </div>
                                    )}

                                    {msg.status === 'error' && (
                                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                                            Failed to generate: {msg.error}
                                        </div>
                                    )}

                                    {msg.status === 'done' && msg.imageUrl && (
                                        <div className="group relative rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 bg-[var(--card-bg)] min-h-[300px] md:min-h-[400px] flex items-center justify-center text-[var(--text-muted)]">
                                            <img 
                                                src={msg.imageUrl} 
                                                alt={msg.content || "Generated AI"} 
                                                className="absolute inset-0 w-full h-full object-contain rounded-2xl z-10"
                                                onError={(e) => {
                                                    // Fallback if the image URL is broken
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            {/* Shown only if image breaks */}
                                            <div className="hidden z-0 flex-col items-center gap-2">
                                                <span>⚠️ Failed to load image from provider.</span>
                                                <a href={msg.imageUrl} target="_blank" rel="noreferrer" className="text-purple-400 underline text-sm">Try opening URL directly</a>
                                            </div>
                                            
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 z-20">
                                                <a href={msg.imageUrl} target="_blank" rel="noreferrer" className="px-6 py-2 glass-panel hover:bg-white/10 text-white font-medium rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2">
                                                    🔍 View Full Screen
                                                </a>
                                                <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all delay-75">
                                                    <a href={msg.imageUrl} download="SoraImage.jpg" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-2">
                                                        ⬇️ Download HD
                                                    </a>
                                                    <button className="px-4 py-2 glass-panel hover:bg-white/10 text-white font-medium rounded-full">
                                                        🔁 Vary
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Pro Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pointer-events-none">
                <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-3 border border-[var(--panel-border)] shadow-2xl pointer-events-auto">
                    
                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 px-2">
                        {/* Style Selector */}
                        <div className="flex items-center gap-1 bg-[var(--card-bg)] rounded-full p-1 border border-[var(--glass-border)]">
                            {['Realistic 📸', 'Cinematic 🎬', 'Anime 🌸', '3D Render 🕹️'].map((s) => (
                                <button 
                                    key={s} 
                                    onClick={() => setStyle(s.split(' ')[0])}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${style === s.split(' ')[0] ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Ratio Selector */}
                        <select 
                            value={aspectRatio} 
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="bg-[var(--card-bg)] border border-[var(--glass-border)] text-sm rounded-full px-3 py-1.5 focus:outline-none focus:border-purple-500"
                        >
                            <option value="1:1">1:1 Square</option>
                            <option value="16:9">16:9 Landscape</option>
                            <option value="9:16">9:16 Portrait</option>
                        </select>

                        {/* Advanced Toggle */}
                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="ml-auto px-3 py-1.5 text-xs text-gray-400 hover:text-white flex items-center gap-1">
                            ⚙️ Advanced
                        </button>
                    </div>

                    {/* Advanced Settings Drawer */}
                    {showAdvanced && (
                        <div className="px-4 py-3 mb-3 bg-black/40 rounded-2xl border border-[var(--glass-border)] flex gap-6 text-sm">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">CFG Scale: {cfgScale}</label>
                                <input type="range" min="1" max="20" step="0.5" value={cfgScale} onChange={(e) => setCfgScale(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Seed (Optional)</label>
                                <input type="number" placeholder="Random" className="w-full bg-transparent border-b border-gray-600 focus:border-purple-500 focus:outline-none p-1 text-xs" />
                            </div>
                        </div>
                    )}

                    {/* Input Field & Submit */}
                    <div className="flex items-end gap-2 relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerate();
                                }
                            }}
                            placeholder="Describe your masterpiece... (e.g. 'A futuristic city')"
                            className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-3 max-h-32 min-h-[50px] overflow-y-auto text-white"
                            rows={1}
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating || cooldown > 0}
                            className={`p-3 rounded-full mb-1 flex items-center justify-center transition-all ${
                                !prompt.trim() || isGenerating || cooldown > 0 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            }`}
                        >
                            {cooldown > 0 ? (
                                <span className="font-bold text-xs px-2">{cooldown}s Wait</span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
