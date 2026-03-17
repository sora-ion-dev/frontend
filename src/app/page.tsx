"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ChevronDown, Menu, X, Zap, Brain, Trophy, RefreshCw, Shield, Globe } from "lucide-react";

// --- DATA ---
const NAV_LINKS = ["Features", "Pricing", "FAQ"];

const AI_MODELS = [
  { name: "OpenAI GPT", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg", color: "#10a37f" },
  { name: "Arcee Trinity", logo: "https://github.com/arcee-ai.png", color: "#9333ea" },
  { name: "Alibaba Qwen", logo: "https://github.com/Qwen.png", color: "#4a90e2" },
  { name: "Meta Llama", logo: "https://github.com/meta-llama.png", color: "#1877F2" },
  { name: "Google Gemma", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Gemma_logo.svg", color: "#4285F4" },
  { name: "OpenRouter", logo: "https://openrouter.ai/favicon.ico", color: "#ffffff" },
];

const FEATURES = [
  {
    icon: <Zap size={22} className="text-yellow-400" />,
    title: "Parallel Multi-AI Answers",
    desc: "Send one question, get answers from 6 top AI models simultaneously. Compare instantly.",
    color: "from-yellow-500/10 to-transparent",
    border: "border-yellow-500/20",
  },
  {
    icon: <Brain size={22} className="text-indigo-400" />,
    title: "Sora Engine",
    desc: "Our intelligent router auto-picks the absolute best AI for your specific query type.",
    color: "from-indigo-500/10 to-transparent",
    border: "border-indigo-500/20",
  },
  {
    icon: <RefreshCw size={22} className="text-purple-400" />,
    title: "Ask Another AI",
    desc: "Not satisfied? Instantly cycle to the next-ranked AI model in one click.",
    color: "from-purple-500/10 to-transparent",
    border: "border-purple-500/20",
  },
  {
    icon: <Trophy size={22} className="text-amber-400" />,
    title: "AI Rankings & Scoring",
    desc: "See which AI gave the best answer with built-in response ranking & quality scoring.",
    color: "from-amber-500/10 to-transparent",
    border: "border-amber-500/20",
  },
  {
    icon: <Shield size={22} className="text-green-400" />,
    title: "Instant Access",
    desc: "No sign-up required. Start chatting immediately with the world's best AI models.",
    color: "from-green-500/10 to-transparent",
    border: "border-green-500/20",
  },
  {
    icon: <Globe size={22} className="text-sky-400" />,
    title: "6 Top Open Models",
    desc: "Access GPT, Llama, Qwen, Gemma, Trinity and more — all in one unified interface.",
    color: "from-sky-500/10 to-transparent",
    border: "border-sky-500/20",
  },
];

const FAQS = [
  {
    q: "How is Super AI different from using each AI separately?",
    a: "Super AI gives you all 6 top models in one place. Instead of switching between tabs, you see all answers side-by-side and our Sora Engine picks the best one automatically.",
  },
  {
    q: "Which AI models are available?",
    a: "We currently support GPT-4o (OpenAI), Arcee Trinity, Qwen 2.5, Meta Llama 3.1, Google Gemma 2, and OpenRouter Auto-Select — with more coming regularly.",
  },
  {
    q: "What is Sora Mode?",
    a: "Sora Mode is our intelligent engine that sends your question to all available AIs, evaluates their quality, and surfaces the single best answer — automatically.",
  },
  {
    q: "Do I need an account to use Super AI?",
    a: "No — Super AI is open to everyone. You can start chatting immediately without any account or sign-in.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your conversations are private, encrypted, and never sold or shared. We take privacy seriously.",
  },
  {
    q: "Is Super AI free to use?",
    a: "Super AI is currently in early access. Start chatting today for free — no account or credit card required.",
  },
];

// --- SUB COMPONENTS ---
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        ${open ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <span className="text-[15px] font-medium text-gray-100">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-indigo-400" : ""}`}
        />
      </div>
      {open && (
        <div className="px-5 pb-5 text-[14px] text-gray-400 leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// --- MAIN PAGE ---
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen mesh-bg text-white overflow-x-hidden selection:bg-primary/30">

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Super AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase())} className="hover:text-white transition-colors">
                {link}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="text-sm font-bold px-6 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Start Chatting
            </Link>
            <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/90 px-6 py-4 flex flex-col gap-3">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase())} className="text-left text-gray-300 hover:text-white text-sm py-1">
                {link}
              </button>
            ))}
            <Link href="/app" className="text-indigo-400 text-sm font-semibold">Start Chatting →</Link>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Animated BG */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 -left-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-700" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8">
            <Sparkles size={12} />
            Now with Sora Engine — Auto-picks the Best AI
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            The World&apos;s
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-x">
              Ultimate AI.
            </span>
            <br />
            Unified.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            One window. 6+ AI perspectives. Super AI compares the world&apos;s top models
            side-by-side and automatically surfaces the best answer for every question.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link
              href="/app"
              className="px-10 py-5 rounded-full bg-white text-black hover:invert font-black text-[18px] transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] w-full sm:w-auto active:scale-95"
            >
              Start Chatting Free —&gt;
            </Link>
            <button
              onClick={() => scrollTo("features")}
              className="px-10 py-5 rounded-full glass-thin hover:glass-thick text-white font-bold text-[18px] transition-all w-full sm:w-auto active:scale-95"
            >
              Features
            </button>
          </div>

          {/* AI Model Logos */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-gray-600 mr-2">Powered by</span>
            {AI_MODELS.map(m => (
              <div key={m.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <img src={m.logo} alt={m.name} className="w-4 h-4 rounded-sm object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span className="text-xs text-gray-400">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEMO VISUAL ===== */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f0f0f] to-[#080808] shadow-[0_0_100px_rgba(99,102,241,0.1)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="flex-1 text-center text-xs text-gray-600">superai.app</span>
            </div>
            {/* UI Preview */}
            <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4 min-h-[260px]">
              {AI_MODELS.map((m, i) => (
                <div key={m.name} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <img src={m.logo} alt={m.name} className="w-5 h-5 rounded-sm object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="text-xs text-gray-400 font-medium">{m.name}</span>
                    {i === 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">#1</span>}
                  </div>
                  <div className="space-y-1.5">
                    {[60, 80, 50].map((w, j) => (
                      <div key={j} className="h-1.5 rounded-full bg-white/5" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4">Features</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Why Super AI?</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Everything you need to get the best answer, every single time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`rounded-2xl border ${f.border} bg-gradient-to-b ${f.color} p-6 hover:scale-[1.02] transition-transform duration-200`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[16px] mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4">How It Works</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-16">One Window. 6+ Perspectives.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Ask Anything", desc: "Type any question once in the Super AI chat interface." },
              { step: "02", title: "6 AIs Respond", desc: "All 6 of our top AI models answer in parallel, instantly." },
              { step: "03", title: "Get the Best Answer", desc: "Sora Engine ranks them and shows you the highest quality answer first." },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-indigo-300 font-black text-xl mb-4">{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg">Start for free. No credit card needed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <div className="mb-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Free</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">₹0</span>
                  <span className="text-gray-400 mb-2">/lifetime</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Perfect to get started</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Access to 6 AI models", "SuperFiesta Mode", "Sora Engine (limited)", "Google Sign-In", "Chat history"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-green-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/app" className="block text-center py-3 rounded-2xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-semibold transition-all">
                Start Chatting Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600">Coming Soon</div>
              <div className="mb-6">
                <p className="text-sm text-indigo-300 font-semibold uppercase tracking-wider mb-2">Pro</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">₹50</span>
                  <span className="text-gray-400 mb-2">/lifetime ($0.60)</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">For power users</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Everything in Free", "Unlimited Sora Engine queries", "Priority response speed", "Custom AI instructions", "Export chat history", "Priority support"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-indigo-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/payment" className="block w-full text-center py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_50px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98]">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold mb-4">FAQ</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 relative">
            Ready to experience smarter<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI answers?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of users who get better answers with Super AI.</p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-lg transition-all shadow-[0_0_50px_rgba(99,102,241,0.3)] hover:shadow-[0_0_80px_rgba(99,102,241,0.5)]"
          >
            <Sparkles size={20} />
            Start Chatting Now — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">Super AI</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-500">
            <a href="mailto:owner.superai@gmail.com" className="hover:text-indigo-400 transition-colors">Support: owner.superai@gmail.com</a>
            <p>© 2026 Super AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
