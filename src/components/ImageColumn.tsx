"use client";

import { useState } from "react";
import { Download, Maximize2, X, Image as ImageIcon, Loader2, Share2, FileText } from "lucide-react";
import { AIBrand } from "@/types";
import { useTheme } from "./ThemeProvider";
import { jsPDF } from "jspdf";

interface ImageResult {
    id: string;
    url: string;
    prompt: string;
    timestamp: number;
    isLoading?: boolean;
}

interface ImageColumnProps {
    brand: AIBrand;
    results: ImageResult[];
    isGenerating: boolean;
    isEnabled: boolean;
    onToggleEnabled: () => void;
}

export default function ImageColumn({ 
    brand, 
    results, 
    isGenerating,
    isEnabled,
    onToggleEnabled 
}: ImageColumnProps) {
    const { theme } = useTheme();
    const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

    const downloadImage = (url: string, format: 'png' | 'jpg' | 'pdf', prompt: string = "image") => {
        // Create a safe filename from prompt
        const safePrompt = prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `superai-${safePrompt}-${Date.now()}`;
        
        if (format === 'pdf') {
            const doc = new jsPDF();
            const img = new Image();
            img.src = url;
            if (!url.startsWith('data:')) img.crossOrigin = "Anonymous"; 
            
            img.onload = () => {
                const imgProps = doc.getImageProperties(img);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                doc.save(`${filename}.pdf`);
            };
            return;
        }

        // Bypassing Puter.js Interceptor by using Data URL instead of Blob URL
        // Puter often intercepts Blob URLs but ignores direct Data URL downloads
        const triggerDownload = (dataUrl: string) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${filename}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        if (url.startsWith('data:')) {
            // Already a Data URL (likely from my backend)
            triggerDownload(url);
        } else {
            // Convert to Data URL first to bypass interceptor
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => triggerDownload(reader.result as string);
                    reader.readAsDataURL(blob);
                })
                .catch(() => {
                    // Ultimate fallback
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${filename}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent transition-all duration-700">
            {/* Header */}
            {/* Header - Refined Glassmorphism */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-foreground/[0.03] backdrop-blur-3xl z-10">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden bg-foreground/5 p-1">
                        <img src={brand.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[14px] font-bold text-foreground truncate uppercase tracking-tight">
                        {brand.name}
                    </span>
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleEnabled();
                    }}
                    className={`w-10 h-5 rounded-full flex items-center transition-all px-[2px] border border-panel-border ${isEnabled ? 'bg-accent' : 'bg-foreground/10'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-background shadow-lg transition-transform duration-200 ${isEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar custom-scrollbar bg-background/30">
                {results.length === 0 && !isGenerating ? (
                    <div className="m-auto text-center opacity-10 py-20 flex flex-col items-center">
                        <ImageIcon size={40} className="mb-4 text-foreground" />
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground">Ready for Sync</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
                                {/* Luxury Manifesting Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 via-transparent to-transparent animate-pulse" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] animate-pulse" />
                                
                                <div className="relative z-10">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-[#10b981]/20 blur-xl rounded-full scale-150 animate-pulse" />
                                        <Loader2 className="w-10 h-10 animate-spin text-[#10b981] relative z-10" />
                                    </div>
                                    <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-3">Manifesting Pixels</h4>
                                    <p className="text-[11px] text-foreground/40 max-w-[180px] leading-relaxed font-medium">Synthesizing multidimensional visual data from your prompt...</p>
                                </div>

                                {/* Animated Shimmer Line */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent animate-[shimmer_2s_infinite]" />
                            </div>
                        )}
                        {results.map((res) => (
                            <div key={res.id} className="group relative aspect-square rounded-[2.5rem] overflow-hidden border border-panel-border bg-foreground/[0.02] hover:border-accent/30 transition-all duration-500 shadow-2xl">
                                <img 
                                    src={res.url} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    alt={res.prompt} 
                                />
                                
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedImage(res)}
                                            className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center text-foreground transition-all transform hover:scale-110"
                                            title="Expand"
                                        >
                                            <Maximize2 size={18} />
                                        </button>
                                        <button 
                                            className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center text-foreground transition-all transform hover:scale-110"
                                            title="Share"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 w-full px-8 mt-4">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => downloadImage(res.url, 'png', res.prompt)}
                                                className="flex-1 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground text-[10px] font-black text-foreground hover:text-background uppercase tracking-widest transition-all"
                                            >
                                                PNG
                                            </button>
                                            <button 
                                                onClick={() => downloadImage(res.url, 'jpg', res.prompt)}
                                                className="flex-1 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground text-[10px] font-black text-foreground hover:text-background uppercase tracking-widest transition-all"
                                            >
                                                JPG
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => downloadImage(res.url, 'pdf', res.prompt)}
                                            className="w-full py-3 rounded-xl bg-accent text-[10px] font-bold text-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                                        >
                                            <FileText size={14} /> Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-500 rounded-2xl transition-all active:scale-90">
                        <X size={28} />
                    </button>
                    <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center gap-8" onClick={e => e.stopPropagation()}>
                        <img 
                            src={selectedImage.url} 
                            className="max-w-full max-h-[80vh] rounded-[3rem] shadow-[0_0_100px_rgba(34,197,94,0.15)] border border-panel-border" 
                            alt={selectedImage.prompt} 
                        />
                        <div className="w-full max-w-2xl p-8 rounded-[2rem] bg-panel border border-panel-border backdrop-blur-3xl shadow-2xl">
                            <p className="text-foreground/20 text-[10px] font-black uppercase tracking-widest mb-3">Immersive Prompt</p>
                            <p className="text-foreground text-lg font-bold leading-relaxed">{selectedImage.prompt}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
