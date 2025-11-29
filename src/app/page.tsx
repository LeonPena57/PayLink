"use client";

import { ArrowRight, Check, Shield, Zap, LayoutGrid, Lock, CreditCard, Image as ImageIcon, Globe, Repeat, FileText, Star, Play, ChevronRight, Menu, X } from "lucide-react";
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
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image src="/logo-white.png" alt="PayLink Logo" fill className="object-contain" priority />
                        </div>
                        <span className="font-black tracking-tighter text-2xl italic bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">PAYLINK</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <Link href="/home" className="hover:text-white transition-colors text-blue-400">Explore</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors px-4 py-2">
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Get Started
                        </Link>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-[#0a0a0a] border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
                        <a href="#features" className="text-lg font-bold text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" className="text-lg font-bold text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
                        <a href="#pricing" className="text-lg font-bold text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                        <Link href="/home" className="text-lg font-bold text-blue-400 hover:text-blue-300">Explore</Link>
                        <div className="h-px bg-white/10 my-2" />
                        <Link href="/login" className="text-lg font-bold text-gray-400 hover:text-white">Log in</Link>
                        <Link href="/signup" className="px-6 py-3 bg-white text-black text-center font-bold rounded-full">Get Started</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-52 pb-20 px-6 relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-40 pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] opacity-30 pointer-events-none mix-blend-screen" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Now available for early access</span>
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[0.9]">
                        The best <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">commission site.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
                        Better than Fiverr, Ko-fi, and PayPal. Secure file delivery, automated invoicing, and instant global payouts for digital artists and freelancers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <Link
                            href="/signup"
                            className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
                        >
                            Start Selling Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/home"
                            className="px-8 py-4 bg-white/10 text-white border border-white/10 rounded-full font-bold text-lg transition-all hover:scale-105 hover:bg-white/20 backdrop-blur-md flex items-center gap-2"
                        >
                            Explore
                            <Globe className="w-5 h-5" />
                        </Link>

                    </div>
                </div>
            </section>

            {/* Trusted By */}
            <section className="py-12 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-[0.2em]">Trusted by creators from</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-3 text-2xl font-bold font-serif text-white hover:text-white transition-colors"><span className="text-4xl">𝕏</span> Twitter</div>
                        <div className="flex items-center gap-3 text-2xl font-bold font-sans tracking-tighter text-white hover:text-[#5865F2] transition-colors"><span className="text-4xl">●</span> Discord</div>
                        <div className="flex items-center gap-3 text-2xl font-bold font-mono text-white hover:text-[#9146FF] transition-colors"><span className="text-4xl">👾</span> Twitch</div>
                        <div className="flex items-center gap-3 text-2xl font-bold font-sans text-white hover:text-[#FF0000] transition-colors"><span className="text-4xl">▶</span> YouTube</div>
                    </div>
                </div>
            </section>

            {/* How it Works - Interactive Visualization */}
            <section className="px-6 py-32 bg-[#0a0a0a] relative" id="how-it-works">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Built for the <span className="italic text-blue-500">hustle.</span></h2>
                        <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">Stop chasing payments. Let Paylink handle the boring stuff so you can focus on creating.</p>
                    </div>

                    <div className="relative bg-[#111] rounded-[2.5rem] border border-white/10 p-2 shadow-2xl shadow-black/50 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-14 bg-[#161616] border-b border-white/5 flex items-center px-6 gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF453A]" />
                                <div className="w-3 h-3 rounded-full bg-[#FFD60A]" />
                                <div className="w-3 h-3 rounded-full bg-[#30D158]" />
                            </div>
                            <div className="ml-6 px-4 py-1.5 bg-[#0a0a0a] rounded-lg text-xs text-gray-400 flex items-center gap-2 border border-white/5 font-mono">
                                <Lock className="w-3 h-3" />
                                paylink.com/drive/project-alpha
                            </div>
                        </div>

                        <div className="mt-14 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Step 1 */}
                            <div className="group">
                                <div className="h-64 bg-[#1a1a1a] rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center text-gray-500 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <LayoutGrid className="w-12 h-12 mb-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 text-blue-500" />
                                    <span className="text-sm font-bold tracking-widest uppercase text-gray-400 group-hover:text-blue-400 transition-colors">Drag & Drop Files</span>
                                </div>
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg mb-4 shadow-lg shadow-blue-900/40">1</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Upload Work</h3>
                                    <p className="text-gray-400 leading-relaxed">Organize folders just like your desktop. Supports all file types up to 50GB.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="group">
                                <div className="h-64 bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 flex flex-col justify-center gap-4 group-hover:border-purple-500/50 group-hover:bg-purple-500/5 transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="flex justify-between items-center text-sm text-gray-400">
                                        <span>Total Amount</span>
                                        <span className="text-white font-bold text-lg">$500.00</span>
                                    </div>
                                    <div className="h-3 bg-[#222] rounded-full overflow-hidden">
                                        <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-purple-500" />
                                    </div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span className="text-blue-400">50% Upfront</span>
                                        <span className="text-purple-400">50% on Delivery</span>
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-lg mb-4 shadow-lg shadow-purple-900/40">2</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Set Terms</h3>
                                    <p className="text-gray-400 leading-relaxed">50/50, 100% upfront, or custom milestones. You're in control.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="group">
                                <div className="h-64 bg-[#1a1a1a] rounded-3xl border border-white/5 p-4 relative overflow-hidden group-hover:border-green-500/50 group-hover:bg-green-500/5 transition-all duration-500">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="bg-[#0a0a0a]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                                            <Lock className="w-5 h-5 text-green-500" />
                                            <span className="text-sm font-bold text-white">Pay to Unlock</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 opacity-30 blur-[2px] scale-105">
                                        <div className="aspect-square bg-[#333] rounded-xl" />
                                        <div className="aspect-square bg-[#333] rounded-xl" />
                                        <div className="aspect-square bg-[#333] rounded-xl" />
                                        <div className="aspect-square bg-[#333] rounded-xl" />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg mb-4 shadow-lg shadow-green-900/40">3</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Secure Handoff</h3>
                                    <p className="text-gray-400 leading-relaxed">Clients see watermarked previews until they pay. No more unpaid work.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 bg-[#0a0a0a]" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">scale.</span></h2>
                        <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">More than just payments. A complete operating system for your creative business.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", title: "Global Payments", desc: "Accept payments from clients anywhere in the world. We handle the currency conversion." },
                            { icon: Repeat, color: "text-purple-500", bg: "bg-purple-500/10", title: "Subscriptions", desc: "Build recurring revenue. Offer monthly retainers or exclusive content access." },
                            { icon: FileText, color: "text-green-500", bg: "bg-green-500/10", title: "Smart Invoicing", desc: "Generate professional invoices automatically. Track status and send reminders." },
                            { icon: ImageIcon, color: "text-orange-500", bg: "bg-orange-500/10", title: "Auto-Watermarking", desc: "Protect your work. We automatically generate watermarked previews for clients." },
                            { icon: Shield, color: "text-red-500", bg: "bg-red-500/10", title: "Dispute Protection", desc: "Say goodbye to chargebacks. Our secure handoff process provides proof of delivery." },
                            { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", title: "Instant Payouts", desc: "Don't wait weeks for your money. Withdraw your earnings instantly." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-[#111] border border-white/5 hover:border-white/10 transition-all group hover:-translate-y-1 duration-300">
                                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 px-6 bg-[#0a0a0a] relative overflow-hidden" id="pricing">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Simple, transparent pricing.</h2>
                        <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">Choose the plan that fits your growth. Upgrade anytime.</p>

                        {/* 0% Tips Highlight */}
                        <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold animate-pulse">
                            <Star className="w-5 h-5 fill-current" />
                            <span>We never take a cut from your tips. You keep 100%.</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Starter Plan */}
                        <div className="bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden p-8 flex flex-col hover:border-white/20 transition-all">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1 my-4">
                                    <span className="text-5xl font-black text-white">$0</span>
                                    <span className="text-gray-400 font-bold">/month</span>
                                </div>
                                <p className="text-gray-400 font-medium">Perfect for just getting started.</p>
                            </div>

                            <ul className="space-y-4 flex-1 mb-8">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>
                                    <span className="text-gray-300 font-medium">5% Transaction Fee</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>
                                    <span className="text-gray-300 font-medium">Unlimited Products</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>
                                    <span className="text-gray-300 font-medium">Basic Analytics</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>
                                    <span className="text-gray-300 font-medium">1GB File Uploads</span>
                                </li>
                            </ul>

                            <Link href="/signup" className="block w-full py-4 bg-white/10 text-white text-center font-bold rounded-2xl hover:bg-white/20 transition-all">
                                Start for Free
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-[#111] border border-blue-500/30 rounded-[2.5rem] overflow-hidden p-8 flex flex-col relative group">
                            <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                            <div className="absolute top-0 right-0 p-6">
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">RECOMMENDED</span>
                            </div>

                            <div className="mb-8 relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Pro Creator</h3>
                                <div className="flex items-baseline gap-1 my-4">
                                    <span className="text-5xl font-black text-white">$9</span>
                                    <span className="text-gray-400 font-bold">/month</span>
                                </div>
                                <p className="text-blue-200 font-medium">For serious sellers scaling up.</p>
                            </div>

                            <ul className="space-y-4 flex-1 mb-8 relative z-10">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>
                                    <span className="text-white font-bold">0% Transaction Fee</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-blue-400" /></div>
                                    <span className="text-gray-300 font-medium">Verified Badge</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-blue-400" /></div>
                                    <span className="text-gray-300 font-medium">Advanced Analytics</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-blue-400" /></div>
                                    <span className="text-gray-300 font-medium">10GB File Uploads</span>
                                </li>
                            </ul>

                            <Link href="/signup" className="relative z-10 block w-full py-4 bg-blue-600 text-white text-center font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                                Get Started with Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-6 bg-[#0a0a0a] border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { q: "How do I get paid?", a: "We use Stripe Connect to send payouts directly to your bank account. Payouts are instant for most countries." },
                            { q: "Are there really no fees on tips?", a: "Yes! We believe tips are a gift from your supporters. We don't take a single cent from them." },
                            { q: "Can I cancel my Pro subscription?", a: "Absolutely. You can cancel anytime from your settings dashboard. No questions asked." },
                            { q: "What file types do you support?", a: "We support all major file types including ZIP, PSD, AI, MP4, and more. Maximum file size depends on your plan." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-[#111] border border-white/5 hover:border-white/10 transition-all">
                                <h3 className="text-xl font-bold text-white mb-3">{item.q}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <Image src="/logo-white.png" alt="PayLink Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold tracking-tight text-gray-500">Paylink © 2025</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500 font-bold">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
