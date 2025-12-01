"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Lock, Mail } from "lucide-react";
import Image from "next/image";

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

            router.push("/home");
        } catch (err) {
            setError((err as Error).message);
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
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans selection:bg-primary/30 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <button onClick={() => router.back()} className="fixed top-6 left-6 p-3 bg-card border border-border rounded-full text-foreground hover:bg-muted transition-colors z-50 hover:scale-105 backdrop-blur-md group shadow-sm">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="relative w-12 h-12 mx-auto mb-6">
                        <Image src="/logo.png" alt="PayLink Logo" fill className="object-contain" priority sizes="48px" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight italic text-foreground">
                        {forgotPasswordMode ? "Reset Password" : "Welcome back"}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        {forgotPasswordMode
                            ? "Enter your email to receive reset instructions"
                            : "Enter your credentials to access your account"}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
                    {forgotPasswordMode ? (
                        resetSent ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Check your email</h3>
                                <p className="text-muted-foreground">We&apos;ve sent password reset instructions to <span className="text-foreground font-bold">{email}</span></p>
                                <button
                                    onClick={() => {
                                        setForgotPasswordMode(false);
                                        setResetSent(false);
                                    }}
                                    className="text-primary font-bold hover:underline mt-4 block"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1" htmlFor="reset-email">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="reset-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-12 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-medium"
                                            placeholder="m@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-full text-sm font-bold transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotPasswordMode(false)}
                                    className="w-full text-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mt-4"
                                >
                                    Back to Sign In
                                </button>
                            </form>
                        )
                    ) : (
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={async () => {
                                    await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: `${window.location.origin}/auth/callback`,
                                        },
                                    });
                                }}
                                className="w-full h-12 bg-card border border-border text-foreground hover:bg-muted/50 inline-flex items-center justify-center rounded-full text-sm font-bold transition-all hover:scale-[1.02] gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground font-bold">Or continue with</span>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1" htmlFor="email">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-12 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-medium"
                                            placeholder="m@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-bold text-muted-foreground" htmlFor="password">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setForgotPasswordMode(true)}
                                            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-12 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-medium"
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-full text-sm font-bold transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 mt-6 shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {!forgotPasswordMode && (
                    <div className="text-center text-sm font-medium">
                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
