import { useState } from "react";
import { Copy, RefreshCw, Maximize2, Minimize2, Download, Settings2, MoreHorizontal, X, Clock, Brain, MessageSquare, ChevronDown, ThumbsUp, ThumbsDown, Share2, CornerDownRight } from "lucide-react";
import { AIBrand, AIModel, ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "./ThemeProvider";
import { jsPDF } from "jspdf";

interface AIColumnProps {
    brand: AIBrand;
    messages: ChatMessage[];
    selectedModelId: string;
    onModelChange: (modelId: string) => void;
    onRegenerate: (msgId: string) => void;
    isStreaming: boolean;
    rank?: number | null; // 1, 2, or 3
    onClearColumn?: () => void;
    isEnabled: boolean;
    onToggleEnabled: () => void;
    userStatus?: any;
}

export default function AIColumn({ brand, messages, selectedModelId, onModelChange, isStreaming, rank, onRegenerate, onClearColumn, isEnabled, onToggleEnabled, userStatus }: AIColumnProps) {
    const { theme } = useTheme();
    const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [tempValue, setTempValue] = useState(0.5); // Default to 0.5 as requested
    const selectedModel = brand.models.find(m => m.id === selectedModelId) || brand.models[1];

    const renderMedal = () => {
        if (rank === 1) return <span className="text-2xl drop-shadow-[0_0_12px_gold] animate-bounce" title="1st Place">🥇</span>;
        if (rank === 2) return <span className="text-2xl drop-shadow-[0_0_10px_silver]" title="2nd Place">🥈</span>;
        if (rank === 3) return <span className="text-2xl drop-shadow-[0_0_8px_#cd7f32]" title="3rd Place">🥉</span>;
        return null;
    };

    const renderLogo = () => {
        if (brand.logo.includes("http") || brand.logo.startsWith("/")) {
            return <img src={brand.logo} alt={brand.brandName} className="w-6 h-6 object-contain opacity-80" />;
        }
        return (
            <div
                className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] shadow-sm"
                style={{ backgroundColor: `${brand.color}20`, color: brand.color }}
            >
                {brand.brandName.substring(0, 1)}
            </div>
        );
    };

    return (
        <>
            {isFullScreen && <div className="min-w-[250px] max-w-[280px] w-full shrink-0 hidden md:block" />}
            <div
                className={`flex flex-col flex-1 h-full min-h-[500px] overflow-hidden transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${!isEnabled ? 'opacity-30 grayscale' : 'opacity-100'}`}
                style={{ backgroundColor: "transparent", border: "none" }}
            >
                {/* Header - photo style */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-panel-border bg-panel">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {renderLogo()}
                        <div className="flex items-center gap-1 cursor-pointer group hover:bg-foreground/5 rounded-lg px-2 py-1 transition-all">
                            <span className="text-[15px] font-bold text-foreground opacity-90 truncate">
                                {selectedModel ? selectedModel.name : brand.brandName}
                            </span>
                            <ChevronDown className="w-4 h-4 text-foreground/20 group-hover:text-foreground/60 transition-colors" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-foreground/20">
                        <button className="hover:text-foreground transition-colors">
                            <RefreshCw size={14} />
                        </button>
                        <button
                            onClick={onToggleEnabled}
                            className={`w-10 h-5 rounded-full flex items-center transition-all px-[2px] border border-panel-border ${isEnabled ? 'bg-accent' : 'bg-foreground/5'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-lg transition-transform duration-200 ${isEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Chat Area - photo style */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 hide-scrollbar custom-scrollbar bg-panel">
                    {messages.length === 0 ? (
                        <div className="m-auto text-center space-y-4 opacity-10">
                            <Brain size={48} className="mx-auto" />
                            <p className="text-sm font-bold tracking-widest uppercase">Select Uplink</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`relative ${msg.role === 'user'
                                        ? 'max-w-[85%] text-[15px] leading-[1.6] text-foreground bg-accent/10 border border-accent/20 px-5 py-3 rounded-[1.5rem]'
                                        : 'text-[16px] leading-[1.7] text-foreground self-start w-full font-bold py-2'
                                    }`}
                                >
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-foreground/5 prose-pre:border prose-pre:border-panel-border`}>
                                                {msg.content.includes("<thought>") ? (
                                                  <div className="space-y-5">
                                                    <details className="group bg-panel-border/10 rounded-[2rem] overflow-hidden border border-panel-border/30 transition-all hover:bg-panel-border/20">
                                                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                                                        <div className="flex items-center gap-3 text-purple-400/80 group-hover:text-purple-400 transition-colors">
                                                          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                            <Brain size={16} className="animate-pulse" />
                                                          </div>
                                                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Thinking Process</span>
                                                        </div>
                                                        <ChevronDown size={14} className="text-foreground/20 group-open:rotate-180 transition-transform duration-300" />
                                                      </summary>
                                                      <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="text-[14px] text-foreground/40 font-medium italic leading-relaxed pl-5 border-l-2 border-purple-500/20">
                                                          {msg.content.match(/<thought>([\s\S]*?)<\/thought>/)?.[1] || "Deep reasoning analysis..."}
                                                        </div>
                                                      </div>
                                                    </details>
                                                    <ReactMarkdown 
                                                      remarkPlugins={[remarkGfm]}
                                                      components={{
                                                        code({ node, inline, className, children, ...props }: any) {
                                                            const match = /language-(\w+)/.exec(className || "");
                                                            return !inline && match ? (
                                                                <div className="rounded-2xl overflow-hidden border border-panel-border my-4 shadow-2xl">
                                                                    <div className="bg-foreground/5 px-4 py-1.5 flex justify-between items-center">
                                                                        <span className="text-[10px] font-black tracking-widest text-[#10b981]">{match[1]}</span>
                                                                        <button 
                                                                            onClick={() => navigator.clipboard.writeText(String(children))}
                                                                            className="text-foreground/20 hover:text-foreground"
                                                                        >
                                                                            <Copy size={12} />
                                                                        </button>
                                                                    </div>
                                                                    <SyntaxHighlighter
                                                                        style={theme === 'dark' ? vscDarkPlus : prism}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', background: 'transparent' }}
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, "")}
                                                                    </SyntaxHighlighter>
                                                                </div>
                                                            ) : (
                                                                <code className={`${className} bg-foreground/10 px-1.5 py-0.5 rounded-md font-bold text-foreground`} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                      }}
                                                    >
                                                      {msg.content.replace(/<thought>[\s\S]*?<\/thought>/, "").trim()}
                                                    </ReactMarkdown>
                                                  </div>
                                                ) : (
                                                  <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }: any) {
                                                            const match = /language-(\w+)/.exec(className || "");
                                                            return !inline && match ? (
                                                                <div className="rounded-2xl overflow-hidden border border-panel-border my-4 shadow-2xl">
                                                                    <div className="bg-foreground/5 px-4 py-1.5 flex justify-between items-center">
                                                                        <span className="text-[10px] font-black tracking-widest text-[#10b981]">{match[1]}</span>
                                                                        <button 
                                                                            onClick={() => navigator.clipboard.writeText(String(children))}
                                                                            className="text-foreground/20 hover:text-foreground"
                                                                        >
                                                                            <Copy size={12} />
                                                                        </button>
                                                                    </div>
                                                                    <SyntaxHighlighter
                                                                        style={theme === 'dark' ? vscDarkPlus : prism}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', background: 'transparent' }}
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, "")}
                                                                    </SyntaxHighlighter>
                                                                </div>
                                                            ) : (
                                                                <code className={`${className} bg-foreground/10 px-1.5 py-0.5 rounded-md font-bold text-foreground`} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                  >
                                                    {msg.content}
                                                  </ReactMarkdown>
                                                )}
                                        </div>
                                    )}
                                    {msg.isStreaming && <span className="inline-block w-2 h-5 ml-2 bg-accent animate-pulse align-middle rounded-full"></span>}
                                </div>

                                {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                    <div className="flex items-center gap-4 mt-2 ml-1 text-foreground/30">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            className="hover:text-foreground transition-colors p-1"
                                            title="Copy"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button className="hover:text-foreground transition-colors p-1">
                                            <ThumbsUp size={16} />
                                        </button>
                                        <button className="hover:text-foreground transition-colors p-1">
                                            <ThumbsDown size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log("PDF Generation Triggered for AI Response");
                                                const doc = new jsPDF();
                                                const pageWidth = doc.internal.pageSize.getWidth();
                                                const pageHeight = doc.internal.pageSize.getHeight();
                                                const margin = 15;
                                                const maxWidth = pageWidth - (margin * 2);
                                                
                                                // Create a descriptive filename
                                                const safeModel = brand.brandName.substring(0, 10).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                                const filename = `superai-response-${safeModel}-${Date.now()}.pdf`;

                                                doc.setFont("helvetica", "bold");
                                                doc.setFontSize(16);
                                                doc.text("SUPER AI RESPONSE", margin, 20);
                                                
                                                doc.setFontSize(10);
                                                doc.setFont("helvetica", "normal");
                                                doc.text(`Model: ${selectedModel.name} (${brand.brandName})`, margin, 28);
                                                doc.text(`Date: ${new Date().toLocaleString()}`, margin, 34);
                                                
                                                doc.setLineWidth(0.5);
                                                doc.line(margin, 38, pageWidth - margin, 38);
                                                
                                                doc.setFontSize(11);
                                                const lines = doc.splitTextToSize(msg.content, maxWidth);
                                                
                                                let cursorY = 48;
                                                lines.forEach((line: string) => {
                                                    if (cursorY > pageHeight - 20) {
                                                        doc.addPage();
                                                        cursorY = 20;
                                                    }
                                                    doc.text(line, margin, cursorY);
                                                    cursorY += 7;
                                                });
                                                
                                                // Using doc.save with explicit filename
                                                doc.save(filename);
                                            }}
                                            className="hover:text-foreground transition-colors p-1"
                                            title="Download PDF"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Expand Modal */}
                {expandedMsg && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in" onClick={() => setExpandedMsg(null)}>
                        <div
                            className="bg-background border-4 border-panel-border rounded-[3rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl relative scale-in-center overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-panel-border bg-foreground/[0.02]">
                                <div className="flex items-center gap-4">
                                    {renderLogo()}
                                    <div>
                                        <h3 className="font-semibold text-foreground tracking-widest">{brand.brandName}</h3>
                                        <p className="text-[10px] text-muted font-medium tracking-tighter">{selectedModel.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setExpandedMsg(null)} className="p-3 bg-panel-border hover:bg-red-500/20 text-muted hover:text-red-500 rounded-2xl transition-all shadow-lg active:scale-90">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className={`flex-1 overflow-y-auto p-10 leading-relaxed custom-scrollbar prose ${theme === 'dark' ? 'prose-invert' : ''} prose-lg max-w-none font-bold text-foreground`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{expandedMsg}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
