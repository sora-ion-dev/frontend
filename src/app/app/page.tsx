"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, MessageSquarePlus, Maximize, Settings, Sparkles, X, RefreshCw, Trophy, History as HistoryIcon, LogOut, Shield, CreditCard, Loader2, Layers, Brain } from "lucide-react";
import { AIBrand, ChatMessage, MODEL_BRANDS } from "@/types";
import AIColumn from "@/components/AIColumn";
import SoraMode from "@/components/SoraMode";
import PromptMode from "@/components/PromptMode";
import ImageMode from "@/components/ImageMode";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const session = { user: { email: "public-user", name: "Guest" } }; // Dummy session for public access
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (window.innerWidth > 768) setSidebarOpen(true);
  }, []);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [rankings, setRankings] = useState<string[]>([]);
  const [personality, setPersonality] = useState("Professional");
  const [webSearch, setWebSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"superfiesta" | "sora" | "prompt_ai" | "image_gen">("superfiesta"); 

  useEffect(() => {
    const loadSettings = () => {
      const savedPersona = localStorage.getItem("superai_persona");
      const savedWebSearch = localStorage.getItem("superai_websearch") === "true";
      if (savedPersona) setPersonality(savedPersona);
      setWebSearch(savedWebSearch);
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);
    window.addEventListener("settingsChanged", loadSettings);
    
    return () => {
      window.removeEventListener("storage", loadSettings);
      window.removeEventListener("settingsChanged", loadSettings);
    };
  }, []);
  const [fiestaHistory, setFiestaHistory] = useState<{ id: string, prompt: string, timestamp: number }[]>([]);

  const [enabledModels, setEnabledModels] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MODEL_BRANDS.forEach(brand => {
      initial[brand.brandId] = true;
    });
    return initial;
  });

  const [selectedModels, setSelectedModels] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MODEL_BRANDS.forEach(brand => {
      initial[brand.brandId] = brand.models[0].id;
    });
    return initial;
  });

  const [currentTier, setCurrentTier] = useState<"Flash" | "Moderate" | "Pro">("Flash");

  const toggleTier = (tier: "Flash" | "Moderate" | "Pro") => {
    setCurrentTier(tier);
    setSelectedModels(prev => {
      const next = { ...prev };
      MODEL_BRANDS.forEach(brand => {
        const model = brand.models.find(m => m.tier === tier) || brand.models[0];
        next[brand.brandId] = model.id;
      });
      return next;
    });
  };

  const [columnMessages, setColumnMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const initial: Record<string, ChatMessage[]> = {};
    MODEL_BRANDS.forEach(brand => {
      initial[brand.brandId] = [];
    });
    return initial;
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${BACKEND_URL}/user-status`, {
        headers: { "email": session?.user?.email || "", "x-user-email": session?.user?.email || "unknown" }
      });
      if (res.ok) {
        const data = await res.json();
        setUserStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // The wheel scrolling logic has been moved to onWheelCapture on the div itself to ensure it always fires

  const handleModelChange = (brandId: string, newModelId: string) => {
    setSelectedModels(prev => ({ ...prev, [brandId]: newModelId }));
  };

  const streamResponse = async (brandId: string, userPrompt: string, selectedModelId: string, assistantMsgId: string) => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      // Read latest settings right before sending
      const currentPersona = localStorage.getItem("superai_persona") || "Professional";
      const currentWebSearch = localStorage.getItem("superai_websearch") === "true";

      const res = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": session?.user?.email || "unknown"
        },
        body: JSON.stringify({
          prompt: userPrompt,
          models: [selectedModelId],
          personality: currentPersona,
          web_search: currentWebSearch,
          user_email: session?.user?.email || "unknown"
        })
      });

      if (!res.ok) throw new Error("Network response was not ok");
      fetchUserStatus();
      if (!res.body) throw new Error("No body in response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let fullText = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const line of parts) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.chunk) {
                  fullText += data.chunk;

                  // Update UI with the chunk
                  setColumnMessages(prev => {
                    const next = { ...prev };
                    const messages = next[brandId];
                    const msgIndex = messages.findIndex(m => m.id === assistantMsgId);

                    if (msgIndex !== -1) {
                      messages[msgIndex] = { ...messages[msgIndex], content: fullText };
                      next[brandId] = [...messages];
                    }
                    return next;
                  });
                }
              } catch (e) {
                console.error("Partial JSON chunk", e);
              }
            }
          }
        }
      }

      // Stop streaming animation
      setColumnMessages(prev => {
        const next = { ...prev };
        const messages = next[brandId];
        const msgIndex = messages.findIndex(m => m.id === assistantMsgId);
        if (msgIndex !== -1) {
          messages[msgIndex] = { ...messages[msgIndex], isStreaming: false };
          next[brandId] = [...messages];
        }
        return next;
      });

    } catch (error) {
      setColumnMessages(prev => {
        const next = { ...prev };
        const messages = next[brandId];
        const msgIndex = messages.findIndex(m => m.id === assistantMsgId);
        if (msgIndex !== -1) {
          messages[msgIndex] = { ...messages[msgIndex], content: "Error connecting to model.", isStreaming: false };
          next[brandId] = [...messages];
        }
        return next;
      });
    }
  };

  const handleSendPrompt = async (customPrompt?: string, targetModels?: string[]) => {
    const userPrompt = customPrompt || prompt;
    if (!userPrompt.trim() || isStreaming) return;

    setIsStreaming(true);
    setRankings([]); // clear previous rankings
    if (!customPrompt) setPrompt("");

    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = { id: userMsgId, role: "user", content: userPrompt };

    // Update history only for SuperFiesta Mode
    if (activeTab === "superfiesta") {
      setFiestaHistory(prev => [{ id: userMsgId, prompt: userPrompt, timestamp: Date.now() }, ...prev]);
    }

    // Add user message to all ENABLED columns and initialize a generic empty assistant message
    const activeBrands = MODEL_BRANDS;
    setColumnMessages(prev => {
      const next = { ...prev };
      activeBrands.forEach(brand => {
        const isEnabled = targetModels ? targetModels.includes(brand.brandId) : enabledModels[brand.brandId];
        if (isEnabled) {
          const assistantMsgId = `assistant-${brand.brandId}-${userMsgId}`;
          next[brand.brandId] = [
            ...next[brand.brandId],
            newUserMessage,
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
          ];
        } else {
          next[brand.brandId] = [
            ...next[brand.brandId],
            newUserMessage
          ];
        }
      });
      return next;
    });

    // Launch streams ONLY for enabled models!
    const effectiveModels = targetModels
      ? activeBrands.filter(b => targetModels.includes(b.brandId))
      : activeBrands.filter(b => enabledModels[b.brandId]);

    const promises = effectiveModels.map(brand => {
      const exactMsgId = `assistant-${brand.brandId}-${userMsgId}`;
      return streamResponse(brand.brandId, userPrompt, selectedModels[brand.brandId], exactMsgId);
    });

    await Promise.all(promises);
    setIsStreaming(false);
  };

  const handleRank = async () => {
    const activeBrands = MODEL_BRANDS;
    const answers: Record<string, string> = {};
    activeBrands.forEach(brand => {
      const msgs = columnMessages[brand.brandId];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg?.role === "assistant") {
        answers[brand.brandId] = lastMsg.content;
      }
    });

    if (Object.keys(answers).length < 2) return;

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${BACKEND_URL}/chat/rank`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": session?.user?.email || "unknown"
        },
        body: JSON.stringify({
          original_prompt: columnMessages[activeBrands[0].brandId].find(m => m.role === "user")?.content || "Rate the answers",
          answers: answers,
          user_email: session?.user?.email || "unknown"
        })
      });

      if (!res.ok) throw new Error("Ranking failed");
      const data = await res.json();
      if (data.rankings && Array.isArray(data.rankings)) {
        setRankings(data.rankings);
      }
    } catch (e) {
      console.error("Failed to rank", e);
    }
  };

  const handleMerge = async () => {
    const activeBrands = MODEL_BRANDS;
    const answers = activeBrands.map(brand => {
      const msgs = columnMessages[brand.brandId];
      const lastMsg = msgs[msgs.length - 1];
      return lastMsg?.role === "assistant" ? lastMsg.content : "";
    }).filter(a => a.length > 0);

    if (answers.length < 2) return;

    const newId = Date.now().toString();
    setColumnMessages(prev => {
      const next = { ...prev };
      activeBrands.forEach(brand => {
        next[brand.brandId] = [
          ...next[brand.brandId],
          { id: `merge-${brand.brandId}-${newId}`, role: "assistant", content: "", isStreaming: true }
        ];
      });
      return next;
    });

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${BACKEND_URL}/chat/merge`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": session?.user?.email || "unknown"
        },
        body: JSON.stringify({
          original_prompt: columnMessages[MODEL_BRANDS[0].brandId].find(m => m.role === "user")?.content || "Merged user prompt",
          answers: answers,
          user_email: session?.user?.email || "unknown"
        })
      });

      if (!res.ok) throw new Error("Merge failed");
      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let fullText = "### 🧠 **Combined AI Insight**\n\n---\n\n";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const line of parts) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.chunk) {
                  fullText += data.chunk;
                  setColumnMessages(prev => {
                    const next = { ...prev };
                    activeBrands.forEach(brand => {
                      const msgs = next[brand.brandId];
                      const msgIndex = msgs.findIndex(m => m.id === `merge-${brand.brandId}-${newId}`);
                      if (msgIndex !== -1) {
                        msgs[msgIndex] = { ...msgs[msgIndex], content: fullText };
                        next[brand.brandId] = [...msgs];
                      }
                    });
                    return next;
                  });
                }
              } catch (e) {
                console.error("Partial JSON in merge", e);
              }
            }
          }
        }
      }

      setColumnMessages(prev => {
        const next = { ...prev };
        MODEL_BRANDS.forEach(brand => {
          const msgs = next[brand.brandId];
          const msgIndex = msgs.findIndex(m => m.id === `merge-${brand.brandId}-${newId}`);
          if (msgIndex !== -1) {
            msgs[msgIndex] = { ...msgs[msgIndex], isStreaming: false };
            next[brand.brandId] = [...msgs];
          }
        });
        return next;
      });

    } catch (e) {
      console.error("Merge failed", e);
    }
  };

  const handleClearColumn = (brandId: string) => {
    setColumnMessages(prev => ({
      ...prev,
      [brandId]: []
    }));
  };

  const handleRegenerate = (brandId: string, msgId: string) => {
    if (isStreaming) return;
    const msgs = columnMessages[brandId];
    const msgIdx = msgs.findIndex(m => m.id === msgId);
    if (msgIdx > 0) {
      const userMsg = msgs[msgIdx - 1];
      if (userMsg && userMsg.role === "user") {
        setColumnMessages(prev => {
          const next = { ...prev };
          next[brandId][msgIdx].content = "";
          next[brandId][msgIdx].isStreaming = true;
          return next;
        });
        streamResponse(brandId, userMsg.content, selectedModels[brandId], msgId);
      }
    }
  };

  // Helper for Navigation
  function NavItem({ icon, label, isOpen, active = false, onClick, href, className }: { icon: React.ReactNode, label: string, isOpen: boolean, active?: boolean, onClick?: () => void, href?: string, className?: string }) {
    const isSoraLocked = false; // Limits removed

    const content = (
      <div className="flex flex-1 items-center justify-between">
        <span className="font-bold text-sm">{label}</span>
        {isSoraLocked && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
      </div>
    );

    if (href) {
        return (
            <a
                href={href}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-foreground hover:bg-card'} ${!isOpen ? 'justify-center md:flex hidden' : ''} ${className || ""}`}
            >
                {icon}
                {isOpen && content}
            </a>
        );
    }

    return (
      <button
        onClick={label === "Sora Mode" && isSoraLocked ? undefined : onClick}
        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:text-foreground hover:bg-card'} ${!isOpen ? 'justify-center md:flex hidden' : ''} ${isSoraLocked ? 'opacity-30 cursor-not-allowed' : ''} ${className || ""}`}
      >
        {icon}
        {isOpen && content}
      </button>
    );
  }

  return (
    <div className="flex h-screen w-full transition-colors duration-500 overflow-hidden selection:bg-accent/30 bg-black">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${isFullScreen ? 'hidden' : (sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-22 md:translate-x-0 md:opacity-100')} 
        transition-all duration-500 ease-in-out border-r border-panel-border glass-panel flex flex-col justify-between shrink-0 z-50 fixed md:relative h-full ${!sidebarOpen ? 'pointer-events-none md:pointer-events-auto' : ''}`}
      >
        <div className="p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2 px-2">
                <img src="/logo.png" alt="Super AI Logo" className="w-8 h-8 rounded-lg" />
                SUPER AI
              </h1>
            )}
            {!sidebarOpen && (
              <div className="mx-auto hidden md:block">
                <img src="/logo.png" alt="Super AI Logo" className="w-9 h-9 rounded-lg" />
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted hover:text-foreground md:hidden">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              const initial: Record<string, ChatMessage[]> = {};
              MODEL_BRANDS.forEach(brand => {
                initial[brand.brandId] = [];
              });
              setColumnMessages(initial);
              setRankings([]);
            }}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-2xl font-bold transition-all shadow-lg shadow-accent/20 active:scale-95">
            <MessageSquarePlus size={18} />
            {sidebarOpen && <span>New Conversation</span>}
          </button>

          <nav className="flex flex-col gap-1.5 mt-2">
            <NavItem icon={<Search size={18} />} label="Search" isOpen={sidebarOpen} />
            <NavItem
              icon={<Sparkles size={18} className="text-orange-400" />}
              label="SuperFiesta Mode"
              isOpen={sidebarOpen}
                active={activeTab === 'superfiesta'}
                onClick={() => {
                    setActiveTab('superfiesta');
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              />
            <NavItem
              icon={<Sparkles size={18} className="text-indigo-400" />}
              label="Sora Mode"
              isOpen={sidebarOpen}
                active={activeTab === 'sora'}
                onClick={() => {
                    setActiveTab('sora');
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              />
            <NavItem
              icon={<Layers size={18} className="text-purple-400" />}
              label="Image Generator"
              isOpen={sidebarOpen}
                active={activeTab === 'image_gen'}
                onClick={() => {
                    setActiveTab('image_gen');
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              />
            <NavItem
              icon={<Brain size={18} className="text-blue-400" />}
              label="Prompt AI"
              isOpen={sidebarOpen}
                active={activeTab === 'prompt_ai'}
                onClick={() => {
                    setActiveTab('prompt_ai');
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              />
            <NavItem
              icon={<Shield size={18} className="text-red-400" />}
              label="Admin Panel"
              isOpen={sidebarOpen}
              href="/admin"
            />
          </nav>
        </div>

        <div className="p-4 border-t border-panel-border overflow-hidden flex flex-col min-h-0">
          {sidebarOpen && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-3 text-muted">
                <HistoryIcon size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recents</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-1 mb-4 hide-scrollbar">
                {fiestaHistory.length === 0 ? (
                  <div className="text-[10px] text-muted/50 italic px-2 font-bold">No threads yet</div>
                ) : (
                  fiestaHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPrompt(item.prompt);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted hover:bg-card hover:text-foreground transition-all truncate font-bold"
                    >
                      {item.prompt}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          
          <NavItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            isOpen={sidebarOpen} 
            onClick={() => setIsSettingsOpen(true)}
            className={!sidebarOpen ? 'md:flex hidden' : ''}
          />

          <div className={`mt-2 pt-3 border-t border-panel-border flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 animate-float">
                <Sparkles size={16} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate uppercase tracking-tighter">Premium Access</p>
                <p className="text-[10px] text-muted truncate font-bold uppercase">Sora-ion Mode</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 border-b border-panel-border glass-panel backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {!isFullScreen && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted hover:text-foreground p-2 -ml-2">
                <Menu size={20} />
              </button>
            )}
            <span className="font-black text-foreground uppercase tracking-widest text-[10px] md:text-xs">
              {activeTab === 'superfiesta' ? 'SuperFiesta' : 
               activeTab === 'sora' ? 'Sora' : 
               activeTab === 'prompt_ai' ? 'Prompt AI' : 'Image Gen'}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-md" />
            </div>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-accent/30 bg-accent/5 hover:bg-accent/20 text-accent px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-accent/5">
              <Maximize size={14} className="hidden sm:block" /> {isFullScreen ? "Contract" : "Full Screen"}
            </button>
            <button className="text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-panel-border hover:border-accent hover:bg-accent/5 px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-muted hover:text-accent hidden sm:flex">
              <RefreshCw size={14} className="text-accent" /> Rotate Keys
            </button>
          </div>
        </header>

        <div className={`flex-1 flex flex-col min-h-0 relative ${activeTab === 'superfiesta' ? 'liquid-mesh' : ''}`}>
            {activeTab === 'superfiesta' ? (
            <>
                <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto w-full relative custom-scrollbar p-3 md:p-6 pb-48"
                >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[500px] md:auto-rows-[600px] max-w-[1800px] mx-auto">
                    {MODEL_BRANDS.map(brand => (
                    <AIColumn
                        key={brand.brandId}
                        brand={brand}
                        messages={columnMessages[brand.brandId]}
                        selectedModelId={selectedModels[brand.brandId]}
                        onModelChange={(newModelId) => handleModelChange(brand.brandId, newModelId)}
                        isEnabled={enabledModels[brand.brandId]}
                        onToggleEnabled={() => setEnabledModels(p => ({ ...p, [brand.brandId]: !p[brand.brandId] }))}
                        isStreaming={isStreaming}
                        rank={rankings.length > 0 ? (rankings.indexOf(brand.brandId) !== -1 ? rankings.indexOf(brand.brandId) + 1 : null) : null}
                        onRegenerate={(msgId) => handleRegenerate(brand.brandId, msgId)}
                        onClearColumn={() => handleClearColumn(brand.brandId)}
                        userStatus={userStatus}
                    />
                    ))}
                </div>
                </div>

                <div className="absolute bottom-6 left-0 w-full flex flex-col items-center justify-center px-4 z-30 pointer-events-none gap-4">
                {!isStreaming && columnMessages[MODEL_BRANDS[0].brandId].length > 0 && (
                    <div className="flex gap-4">
                    {rankings.length === 0 && (
                        <button
                        onClick={handleRank}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:scale-105 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/30 transition-all flex items-center gap-3 pointer-events-auto active:scale-95"
                        >
                        <Trophy size={16} /> Battle Evaluation
                        </button>
                    )}
                    <button
                        onClick={handleMerge}
                        className="bg-gradient-to-r from-accent to-primary hover:scale-105 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent/30 transition-all flex items-center gap-3 pointer-events-auto active:scale-95"
                    >
                        <Sparkles size={16} /> Merge Insights
                    </button>
                    </div>
                )}

                <div className="w-full max-w-4xl glass-panel !bg-background/40 backdrop-blur-3xl rounded-3xl md:rounded-[2.5rem] p-3 md:p-5 shadow-2xl pointer-events-auto border border-panel-border glow-accent group focus-within:border-accent/40 transition-all duration-500 scale-in-center">
                    <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="flex rounded-full p-1 border font-black bg-white/5 border-white/5">
                        <button
                        onClick={() => toggleTier("Flash")}
                        className={`text-[9px] uppercase tracking-widest px-5 py-2 rounded-full transition-all ${currentTier === "Flash" ? 'bg-white text-black shadow-xl' : 'text-muted hover:text-foreground'}`}
                        >
                        Flash
                        </button>
                        <button
                        onClick={() => toggleTier("Pro")}
                        className={`text-[9px] uppercase tracking-widest px-5 py-2 rounded-full transition-all ${currentTier === "Pro" ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-muted hover:text-foreground'}`}
                        >
                        Pro
                        </button>
                    </div>
                    </div>

                    <div className="relative px-2 flex items-end gap-3">
                    <textarea
                        value={prompt}
                        onChange={(e) => {
                        setPrompt(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt();
                        }
                        }}
                        placeholder={isStreaming ? "Synthesizing intelligence..." : "Ask anything..."}
                        className="flex-1 bg-transparent text-foreground placeholder-muted resize-none outline-none max-h-48 min-h-[40px] md:min-h-[50px] py-2 md:py-3 overflow-y-auto font-semibold md:font-bold text-sm md:text-lg leading-relaxed px-1"
                        rows={1}
                        disabled={isStreaming}
                    />
                    <button
                        onClick={() => handleSendPrompt()}
                        disabled={!prompt.trim() || isStreaming}
                        className={`p-4 rounded-3xl transition-all duration-500 mb-1 ${prompt.trim() ? 'bg-accent text-white shadow-xl shadow-accent/40 scale-110 rotate-0' : 'bg-panel-border text-muted grayscale'}`}
                    >
                        {isStreaming ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                    </button>
                    </div>
                </div>
                </div>
            </>
            ) : activeTab === 'sora' ? (
            <SoraMode />
            ) : activeTab === 'prompt_ai' ? (
            <PromptMode />
            ) : (
            <ImageMode />
            )}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

