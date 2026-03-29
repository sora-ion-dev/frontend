import { useState } from "react";
import { Copy, RefreshCw, Maximize2, Minimize2, Download, Settings2, MoreHorizontal, X, Clock, Brain, MessageSquare, ChevronDown, ThumbsUp, ThumbsDown, Share2, CornerDownRight } from "lucide-react";
import { AIBrand, AIModel, ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
        if (brand.logo.includes("http")) {
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
                className={`flex flex-col flex-1 h-full min-h-[500px] rounded-2xl overflow-hidden transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${!isEnabled ? 'opacity-30 grayscale' : 'opacity-100'}`}
                style={{ background: "linear-gradient(180deg, #0e0e2a 0%, #080820 100%)", border: "1px solid rgba(108,99,255,0.15)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(108,99,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {renderLogo()}
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 cursor-pointer group hover:bg-white/5 rounded-lg px-1 transition-all">
                                <span className="text-sm font-bold text-white truncate">
                                    {selectedModel ? selectedModel.name : brand.brandName}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 flex-shrink-0" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onRegenerate(messages[messages.length-1]?.id || "")}
                            className="p-1.5 text-white/20 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
                        >
                            <RefreshCw size={13} />
                        </button>

                        <button
                            onClick={onToggleEnabled}
                            className={`w-9 h-5 rounded-full flex items-center transition-all px-[2px] flex-shrink-0 ${isEnabled ? 'bg-[#6c63ff]' : 'bg-white/10'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>

                        <button className="p-1.5 text-white/20 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all">
                            <MoreHorizontal size={13} />
                        </button>

                        <button className="p-1.5 text-white/20 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all" onClick={() => setIsFullScreen(!isFullScreen)}>
                            {isFullScreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
                    {messages.length === 0 ? (
                        <div className="m-auto text-center space-y-4 opacity-40">
                            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}>
                                <Brain size={28} className="text-[#6c63ff]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/60">Neural Connection Idle</p>
                                <p className="text-xs text-white/30 mt-1">Waiting for uplink...</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-[90%] text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'text-white px-4 py-2.5 rounded-2xl rounded-tr-sm'
                                        : 'text-white/85 self-start w-full'
                                    }`}
                                    style={msg.role === 'user' ? { background: "linear-gradient(135deg, #6c63ff22, #a855f722)", border: "1px solid rgba(108,99,255,0.2)" } : {}}
                                >
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:font-medium prose-headings:font-semibold prose-headings:tracking-tighter">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        return !inline && match ? (
                                                            <div className="rounded-2xl overflow-hidden border-2 border-panel-border my-4 shadow-xl">
                                                                <div className="bg-panel-border px-4 py-1.5 flex justify-between items-center">
                                                                    <span className="text-[10px] font-semibold tracking-widest text-muted">{match[1]}</span>
                                                                    <button 
                                                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                                                        className="text-muted hover:text-accent"
                                                                    >
                                                                        <Copy size={12} />
                                                                    </button>
                                                                </div>
                                                                <SyntaxHighlighter
                                                                    style={vscDarkPlus}
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem' }}
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, "")}
                                                                </SyntaxHighlighter>
                                                            </div>
                                                        ) : (
                                                            <code className={`${className} bg-foreground/10 px-1.5 py-0.5 rounded-md font-semibold`} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                    {msg.isStreaming && <span className="inline-block w-2 h-5 ml-2 bg-accent animate-pulse align-middle rounded-full"></span>}
                                </div>

                                {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                    <div className="flex items-center gap-4 mt-2 ml-1 opacity-20 hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            className="p-1 hover:text-accent transition-colors"
                                            title="Copy"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button className="p-1 hover:text-accent transition-colors">
                                            <ThumbsUp size={16} />
                                        </button>
                                        <button className="p-1 hover:text-accent transition-colors">
                                            <ThumbsDown size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([msg.content], { type: 'text/markdown' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${brand.brandName}-packet.md`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="p-1 hover:text-accent transition-colors"
                                            title="Download"
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
                            <div className="flex-1 overflow-y-auto p-10 leading-relaxed custom-scrollbar prose-invert prose-lg max-w-none font-medium">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{expandedMsg}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
