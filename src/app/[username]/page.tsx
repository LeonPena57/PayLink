"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { MapPin, Link as LinkIcon, Twitter, Instagram, Twitch, Grid as GridIcon, ShoppingBag, Package, Heart, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { PostModal } from "@/components/features/PostModal";
import { useToast } from "@/context/ToastContext";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const router = useRouter();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("POSTS");

    const [stats, setStats] = useState({ followers: 0, following: 0, is_following: false });

    // Post Modal State
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const handlePostClick = (post: any) => {
        // Inject profile data since we know the post belongs to this profile
        const postWithUser = {
            ...post,
            user: {
                name: profile.full_name,
                username: profile.username,
                avatar: profile.avatar_url,
                verification_status: profile.verification_status
            },
            profiles: profile // Fallback for some components that might look for profiles
        };
        setSelectedPost(postWithUser);
        setIsPostModalOpen(true);
    };

    useEffect(() => {
        fetchProfile();
    }, [username]);

    useEffect(() => {
        if (profile) {
            fetchStats();
        }
    }, [profile, currentUser]); // Re-fetch if user changes (login/logout)

    const fetchProfile = async () => {
        setLoading(true);
        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (profileError || !profileData) {
            setLoading(false);
            return;
        }

        setProfile(profileData);

        // 2. Fetch Portfolio
        const { data: portfolioData } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });

        if (portfolioData) setPortfolioItems(portfolioData);
        setLoading(false);
    };

    const fetchStats = async () => {
        if (!profile) return;

        // Use the RPC function we created
        const { data, error } = await supabase
            .rpc('get_profile_stats', { target_user_id: profile.id });

        if (data) {
            setStats(data);
            setIsFollowing(data.is_following);
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser) {
            // Redirect to login or show auth modal
            toast("Please login to follow users.", "error");
            return;
        }

        if (isFollowing) {
            // Unfollow
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', profile.id);

            if (!error) {
                setIsFollowing(false);
                setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
            }
        } else {
            // Follow
            const { error } = await supabase
                .from('follows')
                .insert({
                    follower_id: currentUser.id,
                    following_id: profile.id
                });

            if (!error) {
                setIsFollowing(true);
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">User not found</h1>
                <p className="text-muted-foreground mb-4">The user @{username} does not exist.</p>
                <Link href="/home" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">
                    Go Home
                </Link>
            </div>
        );
    }

    const accentColor = profile.accent_color || "#3b82f6";
    const isOwner = currentUser?.id === profile.id;

    // Group portfolio items by section
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolioSections = portfolioItems.reduce((acc: any, item: any) => {
        const section = item.section || 'General';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background pb-32">
            <PostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                post={selectedPost}
                onUpdate={(updatedPost) => {
                    setPortfolioItems(prev => prev.map(item => item.id === updatedPost.id ? { ...item, ...updatedPost } : item));
                }}
            />
            {/* Profile Header */}
            <div className="relative group pb-4">
                {/* Banner */}
                <div className="h-64 md:h-96 w-full relative overflow-hidden">
                    {profile.banner_url ? (
                        <div className="absolute inset-0">
                            <img src={profile.banner_url} alt="Profile Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 dark:bg-black/20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/50 to-background" />
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl uppercase tracking-widest">
                                No Banner
                            </div>
                        </>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-32 md:-mt-40">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                        {/* Avatar */}
                        <div className="relative shrink-0 mx-auto md:mx-0">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] p-1.5 bg-background shadow-2xl shadow-black/20">
                                <div className="w-full h-full rounded-[2rem] bg-muted overflow-hidden relative border border-border">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-white text-6xl md:text-7xl font-black italic tracking-tighter"
                                            style={{ background: `linear-gradient(to bottom right, ${accentColor}, #000)` }}
                                        >
                                            {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "??"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full text-center md:text-left pb-4 min-w-0">
                            <div className="space-y-4 flex-1 w-full min-w-0">
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none mb-2">
                                        {profile.full_name || "No Name"}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground font-medium text-lg">
                                        <span className="text-foreground">@{profile.username}</span>
                                        {profile.location && (
                                            <>
                                                <span className="hidden md:inline">•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {profile.location}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-center md:justify-start gap-6 mt-2 text-sm font-medium">
                                        <div className="flex items-center gap-1">
                                            <span className="text-foreground font-bold">{stats.followers}</span>
                                            <span className="text-muted-foreground">Followers</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-foreground font-bold">{stats.following}</span>
                                            <span className="text-muted-foreground">Following</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
                                    {profile.bio || "No bio information provided."}
                                </p>

                                {/* Social Pills */}
                                <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        {profile.social_links?.twitter && (
                                            <a href={`https://twitter.com/${profile.social_links.twitter}`} target="_blank" className="px-4 py-2 bg-muted/40 border border-border/50 rounded-xl hover:border-blue-400/50 hover:bg-blue-400/10 hover:text-[#1DA1F2] text-muted-foreground hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm">
                                                <Twitter className="w-4 h-4" fill="currentColor" />
                                                Twitter
                                            </a>
                                        )}
                                        {profile.social_links?.instagram && (
                                            <a href={`https://instagram.com/${profile.social_links.instagram}`} target="_blank" className="px-4 py-2 bg-muted/40 border border-border/50 rounded-xl hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-[#E1306C] text-muted-foreground hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm">
                                                <Instagram className="w-4 h-4" />
                                                Instagram
                                            </a>
                                        )}
                                        {profile.social_links?.twitch && (
                                            <a href={`https://twitch.tv/${profile.social_links.twitch}`} target="_blank" className="px-4 py-2 bg-muted/40 border border-border/50 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-[#9146FF] text-muted-foreground hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm">
                                                <Twitch className="w-4 h-4" fill="currentColor" />
                                                Twitch
                                            </a>
                                        )}
                                    </div>
                                </div>


                                {/* Actions */}
                                {!isOwner && (
                                    <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                                        <button
                                            onClick={handleFollowToggle}
                                            className={clsx(
                                                "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95",
                                                isFollowing
                                                    ? "bg-card border border-border text-foreground hover:bg-muted"
                                                    : "bg-primary text-primary-foreground hover:opacity-90"
                                            )}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <UserCheck className="w-5 h-5" />
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-5 h-5" />
                                                    Follow
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!currentUser) {
                                                    toast("Make an account to message", "error");
                                                    return;
                                                }
                                                router.push(`/messages?chat_with=${profile.id}`);
                                            }}
                                            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 bg-card border border-border text-foreground hover:bg-muted"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Message
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}

                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-12 border-b border-border">
                        <div className="flex gap-8 overflow-x-auto max-w-full pb-px no-scrollbar justify-start">
                            {["POSTS", "SHOP"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        "py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-black tracking-widest border-b-[3px] transition-all flex items-center gap-2 uppercase",
                                        activeTab === tab
                                            ? "text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                    style={{
                                        borderColor: activeTab === tab ? accentColor : "transparent",
                                        color: activeTab === tab ? accentColor : undefined
                                    }}
                                >
                                    {tab === "POSTS" && <GridIcon className="w-4 h-4" />}
                                    {tab === "SHOP" && <ShoppingBag className="w-4 h-4" />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto mt-2 pb-20">
                {activeTab === "POSTS" && (
                    <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {portfolioItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <GridIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">No Portfolio Items</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                        This user hasn't added any projects yet.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            Object.entries(portfolioSections).map(([sectionName, items]: [string, any]) => (
                                <div key={sectionName} className="space-y-4">
                                    <h3 className="text-xl font-bold text-foreground px-1 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-primary rounded-full" />
                                        {sectionName}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handlePostClick(item)}
                                                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-muted border border-border shadow-sm hover:shadow-md transition-all"
                                            >
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                    <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                                                    {item.description && <p className="text-white/70 text-xs truncate">{item.description}</p>}
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1 text-white/90 text-xs font-bold">
                                                            <Heart className="w-3 h-3 fill-white" />
                                                            {item.likes || 0}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-white/90 text-xs font-bold">
                                                            <MessageCircle className="w-3 h-3 fill-white" />
                                                            {item.comments || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "SHOP" && (
                    <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Shop is Empty</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                    This user hasn't listed any products yet.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
