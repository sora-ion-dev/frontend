"use client";

import { useState, useEffect } from "react";
import { Sparkles, Shield, User, CreditCard, Power, Check, X, Mail, Loader2, RefreshCw, Key } from "lucide-react";

const ADMIN_EMAIL = "bhaveshkori001@gmail.com";

interface DashboardData {
    feature_flags: Record<string, boolean>;
    payments: any[];
    users: Record<string, any>;
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [grantEmail, setGrantEmail] = useState("");

    useEffect(() => {
        // Check if already authenticated via cookie
        const cookieKey = document.cookie
            .split("; ")
            .find((row) => row.startsWith("admin_key="))
            ?.split("=")[1];
        
        if (cookieKey === "Bhavesh#21") {
            setIsAuthenticated(true);
            fetchAdminData();
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = () => {
        if (adminKey === "Bhavesh#21") {
            document.cookie = `admin_key=${adminKey}; path=/; max-age=86400`; // 24 hours
            setIsAuthenticated(true);
            setLoading(true);
            fetchAdminData();
        } else {
            alert("Incorrect Admin Key!");
        }
    };

    const fetchAdminData = async () => {
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const res = await fetch(`${BACKEND_URL}/admin/data`, {
                headers: { "X-Admin-Email": ADMIN_EMAIL }
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error("Failed to fetch admin data", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (flag: string) => {
        if (!data) return;
        const newFlags = { ...data.feature_flags, [flag]: !data.feature_flags[flag] };
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            await fetch(`${BACKEND_URL}/admin/update-flags`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Email": ADMIN_EMAIL
                },
                body: JSON.stringify({ flags: newFlags })
            });
            setData({ ...data, feature_flags: newFlags });
        } catch (e) {
            console.error(e);
        }
    };

    const handleVerify = async (email: string, txn_id: string, action: "approve" | "reject") => {
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            await fetch(`${BACKEND_URL}/admin/verify-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Email": ADMIN_EMAIL
                },
                body: JSON.stringify({ email, txn_id, action })
            });
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
                    <p className="text-gray-500 text-sm mb-8">Enter your secret key to continue</p>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                placeholder="Enter Secret Key..."
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500/50 transition-all font-mono"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Unlock Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-500 text-sm">Welcome back, Bhavesh</p>
                        </div>
                    </div>
                    <button onClick={fetchAdminData} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
                        <RefreshCw size={20} />
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feature Flags */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="glass-panel p-6 rounded-3xl border border-white/5">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Power size={14} className="text-indigo-400" /> Global Feature Flags
                            </h3>
                            <div className="space-y-4">
                                {data && Object.keys(data.feature_flags).map(flag => (
                                    <div key={flag} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <span className="text-sm font-medium capitalize">{flag.replace("_", " ")}</span>
                                        <button
                                            onClick={() => toggleFlag(flag)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${data.feature_flags[flag] ? 'bg-indigo-600' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${data.feature_flags[flag] ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="glass-panel p-6 rounded-3xl border border-white/5">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <User size={14} className="text-green-400" /> Quick Grant Pro
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter user email..."
                                    value={grantEmail}
                                    onChange={(e) => setGrantEmail(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500/50"
                                />
                                <button
                                    onClick={() => handleVerify(grantEmail, "ADMIN_GRANT", "approve")}
                                    className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    Grant
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Payments Queue */}
                    <div className="lg:col-span-2">
                        <section className="glass-panel p-8 rounded-3xl border border-white/5 h-full">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                                <CreditCard size={14} className="text-yellow-400" /> Pending Payment Verifications
                            </h3>

                            <div className="space-y-4">
                                {data && data.payments.filter(p => p.status === "pending").length === 0 ? (
                                    <div className="text-center py-12 text-gray-600 italic">No pending payments.</div>
                                ) : (
                                    data?.payments.filter(p => p.status === "pending").map((p, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">{p.email}</p>
                                                    <p className="text-xs text-gray-500 mt-1">TXN: <span className="text-gray-300 font-mono">{p.txn_id}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <button
                                                    onClick={() => handleVerify(p.email, p.txn_id, "reject")}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all"
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(p.email, p.txn_id, "approve")}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-bold transition-all"
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Recent History */}
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-12 mb-6 flex items-center gap-2">
                                Recent Activity
                            </h3>
                            <div className="space-y-2 opacity-60">
                                {data?.payments.filter(p => p.status !== "pending").slice(-5).reverse().map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/5 text-xs">
                                        <span>{p.email}</span>
                                        <span className={`font-bold ${p.status === 'approve' ? 'text-green-400' : 'text-red-400'}`}>{p.status.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
