"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUserMode, useUser } from "@/context/UserContext";
import { Moon, Sun, Monitor, User, Bell, Shield, LogOut, ChevronRight, CreditCard, Globe, HelpCircle, Crown, X, Check, Mail, Lock, Smartphone, Trash2, LayoutGrid } from "lucide-react";
import clsx from "clsx";
import { SubscriptionModal } from "@/components/features/dashboard/SubscriptionModal";
import { VerificationModal } from "@/components/features/dashboard/VerificationModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

// Generic Modal Component (Keep as is for mobile/specific actions)
function SettingsDetailModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold text-foreground">{title}</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { userMode, toggleUserMode, profile } = useUser();
    const { user, signOut } = useUser();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // Modal States
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleResetPassword = async () => {
        if (user?.email) {
            await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            setResetSent(true);
            setTimeout(() => setResetSent(false), 3000);
        }
    };

    const getVerificationStatusLabel = () => {
        switch (profile?.verification_status) {
            case 'verified': return 'Verified';
            case 'pending': return 'Pending Review';
            case 'rejected': return 'Rejected';
            default: return 'Request Verification';
        }
    };

    const handleVerificationClick = () => {
        if (profile?.verification_status === 'none' || profile?.verification_status === 'rejected') {
            setIsVerificationOpen(true);
        }
    };

    const tabs = [
        { id: "general", label: "General", icon: User },
        { id: "account_mode", label: "Account Mode", icon: LayoutGrid },
        { id: "subscription", label: "Subscription", icon: Crown },
        { id: "appearance", label: "Appearance", icon: Moon },
        { id: "security", label: "Security", icon: Shield },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "support", label: "Support", icon: HelpCircle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">General Settings</h2>
                            <p className="text-muted-foreground">Manage your account details and preferences.</p>
                        </div>
                        <div className="grid gap-6">
                            <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
                                <h3 className="font-bold text-lg border-b border-border pb-4">Profile Information</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <div className="p-3 bg-muted/50 rounded-xl border border-border flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground font-medium">{user?.email || "No email found"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                                            <span className="font-medium">{getVerificationStatusLabel()}</span>
                                            {(profile?.verification_status === 'none' || profile?.verification_status === 'rejected') && (
                                                <button onClick={handleVerificationClick} className="text-xs font-bold text-primary hover:underline">
                                                    Start Verification
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
                                <h3 className="font-bold text-lg border-b border-border pb-4">Language & Region</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Language</div>
                                            <div className="text-sm text-muted-foreground">English</div>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-muted rounded-lg text-sm font-bold hover:bg-muted/80">Change</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "account_mode":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Account Mode</h2>
                            <p className="text-muted-foreground">Switch between Seller and Buyer features.</p>
                        </div>
                        <div className="p-8 bg-card border border-border rounded-3xl flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <LayoutGrid className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Current Mode: {userMode}</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    {userMode === "SELLER"
                                        ? "You are currently in Seller mode. You can manage your services, portfolio, and orders."
                                        : "You are currently in Buyer mode. You can browse services, make purchases, and track your orders."}
                                </p>
                            </div>
                            <button
                                onClick={toggleUserMode}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105"
                            >
                                Switch to {userMode === "SELLER" ? "Buyer" : "Seller"} Mode
                            </button>
                        </div>
                    </div>
                );
            case "subscription":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Subscription</h2>
                            <p className="text-muted-foreground">Manage your plan and billing.</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-3xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Crown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Free Plan</h3>
                                        <p className="text-sm text-muted-foreground">Basic features active</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">Active</span>
                            </div>
                            <button
                                onClick={() => setIsSubscriptionOpen(true)}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                );
            case "appearance":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Appearance</h2>
                            <p className="text-muted-foreground">Customize how PayLink looks for you.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={clsx(
                                    "p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all",
                                    theme === 'light' ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                                )}
                            >
                                <Sun className="w-8 h-8" />
                                <span className="font-bold">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={clsx(
                                    "p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all",
                                    theme === 'dark' ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                                )}
                            >
                                <Moon className="w-8 h-8" />
                                <span className="font-bold">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={clsx(
                                    "p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all",
                                    theme === 'system' ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                                )}
                            >
                                <Monitor className="w-8 h-8" />
                                <span className="font-bold">System</span>
                            </button>
                        </div>
                    </div>
                );
            case "security":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Security</h2>
                            <p className="text-muted-foreground">Protect your account and data.</p>
                        </div>
                        <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Password</label>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={resetSent}
                                        className="w-full p-3 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-colors flex items-center justify-between group"
                                    >
                                        <span className="font-medium">Change Password</span>
                                        <span className="text-xs text-primary font-bold">{resetSent ? "Email Sent!" : "Send Reset Link"}</span>
                                    </button>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground">Two-Factor Authentication</div>
                                                <div className="text-xs text-muted-foreground">Add an extra layer of security.</div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-1.5 bg-muted text-foreground text-xs font-bold rounded-lg hover:bg-muted/80">Enable</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
                            <h3 className="font-bold text-red-500 mb-2">Danger Zone</h3>
                            <p className="text-sm text-red-500/80 mb-4">Permanently delete your account and all of your content.</p>
                            <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Select a setting to view details.
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32 md:pb-10 p-4 md:p-8 max-w-7xl mx-auto">
            <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
            <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} />

            <h1 className="text-3xl font-bold text-foreground mb-8 md:mb-10">Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar (Desktop) / List (Mobile) */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-border">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[500px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
