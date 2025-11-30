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
                            <h2 className="text-2xl font-black mb-1">General Settings</h2>
                            <p className="text-muted-foreground font-medium">Manage your account preferences.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 bg-muted/30 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm">
                                        <User className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Profile Details</div>
                                        <div className="text-sm text-muted-foreground font-medium">Update your name, bio, and avatar.</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="p-5 bg-muted/30 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm">
                                        <Mail className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Email Address</div>
                                        <div className="text-sm text-muted-foreground font-medium">{user?.email}</div>
                                    </div>
                                </div>
                                <button className="px-5 py-2.5 bg-background hover:bg-muted rounded-xl font-bold text-sm transition-colors shadow-sm">
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
                            <h2 className="text-2xl font-black mb-1">Appearance</h2>
                            <p className="text-muted-foreground font-medium">Customize how PayLink looks on your device.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTheme("light")}
                                className={clsx(
                                    "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                    theme === "light" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/50"
                                )}
                            >
                                <Sun className={clsx("w-8 h-8", theme === "light" ? "text-primary" : "text-muted-foreground")} />
                                <span className={clsx("font-bold text-sm", theme === "light" ? "text-primary" : "text-muted-foreground")}>Light</span>
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={clsx(
                                    "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                    theme === "dark" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/50"
                                )}
                            >
                                <Moon className={clsx("w-8 h-8", theme === "dark" ? "text-primary" : "text-muted-foreground")} />
                                <span className={clsx("font-bold text-sm", theme === "dark" ? "text-primary" : "text-muted-foreground")}>Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme("system")}
                                className={clsx(
                                    "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                    theme === "system" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-transparent bg-muted/30 hover:bg-muted/50"
                                )}
                            >
                                <Monitor className={clsx("w-8 h-8", theme === "system" ? "text-primary" : "text-muted-foreground")} />
                                <span className={clsx("font-bold text-sm", theme === "system" ? "text-primary" : "text-muted-foreground")}>System</span>
                            </button>
                        </div>
                    </div>
                );
            case "payments":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-2xl font-black mb-1">Payments & Payouts</h2>
                            <p className="text-muted-foreground font-medium">Manage how you get paid and your payment methods.</p>
                        </div>

                        {/* Payouts Section */}
                        <div className="p-6 bg-muted/30 rounded-[2rem] space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Payout Method
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">
                                        Connect your Stripe account to receive payouts from your sales.
                                    </p>
                                </div>
                                <div className={clsx(
                                    "px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border",
                                    stripeConnected
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                )}>
                                    {stripeConnected ? "Connected" : "Not Connected"}
                                </div>
                            </div>

                            <div className="p-4 bg-background rounded-2xl shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#635BFF] rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-[#635BFF]/30">
                                    <span className="text-white font-bold text-xl italic">S</span>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-foreground">Stripe Connect</div>
                                    <div className="text-xs text-muted-foreground font-medium">Secure payouts to your bank account.</div>
                                </div>
                                {stripeConnected ? (
                                    <button
                                        disabled
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm opacity-50 cursor-not-allowed"
                                    >
                                        Connected
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConnectStripe}
                                        disabled={loadingStripe}
                                        className="px-4 py-2 bg-[#635BFF] text-white rounded-xl font-bold text-sm hover:bg-[#635BFF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#635BFF]/20"
                                    >
                                        {loadingStripe ? "Connecting..." : "Connect Stripe"}
                                    </button>
                                )}
                            </div>
                            {!stripeConnected && (
                                <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-xl">
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
                            <h2 className="text-2xl font-black mb-1">Subscription Plans</h2>
                            <p className="text-muted-foreground font-medium">Choose the plan that fits your growth.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Free Plan */}
                            <div className="p-6 rounded-[2rem] bg-muted/30 relative overflow-hidden group hover:bg-muted/40 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <User className="w-24 h-24" />
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                    <span>10GB File Uploads</span>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>

                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                            <SettingsIcon tabId={activeTab} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                        <p className="text-muted-foreground font-medium max-w-sm">
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
                    "w-full md:w-72 shrink-0 space-y-2",
                    mobileView ? "hidden md:block" : "block"
                )}>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-8 px-2">Settings</h1>

                    {/* Account Mode Toggle */}
                    <div className="mb-8 p-1.5 bg-muted/30 rounded-[2rem] flex relative">
                        <motion.div
                            className="absolute inset-y-1.5 bg-background shadow-sm rounded-[1.5rem] z-10"
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
                                "flex-1 py-3 px-4 rounded-[1.5rem] text-sm font-bold relative z-20 transition-colors flex items-center justify-center gap-2",
                                userMode === "SELLER" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Seller
                        </button>
                        <button
                            onClick={() => userMode !== "BUYER" && toggleUserMode()}
                            className={clsx(
                                "flex-1 py-3 px-4 rounded-[1.5rem] text-sm font-bold relative z-20 transition-colors flex items-center justify-center gap-2",
                                userMode === "BUYER" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Buyer
                        </button>
                    </div>

                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={clsx(
                                    "w-full flex items-center justify-between px-5 py-4 rounded-[2rem] font-bold transition-all group",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={clsx("w-5 h-5", activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                    {tab.label}
                                </div>
                                <ChevronRight className={clsx("w-4 h-4 transition-transform", activeTab === tab.id ? "text-primary-foreground rotate-90 md:rotate-0" : "text-muted-foreground/50")} />
                            </button>
                        ))}
                    </div>

                    <div className="pt-6 mt-6 md:border-t border-border/50">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-5 py-4 rounded-[2rem] font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={clsx(
                    "flex-1 min-h-[500px] bg-card md:rounded-[2.5rem] md:p-8 md:shadow-sm",
                    mobileView ? "block" : "hidden md:block"
                )}>
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center gap-4 mb-8">
                        <button onClick={handleBackToList} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black tracking-tight">{tabs.find(t => t.id === activeTab)?.label}</h2>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
