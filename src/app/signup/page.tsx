"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, User, Mail, Lock } from "lucide-react";

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

                router.push("/dashboard");
            } else {
                // Email confirmation required
                // For dev, we might want to just redirect or show a success message
                alert("Please check your email to confirm your account.");
                router.push("/login");
            }

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
                    <h1 className="text-3xl font-black tracking-tight italic">Create an account</h1>
                    <p className="text-gray-400 font-medium">Join thousands of creators on Paylink</p>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1" htmlFor="fullName">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-12 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-medium"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 ml-1" htmlFor="username">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-medium"
                                    placeholder="johndoe"
                                    required
                                    minLength={3}
                                />
                            </div>
                        </div>

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
                            <label className="text-sm font-bold text-gray-300 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-12 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-medium"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-white text-black hover:bg-gray-200 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 mt-6 shadow-lg shadow-white/10"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                        </button>
                    </form>
                </div>

                <div className="text-center text-sm font-medium">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/login" className="text-white font-bold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
