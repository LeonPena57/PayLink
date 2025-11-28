"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, MapPin, Link as LinkIcon, Mail, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useUser } from "@/context/UserContext";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ACCENT_COLORS = [
    { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
    { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
    { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
    { name: "Orange", value: "#f97316", class: "bg-orange-500" },
    { name: "Green", value: "#22c55e", class: "bg-green-500" },
    { name: "Red", value: "#ef4444", class: "bg-red-500" },
    { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
    { name: "Yellow", value: "#eab308", class: "bg-yellow-500" },
];

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, updateProfile } = useUser();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        location: "",
        website: "",
        bio: "",
        accent_color: "#3b82f6",
        twitter: "",
        instagram: "",
        twitch: "",
        youtube: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                location: profile.location || "",
                website: profile.website || "",
                bio: profile.bio || "",
                accent_color: profile.accent_color || "#3b82f6",
                twitter: profile.social_links?.twitter || "",
                instagram: profile.social_links?.instagram || "",
                twitch: profile.social_links?.twitch || "",
                youtube: profile.social_links?.youtube || ""
            });
        }
    }, [profile, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                full_name: formData.full_name,
                location: formData.location,
                website: formData.website,
                bio: formData.bio,
                accent_color: formData.accent_color,
                social_links: {
                    twitter: formData.twitter,
                    instagram: formData.instagram,
                    twitch: formData.twitch,
                    youtube: formData.youtube
                }
            });
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop (Desktop only) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] hidden md:block"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed z-[70] inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg bg-card md:border border-border md:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary hidden md:block" />
                                    Edit Profile
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="hidden md:block p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {/* Mobile Save Button in Header */}
                            <button
                                type="submit"
                                form="edit-profile-form"
                                disabled={isSaving}
                                className="md:hidden text-primary font-bold text-sm disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>

                        {/* Form */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6 pb-20 md:pb-0">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            placeholder="Your Name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Website</label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={formData.website}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                    className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="yourwebsite.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[100px] resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    {/* Accent Color Picker */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Accent Color
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {ACCENT_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, accent_color: color.value })}
                                                    className={clsx(
                                                        "w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-sm hover:scale-110 active:scale-95",
                                                        color.class,
                                                        formData.accent_color === color.value ? "ring-4 ring-offset-2 ring-offset-card ring-primary" : "opacity-80 hover:opacity-100"
                                                    )}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Social Links</label>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={formData.twitter}
                                                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                                                placeholder="Twitter username"
                                            />
                                            <input
                                                type="text"
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                                                placeholder="Instagram username"
                                            />
                                            <input
                                                type="text"
                                                value={formData.twitch}
                                                onChange={(e) => setFormData({ ...formData, twitch: e.target.value })}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                                                placeholder="Twitch username"
                                            />
                                            <input
                                                type="text"
                                                value={formData.youtube}
                                                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                                                placeholder="YouTube username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer (Desktop Only) */}
                        <div className="hidden md:flex p-6 border-t border-border bg-muted/30 justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-profile-form"
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
