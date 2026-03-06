"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, MessageSquarePlus, Maximize, Settings, Sparkles, X, RefreshCw, Trophy, History as HistoryIcon, LogOut, Shield, CreditCard, Loader2 } from "lucide-react";
import { AIBrand, ChatMessage, MODEL_BRANDS } from "@/types";
import AIColumn from "@/components/AIColumn";
import SoraMode from "@/components/SoraMode";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [rankings, setRankings] = useState<string[]>([]);
  const [personality, setPersonality] = useState("normal");
  const [activeTab, setActiveTab] = useState<"superfiesta" | "sora">("superfiesta"); // Default to SuperFiesta
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
  const [isRPMLocked, setIsRPMLocked] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserStatus();
    }
  }, [session]);

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
      const res = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": session?.user?.email || "unknown"
        },
        body: JSON.stringify({
          prompt: userPrompt,
          models: [selectedModelId],
          personality: personality,
          user_email: session?.user?.email || "unknown"
        })
      });

      if (res.status === 429) {
        setIsRPMLocked(true);
        setTimeout(() => setIsRPMLocked(false), 60000); // Unlock after 1 min
        return;
      }

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
  function NavItem({ icon, label, isOpen, active = false, onClick }: { icon: React.ReactNode, label: string, isOpen: boolean, active?: boolean, onClick?: () => void }) {
    const isSoraLocked = label === "Sora Mode" && userStatus && userStatus.messages_sent >= 10 && !userStatus.is_pro;

    return (
      <button
        onClick={label === "Sora Mode" && isSoraLocked ? undefined : onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-[#ff4d4d]/10 text-[#ff4d4d]' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'} ${!isOpen ? 'justify-center' : ''} ${isSoraLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        {icon}
        {isOpen && (
          <div className="flex flex-1 items-center justify-between">
            <span className="font-medium text-sm">{label}</span>
            {isSoraLocked && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden selection:bg-red-500/30">
      <aside
        className={`${isFullScreen ? 'hidden' : (sidebarOpen ? 'w-64' : 'w-0 opacity-0 md:w-20 md:opacity-100')} 
        transition-all duration-300 ease-in-out border-r border-[#222222] bg-[#0a0a0a] flex flex-col justify-between shrink-0 z-20 absolute md:relative h-full`}
      >
        <div className="p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2"><Sparkles className="text-[#ff4d4d]" size={20} /> Super AI</h1>}
            {!sidebarOpen && <Sparkles className="text-[#ff4d4d] mx-auto hidden md:block" size={24} />}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white md:hidden">
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
            className="flex items-center justify-center gap-2 bg-[#ff4d4d] hover:bg-[#ff6666] text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(255,77,77,0.15)]">
            <MessageSquarePlus size={18} />
            {sidebarOpen && <span>New Chat</span>}
          </button>

          <nav className="flex flex-col gap-2 mt-4">
            <NavItem icon={<Search size={18} />} label="Search" isOpen={sidebarOpen} />
            <NavItem
              icon={<Sparkles size={18} className="text-[#ff4d4d]" />}
              label="SuperFiesta Mode"
              isOpen={sidebarOpen}
              active={activeTab === 'superfiesta'}
              onClick={() => setActiveTab('superfiesta')}
            />
            <NavItem
              icon={<Sparkles size={18} className="text-indigo-400" />}
              label="Sora Mode"
              isOpen={sidebarOpen}
              active={activeTab === 'sora'}
              onClick={() => setActiveTab('sora')}
            />
            {session?.user?.email === "bhaveshkori001@gmail.com" && (
              <NavItem
                icon={<Shield size={18} className="text-indigo-400" />}
                label="Admin Panel"
                isOpen={sidebarOpen}
                onClick={() => window.open("/admin", "_blank")}
              />
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-[#222222] overflow-hidden flex flex-col min-h-0">
          {sidebarOpen && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <HistoryIcon size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">History</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                {fiestaHistory.length === 0 ? (
                  <div className="text-xs text-gray-600 italic px-2">No history yet</div>
                ) : (
                  fiestaHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPrompt(item.prompt);
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs text-gray-400 hover:bg-[#111] hover:text-gray-200 transition-all border border-transparent hover:border-white/5 truncate"
                    >
                      {item.prompt}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          <NavItem icon={<Settings size={18} />} label="Settings" isOpen={sidebarOpen} />

          {/* User Info + Sign Out */}
          <div className={`mt-2 pt-3 border-t border-[#222] flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            {session?.user?.image && (
              <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full shrink-0 ring-2 ring-indigo-500/40" />
            )}
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {!isFullScreen && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
                <Menu size={20} />
              </button>
            )}
            <span className="font-medium text-gray-200 capitalize">
              {activeTab === 'superfiesta' ? 'SuperFiesta Mode' : 'Sora Mode'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-sm font-medium border border-[#ff4d4d] bg-[#ff4d4d]/10 hover:bg-[#ff4d4d]/30 text-[#ff4d4d] px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,77,77,0.2)]">
              <Maximize size={14} /> {isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
            </button>
            <button className="text-sm font-medium border border-[#333] hover:bg-[#222] px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-gray-300">
              <RefreshCw size={14} className="text-[#ff4d4d]" /> Rotate Tokens
            </button>
          </div>
        </header>

        {activeTab === 'superfiesta' ? (
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto w-full relative custom-scrollbar p-4 md:p-6 pb-48"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[600px] max-w-[1800px] mx-auto">
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
              {/* Reuse existing inputs for SuperFiesta */}
              {!isStreaming && columnMessages[MODEL_BRANDS[0].brandId].length > 0 && (
                <div className="flex gap-4">
                  {rankings.length === 0 && (
                    <button
                      onClick={handleRank}
                      className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white px-6 py-2.5 rounded-full font-medium shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2 pointer-events-auto active:scale-95"
                    >
                      <Trophy size={16} /> AI Battle Evaluation
                    </button>
                  )}
                  <button
                    onClick={handleMerge}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-full font-medium shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center gap-2 pointer-events-auto active:scale-95"
                  >
                    <Sparkles size={16} /> Merge Best Answers
                  </button>
                </div>
              )}

              <div className="w-full max-w-2xl glass-panel rounded-2xl p-3 shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="flex bg-[#1a1a1a] rounded-lg p-1">
                    <button
                      onClick={() => toggleTier("Flash")}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${currentTier === "Flash" ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Fast Mode
                    </button>
                    <button
                      onClick={() => toggleTier("Pro")}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${currentTier === "Pro" ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Best Mode
                    </button>
                  </div>
                </div>

                <div className="mt-3 relative">
                  {(() => {
                    const isInputLocked = isRPMLocked || (userStatus && userStatus.messages_sent >= 10 && !userStatus.is_pro);
                    return (
                      <>
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
                              if (!isInputLocked) handleSendPrompt();
                            }
                          }}
                          placeholder={isRPMLocked ? "RPM Limit Reached. Locked for 1 min..." : isStreaming ? "Generating response..." : isInputLocked ? "10-Message Free Limit Reached. Go Pro!" : "Ask Super AI anything..."}
                          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none max-h-48 min-h-[50px] pr-12 overflow-y-auto disabled:opacity-50"
                          rows={1}
                          disabled={isStreaming || isInputLocked}
                        />
                        <div className="absolute right-2 bottom-2">
                          <button
                            onClick={() => handleSendPrompt()}
                            disabled={!prompt.trim() || isStreaming || isInputLocked}
                            className={`p-2 rounded-lg transition-colors ${isInputLocked ? 'bg-gray-800 text-gray-500' : 'bg-white text-black hover:bg-gray-200'} disabled:opacity-50`}
                          >
                            <Sparkles size={18} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <SoraMode />
        )}
      </main>
    </div>
  );
}

