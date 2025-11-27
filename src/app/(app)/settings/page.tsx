"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUserMode, useUser } from "@/context/UserContext";
import { Moon, Sun, Monitor, User, Bell, Shield, LogOut, ChevronRight, CreditCard, Globe, HelpCircle, Crown, X, Check, Mail, Lock, Smartphone, Trash2 } from "lucide-react";
import clsx from "clsx";
import { SubscriptionModal } from "@/components/features/dashboard/SubscriptionModal";
import { VerificationModal } from "@/components/features/dashboard/VerificationModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

// Generic Modal Component
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

    const sections = [
        {
            title: "Subscription",
            items: [
                {
                    icon: Crown,
                    label: "Manage Subscription",
                    value: "Free Plan",
                    action: () => setIsSubscriptionOpen(true),
                    type: "link"
                }
            ]
        },
        {
            title: "Appearance",
            items: [
                {
                    icon: theme === 'dark' ? Moon : Sun,
                    label: "Theme",
                    value: theme === 'dark' ? "Dark" : theme === 'light' ? "Light" : "System",
                    action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
                    type: "toggle"
                }
            ]
        },
        {
            title: "Account Mode",
            items: [
                {
                    icon: User,
                    label: "Switch Mode",
                    value: userMode === "SELLER" ? "Seller" : "Buyer",
                    action: toggleUserMode,
                    type: "toggle_mode"
                }
            ]
        },
        {
            title: "General",
            items: [
                { icon: User, label: "Account Information", action: () => setActiveModal("ACCOUNT"), type: "link" },
                {
                    icon: Check,
                    label: "Verification",
                    value: getVerificationStatusLabel(),
                    action: handleVerificationClick,
                    type: "link",
                    disabled: profile?.verification_status === 'verified' || profile?.verification_status === 'pending'
                },
                { icon: Bell, label: "Notifications", action: () => setActiveModal("NOTIFICATIONS"), type: "link" },
                { icon: Globe, label: "Language", value: "English", action: () => setActiveModal("LANGUAGE"), type: "link" },
            ]
        },
        {
            title: "Payments & Security",
            items: [
                { icon: CreditCard, label: "Payment Methods", action: () => setActiveModal("PAYMENTS"), type: "link" },
                { icon: Shield, label: "Security & Privacy", action: () => setActiveModal("SECURITY"), type: "link" },
            ]
        },
        {
            title: "Support",
            items: [
                { icon: HelpCircle, label: "Help Center", action: () => setActiveModal("HELP"), type: "link" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-32 p-4 md:p-8 max-w-3xl mx-auto">
            <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
            <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} />

            {/* Account Modal */}
            <SettingsDetailModal isOpen={activeModal === "ACCOUNT"} onClose={() => setActiveModal(null)} title="Account Information">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                        <div className="p-3 bg-muted/50 rounded-xl border border-border flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground font-medium">{user?.email || "No email found"}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Password</label>
                        <button
                            onClick={handleResetPassword}
                            disabled={resetSent}
                            className="w-full p-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors flex items-center justify-between group"
                        >
                            <span className="font-medium">Change Password</span>
                            <span className="text-xs text-primary font-bold">{resetSent ? "Email Sent!" : "Send Reset Link"}</span>
                        </button>
                    </div>
                </div>
            </SettingsDetailModal>

            {/* Notifications Modal */}
            <SettingsDetailModal isOpen={activeModal === "NOTIFICATIONS"} onClose={() => setActiveModal(null)} title="Notifications">
                <div className="space-y-4">
                    {[
                        { label: "Email Notifications", desc: "Receive emails about your account activity." },
                        { label: "Push Notifications", desc: "Receive push notifications on your device." },
                        { label: "Marketing Emails", desc: "Receive emails about new features and offers." },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                            <div>
                                <div className="font-bold text-foreground">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsDetailModal>

            {/* Language Modal */}
            <SettingsDetailModal isOpen={activeModal === "LANGUAGE"} onClose={() => setActiveModal(null)} title="Language">
                <div className="space-y-2">
                    {["English", "Spanish", "French", "German", "Japanese"].map((lang) => (
                        <button key={lang} className="w-full p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors flex items-center justify-between group">
                            <span className="font-medium">{lang}</span>
                            {lang === "English" && <Check className="w-4 h-4 text-primary" />}
                        </button>
                    ))}
                </div>
            </SettingsDetailModal>

            {/* Payments Modal */}
            <SettingsDetailModal isOpen={activeModal === "PAYMENTS"} onClose={() => setActiveModal(null)} title="Payment Methods">
                <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <CreditCard className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">No Payment Methods</h3>
                        <p className="text-muted-foreground text-sm">You haven't added any payment methods yet.</p>
                    </div>
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                        Add Payment Method
                    </button>
                </div>
            </SettingsDetailModal>

            {/* Security Modal */}
            <SettingsDetailModal isOpen={activeModal === "SECURITY"} onClose={() => setActiveModal(null)} title="Security & Privacy">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
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

                    <div className="pt-4 border-t border-border">
                        <button className="w-full p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-500 group">
                            <Trash2 className="w-5 h-5" />
                            <div className="text-left">
                                <div className="font-bold">Delete Account</div>
                                <div className="text-xs opacity-80">Permanently delete your account and data.</div>
                            </div>
                        </button>
                    </div>
                </div>
            </SettingsDetailModal>

            {/* Help Modal */}
            <SettingsDetailModal isOpen={activeModal === "HELP"} onClose={() => setActiveModal(null)} title="Help Center">
                <div className="space-y-4">
                    <div className="p-4 bg-card border border-border rounded-xl space-y-4">
                        <h3 className="font-bold">Contact Support</h3>
                        <p className="text-sm text-muted-foreground">Need help? Our support team is available 24/7.</p>
                        <button className="w-full py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
                            Start Live Chat
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors text-center space-y-2">
                            <div className="font-bold text-sm">FAQs</div>
                        </button>
                        <button className="p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors text-center space-y-2">
                            <div className="font-bold text-sm">Community</div>
                        </button>
                    </div>
                </div>
            </SettingsDetailModal>

            <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

            <div className="space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">{section.title}</h2>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            {section.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    onClick={item.disabled ? undefined : item.action}
                                    className={clsx(
                                        "flex items-center justify-between p-4 transition-colors",
                                        item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50 cursor-pointer",
                                        itemIdx !== section.items.length - 1 && "border-b border-border/50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-foreground">{item.label}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {item.type === "toggle_mode" && (
                                            <div className="bg-muted p-1 rounded-lg flex items-center">
                                                <span className={clsx("px-3 py-1 rounded-md text-xs font-bold transition-all", item.value === "Seller" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>Seller</span>
                                                <span className={clsx("px-3 py-1 rounded-md text-xs font-bold transition-all", item.value === "Buyer" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>Buyer</span>
                                            </div>
                                        )}

                                        {item.value && item.type !== "toggle_mode" && (
                                            <span className="text-muted-foreground text-sm">{item.value}</span>
                                        )}

                                        <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleSignOut}
                    className="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-bold flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </div>
    );
}
