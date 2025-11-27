"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Lock, Mail } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            setResetSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] opacity-30 pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <Link href="/" className="fixed top-6 left-6 p-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors z-50 hover:scale-105 backdrop-blur-md group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center font-black italic text-white text-xl shadow-lg shadow-blue-900/20 transform -skew-x-6 mx-auto mb-6">
                        <span className="transform skew-x-6">P</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight italic">
                        {forgotPasswordMode ? "Reset Password" : "Welcome back"}
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {forgotPasswordMode
                            ? "Enter your email to receive reset instructions"
                            : "Enter your credentials to access your account"}
                    </p>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    {forgotPasswordMode ? (
                        resetSent ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Check your email</h3>
                                <p className="text-gray-400">We've sent password reset instructions to <span className="text-white font-bold">{email}</span></p>
                                <button
                                    onClick={() => {
                                        setForgotPasswordMode(false);
                                        setResetSent(false);
                                    }}
                                    className="text-blue-500 font-bold hover:underline mt-4 block"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1" htmlFor="reset-email">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            id="reset-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-12 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-medium"
                                            placeholder="m@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-white text-black hover:bg-gray-200 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 mt-2 shadow-lg shadow-white/10"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotPasswordMode(false)}
                                    className="w-full text-center text-sm font-bold text-gray-500 hover:text-white transition-colors mt-4"
                                >
                                    Back to Sign In
                                </button>
                            </form>
                        )
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-12 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-medium"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-bold text-gray-300" htmlFor="password">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setForgotPasswordMode(true)}
                                        className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-12 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-medium"
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-white text-black hover:bg-gray-200 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 mt-6 shadow-lg shadow-white/10"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                            </button>
                        </form>
                    )}
                </div>

                {!forgotPasswordMode && (
                    <div className="text-center text-sm font-medium">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link href="/signup" className="text-white font-bold hover:underline">
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
