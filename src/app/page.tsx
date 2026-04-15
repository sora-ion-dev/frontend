"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Sparkles, ChevronDown, Zap, Cpu, Command, Network, 
  Shield, Globe, ArrowRight, Instagram, Linkedin, Github, Twitter, 
  Layers, Database, Activity, Terminal, CheckCircle2, Search,
  Eye, Code, PenTool, BarChart3, Radio, HardDrive
} from "lucide-react";

// --- ANIMATION VARIANTS ---

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

// --- COMPONENTS ---

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={FADE_UP}
      className={`group border rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer
        ${open ? "border-purple-500/30 bg-purple-500/5 shadow-[0_20px_40px_rgba(123,97,255,0.05)]" : "border-white/5 bg-white/[0.01] hover:border-white/10"}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-8 gap-4">
        <span className="text-[18px] font-semibold text-white/70 group-hover:text-white transition-colors tracking-tight">{q}</span>
        <div className={`p-2 rounded-xl bg-white/5 transition-transform duration-500 ${open ? "rotate-180 bg-purple-500/20 text-purple-400" : ""}`}>
          <ChevronDown size={18} />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 text-[15px] text-white/30 leading-relaxed border-t border-white/5 pt-6 uppercase">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NeuralEnginePreview() {
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { label: "Semantic Parsing", icon: <Search size={14} />, detail: "Analyzing intent vectors..." },
    { label: "Kernel Swap", icon: <Cpu size={14} />, detail: "Selecting optimal node..." },
    { label: "Evaluation", icon: <Activity size={14} />, detail: "Verifying logic integrity..." },
    { label: "Final Stream", icon: <CheckCircle2 size={14} />, detail: "Pushing to user edge." }
  ];

  return (
    <div className="w-full max-w-lg mx-auto rounded-[3rem] border border-white/10 bg-[#050505] p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div className="flex items-center justify-between mb-10 opacity-40">
        <div className="flex gap-1.5 text-purple-500">
          <Terminal size={14} />
          <div className="text-[10px] font-black tracking-widest uppercase">System Control v6.0</div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
      </div>
      
      <div className="space-y-5">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            animate={{ opacity: activeStep === idx ? 1 : 0.25, x: activeStep === idx ? 12 : 0 }}
            className={`flex items-center gap-5 p-5 rounded-2xl border ${activeStep === idx ? "border-purple-500/30 bg-purple-500/5 shadow-inner" : "border-white/5 bg-transparent"}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeStep === idx ? "bg-purple-600 text-white shadow-lg" : "bg-white/5 text-white/20"}`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold tracking-wide uppercase">{step.label}</div>
              <div className="text-[11px] text-white/20 font-medium uppercase mt-1">{step.detail}</div>
            </div>
            {activeStep === idx && <motion.div layoutId="active" className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(123,97,255,0.8)]" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const ALL_MODELS = [
  { name: "GLM 4.7 Reasoning", logo: "/logos/glm.svg" },
  { name: "Mistral Small v3", logo: "/logos/mistral.svg" },
  { name: "Gemini 1.5 Pro", logo: "/logos/gemini_flash.svg" },
  { name: "DeepSeek V3", logo: "/logos/deepseek_chat.svg" },
  { name: "Llama 3.3", logo: "/logos/llama33.svg" },
  { name: "o1-Preview", logo: "/logos/gpt4o_pro.svg" },
  { name: "Flux.1", logo: "/logos/bfl.svg" },
  { name: "Hunyuan 3.0", logo: "/logos/hunyuan.png" },
  { name: "SDXL Lightning", logo: "/logos/bytedance.svg" },
  { name: "Mistral Large", logo: "/logos/mistral.png" },
  { name: "Qwen 2.5", logo: "/logos/qwen.svg" },
  { name: "Perplexity Online", logo: "/logos/perplexity.png" },
  { name: "Command R+", logo: "/logos/cohere.png" },
  { name: "Stable Diffusion 3", logo: "/logos/sd3.png" },
  { name: "Gemini Flash", logo: "/logos/gemini_flash.svg" },
  { name: "Claude Opus", logo: "/logos/claude.png" },
  { name: "GPT-3.5 Turbo", logo: "/logos/gpt4o_pro.svg" },
  { name: "Nova One", logo: "/logos/nova.png" }
];

const FEATURES = [
  {
    icon: <Network size={22} className="text-purple-400" />,
    title: "Neural Synergy",
    desc: "Autonomous fusion of 31+ flagship nodes into one stream.",
    grid: "col-span-1 md:col-span-6 lg:col-span-7",
    glow: "bg-purple-600/10"
  },
  {
    icon: <Eye size={22} className="text-blue-400" />,
    title: "Vision Eval",
    desc: "Advanced multimodal analysis across global vision kernels.",
    grid: "col-span-1 md:col-span-6 lg:col-span-5",
    glow: "bg-blue-600/10"
  },
  {
    icon: <Code size={22} className="text-emerald-400" />,
    title: "Logic Studio",
    desc: "Deep comparative coding and architectural battle testing.",
    grid: "col-span-1 md:col-span-6 lg:col-span-5",
    glow: "bg-emerald-600/10"
  },
  {
    icon: <PenTool size={22} className="text-indigo-400" />,
    title: "Artisan Image",
    desc: "Sub-5 second generation with ByteDance & Tencent latency.",
    grid: "col-span-1 md:col-span-6 lg:col-span-7",
    glow: "bg-indigo-600/10"
  },
  {
    icon: <BarChart3 size={22} className="text-amber-400" />,
    title: "IQ Benchmarking",
    desc: "Real-time accuracy scoring for every single model hit.",
    grid: "col-span-1 md:col-span-6 lg:col-span-6",
    glow: "bg-amber-600/10"
  },
  {
    icon: <Shield size={22} className="text-white" />,
    title: "Isolation Mode",
    desc: "Ephemeral session security for professional scale query.",
    grid: "col-span-1 md:col-span-6 lg:col-span-6",
    glow: "bg-white/5"
  }
];

const FAQS = [
  {
    q: "How does the Neural Orchestrator work?",
    a: "It visualizes the meta-reasoning process of 31 AI models, allowing you to selectively weight and compare inputs in real-time.",
  },
  {
    q: "Is it really 100% account-free?",
    a: "Correct. We value the friction-less exchange of intelligence. Land, prompt, and receive—no logins required for standard access.",
  },
  {
    q: "Can I use it for commercial production?",
    a: "Yes. Fiesta AI is built for professional pipelines, offering the highest model concurrency available for verification and creative drafting.",
  },
  {
    q: "Which models power the image mode?",
    a: "We integrate direct fast-inference nodes for FLUX.1, SDXL Lightning, and Hunyuan 3.0, ensuring sub-5-second generation speeds.",
  }
];

// --- MAIN PAGE ---

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans antialiased uppercase tracking-tight">
      
      {/* ===== ATMOSPHERIC BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] right-[5%] w-[800px] h-[800px] bg-purple-600/[0.03] blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 70, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] left-[-5%] w-[900px] h-[900px] bg-blue-600/[0.03] blur-[150px] rounded-full" 
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ===== FLOATING NAVBAR ===== */}
      <nav className="fixed top-10 left-0 right-0 z-[100] px-6">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`max-w-4xl mx-auto h-16 rounded-full border transition-all duration-700 flex items-center justify-between px-10 backdrop-blur-3xl
            ${scrolled ? "bg-black/95 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] scale-95" : "bg-white/5 border-white/5"}`}
        >
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center shadow-[0_0_25px_rgba(123,97,255,0.4)] group-hover:rotate-[15deg] transition-transform">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-semibold text-[14px] tracking-widest uppercase text-white/90">Fiesta AI Hub</span>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            {["INTELLIGENCE", "ARCHITECT", "FAQ"].map((item, idx) => (
              <button 
                key={item} 
                onClick={() => scrollTo(["ecosystem", "engine", "faq"][idx])} 
                className="text-[12px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {item}
              </button>
            ))}
          </div>

          <Link
            href="/app"
            className="px-8 py-3 rounded-full bg-white text-black text-[12px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            Launch Terminal
          </Link>
        </motion.div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-80 pb-32 px-6">
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-7xl mx-auto text-center"
        >
          <motion.div
            variants={FADE_UP}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[11px] font-black uppercase tracking-[0.5em] mb-16 shadow-2xl backdrop-blur-md"
          >
            <Radio size={12} className="text-purple-500 animate-pulse" />
            31 Active Neural Clusters Verified | BUILT BY X-AI GROUP
          </motion.div>

          <motion.h1 
            variants={FADE_UP}
            className="text-[clamp(3.5rem,14vw,8.5rem)] font-semibold tracking-tighter text-white leading-[0.82] mb-16"
          >
            Synchronize <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-400 animate-shimmer bg-[length:200%_auto]">Your Essence.</span>
          </motion.h1>

          <motion.p 
            variants={FADE_UP}
            className="text-[18px] md:text-[22px] text-white/30 max-w-3xl mx-auto mb-20 leading-relaxed font-medium tracking-wide normal-case"
          >
            The pinnacle of unified orchestration. Fiesta AI synchronizes 31+ flagship models into a single, high-fidelity environment for reasoning, vision, and art.
          </motion.p>

          <motion.div 
            variants={FADE_UP}
            className="flex flex-col sm:flex-row items-center justify-center gap-10"
          >
            <Link
              href="/app"
              className="px-20 py-8 rounded-[3rem] bg-white text-black font-black text-[16px] uppercase tracking-widest hover:scale-110 hover:shadow-[0_25px_80px_rgba(123,97,255,0.4)] transition-all active:scale-95 flex items-center gap-4 shadow-2xl"
            >
              Enter Hub
              <ArrowRight size={24} />
            </Link>
            <button
              onClick={() => scrollTo("ecosystem")}
              className="px-20 py-8 rounded-[3rem] border border-white/15 bg-white/5 text-white/60 font-bold text-[16px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-xl backdrop-blur-lg"
            >
              The Ecosystem
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== NEW: INFINITE MODEL MARQUEE ===== */}
      <section id="ecosystem" className="py-24 border-y border-white/5 relative bg-white/[0.01] overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />
        
        <div className="flex flex-col gap-14">
          <motion.div 
             animate={{ x: [0, -2800] }}
             transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
             className="flex gap-24 whitespace-nowrap"
          >
            {[...ALL_MODELS, ...ALL_MODELS].map((m, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 group-hover:scale-110 transition-all overflow-hidden p-1.5 grayscale group-hover:grayscale-0">
                  <img src={m.logo} alt={m.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <span className="text-[22px] font-black text-white/20 group-hover:text-white transition-all uppercase tracking-tighter">{m.name}</span>
              </div>
            ))}
          </motion.div>
          <motion.div 
             animate={{ x: [-2800, 0] }}
             transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
             className="flex gap-24 whitespace-nowrap opacity-50"
          >
            {[...[...ALL_MODELS].reverse(), ...ALL_MODELS].map((m, i) => (
              <div key={i} className="flex items-center gap-6 group scale-90">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 group-hover:scale-110 transition-all overflow-hidden p-1.5 grayscale">
                  <img src={m.logo} alt={m.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <span className="text-[22px] font-black text-white/10 group-hover:text-white/40 transition-all uppercase tracking-tighter">{m.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ENGINE PREVIEW ===== */}
      <section id="engine" className="py-48 px-6 border-b border-white/10 bg-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
           <motion.div
             initial={{ opacity: 0, x: -40 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="space-y-12"
           >
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-purple-500/50" />
                <div className="text-purple-500 text-[12px] font-black tracking-[0.7em] uppercase">Architecture v6</div>
              </div>
              <h2 className="text-6xl md:text-8xl font-semibold tracking-tighter uppercase leading-[0.88]">Unified <br/> Orchestration.</h2>
              <p className="text-white/30 text-[20px] font-medium leading-relaxed normal-case">
                Fiesta AI analyzes every query through a professional meta-eval layer, identifying which node in the global cloud is best equipped for your specific intent.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                 {[
                   { t: "31 Nodes", d: "Global Cluster Scale" },
                   { t: "1.2ms Switch", d: "Engine Latency" },
                   { t: "High IQ", d: "Deep Reasoning Evals" },
                   { t: "Fused Art", d: "Tencent & ByteDance" }
                 ].map((item, i) => (
                   <div key={i} className="space-y-2 border-l-2 border-purple-500/20 pl-6">
                      <div className="text-[15px] font-black uppercase tracking-widest">{item.t}</div>
                      <div className="text-[11px] text-white/20 uppercase tracking-widest">{item.d}</div>
                   </div>
                 ))}
              </div>
           </motion.div>
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
           >
              <NeuralEnginePreview />
           </motion.div>
        </div>
      </section>

      {/* ===== NEW: PERFORMANCE BENTO GRID ===== */}
      <section className="py-48 px-6 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.02] blur-[150px] rounded-full" />
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-32"
          >
            <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase">Power Deployment.</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[320px] gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.01 }}
                className={`${f.grid} p-12 rounded-[4rem] border border-white/5 bg-[#050505] relative group transition-all overflow-hidden shadow-2xl`}
              >
                <div className={`absolute -right-32 -top-32 w-80 h-80 ${f.glow} blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-10 border border-white/10 shadow-xl group-hover:bg-white/10 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-5 tracking-tight uppercase">{f.title}</h3>
                <p className="text-white/20 text-[16px] font-medium leading-relaxed tracking-tight uppercase">{f.desc}</p>
                <div className="absolute bottom-8 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white/20">
                   <span className="text-[10px] font-bold tracking-widest uppercase">Select Mode</span>
                   <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MISSION TRANSPARENCY ===== */}
      <section className="py-48 px-6 border-t border-white/10 bg-[#020202]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-8 py-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[12px] font-black tracking-[0.5em] uppercase"
            >
              The Vision Protocol
            </motion.div>
            <h2 className="text-6xl md:text-9xl font-semibold tracking-tighter uppercase leading-[0.85]">Intelligence <br/> For Everyone.</h2>
            <p className="text-white/30 text-[22px] font-medium leading-relaxed normal-case max-w-3xl mx-auto">
              We believe elite neural orchestration should be accessible to every creative human. Fiesta AI is built for absolute privacy and zero-friction scale.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10 text-left">
               {[
                 { t: "Account-Free", d: "No registration nodes. Ever.", c: "text-purple-400" },
                 { t: "Zero-Cost", d: "Enterprise logic at consumer scale.", c: "text-blue-400" },
                 { t: "Node-Privacy", d: "Ephemeral processing isolation.", c: "text-indigo-400" }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -5 }}
                   className="p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                 >
                    <div className={`text-[14px] font-black tracking-widest uppercase mb-4 ${item.c}`}>{item.t}</div>
                    <p className="text-[15px] text-white/20 font-medium leading-relaxed uppercase">{item.d}</p>
                 </motion.div>
               ))}
            </div>
        </div>
      </section>

      {/* ===== PERFORMANCE TICKER ===== */}
      <section className="py-24 border-y border-white/5 bg-black overflow-hidden group">
         <motion.div 
           animate={{ x: [-1500, 0] }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           className="flex gap-40 whitespace-nowrap"
         >
            {[1,2,3].map(set => (
              <div key={set} className="flex gap-40">
                {[
                  { m: "GPT-4o", lat: "1.2s", iq: "98.2" },
                  { m: "Claude 3.5", lat: "1.4s", iq: "99.1" },
                  { m: "Gemini 1.5", lat: "0.8s", iq: "96.4" },
                  { m: "DeepSeek V3", lat: "2.1s", iq: "97.8" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-12">
                    <div className="text-[14px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.m}</div>
                    <div className="flex gap-4">
                       <span className="text-[12px] font-bold text-white/10 uppercase">Speed: {stat.lat}</span>
                       <span className="text-[12px] font-bold text-purple-500/40 uppercase">IQ: {stat.iq}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
         </motion.div>
      </section>

      {/* ===== PARTNER BANNER ===== */}
      <section className="py-64 px-6 relative overflow-hidden bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto rounded-[6rem] border border-white/10 bg-[#070707] p-24 md:p-36 text-center relative shadow-[0_100px_200px_rgba(0,0,0,1)] group overflow-hidden"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="relative z-10 space-y-16">
            <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-black tracking-[0.5em] uppercase shadow-lg">Network Node Partner</div>
            <h2 className="text-5xl md:text-9xl font-semibold tracking-tighter leading-[0.85] text-white uppercase">Try tracker app <br/> from X-ai group.</h2>
            <p className="text-white/20 text-[20px] max-w-xl mx-auto font-medium leading-relaxed uppercase tracking-widest">
              Seamlessly monitor node synchronization and creative evolution across the globe.
            </p>
            <div className="pt-12">
              <Link
                href="https://super-in-ai.vercel.app"
                target="_blank"
                className="inline-flex items-center gap-8 px-20 py-8 rounded-[3.5rem] bg-white text-black font-black text-[18px] uppercase tracking-widest hover:scale-110 hover:shadow-[0_0_100px_rgba(123,97,255,0.4)] transition-all active:scale-95 shadow-2xl"
              >
                Launch Tracker Terminal
                <ArrowRight size={28} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="faq" className="py-48 px-6 border-t border-white/10 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-40 space-y-8"
          >
             <div className="text-purple-500 text-[12px] font-black uppercase tracking-[0.7em]">Support Layer</div>
             <h2 className="text-6xl md:text-8xl font-semibold tracking-tighter text-white uppercase">Neural FAQ.</h2>
          </motion.div>
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8 text-left"
          >
            {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-48 px-6 border-t border-white/10 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-24 mb-40">
            <div className="space-y-16">
              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                  <img src="/logos/logo.png" alt="Fiesta Network" className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold text-4xl tracking-tighter uppercase whitespace-nowrap">Fiesta Network</span>
              </div>
              <p className="max-w-sm text-white/30 text-[16px] font-bold leading-relaxed tracking-widest uppercase mx-auto lg:mx-0 border-l-[6px] border-purple-500/20 pl-10">
                Absolute unified neural orchestration for the visions of 2026.
              </p>
              <div className="flex items-center gap-8 pt-6 justify-center lg:justify-start">
                {[Twitter, Instagram, Linkedin, Github].map((Icon, idx) => (
                  <a key={idx} href={[
                    "https://x.com/Soraion_app",
                    "https://www.instagram.com/sora.ion_app",
                    "https://www.linkedin.com/in/bhavesh-kori-b39a79305",
                    "https://github.com/sora-ion-dev"
                  ][idx]} target="_blank" className="p-5 rounded-[1.5rem] bg-white/5 hover:text-white text-white/20 transition-all hover:bg-purple-600/30 group">
                    <Icon size={28} className="group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-32 lg:gap-48 mx-auto lg:mx-0">
              <div className="space-y-10 text-left">
                <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20">Ecology</h4>
                <div className="flex flex-col gap-8">
                  {["Intelligence", "Experience", "Support Hub"].map((l, idx) => (
                    <button key={l} onClick={() => scrollTo(["ecosystem", "engine", "faq"][idx])} className="text-left text-[17px] font-black text-white/40 hover:text-white transition-colors tracking-tight uppercase whitespace-nowrap">{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-10 text-left">
                <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20">Network</h4>
                <div className="flex flex-col gap-8">
                  <a href="mailto:owner.superai@gmail.com" className="text-[17px] font-black text-white/40 hover:text-white transition-colors tracking-tight uppercase whitespace-nowrap">Cloud Support</a>
                  <div className="flex items-center gap-4 text-[15px] font-black text-green-500 tracking-widest uppercase bg-green-500/5 px-6 py-2 rounded-full border border-green-500/20 shadow-xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    STATUS: SYNCED
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-16 pt-32 border-t border-white/5 grayscale opacity-20">
            <span className="text-[11px] font-black uppercase tracking-[1em] text-white/40 group-hover:text-white transition-colors">© 2026 FIESTA AI NETWORK | BUILT BY X-AI GROUP</span>
            <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.5em] font-black text-white/40">
                 <Globe size={18} />
                 EDGE-01 | VERSION_6.0.4
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
