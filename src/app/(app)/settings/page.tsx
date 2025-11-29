"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUserMode, useUser } from "@/context/UserContext";
import { Moon, Sun, Monitor, User, Shield, LogOut, ChevronRight, CreditCard, HelpCircle, Crown, Mail, LayoutGrid, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { EditProfileModal } from "@/components/features/dashboard/EditProfileModal";
import { supabase } from "@/lib/supabase/client";

const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "subscription", label: "Subscription", icon: Crown },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "security", label: "Security", icon: Shield },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "support", label: "Support", icon: HelpCircle },
];

const SettingsIcon = ({ tabId }: { tabId: string }) => {
    const tab = tabs.find(t => t.id === tabId);
    const Icon = tab?.icon || HelpCircle;
    return <Icon className="w-8 h-8 text-muted-foreground" />;
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { userMode, toggleUserMode } = useUserMode();
    const { user, signOut } = useUser();
    const [activeTab, setActiveTab] = useState("general");
    const [mobileView, setMobileView] = useState(false); // false = list, true = content
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [loadingStripe, setLoadingStripe] = useState(false);

    // Handle mobile navigation
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        setMobileView(true);
    };

    const handleBackToList = () => {
        setMobileView(false);
    };

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/home"; // Hard redirect to ensure state clear and navigation to public home
    };

    useEffect(() => {
        if (activeTab === "payments") {
            checkStripeStatus();
        }
    }, [activeTab]);

    const checkStripeStatus = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch("/api/stripe/status", {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            if (data.connected) {
                setStripeConnected(true);
            }
        } catch (error) {
            console.error("Error checking stripe status:", error);
        }
    };

    const handleConnectStripe = async () => {
        setLoadingStripe(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch("/api/stripe/connect", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to start Stripe connection. Please check if STRIPE_SECRET_KEY is set.");
            }
        } catch (error) {
            console.error("Error connecting stripe:", error);
            alert("Error connecting stripe.");
        } finally {
            setLoadingStripe(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">General Settings</h2>
                            <p className="text-muted-foreground">Manage your account preferences.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Profile Details</div>
                                        <div className="text-sm text-muted-foreground">Update your name, bio, and avatar.</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Email Address</div>
                                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-bold text-sm transition-colors">
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "appearance":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Appearance</h2>
                            <p className="text-muted-foreground">Customize how PayLink looks on your device.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme("light")}
                                className={clsx(
                                    "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                    theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                )}
                            >
                                <Sun className="w-8 h-8" />
                                <span className="font-bold text-sm">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={clsx(
                                    "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                    theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                )}
                            >
                                <Moon className="w-8 h-8" />
                                <span className="font-bold text-sm">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme("system")}
                                className={clsx(
                                    "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                    theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                )}
                            >
                                <Monitor className="w-8 h-8" />
                                <span className="font-bold text-sm">System</span>
                            </button>
                        </div>
                    </div>
                );
            case "payments":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Payments & Payouts</h2>
                            <p className="text-muted-foreground">Manage how you get paid and your payment methods.</p>
                        </div>

                        {/* Payouts Section */}
                        <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Payout Method
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Connect your Stripe account to receive payouts from your sales.
                                    </p>
                                </div>
                                <div className={clsx(
                                    "px-3 py-1 text-xs font-bold rounded-full border",
                                    stripeConnected
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                )}>
                                    {stripeConnected ? "Connected" : "Not Connected"}
                                </div>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-white font-bold text-xl italic">S</span>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-foreground">Stripe Connect</div>
                                    <div className="text-xs text-muted-foreground">Secure payouts to your bank account.</div>
                                </div>
                                {stripeConnected ? (
                                    <button
                                        disabled
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm opacity-50 cursor-not-allowed"
                                    >
                                        Connected
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConnectStripe}
                                        disabled={loadingStripe}
                                        className="px-4 py-2 bg-[#635BFF] text-white rounded-lg font-bold text-sm hover:bg-[#635BFF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingStripe ? "Connecting..." : "Connect Stripe"}
                                    </button>
                                )}
                            </div>
                            {!stripeConnected && (
                                <p className="text-xs text-red-500 font-bold">
                                    * Stripe Secret Key is required to enable payouts. Please add it to your environment variables.
                                </p>
                            )}
                        </div>
                    </div>
                );
            case "subscription":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Subscription Plans</h2>
                            <p className="text-muted-foreground">Choose the plan that fits your growth.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Free Plan */}
                            <div className="p-6 rounded-3xl border border-border bg-card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <User className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black italic">STARTER</h3>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-4xl font-black">$0</span>
                                        <span className="text-muted-foreground font-medium">/month</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">Perfect for getting started.</p>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <span>5% Transaction Fee</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <span>Unlimited Products</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <span>Basic Analytics</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <span>1GB File Uploads</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-8 py-3 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors">
                                        Current Plan
                                    </button>
                                </div>
                            </div>

                            {/* Pro Plan */}
                            <div className="p-6 rounded-3xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden ring-1 ring-blue-500/50">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Crown className="w-24 h-24 text-blue-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black italic text-blue-500">PRO CREATOR</h3>
                                        <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full">RECOMMENDED</span>
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-4xl font-black">$9</span>
                                        <span className="text-muted-foreground font-medium">/month</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">For serious sellers scaling up.</p>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                                <Shield className="w-3 h-3 text-white" />
                                            </div>
                                            <span>0% Transaction Fee</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                <Crown className="w-3 h-3 text-blue-500" />
                                            </div>
                                            <span>Verified Badge</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <span>Advanced Analytics</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <span>10GB File Uploads</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                                        Upgrade to Pro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <SettingsIcon tabId={activeTab} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-sm">
                            The {tabs.find(t => t.id === activeTab)?.label} settings are currently under development.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32 md:pb-0 p-4 md:p-8">
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 min-h-[600px]">
                {/* Sidebar */}
                <div className={clsx(
                    "w-full md:w-64 shrink-0 space-y-2",
                    mobileView ? "hidden md:block" : "block"
                )}>
                    <h1 className="text-3xl font-bold font-header italic tracking-tight mb-6 px-2">Settings</h1>

                    {/* Account Mode Toggle */}
                    <div className="mb-6 p-1 bg-muted/50 rounded-2xl flex relative">
                        <motion.div
                            className="absolute inset-y-1 bg-background shadow-sm border border-border rounded-xl z-10"
                            initial={false}
                            animate={{
                                x: userMode === "SELLER" ? 0 : "100%",
                                width: "50%"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => userMode !== "SELLER" && toggleUserMode()}
                            className={clsx(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold relative z-20 transition-colors flex items-center justify-center gap-2",
                                userMode === "SELLER" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Seller
                        </button>
                        <button
                            onClick={() => userMode !== "BUYER" && toggleUserMode()}
                            className={clsx(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold relative z-20 transition-colors flex items-center justify-center gap-2",
                                userMode === "BUYER" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Buyer
                        </button>
                    </div>

                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={clsx(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all group",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 md:bg-primary md:text-primary-foreground"
                                    : "bg-card border border-border md:border-transparent md:bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </div>
                            <ChevronRight className={clsx("w-4 h-4 md:hidden", activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground")} />
                        </button>
                    ))}

                    <div className="pt-4 mt-4 md:border-t border-border">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 bg-card border border-border md:border-transparent md:bg-transparent hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={clsx(
                    "flex-1 min-h-[500px]",
                    mobileView ? "block" : "hidden md:block"
                )}>
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center gap-4 mb-6">
                        <button onClick={handleBackToList} className="p-2 -ml-2 hover:bg-muted rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
