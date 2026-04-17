"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, MessageSquarePlus, Maximize, Settings, Sparkles, X, RefreshCw, Trophy, History as HistoryIcon, LogOut, Shield, CreditCard, Loader2, Layers, Brain, Zap, Send, Image as ImageIcon, Plus, Lock as LockIcon } from "lucide-react";
import { AIBrand, ChatMessage, MODEL_BRANDS, FIESTA_BRAND_IDS } from "@/types";
import { BACKEND_URL } from "@/lib/config";
import AIColumn from "@/components/AIColumn";
import SoraMode from "@/components/SoraMode";
import PromptMode from "@/components/PromptMode";
import PlaySora from "@/components/PlaySora";
import AIFiestaMode from "@/components/AIFiestaMode";
import SettingsModal from "@/components/SettingsModal";
import ImageFiestaMode from "@/components/ImageFiestaMode";
import SuperSearchMode from "@/components/SuperSearchMode";
import { IMAGE_FIESTA_BRAND_IDS } from "@/types";
import AccessGate from "@/components/AccessGate";

const AUTHORIZATION_KEY = "2103";
const FREE_MESSAGE_LIMIT = 5;

export default function Home() {
  const session = { user: { email: "public-user", name: "Guest" } }; // Dummy session for public access
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [rankings, setRankings] = useState<string[]>([]);
  const [personality, setPersonality] = useState("Professional");
  const [webSearch, setWebSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"superfiesta" | "sora" | "prompt_ai" | "play_sora" | "image_fiesta" | "super_search">("superfiesta");
  
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const auth = localStorage.getItem("superai_authorized");
    const count = parseInt(localStorage.getItem("superai_msg_count") || "0");
    const lastDate = localStorage.getItem("superai_last_msg_date");
    const today = new Date().toLocaleDateString();

    if (auth === "true") setIsAuthorized(true);
    else if (auth === "false") setIsAuthorized(false);

    if (lastDate !== today) {
      localStorage.setItem("superai_last_msg_date", today);
      localStorage.setItem("superai_msg_count", "0");
      setMessageCount(0);
    } else {
      setMessageCount(count);
    }
  }, []);

  const handleAuthorized = () => {
    const auth = localStorage.getItem("superai_authorized") === "true";
    setIsAuthorized(auth);
  };

  const incrementMessageCount = () => {
    if (isAuthorized) return;
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    localStorage.setItem("superai_msg_count", newCount.toString());
  };

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

  const [enabledModels, setEnabledModels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const syncEnabledModels = () => {
      const saved = localStorage.getItem("superai_enabled_models");
      if (saved) {
        setEnabledModels(JSON.parse(saved));
      } else {
        const initial: Record<string, boolean> = {};
        MODEL_BRANDS.forEach(brand => (initial[brand.id] = true));
        setEnabledModels(initial);
      }
    };
    syncEnabledModels();
    window.addEventListener("settingsChanged", syncEnabledModels);
    return () => window.removeEventListener("settingsChanged", syncEnabledModels);
  }, []);

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

  const [imageFiestaResults, setImageFiestaResults] = useState<Record<string, any[]>>(() => {
    const initial: Record<string, any[]> = {};
    IMAGE_FIESTA_BRAND_IDS.forEach(id => (initial[id] = []));
    return initial;
  });
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [enabledImageModels, setEnabledImageModels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const syncImageModels = () => {
      const saved = localStorage.getItem("superai_enabled_image_models");
      if (saved) {
        setEnabledImageModels(JSON.parse(saved));
      } else {
        const initial: Record<string, boolean> = {};
        IMAGE_FIESTA_BRAND_IDS.forEach(id => (initial[id] = true));
        setEnabledImageModels(initial);
      }
    };
    syncImageModels();
    window.addEventListener("settingsChanged", syncImageModels);
    return () => window.removeEventListener("settingsChanged", syncImageModels);
  }, []);

  const toggleImageModelEnabled = (brandId: string) => {
    setEnabledImageModels(prev => ({ ...prev, [brandId]: !prev[brandId] }));
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
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

  const handleImageFiestaGenerate = async (userPrompt: string) => {
    if (!userPrompt.trim() || isImageGenerating) return;
    setIsImageGenerating(true);

    try {
      // Parallel generation calling our backend (HF/OR Inference)
      let activeModelIds = IMAGE_FIESTA_BRAND_IDS.filter(id => enabledImageModels[id]);
      
      // RESTRICTION: Only 2 models for free users
      if (!isAuthorized) {
        activeModelIds = activeModelIds.slice(0, 2);
      }

      const generationPromises = activeModelIds.map(async (modelId) => {
        try {
          const res = await fetch(`${BACKEND_URL}/chat/image-generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: userPrompt,
              model_id: modelId,
              user_email: session?.user?.email || "unknown"
            })
          });

          if (!res.ok) {
            const errData = await res.json();
             throw new Error(errData.detail || "Generation failed");
          }

          const data = await res.json();
          const imageUrl = data.image; // Base64 or URL

          const result = {
            id: Math.random().toString(36).substring(7),
            url: imageUrl,
            prompt: userPrompt,
            timestamp: Date.now()
          };

          setImageFiestaResults(prev => ({
            ...prev,
            [modelId]: [result, ...prev[modelId]]
          }));
        } catch (err) {
          console.error(`Generation failed for ${modelId}`, err);
        }
      });

      await Promise.all(generationPromises);
    } catch (error) {
      console.error("Global image generation failure", error);
    } finally {
      setIsImageGenerating(false);
    }
  };

  const handleSendPrompt = async (customPrompt?: string, targetModels?: string[]) => {
    const userPrompt = customPrompt || prompt;
    if (!userPrompt.trim() || isStreaming) return;

    if (!isAuthorized && messageCount >= FREE_MESSAGE_LIMIT) {
      alert(`Limit Reached! You have used your ${FREE_MESSAGE_LIMIT} free messages for today. Please enter the access key for unlimited chats.`);
      return;
    }

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

    // RESTRICTION: Only 3 models for free users
    const limitedModels = !isAuthorized ? effectiveModels.slice(0, 3) : effectiveModels;

    const promises = limitedModels.map(brand => {
      const exactMsgId = `assistant-${brand.id}-${userMsgId}`;
      const selectedModelId = selectedModels[brand.id] || brand.id;
      return streamResponse(brand.id, userPrompt, selectedModelId, exactMsgId);
    });

    await Promise.all(promises);
    incrementMessageCount();
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
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-500">
      <div className="premium-grain" />
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-all duration-300 ease-in-out transform aurora-bg ${sidebarOpen ? (sidebarCollapsed ? "-translate-x-full" : "translate-x-0") : "-translate-x-full"} md:relative md:translate-x-0 ${sidebarCollapsed ? "md:w-0 md:opacity-0" : "md:w-72 md:opacity-100"} bg-panel/80 backdrop-blur-3xl border-r border-panel-border overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg transform transition-transform hover:rotate-6 flex items-center justify-center bg-white/5 border border-white/10 logo-glow">
              <img src="/logos/logo.png" alt="Fiesta AI" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">SUPER AI</h1>
          </div>
          <button 
            className="text-foreground/20 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-foreground/5" 
            onClick={() => setSidebarCollapsed(true)}
            title="Collapse Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Conversation */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              MODEL_BRANDS.forEach(brand => {
                setColumnMessages(prev => ({ ...prev, [brand.brandId]: [] }));
              });
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent/20"
            style={{ background: "linear-gradient(135deg, #10b981, #059669, #3b82f6)" }}
          >
            <Plus className="w-5 h-5" /> New Conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-foreground/5 border border-panel-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground placeholder-foreground/40 outline-none focus:border-accent/40 transition-all font-medium"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("superfiesta")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${activeTab === "superfiesta" ? "bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/5" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
          >
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTab === "superfiesta" ? "bg-accent/20" : "bg-foreground/5"}`}>
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold uppercase tracking-widest">Super Fiesta</span>
              <span className="text-[9px] font-medium opacity-50">Multi-Model Arena</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("sora")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${activeTab === "sora" ? "bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/5" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
          >
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTab === "sora" ? "bg-accent/20" : "bg-foreground/5"}`}>
              <Zap className="w-5 h-5 text-[#6c63ff]" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold uppercase tracking-widest">Sora Mode</span>
              <span className="text-[9px] font-medium opacity-50">Cinematic Video</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("image_fiesta")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${activeTab === "image_fiesta" ? "bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/5" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
          >
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTab === "image_fiesta" ? "bg-accent/20" : "bg-foreground/5"}`}>
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Image Mode
              </span>
              <span className="text-[9px] font-medium opacity-50">Unlimited Synthesis</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("prompt_ai")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${activeTab === "prompt_ai" ? "bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/5" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
          >
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTab === "prompt_ai" ? "bg-accent/20" : "bg-foreground/5"}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Prompt AI
              </span>
              <span className="text-[9px] font-medium opacity-50">Intelligent Prompt Engineering</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("super_search")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${activeTab === "super_search" ? "bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/5" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
          >
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTab === "super_search" ? "bg-accent/20" : "bg-foreground/5"}`}>
              <Search className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Super Search
              </span>
              <span className="text-[9px] font-medium opacity-50">Deep Research AI</span>
            </div>
          </button>



          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <Shield size={18} className="text-indigo-400" />
            Admin Panel
          </button>

          {/* RECENTS */}
          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-4 pb-2">Recents</p>
            <p className="text-xs text-foreground/40 italic px-4 font-bold">No threads yet</p>
          </div>
        </nav>

        {/* Bottom: Settings + User */}
        <div className="p-4 border-t border-panel-border space-y-2">
          <button
            onClick={toggleSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <Settings size={18} />
            Settings
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 border border-panel-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-blue-500/10 to-accent/10 animate-slow-pan opacity-50" />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg relative z-10" style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}>
              <Sparkles size={16} />
            </div>
            <div className="flex-1 overflow-hidden relative z-10">
              <p className="text-xs font-black text-foreground truncate uppercase">Quantum Access</p>
              <p className="text-[10px] text-foreground/50 truncate uppercase font-bold tracking-tighter">
                Super AI Pro Network
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-background">
        
        {/* Floating Sidebar Toggle (Persistent when collapsed or on mobile) */}
        {(!sidebarOpen || sidebarCollapsed) && (
          <div className="absolute top-6 left-6 z-[60]">
            <button 
              onClick={() => { setSidebarCollapsed(false); setSidebarOpen(true); }}
              className="group relative p-3 bg-panel/80 backdrop-blur-2xl border border-panel-border rounded-[1.25rem] text-foreground/50 hover:text-foreground hover:border-accent/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95"
              title="Expand Workspace"
            >
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.25rem] blur-xl" />
              <Menu className="w-5 h-5 relative z-10" />
            </button>
          </div>
        )}

        {/* Header */}
        {/* Header - Hidden in SuperFiesta & Sora as per user request */}
        {activeTab !== "superfiesta" && activeTab !== "sora" && activeTab !== "image_fiesta" && activeTab !== "prompt_ai" && activeTab !== "super_search" && (
          <header className="h-16 flex items-center justify-between px-6 border-b border-panel-border z-40 bg-background/80 backdrop-blur-xl shrink-0">

          <div className="flex items-center gap-4">
            {(sidebarCollapsed || !sidebarOpen) && (
              <button 
                className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent hover:bg-accent/20 transition-all animate-in fade-in slide-in-from-left-4" 
                onClick={() => { setSidebarCollapsed(false); setSidebarOpen(true); }}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-sm font-semibold text-foreground/80">
              {(activeTab as string) === "superfiesta" ? "SuperFiesta Mode" : (activeTab as string) === "sora" ? "Sora Mode" : (activeTab as string) === "prompt_ai" ? "Prompt AI" : (activeTab as string).replace("_", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleFullScreen} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/5 border border-panel-border transition-all">
              <Maximize className="w-4 h-4" /> Full Screen
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-foreground/5 border border-panel-border transition-all">
              <RefreshCw className="w-4 h-4" /> Rotate Keys
            </button>
          </div>
        </header>
        )}


        {/* Tab Content */}
        <section className="flex-1 overflow-hidden relative">
          {activeTab === "sora" && <SoraMode enabledModels={enabledModels} isAuthorized={!!isAuthorized} />}
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
              isAuthorized={!!isAuthorized}
            />
          )}
          {activeTab === "image_fiesta" && (
            <div className="h-full animate-in fade-in duration-700">
               <ImageFiestaMode 
                  onGenerate={handleImageFiestaGenerate}
                  results={imageFiestaResults}
                  isGenerating={isImageGenerating}
                  enabledImageModels={enabledImageModels}
                  onToggleEnabled={toggleImageModelEnabled}
                  isAuthorized={!!isAuthorized}
               />
            </div>
          )}
          {activeTab === "prompt_ai" && <PromptMode />}
          {activeTab === "super_search" && <SuperSearchMode />}
        </section>

        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            userStatus={userStatus}
            sessionImages={Object.values(imageFiestaResults).flat()}
          />
        )}
      </main>
    </div>
  );

  if (isAuthorized === null) {
    return <AccessGate onAuthorized={handleAuthorized} />;
  }

  return MainAppContent;
}
