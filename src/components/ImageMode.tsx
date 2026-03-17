"use client";

import { useState } from "react";
import { Sparkles, Loader2, Download, RefreshCw, Layers, Wand2, Image as ImageIcon, Frame } from "lucide-react";

export default function ImageMode() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<{url: string, prompt: string} | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const res = await fetch(`${BACKEND_URL}/chat/image_gen`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    user_email: "public-user"
                })
            });

            if (!res.ok) throw new Error("Failed to generate image");
            const data = await res.json();
            setGeneratedImage({ url: data.image_url, prompt: data.prompt });
        } catch (error) {
            console.error(error);
            alert("Failed to generate image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = async () => {
        if (!generatedImage) return;
        try {
            const response = await fetch(generatedImage.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `superai-gen-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Download failed", e);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 bg-black">
            {/* Animated Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 bg-accent/10 opacity-50" />
            <div className="absolute inset-0 liquid-mesh opacity-10 pointer-events-none" />
            
            <div className="w-full max-w-5xl flex flex-col gap-10 z-10">
                {!generatedImage && !isLoading && (
                    <div className="text-center space-y-6 animate-float">
                        <div className="w-24 h-24 rounded-[2rem] bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto shadow-2xl glow-accent border-panel-border overflow-hidden p-4">
                            <img src="/logo.png" alt="Super AI Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase">Visual Synthesis</h2>
                            <p className="text-muted text-lg font-bold leading-relaxed uppercase tracking-widest text-[10px]">
                                Manifesting Digital Reality from Neural Descriptions
                            </p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="aspect-square w-full max-w-lg mx-auto rounded-[3rem] border-4 border-panel-border bg-foreground/[0.02] flex flex-col items-center justify-center gap-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 liquid-mesh opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="p-5 rounded-full bg-accent/20 animate-bounce">
                                <Loader2 size={48} className="animate-spin text-accent" />
                            </div>
                            <span className="text-xs font-black text-foreground/60 font-mono tracking-[0.3em] uppercase animate-pulse">Synthesizing Pixels...</span>
                        </div>
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-panel-border rounded-full overflow-hidden">
                            <div className="h-full bg-accent animate-shimmer w-full" />
                        </div>
                    </div>
                )}

                {generatedImage && !isLoading && (
                    <div className="flex flex-col items-center gap-8 animate-scale-in">
                        <div className="relative group aspect-square w-full max-w-lg rounded-[3rem] overflow-hidden border-4 border-panel-border shadow-2xl transition-all duration-500 hover:shadow-accent/20 hover:scale-[1.02] hover:border-accent/30">
                            <img 
                                src={generatedImage.url} 
                                alt={generatedImage.prompt} 
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-6">
                                <button 
                                    onClick={downloadImage}
                                    className="p-5 bg-white text-black rounded-3xl hover:bg-accent hover:text-white transition-all transform hover:scale-110 shadow-2xl active:scale-95 flex flex-col items-center gap-2"
                                    title="Export Artifact"
                                >
                                    <Download size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Store</span>
                                </button>
                                <button 
                                    onClick={handleGenerate}
                                    className="p-5 bg-white text-black rounded-3xl hover:bg-accent hover:text-white transition-all transform hover:scale-110 shadow-2xl active:scale-95 flex flex-col items-center gap-2"
                                    title="Iterate Vektor"
                                >
                                    <RefreshCw size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Iterate</span>
                                </button>
                            </div>
                            <div className="absolute top-6 right-6 px-4 py-2 bg-accent/90 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                Render Complete
                            </div>
                        </div>
                        <div className="text-center max-w-md glass-panel p-6 border-2 border-panel-border rounded-3xl shadow-xl">
                            <p className="text-sm font-bold text-foreground italic leading-relaxed">"{generatedImage.prompt}"</p>
                        </div>
                    </div>
                )}

                <div className="w-full max-w-2xl mx-auto mt-4 px-4">
                    <div className="glass-panel p-3 rounded-[2.5rem] border-2 border-panel-border flex items-center gap-4 focus-within:border-accent/40 focus-within:shadow-accent/10 transition-all duration-500 shadow-2xl">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerate();
                                }
                            }}
                            placeholder="Describe your visual concept..."
                            className="flex-1 bg-transparent text-foreground placeholder-muted outline-none resize-none px-4 py-3 min-h-[50px] max-h-32 text-lg font-bold"
                            rows={1}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isLoading}
                            className={`p-5 rounded-[1.8rem] transition-all duration-500 flex items-center justify-center ${prompt.trim() ? 'bg-accent text-white shadow-xl shadow-accent/40 scale-105 active:scale-95' : 'bg-muted/20 text-muted grayscale'}`}
                        >
                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                        </button>
                    </div>
                    <div className="flex justify-center gap-8 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] text-muted font-black uppercase tracking-widest">Ultra HD</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] text-muted font-black uppercase tracking-widest">Neural Render</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] text-muted font-black uppercase tracking-widest">Zero Latency</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
