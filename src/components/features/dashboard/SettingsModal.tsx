"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Sun, Moon, Monitor, Settings, Shield, ChevronRight, LogOut, Crown, Plane } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSubscription: () => void;
}

export function SettingsModal({ isOpen, onClose, onOpenSubscription }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const { user, signOut, userMode, toggleUserMode, profile, refreshProfile } = useUser();
    const router = useRouter();
    const [resetSent, setResetSent] = useState(false);
    const [vacationMode, setVacationMode] = useState(false);

    useEffect(() => {
        if (profile) {
            setVacationMode(profile.vacation_mode || false);
        }
    }, [profile]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
        onClose();
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

    const handleVacationToggle = async () => {
        if (!user) return;

        const newStatus = !vacationMode;
        setVacationMode(newStatus); // Optimistic update

        const { error } = await supabase
            .from('profiles')
            .update({ vacation_mode: newStatus })
            .eq('id', user.id);

        if (error) {
            console.error("Error updating vacation mode:", error);
            setVacationMode(!newStatus); // Revert on error
        } else {
            refreshProfile();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                Settings
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                            {/* Mode Switcher */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group cursor-pointer" onClick={toggleUserMode}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                                            <span className="font-bold text-blue-100 text-xs tracking-wider uppercase">Current Mode</span>
                                        </div>
                                        <h3 className="text-2xl font-black italic tracking-tight">{userMode}</h3>
                                        <p className="text-blue-100 text-xs mt-1">Tap to switch to {userMode === "SELLER" ? "Buyer" : "Seller"}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:rotate-180 transition-transform duration-500">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Crown className="w-4 h-4" />
                                    Subscription
                                </h3>
                                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-foreground flex items-center gap-2">
                                            Free Plan
                                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] uppercase tracking-wider rounded-full font-bold">Current</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">Basic features & 5% fee</div>
                                    </div>
                                    <button
                                        onClick={onOpenSubscription}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            </div>

                            {/* Appearance Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Appearance
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={clsx(
                                            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95",
                                            theme === "light"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-muted"
                                        )}
                                    >
                                        <div className="w-full aspect-video bg-[#F5F5F7] rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                                            <Sun className="w-6 h-6 text-gray-900" />
                                        </div>
                                        <span className={clsx("font-medium text-sm", theme === "light" ? "text-primary" : "text-muted-foreground")}>Light</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={clsx(
                                            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95",
                                            theme === "dark"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-muted"
                                        )}
                                    >
                                        <div className="w-full aspect-video bg-[#000000] rounded-lg border border-gray-800 shadow-sm flex items-center justify-center">
                                            <Moon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={clsx("font-medium text-sm", theme === "dark" ? "text-primary" : "text-muted-foreground")}>Dark</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("system")}
                                        className={clsx(
                                            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95",
                                            theme === "system"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-muted"
                                        )}
                                    >
                                        <div className="w-full aspect-video bg-gradient-to-br from-[#F5F5F7] to-[#000000] rounded-lg border border-border shadow-sm flex items-center justify-center">
                                            <Monitor className="w-6 h-6 text-gray-500 mix-blend-difference" />
                                        </div>
                                        <span className={clsx("font-medium text-sm", theme === "system" ? "text-primary" : "text-muted-foreground")}>System</span>
                                    </button>
                                </div>
                            </div>

                            {/* Seller Settings */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Plane className="w-4 h-4" />
                                    Seller Settings
                                </h3>
                                <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-foreground">Vacation Mode</div>
                                        <div className="text-sm text-muted-foreground">Pause your gigs and hide them from search</div>
                                    </div>
                                    <button
                                        onClick={handleVacationToggle}
                                        className={clsx(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                            vacationMode ? "bg-primary" : "bg-muted"
                                        )}
                                    >
                                        <span
                                            className={clsx(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                vacationMode ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Account Security Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Account & Security
                                </h3>
                                <div className="space-y-3">
                                    <div className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                                        <div className="text-left">
                                            <div className="font-medium text-foreground">Email Address</div>
                                            <div className="text-sm text-muted-foreground">{user?.email || "No email found"}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={resetSent}
                                        className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors group"
                                    >
                                        <div className="text-left">
                                            <div className="font-medium text-foreground">Change Password</div>
                                            <div className="text-sm text-muted-foreground">
                                                {resetSent ? "Reset email sent!" : "Send password reset email"}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-4 border-t border-border">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-center gap-2 p-4 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
