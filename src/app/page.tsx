"use client";

import { ArrowRight, Check, Shield, Zap, LayoutGrid, Lock, Image as ImageIcon, Globe, Repeat, FileText, Star, ChevronRight, Menu, X, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/home');
            }
        };
        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image src="/logo.png" alt="PayLink Logo" fill className="object-contain invert dark:invert-0" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </div>
                        <span className="font-black tracking-tighter text-2xl italic text-foreground">PAYLINK</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                        <Link href="/home" className="hover:text-primary transition-colors">Explore</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            Get Started
                        </Link>
                    </div>

                    <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 shadow-2xl">
                        <a href="#features" className="text-lg font-bold text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" className="text-lg font-bold text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
                        <a href="#pricing" className="text-lg font-bold text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                        <Link href="/home" className="text-lg font-bold text-primary hover:text-primary/80">Explore</Link>
                        <div className="h-px bg-border my-2" />
                        <Link href="/login" className="text-lg font-bold text-muted-foreground hover:text-foreground">Log in</Link>
                        <Link href="/signup" className="px-6 py-3 bg-primary text-primary-foreground text-center font-bold rounded-full shadow-lg shadow-primary/20">Get Started</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md hover:bg-muted transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Now available for early access</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[0.9]">
                        The best <br />
                        <span className="text-primary">commission site.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
                        Better than Fiverr, Ko-fi, and PayPal. Secure file delivery, automated invoicing, and instant global payouts for digital artists and freelancers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <Link
                            href="/signup"
                            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/40"
                        >
                            Start Selling Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/home"
                            className="px-8 py-4 bg-card text-foreground border border-border rounded-full font-bold text-lg transition-all hover:scale-105 hover:bg-muted/50 backdrop-blur-md flex items-center gap-2"
                        >
                            Explore
                            <Globe className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trusted By */}
            <section className="py-12 border-y border-border/50 bg-muted/30">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-muted-foreground mb-8 uppercase tracking-[0.2em]">Trusted by creators from</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-3 text-2xl font-bold font-serif text-foreground hover:text-[#1DA1F2] transition-colors"><span className="text-4xl">𝕏</span> Twitter</div>
                        <div className="flex items-center gap-3 text-2xl font-bold font-sans tracking-tighter text-foreground hover:text-[#5865F2] transition-colors"><span className="text-4xl">●</span> Discord</div>
                        <div className="flex items-center gap-3 text-2xl font-bold font-mono text-foreground hover:text-[#9146FF] transition-colors"><span className="text-4xl">👾</span> Twitch</div>
                        <div className="flex items-center gap-3 text-2xl font-bold font-sans text-foreground hover:text-[#FF0000] transition-colors"><span className="text-4xl">▶</span> YouTube</div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="px-6 py-32 bg-background relative" id="how-it-works">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-foreground">Built for the <span className="italic text-primary">hustle.</span></h2>
                        <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">Stop chasing payments. Let Paylink handle the boring stuff so you can focus on creating.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="group p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                                <LayoutGrid className="w-8 h-8" />
                            </div>
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">1</div>
                            <h3 className="text-2xl font-black text-foreground mb-3">Upload Work</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">Organize folders just like your desktop. Supports all file types up to 50GB.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="group p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">2</div>
                            <h3 className="text-2xl font-black text-foreground mb-3">Set Terms</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">50/50, 100% upfront, or custom milestones. You&apos;re in control of how you get paid.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="group p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                                <Lock className="w-8 h-8" />
                            </div>
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">3</div>
                            <h3 className="text-2xl font-black text-foreground mb-3">Secure Handoff</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">Clients see watermarked previews until they pay. No more unpaid work.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 bg-muted/30" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-foreground">Everything you need to <span className="text-primary">scale.</span></h2>
                        <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">More than just payments. A complete operating system for your creative business.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Globe, title: "Global Payments", desc: "Accept payments from clients anywhere in the world. We handle the currency conversion." },
                            { icon: Repeat, title: "Subscriptions", desc: "Build recurring revenue. Offer monthly retainers or exclusive content access." },
                            { icon: FileText, title: "Smart Invoicing", desc: "Generate professional invoices automatically. Track status and send reminders." },
                            { icon: ImageIcon, title: "Auto-Watermarking", desc: "Protect your work. We automatically generate watermarked previews for clients." },
                            { icon: Shield, title: "Dispute Protection", desc: "Say goodbye to chargebacks. Our secure handoff process provides proof of delivery." },
                            { icon: Zap, title: "Instant Payouts", desc: "Don't wait weeks for your money. Withdraw your earnings instantly." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group hover:-translate-y-1 duration-300">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 px-6 bg-background relative overflow-hidden" id="pricing">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-foreground">Simple, transparent pricing.</h2>
                        <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">Choose the plan that fits your growth. Upgrade anytime.</p>

                        {/* 0% Tips Highlight */}
                        <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-bold animate-pulse">
                            <Star className="w-5 h-5 fill-current" />
                            <span>We never take a cut from your tips. You keep 100%.</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Starter Plan */}
                        <div className="bg-card border-2 border-border rounded-[2.5rem] overflow-hidden p-8 flex flex-col hover:border-primary/30 transition-all">
                            <div className="mb-8">
                                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6">
                                    <User className="w-7 h-7 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1 my-4">
                                    <span className="text-5xl font-black text-foreground">$0</span>
                                    <span className="text-muted-foreground font-bold">/month</span>
                                </div>
                                <p className="text-muted-foreground font-medium">Perfect for just getting started.</p>
                            </div>

                            <ul className="space-y-4 flex-1 mb-8">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-green-600" /></div>
                                    <span className="text-foreground font-medium">5% Transaction Fee</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-green-600" /></div>
                                    <span className="text-foreground font-medium">Unlimited Products</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-green-600" /></div>
                                    <span className="text-foreground font-medium">Basic Analytics</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-green-600" /></div>
                                    <span className="text-foreground font-medium">1GB File Uploads</span>
                                </li>
                            </ul>

                            <Link href="/signup" className="block w-full py-4 bg-muted text-foreground text-center font-bold rounded-2xl hover:bg-muted/80 transition-all">
                                Start for Free
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-primary/5 border-2 border-primary rounded-[2.5rem] overflow-hidden p-8 flex flex-col relative group shadow-2xl shadow-primary/10">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-black px-4 py-2 rounded-bl-2xl">
                                POPULAR
                            </div>

                            <div className="mb-8 relative z-10">
                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                    <ShoppingBag className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2">Pro Creator</h3>
                                <div className="flex items-baseline gap-1 my-4">
                                    <span className="text-5xl font-black text-foreground">$29</span>
                                    <span className="text-muted-foreground font-bold">/month</span>
                                </div>
                                <p className="text-primary font-medium">For serious sellers scaling up.</p>
                            </div>

                            <ul className="space-y-4 flex-1 mb-8 relative z-10">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-primary-foreground" /></div>
                                    <span className="text-foreground font-bold">0% Transaction Fee</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-primary" /></div>
                                    <span className="text-foreground font-medium">Verified Badge</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-primary" /></div>
                                    <span className="text-foreground font-medium">Advanced Analytics</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-primary" /></div>
                                    <span className="text-foreground font-medium">10GB File Uploads</span>
                                </li>
                            </ul>

                            <Link href="/signup" className="relative z-10 block w-full py-4 bg-primary text-primary-foreground text-center font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20">
                                Get Started with Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-6 bg-muted/30 border-t border-border/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-foreground">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { q: "How do I get paid?", a: "We use Stripe Connect to send payouts directly to your bank account. Payouts are instant for most countries." },
                            { q: "Are there really no fees on tips?", a: "Yes! We believe tips are a gift from your supporters. We don't take a single cent from them." },
                            { q: "Can I cancel my Pro subscription?", a: "Absolutely. You can cancel anytime from your settings dashboard. No questions asked." },
                            { q: "What file types do you support?", a: "We support all major file types including ZIP, PSD, AI, MP4, and more. Maximum file size depends on your plan." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all">
                                <h3 className="text-xl font-bold text-foreground mb-3">{item.q}</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border bg-background">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <Image src="/logo.png" alt="PayLink Logo" fill className="object-contain invert dark:invert-0" sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                        <span className="font-bold tracking-tight text-muted-foreground">Paylink © 2025</span>
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground font-bold">
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
