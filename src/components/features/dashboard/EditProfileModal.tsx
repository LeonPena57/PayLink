"use client";

import { useState, useEffect } from "react";
import { X, Camera, Save, User, MapPin, Link as LinkIcon, Twitter, Instagram, Twitch, ArrowLeft, Sparkles } from "lucide-react";
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
    const [youtube, setYoutube] = useState("");
    const [website, setWebsite] = useState("");
    const [accentColor, setAccentColor] = useState("");

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
            setYoutube(profile.social_links?.youtube || "");
            setWebsite(profile.website || "");
            setAccentColor(profile.accent_color || "");
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
                website: website,
                accent_color: accentColor,
                social_links: {
                    twitter,
                    instagram,
                    twitch,
                    youtube
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
                        className="fixed z-[200] left-0 top-0 w-full h-full md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] bg-background md:bg-muted/10 md:border md:border-border md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={onClose} className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <h2 className="text-2xl font-black text-foreground tracking-tight">Edit Profile</h2>
                            </div>
                            <button onClick={onClose} className="hidden md:block p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-muted/10">
                            <div className="space-y-6">
                                {/* Images Card */}
                                <div className="bg-background rounded-3xl border border-border/60 p-5 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-2 text-lg font-bold border-b border-border/60 pb-3">
                                        <Camera className="w-5 h-5 text-primary" />
                                        Images
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Profile Picture</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden border border-border shadow-sm shrink-0">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User className="w-8 h-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <label className="cursor-pointer px-5 py-2.5 bg-muted/50 hover:bg-muted rounded-xl text-sm font-bold transition-colors flex items-center gap-2 border border-border/50">
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
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Banner</label>
                                            <div className="h-20 w-full rounded-2xl bg-muted overflow-hidden border border-border relative group shadow-sm">
                                                {profile?.banner_url ? (
                                                    <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                                        <span className="text-xs text-muted-foreground font-medium">No banner</span>
                                                    </div>
                                                )}
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Camera className="w-6 h-6 text-white drop-shadow-md" />
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

                                {/* Basic Info Card */}
                                <div className="bg-background rounded-3xl border border-border/60 p-5 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-2 text-lg font-bold border-b border-border/60 pb-3">
                                        <User className="w-5 h-5 text-primary" />
                                        Basic Info
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Full Name</label>
                                            <div className="relative">
                                                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl pl-11 pr-4 py-3.5 text-base font-medium transition-all"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Username</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">@</span>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl pl-10 pr-4 py-3.5 text-base font-medium transition-all"
                                                    placeholder="username"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl p-4 text-base font-medium transition-all min-h-[120px] resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Location</label>
                                        <div className="relative">
                                            <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl pl-11 pr-4 py-3.5 text-base font-medium transition-all"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            className="w-full bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl px-5 py-3.5 text-base font-medium transition-all"
                                            placeholder="e.g. Graphic Design, React, SEO"
                                        />
                                    </div>
                                </div>

                                {/* Customization Card */}
                                <div className="bg-background rounded-3xl border border-border/60 p-5 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-2 text-lg font-bold border-b border-border/60 pb-3">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        Customization
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Website</label>
                                        <div className="relative">
                                            <LinkIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                className="w-full bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl pl-11 pr-4 py-3.5 text-base font-medium transition-all"
                                                placeholder="https://your-website.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">Accent Color</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-border/50 shrink-0">
                                                <input
                                                    type="color"
                                                    value={accentColor || "#000000"}
                                                    onChange={(e) => setAccentColor(e.target.value)}
                                                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={accentColor}
                                                onChange={(e) => setAccentColor(e.target.value)}
                                                className="flex-1 bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl px-5 py-3.5 text-base font-medium transition-all uppercase"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links Card */}
                                <div className="bg-background rounded-3xl border border-border/60 p-5 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-2 text-lg font-bold border-b border-border/60 pb-3">
                                        <Twitter className="w-5 h-5 text-primary" />
                                        Social Links
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] shrink-0">
                                                <Twitter className="w-6 h-6" />
                                            </div>
                                            <input
                                                type="text"
                                                value={twitter}
                                                onChange={(e) => setTwitter(e.target.value)}
                                                className="flex-1 bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl px-5 py-3.5 text-base font-medium transition-all"
                                                placeholder="Twitter Username"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C] shrink-0">
                                                <Instagram className="w-6 h-6" />
                                            </div>
                                            <input
                                                type="text"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                className="flex-1 bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl px-5 py-3.5 text-base font-medium transition-all"
                                                placeholder="Instagram Username"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#9146FF]/10 flex items-center justify-center text-[#9146FF] shrink-0">
                                                <Twitch className="w-6 h-6" />
                                            </div>
                                            <input
                                                type="text"
                                                value={twitch}
                                                onChange={(e) => setTwitch(e.target.value)}
                                                className="flex-1 bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl px-5 py-3.5 text-base font-medium transition-all"
                                                placeholder="Twitch Username"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000] shrink-0">
                                                <div className="w-6 h-6 font-bold flex items-center justify-center">YT</div>
                                            </div>
                                            <input
                                                type="text"
                                                value={youtube}
                                                onChange={(e) => setYoutube(e.target.value)}
                                                className="flex-1 bg-muted/50 border-transparent focus:border-primary focus:ring-0 rounded-2xl px-5 py-3.5 text-base font-medium transition-all"
                                                placeholder="YouTube Username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 md:p-6 border-t border-border bg-background/80 backdrop-blur-md shrink-0 flex justify-end gap-3 sticky bottom-0 z-10">
                            <button
                                onClick={onClose}
                                className="hidden md:block px-6 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
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
