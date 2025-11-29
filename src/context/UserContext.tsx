"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type UserMode = "SELLER" | "BUYER";

export interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    website: string | null;
    bio: string | null;
    location: string | null;
    accent_color: string | null;
    social_links: {
        twitter?: string;
        instagram?: string;
        twitch?: string;
        youtube?: string;
    } | null;
    verification_status: 'none' | 'pending' | 'verified' | 'rejected';
    updated_at: string | null;
    is_admin?: boolean;
}

interface UserContextType {
    user: User | null;
    profile: Profile | null;
    userMode: UserMode;
    setUserMode: (mode: UserMode) => void;
    toggleUserMode: () => void;
    uploadAvatar: (file: File) => Promise<string | null>;
    uploadBanner: (file: File) => Promise<string | null>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
    isConfigured: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userMode, setUserMode] = useState<UserMode>("SELLER");
    const [loading, setLoading] = useState(true);

    // Fetch session and profile on mount
    useEffect(() => {
        const initializeUser = async () => {
            if (!isSupabaseConfigured) {
                console.warn("Supabase not configured. Using mock data for UI preview.");
                setUser({
                    id: "mock-user-id",
                    email: "demo@paylink.com",
                    app_metadata: {},
                    user_metadata: {},
                    aud: "authenticated",
                    created_at: new Date().toISOString()
                } as User);
                setProfile({
                    id: "mock-user-id",
                    username: "demo_user",
                    full_name: "Demo User",
                    avatar_url: null,
                    banner_url: null,
                    website: null,
                    bio: "This is a demo profile to preview the UI.",
                    location: "Internet",
                    accent_color: "#3b82f6",
                    social_links: null,
                    verification_status: "verified",
                    updated_at: new Date().toISOString()
                });
                setLoading(false);
                return;
            }

            try {
                // Get current session
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error("Error initializing user:", error);
            } finally {
                setLoading(false);
            }

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        };

        initializeUser();

        // Persist UserMode
        const savedMode = localStorage.getItem("paylink_user_mode") as UserMode;
        if (savedMode) {
            setUserMode(savedMode);
        }
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.warn("Error fetching profile:", error.message);
                // If profile doesn't exist, we might want to create one or just leave it null
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error("Unexpected error fetching profile:", error);
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    ...updates,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                throw error;
            }

            await fetchProfile(user.id);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const handleSetUserMode = (mode: UserMode) => {
        setUserMode(mode);
        localStorage.setItem("paylink_user_mode", mode);
    };

    const toggleUserMode = () => {
        const newMode = userMode === "SELLER" ? "BUYER" : "SELLER";
        handleSetUserMode(newMode);
    };

    const uploadFile = async (file: File, bucket: "avatars" | "banners"): Promise<string | null> => {
        if (!user) return null;

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error(`Error uploading ${bucket}:`, error);
            alert(`Error uploading ${bucket}. Please try again.`);
            return null;
        }
    };

    const uploadAvatar = async (file: File) => {
        if (!user) return null;
        const publicUrl = await uploadFile(file, "avatars");
        if (publicUrl) {
            // Update profile
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error("Error updating profile avatar:", error);
            } else {
                await fetchProfile(user.id); // Refresh profile
            }
        }
        return publicUrl;
    };

    const uploadBanner = async (file: File) => {
        if (!user) return null;
        const publicUrl = await uploadFile(file, "banners");
        if (publicUrl) {
            // Update profile
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    banner_url: publicUrl,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error("Error updating profile banner:", error);
            } else {
                await fetchProfile(user.id); // Refresh profile
            }
        }
        return publicUrl;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <UserContext.Provider value={{
            user,
            profile,
            userMode,
            setUserMode: handleSetUserMode,
            toggleUserMode,
            uploadAvatar,
            uploadBanner,
            updateProfile,
            refreshProfile: async () => { if (user) await fetchProfile(user.id); },
            signOut,
            loading,
            isConfigured: isSupabaseConfigured
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

// Backwards compatibility hook if needed, or just deprecate
export const useUserMode = useUser;
