"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, ChevronRight, Copy, Loader2, Send } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

export default function PaymentPage() {
    const session = { user: { email: "guest@superai.com", name: "Guest" } }; // Hardcoded for public access
    const status = "authenticated";
    const [txnId, setTxnId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (status === "unauthenticated") {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Please log in to continue.</div>;
    }

    const handleSubmit = async () => {
        if (!txnId.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${BACKEND_URL}/payment/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: session?.user?.email,
                    txn_id: txnId
                })
            });
            if (res.ok) {
                setSubmitted(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("UPI ID Copied!");
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full glass-panel p-8 rounded-[2.5rem] border border-green-500/20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-8 shadow-lg shadow-green-500/10">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Payment Submitted!</h1>
                    <p className="text-gray-400 leading-relaxed mb-8">
                        We have received your request. Our team will verify the transaction and upgrade your account to Pro within few hours. You will receive an email confirmation.
                    </p>
                    <button onClick={() => redirect("/app")} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20">
                        Back to App
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
            <div className="max-w-xl w-full">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                        <CreditCard size={32} className="text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight">Upgrade to Super AI Pro</h1>
                    <p className="text-gray-400 text-lg">9 RPM Limit • All Models • Priority Access</p>
                </div>

                <div className="space-y-6">
                    {/* UPI Box */}
                    <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6 p-1 px-3 bg-indigo-400/5 rounded-full w-fit">Step 1: Pay using UPI</h3>

                        <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5 mb-8 group hover:border-indigo-500/30 transition-all duration-500">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Payable Amount</p>
                                <p className="text-3xl font-black text-white">₹50 <span className="text-gray-500 text-lg font-medium">($0.60)</span></p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">UPI ID</p>
                                <button
                                    onClick={() => copyToClipboard("bhaveshkori@fam")}
                                    className="text-lg font-bold text-indigo-400 flex items-center gap-2 hover:text-indigo-300 transition-all active:scale-95"
                                >
                                    bhaveshkori@fam <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6 p-1 px-3 bg-indigo-400/5 rounded-full w-fit">Step 2: Submit Proof</h3>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Transaction Number / ID</label>
                            <input
                                type="text"
                                placeholder="Enter 12-digit UTR or Transaction ID..."
                                value={txnId}
                                onChange={(e) => setTxnId(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-lg font-mono outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!txnId.trim() || isSubmitting}
                                className="w-full h-16 bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Submit Transaction <Send size={20} /></>}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm px-8">
                        Payment verification takes few hours. Please do not submit the same transaction multiple times.
                    </p>
                </div>
            </div>
        </div>
    );
}
