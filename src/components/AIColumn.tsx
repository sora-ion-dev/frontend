import { useState } from "react";
import { Copy, RefreshCw, Maximize2, Minimize2, Download, Settings2, MoreHorizontal, X, Clock, Brain, MessageSquare, ChevronDown } from "lucide-react";
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
                className={`flex flex-col flex-1 ${isFullScreen ? 'fixed inset-0 z-50 bg-background rounded-none border-0' : 'h-full w-full border-2 border-panel-border rounded-[2rem] overflow-hidden glass-panel relative shadow-xl hover:shadow-2xl hover:border-accent/20 transition-all duration-500'} ${!isEnabled ? 'opacity-30 grayscale saturate-0' : ''}`}
            >
                {/* Medal Overlay Header */}
                {rank && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 z-20">
                        {renderMedal()}
                    </div>
                )}
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b border-panel-border bg-foreground/[0.02] transition-colors ${rank === 1 ? 'border-b-yellow-500/30' : ''}`}>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            {renderLogo()}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground truncate tracking-tight">
                                    {selectedModel.name}
                                </div>
                                <div className="text-[10px] text-muted font-medium truncate tracking-tight uppercase">
                                    {brand.realBrandName}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2 items-center relative ml-4">
                        <button
                            onClick={onToggleEnabled}
                            className={`w-10 h-5 rounded-full flex items-center transition-all px-[3px] shadow-inner ${isEnabled ? 'bg-accent' : 'bg-muted'}`}
                            title={isEnabled ? "Deactivate Neural Node" : "Activate Neural Node"}
                        >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-accent/10 text-accent shadow-inner' : 'text-muted hover:text-accent hover:bg-accent/5'}`}
                            title="Intelligence Parameters"
                        >
                            <Settings2 size={16} />
                        </button>
                        {showSettings && (
                            <div className="absolute right-0 top-12 w-56 bg-panel-border/80 backdrop-blur-2xl border-2 border-accent/20 rounded-2xl shadow-2xl z-30 p-4 scale-in-center overflow-hidden">
                                <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                                <h4 className="text-[10px] font-semibold text-white px-1 tracking-widest mb-4 bg-accent/80 inline-block rounded py-0.5">Parameters</h4>
                                <div className="mb-5 px-1">
                                    <div className="flex justify-between text-[11px] font-semibold mb-2 text-foreground tracking-tighter">
                                        <span>Temperature</span>
                                        <span className="text-accent">{tempValue}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.1" 
                                        value={tempValue} 
                                        onChange={(e) => setTempValue(parseFloat(e.target.value))} 
                                        className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-accent" 
                                    />
                                </div>
                                <button 
                                    onClick={() => { onClearColumn?.(); setShowSettings(false); }} 
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                >
                                    <X size={14} /> Reset History
                                </button>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsFullScreen(!isFullScreen)} 
                            className={`p-2 rounded-xl transition-all ${isFullScreen ? 'bg-accent/10 text-accent shadow-inner' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
                        >
                            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8 hide-scrollbar relative">
                    {messages.length === 0 ? (
                        <div className="m-auto text-center space-y-4 animate-float">
                            <div className="mx-auto w-16 h-16 rounded-3xl flex items-center justify-center bg-foreground/5 border-2 border-panel-border shadow-inner">
                                <Brain size={32} className="text-accent/40" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-semibold text-foreground tracking-[0.2em]">Neural Connection Idle</p>
                                <p className="text-[12px] text-muted font-medium">Waiting for uplink...</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-[95%] text-[15px] leading-relaxed transition-all duration-500 ${msg.role === 'user'
                                        ? 'message-bubble message-bubble-user text-white scale-in-center font-bold px-5 py-3 rounded-2xl' 
                                        : 'message-bubble message-bubble-ai text-foreground self-start w-full px-5 py-3 rounded-2xl'
                                        }`}
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

                                {/* Controls (Only show for AI responses) */}
                                {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                    <div className="flex items-center gap-1.5 mt-3 ml-2">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            className="p-1.5 text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                                            title="Sync to Terminal"
                                        >
                                            <Copy size={13} />
                                        </button>
                                        <button
                                            onClick={() => onRegenerate(msg.id)}
                                            className="p-1.5 text-muted hover:text-orange-500 hover:bg-orange-500/5 rounded-lg transition-all"
                                            title="Loop Logic"
                                        >
                                            <RefreshCw size={13} />
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
                                            className="p-1.5 text-muted hover:text-green-500 hover:bg-green-500/5 rounded-lg transition-all"
                                            title="Archive Sequence"
                                        >
                                            <Download size={13} />
                                        </button>
                                        <button
                                            onClick={() => setExpandedMsg(msg.content)}
                                            className="p-1.5 text-muted hover:text-blue-500 hover:bg-blue-500/5 rounded-lg transition-all"
                                            title="Maximize Neural Projection"
                                        >
                                            <Maximize2 size={13} />
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
