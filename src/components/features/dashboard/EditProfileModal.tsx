"use client";

import { useState, useEffect } from "react";
import { X, Camera, Save, User, MapPin, Link as LinkIcon, Twitter, Instagram, Twitch, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, user, refreshProfile, uploadAvatar, uploadBanner } = useUser();
    const [loading, setLoading] = useState(false);

    // Form States
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [skills, setSkills] = useState("");
    const [twitter, setTwitter] = useState("");
    const [instagram, setInstagram] = useState("");
    const [twitch, setTwitch] = useState("");

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            setUsername(profile.username || "");
            setBio(profile.bio || "");
            setLocation(profile.location || "");
            setSkills(profile.skills?.join(", ") || "");
            setTwitter(profile.social_links?.twitter || "");
            setInstagram(profile.social_links?.instagram || "");
            setTwitch(profile.social_links?.twitch || "");
        }
    }, [profile, isOpen]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const updates = {
                id: user.id,
                full_name: fullName,
                username: username,
                bio: bio,
                location: location,
                skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
                social_links: {
                    twitter,
                    instagram,
                    twitch
                },
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            await refreshProfile();
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
                            <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-6">
                                {/* Images */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Images</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Profile Picture</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-muted overflow-hidden border border-border">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <label className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                                                    <Camera className="w-4 h-4" />
                                                    Change
                                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setLoading(true);
                                                            await uploadAvatar(file);
                                                            setLoading(false);
                                                        }
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Banner</label>
                                            <div className="h-16 w-full rounded-xl bg-muted overflow-hidden border border-border relative group">
                                                {profile?.banner_url ? (
                                                    <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                                        <span className="text-xs text-muted-foreground">No banner</span>
                                                    </div>
                                                )}
                                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Camera className="w-5 h-5 text-white" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setLoading(true);
                                                            await uploadBanner(file);
                                                            setLoading(false);
                                                        }
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Basic Info</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Full Name</label>
                                            <div className="relative">
                                                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Username</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="username"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full bg-muted/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Location</label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                            placeholder="e.g. Graphic Design, React, SEO"
                                        />
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Social Links</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2]">
                                                <Twitter className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={twitter}
                                                onChange={(e) => setTwitter(e.target.value)}
                                                className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Twitter Username"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C]">
                                                <Instagram className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Instagram Username"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#9146FF]/10 flex items-center justify-center text-[#9146FF]">
                                                <Twitch className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={twitch}
                                                onChange={(e) => setTwitch(e.target.value)}
                                                className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Twitch Username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-muted/30 shrink-0 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
