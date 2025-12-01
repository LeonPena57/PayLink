"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, User, Mail, Lock } from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (username.length < 3) {
            setError("Username must be at least 3 characters long");
            setLoading(false);
            return;
        }

        try {
            // 1. Check if username exists (optional, but good UX)
            const { data: existingUser } = await supabase
                .from("profiles")
                .select("username")
                .eq("username", username)
                .single();

            if (existingUser) {
                throw new Error("Username is already taken");
            }

            // 2. Sign up
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        username,
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.session) {
                // Check if profile was created by trigger (it might take a ms)
                // Or just insert if it doesn't exist.
                const { error: profileError } = await supabase
                    .from("profiles")
                    .upsert({
                        id: data.user!.id,
                        username,
                        full_name: fullName,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'id' });

                if (profileError) {
                    console.log("Profile creation fallback result:", profileError);
                }

                // Send Welcome Email
                await fetch('/api/send-welcome-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username }),
                });

                router.push("/dashboard");
            } else {
                // Email confirmation required
                // For dev, we might want to just redirect or show a success message
                alert("Please check your email to confirm your account.");
                router.push("/login");
            }

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
                    <Link href="/" className="fixed top-6 left-6 p-3 bg-card border border-border rounded-full text-foreground hover:bg-muted transition-colors z-50 hover:scale-105 backdrop-blur-md group shadow-sm">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="relative w-12 h-12 mx-auto mb-6">
                        <Image src="/logo.png" alt="PayLink Logo" fill className="object-contain" priority sizes="48px" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight italic text-foreground">Create an account</h1>
                    <p className="text-muted-foreground font-medium">Join thousands of creators on Paylink</p>
                </div>

                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
                    <div className="space-y-4 mb-4">
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
                            Sign up with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground font-bold">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1" htmlFor="fullName">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-12 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-medium"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1" htmlFor="username">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-medium"
                                    placeholder="johndoe"
                                    required
                                    minLength={3}
                                />
                            </div>
                        </div>

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
                            <label className="text-sm font-bold text-muted-foreground ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-12 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all font-medium"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-full text-sm font-bold transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 mt-6 shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                        </button>
                    </form>
                </div>

                <div className="text-center text-sm font-medium">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
