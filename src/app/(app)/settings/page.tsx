"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUserMode, useUser } from "@/context/UserContext";
import { Moon, Sun, Monitor, User, Shield, LogOut, ChevronRight, CreditCard, Globe, HelpCircle, Crown, X, Mail, Smartphone, Trash2, LayoutGrid, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { EditProfileModal } from "@/components/features/dashboard/EditProfileModal";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { userMode, toggleUserMode } = useUserMode();
    const { user, signOut } = useUser();
    const [activeTab, setActiveTab] = useState("general");
    const [mobileView, setMobileView] = useState(false); // false = list, true = content
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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

    const tabs = [
        { id: "general", label: "General", icon: User },
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

    const SettingsIcon = ({ tabId }: { tabId: string }) => {
        const tab = tabs.find(t => t.id === tabId);
        const Icon = tab?.icon || HelpCircle;
        return <Icon className="w-8 h-8 text-muted-foreground" />;
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
