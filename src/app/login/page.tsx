"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/app" });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px"
                    }}
                />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-600/30 blur-2xl rounded-3xl transform scale-105" />

                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Super AI</h1>
                        <p className="text-gray-400 text-sm">The most powerful AI engine on earth</p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                        {[
                            { icon: "⚡", text: "6 top AI models working together" },
                            { icon: "🎯", text: "Sora Engine auto-picks the best answer" },
                            { icon: "🔁", text: "SuperFiesta parallel multi-model chat" },
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="text-base">{feat.icon}</span>
                                <span>{feat.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl
                                   bg-white text-gray-900 font-semibold text-[15px]
                                   hover:bg-gray-100 active:scale-[0.98] transition-all duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/30
                                   border border-white/10"
                    >
                        {isLoading ? (
                            <svg className="w-5 h-5 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                                <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	                            s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	                            s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107" />
                                <path d="M6.306,14.691l6.571,4.819C14.655,15.108,19.001,12,24,12c3.059,0,5.842,1.154,7.961,3.039
                                l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00" />
                                <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
                                c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50" />
                                <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
                                c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2" />
                            </svg>
                        )}
                        {isLoading ? "Redirecting to Google..." : "Continue with Google"}
                    </button>

                    <p className="text-center text-xs text-gray-600 mt-4">
                        By continuing, you agree to Super AI&apos;s Terms of Service.
                        Your data is private and never sold.
                    </p>
                </div>
            </div>
        </div>
    );
}
