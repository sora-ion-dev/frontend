"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, MessageSquarePlus, Maximize, Settings, Sparkles, X, RefreshCw, Trophy, History as HistoryIcon, LogOut, Shield, CreditCard, Loader2, Layers, Brain, Zap, Send, Image as ImageIcon, Plus } from "lucide-react";
import { AIBrand, ChatMessage, MODEL_BRANDS, FIESTA_BRAND_IDS } from "@/types";
import AIColumn from "@/components/AIColumn";
import SoraMode from "@/components/SoraMode";
import PromptMode from "@/components/PromptMode";
import PlaySora from "@/components/PlaySora";
import AIFiestaMode from "@/components/AIFiestaMode";
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
  const [activeTab, setActiveTab] = useState<"superfiesta" | "sora" | "prompt_ai" | "play_sora">("superfiesta");

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
      initial[brand.id] = true;
    });
    return initial;
  });

  const [selectedModels, setSelectedModels] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MODEL_BRANDS.forEach(brand => {
      initial[brand.id] = brand.id;
    });
    return initial;
  });

  const [columnMessages, setColumnMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const initial: Record<string, ChatMessage[]> = {};
    MODEL_BRANDS.forEach(brand => {
      initial[brand.id] = [];
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

  const handleModelChange = (brandId: string, newModelId: string) => {
    setSelectedModels(prev => ({ ...prev, [brandId]: newModelId }));
  };

  const streamResponse = async (brandId: string, userPrompt: string, selectedModelId: string, assistantMsgId: string) => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
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
    setRankings([]);
    if (!customPrompt) setPrompt("");

    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = { id: userMsgId, role: "user", content: userPrompt };

    if (activeTab === "superfiesta") {
      setFiestaHistory(prev => [{ id: userMsgId, prompt: userPrompt, timestamp: Date.now() }, ...prev]);
    }

    const fiestaBrands = MODEL_BRANDS.filter(b => FIESTA_BRAND_IDS.includes(b.brandId));

    setColumnMessages(prev => {
      const next = { ...prev };
      fiestaBrands.forEach((brand: AIBrand) => {
        const assistantMsgId = `assistant-${brand.id}-${userMsgId}`;
        const isTargeted = targetModels ? targetModels.includes(brand.id) : enabledModels[brand.id];

        if (isTargeted) {
          next[brand.id] = [
            ...next[brand.id],
            newUserMessage,
            { id: assistantMsgId, role: "assistant", content: "", isStreaming: true }
          ];
        } else {
          next[brand.id] = [
            ...next[brand.id],
            newUserMessage
          ];
        }
      });
      return next;
    });

    const effectiveModels = targetModels
      ? fiestaBrands.filter(b => targetModels.includes(b.brandId))
      : fiestaBrands.filter(b => enabledModels[b.brandId]);

    const promises = effectiveModels.map(brand => {
      const exactMsgId = `assistant-${brand.id}-${userMsgId}`;
      const selectedModelId = selectedModels[brand.id] || brand.id;
      return streamResponse(brand.id, userPrompt, selectedModelId, exactMsgId);
    });

    await Promise.all(promises);
    setIsStreaming(false);
  };

  const handleRank = async () => {
    const fiestaBrands = MODEL_BRANDS.filter(b => FIESTA_BRAND_IDS.includes(b.brandId));
    const answers: Record<string, string> = {};
    fiestaBrands.forEach(brand => {
      const msgs = columnMessages[brand.id];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg?.role === "assistant") {
        answers[brand.id] = lastMsg.content;
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
          original_prompt: columnMessages[fiestaBrands[0].id]?.find(m => m.role === "user")?.content || "Rate the answers",
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
    const fiestaBrands = MODEL_BRANDS.filter(b => FIESTA_BRAND_IDS.includes(b.brandId));
    const answers = fiestaBrands.map(brand => {
      const msgs = columnMessages[brand.id];
      const lastMsg = msgs[msgs.length - 1];
      return lastMsg?.role === "assistant" ? lastMsg.content : "";
    }).filter(a => a.length > 0);

    if (answers.length < 2) return;

    const newId = Date.now().toString();
    setColumnMessages(prev => {
      const next = { ...prev };
      fiestaBrands.forEach(brand => {
        next[brand.id] = [
          ...next[brand.id],
          { id: `merge-${brand.id}-${newId}`, role: "assistant", content: "", isStreaming: true }
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
          original_prompt: columnMessages[fiestaBrands[0].id]?.find(m => m.role === "user")?.content || "Merged user prompt",
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
                    fiestaBrands.forEach(brand => {
                      const msgs = next[brand.id];
                      const msgIndex = msgs.findIndex(m => m.id === `merge-${brand.id}-${newId}`);
                      if (msgIndex !== -1) {
                        msgs[msgIndex] = { ...msgs[msgIndex], content: fullText };
                        next[brand.id] = [...msgs];
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
          const msgs = next[brand.id];
          const msgIndex = msgs.findIndex(m => m.id === `merge-${brand.id}-${newId}`);
          if (msgIndex !== -1) {
            msgs[msgIndex] = { ...msgs[msgIndex], isStreaming: false };
            next[brand.id] = [...msgs];
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
        handleSendPrompt(userMsg.content, [brandId]);
      }
    }
  };

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
        style={{ background: "linear-gradient(180deg, #12123a 0%, #0d0d2e 40%, #0a0a1a 100%)", borderRight: "1px solid rgba(100,80,200,0.15)" }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6c63ff, #a855f7)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">SUPER AI</h1>
          <button className="ml-auto md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Conversation */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              MODEL_BRANDS.forEach(brand => {
                setColumnMessages(prev => ({ ...prev, [brand.id]: [] }));
              });
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6c63ff, #a855f7)", boxShadow: "0 4px 20px rgba(108,99,255,0.4)" }}
          >
            <MessageSquarePlus className="w-4 h-4" /> New Conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-purple-500/40 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("superfiesta")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "superfiesta" ? "text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            style={activeTab === "superfiesta" ? { background: "linear-gradient(135deg, #6c63ff33, #a855f733)", border: "1px solid rgba(108,99,255,0.3)" } : {}}
          >
            <Sparkles size={18} className={activeTab === "superfiesta" ? "text-[#a855f7]" : ""} />
            SuperFiesta Mode
          </button>

          <button
            onClick={() => setActiveTab("play_sora")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "play_sora" ? "text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            style={activeTab === "play_sora" ? { background: "linear-gradient(135deg, #6c63ff33, #a855f733)", border: "1px solid rgba(108,99,255,0.3)" } : {}}
          >
            <Zap size={18} className={activeTab === "play_sora" ? "text-[#6c63ff]" : ""} />
            Sora Mode
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ImageIcon size={18} />
            Image Generator
          </button>

          <button
            onClick={() => setActiveTab("prompt_ai")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === "prompt_ai" ? "text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            style={activeTab === "prompt_ai" ? { background: "linear-gradient(135deg, #6c63ff33, #a855f733)", border: "1px solid rgba(108,99,255,0.3)" } : {}}
          >
            <Brain size={18} className={activeTab === "prompt_ai" ? "text-[#a855f7]" : ""} />
            Prompt AI
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <Shield size={18} />
            Admin Panel
          </button>

          {/* RECENTS */}
          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-4 pb-2">Recents</p>
            <p className="text-xs text-white/20 italic px-4">No threads yet</p>
          </div>
        </nav>

        {/* Bottom: Settings + User */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={toggleSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings size={18} />
            Settings
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: "linear-gradient(135deg, #6c63ff, #a855f7)" }}>
              {session?.user?.name?.substring(0, 1) || "N"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate">PREMIUM ACCESS</p>
              <p className="text-[10px] text-white/30 truncate">SORA-ION MODE</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden" style={{ background: "#0a0a1a" }}>
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 z-40" style={{ background: "rgba(10,10,26,0.8)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/60">
              {activeTab === "superfiesta" ? "SuperFiesta Mode" : activeTab === "play_sora" ? "Sora Mode" : activeTab === "prompt_ai" ? "Prompt AI" : activeTab.replace("_", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleFullScreen} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
              <Maximize className="w-4 h-4" /> Full Screen
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
              <RefreshCw className="w-4 h-4" /> Rotate Keys
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <section className="flex-1 overflow-hidden relative">
          {activeTab === "play_sora" && <PlaySora />}
          {activeTab === "superfiesta" && (
            <AIFiestaMode
              onSendPrompt={handleSendPrompt}
              columnMessages={columnMessages}
              selectedModels={selectedModels}
              onModelChange={handleModelChange}
              isStreaming={isStreaming}
              rankings={rankings}
              onRank={handleRank}
              onMerge={handleMerge}
              onRegenerate={handleRegenerate}
              onClearColumn={handleClearColumn}
              enabledModels={enabledModels}
              onToggleEnabled={(bid) => setEnabledModels(prev => ({ ...prev, [bid]: !prev[bid] }))}
            />
          )}
          {activeTab === "sora" && <SoraMode />}
          {activeTab === "prompt_ai" && <PromptMode />}
        </section>

        {isSettingsOpen && (
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        )}
      </main>
    </div>
  );
}
