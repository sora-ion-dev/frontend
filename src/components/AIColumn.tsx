import { useState } from "react";
import { Copy, RefreshCw, Maximize2, Minimize2, Download, Settings2, MoreHorizontal, X } from "lucide-react";
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
        if (rank === 1) return <span className="text-xl drop-shadow-[0_0_8px_gold]" title="1st Place">🥇</span>;
        if (rank === 2) return <span className="text-xl drop-shadow-[0_0_8px_silver]" title="2nd Place">🥈</span>;
        if (rank === 3) return <span className="text-xl drop-shadow-[0_0_8px_#cd7f32]" title="3rd Place">🥉</span>;
        return null;
    };

    const renderLogo = () => {
        if (brand.logo === "gemini-special") {
            return (
                <div className="w-6 h-6 flex items-center justify-center bg-transparent">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#1b91ff] animate-pulse">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                    </svg>
                </div>
            );
        }
        if (brand.logo.includes("http")) {
            return <img src={brand.logo} alt={brand.brandName} className="w-6 h-6 object-contain rounded-md bg-white p-[2px]" />;
        }
        return (
            <div
                className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px]"
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
                className={`flex flex-col flex-1 ${isFullScreen ? 'fixed inset-0 z-50 bg-[#0a0a0a] rounded-none border-0' : 'h-full w-full border border-white/10 rounded-2xl overflow-hidden bg-[#0c0c0c] relative shadow-2xl hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300'} ${!isEnabled ? 'opacity-50 grayscale-[50%]' : ''}`}
            >
                {/* Medal Overlay Header */}
                {rank && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 z-20">
                        {renderMedal()}
                    </div>
                )}
                {/* Header */}
                <div className={`flex items-center justify-between p-3 border-b border-[#222222] bg-[#0d0d0d] transition-colors ${rank === 1 ? 'border-b-yellow-500/30 bg-yellow-900/10' : ''}`}>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {renderLogo()}
                            <div className="relative group">
                                <select
                                    value={selectedModelId}
                                    onChange={(e) => onModelChange(e.target.value)}
                                    className="appearance-none bg-transparent text-sm font-bold text-gray-100 w-[140px] truncate cursor-pointer outline-none pe-4"
                                >
                                    {brand.models.map(m => {
                                        const isLimitReached = userStatus && userStatus.messages_sent >= 10 && !userStatus.is_pro;
                                        const isModelAllowed = !isLimitReached || m.id === "meta-llama/Llama-3.2-3B-Instruct";

                                        return (
                                            <option key={`${m.id}-${m.tier}`} value={m.id} disabled={!isModelAllowed} className="bg-[#111] text-white">
                                                {m.name} {!isModelAllowed ? "(GO PRO)" : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-white">
                                    <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {brand.description && (
                            <span className="text-[10px] text-gray-500 font-medium tracking-tight mt-0.5 ml-8 uppercase">
                                {brand.description}
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2 items-center relative">
                        {/* Toggle Switch */}
                        <button
                            onClick={onToggleEnabled}
                            className={`w-8 h-4 rounded-full flex items-center transition-colors px-[2px] ${isEnabled ? 'bg-[#10a37f]' : 'bg-gray-600'}`}
                            title={isEnabled ? "Disable Model" : "Enable Model"}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-1 rounded-md transition-colors ${showSettings ? 'bg-[#ff4d4d]/10 text-[#ff4d4d]' : 'text-gray-500 hover:text-white'}`}
                            title="AI Control Center"
                        >
                            <Settings2 size={16} />
                        </button>
                        {showSettings && (
                            <div className="absolute right-0 top-8 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl z-30 p-3 select-none">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Model Controls</h4>
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1 text-gray-300">
                                        <span>Temperature</span>
                                        <span>{tempValue}</span>
                                    </div>
                                    <input type="range" min="0" max="1" step="0.1" value={tempValue} onChange={(e) => setTempValue(parseFloat(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#ff4d4d]" />
                                </div>
                                <button onClick={() => { onClearColumn?.(); setShowSettings(false); }} className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors">
                                    Clear Chat
                                </button>
                            </div>
                        )}
                        <button onClick={() => setIsFullScreen(!isFullScreen)} className={`p-1 rounded-md transition-colors ${isFullScreen ? 'bg-[#1a1a1a] text-white' : 'text-gray-500 hover:text-white'}`}>
                            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar relative">
                    {messages.length === 0 ? (
                        <div className="m-auto text-center space-y-3 opacity-50">
                            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-[#1a1a1a]">
                                <span className="text-xl" style={{ color: brand.color }}>{brand.brandName.substring(0, 1)}</span>
                            </div>
                            <p className="text-sm text-gray-400">Waiting for prompt...</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-[95%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                                        ? 'bg-[#1a1a1a] text-white self-end' // User message styling
                                        : 'bg-transparent text-gray-200 self-start w-full' // Assistant message styling
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, "")}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
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
                                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse align-middle"></span>}
                                </div>

                                {/* Controls (Only show for AI responses) */}
                                {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                                    <div className="flex items-center gap-1 mt-2 text-gray-500">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content).then(() => alert("Copied to clipboard!"))}
                                            className="p-1 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button
                                            onClick={() => onRegenerate(msg.id)}
                                            className="p-1 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                                            title="Regenerate"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([msg.content], { type: 'text/markdown' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${brand.brandName}-response.md`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="p-1 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                                            title="Download"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => setExpandedMsg(msg.content)}
                                            className="p-1 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                                            title="Expand"
                                        >
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Expand Modal */}
                {expandedMsg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setExpandedMsg(null)}>
                        <div
                            className="bg-[#0a0a0a] border border-[#333] rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
                                <div className="flex items-center gap-3">
                                    {brand.logo.includes("http") ? (
                                        <img src={brand.logo} alt={brand.brandName} className="w-8 h-8 object-contain rounded-lg bg-white p-1" />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                                            style={{ backgroundColor: `${brand.color}20`, color: brand.color }}
                                        >
                                            {brand.brandName.substring(0, 1)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-white">{brand.brandName}</h3>
                                        <p className="text-xs text-gray-400">{selectedModel.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setExpandedMsg(null)} className="text-gray-400 hover:text-white p-2 bg-[#1a1a1a] rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 text-gray-200 hide-scrollbar leading-relaxed">
                                {expandedMsg}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
