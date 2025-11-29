"use client";

import { useState, useEffect, useRef } from "react";
import {
    Grid as GridIcon,
    ShoppingBag,
    MoreHorizontal,
    MapPin,
    Check,
    TrendingUp,
    RefreshCw,
    Star,
    Home,
    MessageCircle,
    Search,
    UserPlus,
    Heart,
    Share2,
    Camera,
    DollarSign,
    Twitter,
    Instagram,
    Twitch,
    Edit3,
    User,
    Maximize2,
    Send
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useUserMode, useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";

const PROFILE_TABS = ["HOME", "SERVICES", "PORTFOLIO", "SHOP"];
const TAGS = ["All", "Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation"];

import { EditProfileModal } from "@/components/features/dashboard/EditProfileModal";
import { PostModal } from "@/components/features/PostModal";

export default function HomePage() {
    const { userMode } = useUserMode();
    const { user, profile, uploadAvatar, uploadBanner, isConfigured, loading } = useUser();
    const { toast } = useToast();
    const [activeProfileTab, setActiveProfileTab] = useState("HOME");
    const [isFollowing, setIsFollowing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTag, setActiveTag] = useState("All");
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0, is_following: false });

    // Scroll Direction State for Mobile Header
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                // Hide on scroll down (if > 100px), show on scroll up
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    setIsHeaderVisible(false);
                } else {
                    setIsHeaderVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    // Post Modal State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePostClick = (post: any) => {
        setSelectedPost(post);
        setIsPostModalOpen(true);
    };

    useEffect(() => {
        if (profile) {
            fetchStats();
        }
    }, [profile]);

    const fetchStats = async () => {
        if (!profile) return;
        const { data, error } = await supabase
            .rpc('get_profile_stats', { target_user_id: profile.id });

        if (data) {
            setStats(data);
        }
    };

    // Upload States
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleBannerClick = () => bannerInputRef.current?.click();
    const handleAvatarClick = () => avatarInputRef.current?.click();

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingBanner(true);
            await uploadBanner(file);
            setIsUploadingBanner(false);
        }
    };

    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim().length === 0) {
                setSearchedUsers([]);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, verification_status')
                .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
                .limit(5);

            if (data) {
                setSearchedUsers(data);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingAvatar(true);
            await uploadAvatar(file);
            setIsUploadingAvatar(false);
        }
    };

    // Fetch Feed Items (All Portfolio Items for now, simulating a public feed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [feedItems, setFeedItems] = useState<any[]>([]);
    const [loadingFeed, setLoadingFeed] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

    useEffect(() => {
        // Fetch feed if in BUYER mode OR if user is not logged in (public view)
        if (userMode === "BUYER" || !user) {
            fetchFeed();
            fetchSuggestedUsers();
        }
    }, [userMode, user]);

    const fetchFeed = async () => {
        setLoadingFeed(true);
        // Fetch all portfolio items, ordering by newest first
        const { data, error } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                profiles (
                    id,
                    username,
                    full_name,
                    avatar_url,
                    verification_status
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            // Transform data to match the feed UI structure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedFeed = data.map((item: any) => ({
                ...item,
                user: {
                    name: item.profiles?.full_name || "Unknown User",
                    handle: `@${item.profiles?.username || "unknown"}`,
                    avatar: item.profiles?.avatar_url,
                    username: item.profiles?.username,
                    verification_status: item.profiles?.verification_status
                },
                image: item.image_url,
                caption: item.description || item.title,
                likes: 0, // Will be fetched/updated via modal
                comments: 0, // Will be fetched/updated via modal
                tags: item.section ? [item.section] : ["Creative"] // Use section as tag
            }));
            setFeedItems(formattedFeed);
        }
        setLoadingFeed(false);
    };

    const fetchSuggestedUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .limit(5);

        if (data) {
            const formattedUsers = data.map(user => ({
                id: user.id,
                name: user.full_name || "Unknown",
                handle: `@${user.username || "unknown"}`,
                avatar: user.avatar_url,
                username: user.username
            }));
            setSuggestedUsers(formattedUsers);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleLike = async (post: any) => {
        if (!user) {
            toast("Please login to like posts.", "error");
            return;
        }

        // Optimistic update
        const isLiked = post.user_has_liked;
        const newLikesCount = isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

        setFeedItems(prev => prev.map(item =>
            item.id === post.id
                ? { ...item, likes: newLikesCount, user_has_liked: !isLiked }
                : item
        ));

        if (isLiked) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('portfolio_item_id', post.id);

            if (error) {
                toast("Error unliking post", "error");
                // Revert
                setFeedItems(prev => prev.map(item =>
                    item.id === post.id
                        ? { ...item, likes: post.likes, user_has_liked: true }
                        : item
                ));
            }
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert({
                    user_id: user.id,
                    portfolio_item_id: post.id
                });

            if (error) {
                toast("Error liking post", "error");
                // Revert
                setFeedItems(prev => prev.map(item =>
                    item.id === post.id
                        ? { ...item, likes: post.likes, user_has_liked: false }
                        : item
                ));
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [services, setServices] = useState<any[]>([]);

    // Inline Comment State
    const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
    const [inlineComment, setInlineComment] = useState("");

    useEffect(() => {
        if (userMode === "SELLER" && profile) {
            fetchSellerData();
        }
    }, [userMode, profile]);

    const handleInlineCommentSubmit = async (postId: string) => {
        if (!user) {
            toast("Please login to comment.", "error");
            return;
        }
        if (!inlineComment.trim()) return;

        const { error } = await supabase
            .from('comments')
            .insert({
                user_id: user.id,
                portfolio_item_id: postId,
                content: inlineComment.trim()
            });

        if (error) {
            toast(`Error posting comment: ${error.message}`, "error");
        } else {
            toast("Comment posted!", "success");
            setInlineComment("");
            setCommentingPostId(null);
            // Optimistically update comment count
            setFeedItems(prev => prev.map(item =>
                item.id === postId
                    ? { ...item, comments: item.comments + 1 }
                    : item
            ));
        }
    };

    const fetchSellerData = async () => {
        // Fetch Portfolio
        const { data: portfolio } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', profile!.id)
            .order('created_at', { ascending: false });

        if (portfolio) {
            // Attach current user profile to items so PostModal has data
            const formattedPortfolio = portfolio.map(item => ({
                ...item,
                user: {
                    name: profile?.full_name || "Me",
                    handle: `@${profile?.username}`,
                    avatar: profile?.avatar_url,
                    username: profile?.username
                },
                // Ensure image_url is present (it should be from DB)
                image_url: item.image_url
            }));
            setPortfolioItems(formattedPortfolio);
        }

        // Fetch Services
        const { data: servicesData } = await supabase
            .from('services')
            .select('*')
            .eq('seller_id', profile!.id)
            .order('created_at', { ascending: false });

        if (servicesData) {
            // Mock previews for now as the schema might not have it or it's a different structure
            const formattedServices = servicesData.map(s => ({
                ...s,
                icon: ShoppingBag, // Default icon
                previews: s.image_url ? [s.image_url] : []
            }));
            setServices(formattedServices);
        }
    };

    const filteredFeed = feedItems.filter(item => {
        const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
        const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    const accentColor = profile?.accent_color || "#3b82f6";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white pb-32 selection:bg-red-500/30 transition-colors duration-300 font-sans">

            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
            <PostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                post={selectedPost}
                onUpdate={(updatedPost) => {
                    setFeedItems(prev => prev.map(item => item.id === updatedPost.id ? { ...item, ...updatedPost } : item));
                    setPortfolioItems(prev => prev.map(item => item.id === updatedPost.id ? { ...item, ...updatedPost } : item));
                }}
            />
            <input type="file" ref={bannerInputRef} onChange={handleBannerChange} className="hidden" accept="image/*" />
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />

            {user && userMode === "SELLER" ? (
                /* SELLER DASHBOARD */
                <div>
                    {/* Profile Header */}
                    <div className="relative group pb-4">
                        {/* Immersive Banner */}
                        <div className="h-48 md:h-80 w-full relative overflow-hidden group/banner">
                            {profile?.banner_url ? (
                                <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#2a2a2a] dark:to-[#1a1a1a]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background" />

                            {/* Social Icons Overlay (Top Right) */}
                            <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                                {profile?.social_links?.twitch && (
                                    <a href={`https://twitch.tv/${profile.social_links.twitch}`} target="_blank" className="text-white/80 hover:text-white transition-colors hover:scale-110 transform">
                                        <Twitch className="w-6 h-6" />
                                    </a>
                                )}
                                {profile?.social_links?.instagram && (
                                    <a href={`https://instagram.com/${profile.social_links.instagram}`} target="_blank" className="text-white/80 hover:text-white transition-colors hover:scale-110 transform">
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                )}
                                {profile?.social_links?.twitter && (
                                    <a href={`https://twitter.com/${profile.social_links.twitter}`} target="_blank" className="text-white/80 hover:text-white transition-colors hover:scale-110 transform">
                                        <Twitter className="w-6 h-6" />
                                    </a>
                                )}
                            </div>

                            {/* Edit Profile Button */}
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover/banner:opacity-100 transition-opacity hover:bg-black/70 z-30"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 md:-mt-32">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                                {/* Avatar */}
                                <div className="relative shrink-0 mx-auto md:mx-0 group/avatar">
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl p-1 bg-white dark:bg-[#1a1a1a] shadow-2xl">
                                        <div className="w-full h-full rounded-2xl overflow-hidden relative border-2 border-gray-200 dark:border-[#333]">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 dark:bg-[#333] flex items-center justify-center">
                                                    <User className="w-16 h-16 text-gray-400" />
                                                </div>
                                            )}
                                            <div
                                                onClick={handleAvatarClick}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    {profile?.verification_status === 'verified' && (
                                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#1a1a1a] p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-[#333]">
                                            <div className="text-white p-1 rounded-full bg-red-500">
                                                <Check className="w-3 h-3 stroke-[4]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full text-center md:text-left pb-4 min-w-0">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {profile?.full_name || user?.email?.split('@')[0]}
                                        </h1>
                                        <p className="text-gray-500 font-medium">@{profile?.username || "username"}</p>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm font-bold justify-center md:justify-end">
                                        <div className="text-center md:text-right">
                                            <div className="text-gray-900 dark:text-white text-lg">{stats.followers}</div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wider">Followers</div>
                                        </div>
                                        <div className="text-center md:text-right">
                                            <div className="text-gray-900 dark:text-white text-lg">{stats.following}</div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wider">Following</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Tabs */}
                    <div className="sticky top-16 z-30 bg-gray-50/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md w-full border-b border-gray-200 dark:border-[#333] mt-6">
                        <div className="flex gap-6 overflow-x-auto w-full px-4 md:px-0 no-scrollbar justify-start md:justify-center">
                            {PROFILE_TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveProfileTab(tab)}
                                    className={clsx(
                                        "py-4 text-xs font-bold tracking-widest border-b-[3px] transition-all flex items-center gap-2 uppercase min-w-max",
                                        activeProfileTab === tab
                                            ? "text-gray-900 dark:text-white border-red-500"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                >
                                    {tab === "HOME" && <Home className="w-4 h-4" />}
                                    {tab === "SERVICES" && <MoreHorizontal className="w-4 h-4" />}
                                    {tab === "PORTFOLIO" && <GridIcon className="w-4 h-4" />}
                                    {tab === "SHOP" && <ShoppingBag className="w-4 h-4" />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Dashboard Content */}
                    <div className="max-w-7xl mx-auto mt-6 px-4 pb-20">
                        {activeProfileTab === "HOME" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                {/* Revenue Chart Section */}
                                <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl p-6 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold italic tracking-wider text-gray-900 dark:text-white">REVENUE</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold bg-gray-100 dark:bg-[#333] px-3 py-1 rounded-full text-green-500 dark:text-green-400">
                                            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                                            2025
                                        </div>
                                    </div>

                                    <div className="h-48 w-full relative flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-dashed border-gray-200 dark:border-[#333]">
                                        <div className="text-center">
                                            <p className="text-gray-400 dark:text-gray-500 font-bold">No Data Available</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Revenue data will appear here once you start selling.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 italic">Orders - This week</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white mb-2" />
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                <UserPlus className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-2" />
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                <Star className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mb-2 fill-current" />
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">0.0</span>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                <RefreshCw className="w-6 h-6 text-gray-900 dark:text-white mb-2" />
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl p-6 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 italic mb-6">Earnings</h4>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-6 text-center">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">This Week</span>
                                                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">$0.00</span>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-6 text-center">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total</span>
                                                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">$0.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeProfileTab === "SERVICES" && (
                            <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white px-1">Active Services</h3>
                                    <div className="space-y-4">
                                        {services.length > 0 ? (
                                            services.map((service) => (
                                                <div key={service.id} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl p-4">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-100 dark:bg-[#333] rounded-full flex items-center justify-center text-gray-900 dark:text-white">
                                                                <service.icon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white">{service.title}</h4>
                                                                <p className="text-sm text-green-500 dark:text-green-400 font-bold">Starting at ${service.price}</p>
                                                            </div>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                        {service.previews.map((preview: string, idx: number) => (
                                                            <div key={idx} className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-[#333]">
                                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                                No services available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeProfileTab === "PORTFOLIO" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-3 gap-0.5 md:gap-4">
                                    {portfolioItems.length > 0 ? (
                                        portfolioItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handlePostClick(item)}
                                                className="aspect-square relative group cursor-pointer bg-gray-100 dark:bg-[#222]"
                                            >
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Heart className="w-6 h-6 text-white fill-white" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                                            No portfolio items yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeProfileTab === "SHOP" && (
                            <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-gray-200 dark:border-[#333] rounded-3xl bg-gray-50/50 dark:bg-[#222]/30">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
                                        <ShoppingBag className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Shop Demo</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
                                            This is where your digital products would appear.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* BUYER FEED */
                <div className="pt-16 md:pt-24 px-0 md:px-4 pb-32 w-full md:max-w-6xl md:mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {searchedUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between">
                            <Link href={`/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-[#333] bg-gray-100 dark:bg-[#333] flex items-center justify-center">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                                        {user.full_name}
                                        {user.verification_status === 'verified' && (
                                            <div className="bg-blue-500 text-white p-0.5 rounded-full">
                                                <Check className="w-2 h-2 stroke-[4]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                </div>
                            </Link>
                            <Link href={`/${user.username}`} className="text-xs font-bold bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#444] transition-colors">
                                View
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Feed Items */}
            <div className="space-y-6">
                {filteredFeed.length > 0 ? (
                    filteredFeed.map((item) => (
                        <div key={item.id} className="w-full bg-white dark:bg-[#222] border-y md:border border-gray-200 dark:border-[#333] md:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link href={`/${item.user.username}`} className="block">
                                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-[#333] bg-gray-100 dark:bg-[#333] flex items-center justify-center">
                                            {item.user.avatar ? (
                                                <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </Link>
                                    <div>
                                        <Link href={`/${item.user.username}`} className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-sm hover:underline">
                                            {item.user.name}
                                            {/* Verified Badge Logic - Assuming item.user has verification_status or we check a list */}
                                            {(item.user.username === "leonp" || item.user.username === "paylink") && (
                                                <div className="bg-blue-500 text-white p-0.5 rounded-full">
                                                    <Check className="w-2 h-2 stroke-[4]" />
                                                </div>
                                            )}
                                        </Link>
                                        <Link href={`/${item.user.username}`} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                            {item.user.handle}
                                        </Link>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div
                                className="aspect-square w-full bg-gray-100 dark:bg-[#1a1a1a] relative group"
                            >
                                <img src={item.image} alt="Post" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handlePostClick(item)}
                                    className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleLike(item)}
                                            className={clsx(
                                                "hover:scale-110 transition-transform flex items-center justify-center",
                                                item.user_has_liked ? "text-red-500" : "text-gray-900 dark:text-white"
                                            )}
                                        >
                                            <Heart className={clsx("w-7 h-7", item.user_has_liked && "fill-current")} />
                                        </button>
                                        <button
                                            onClick={() => setCommentingPostId(commentingPostId === item.id ? null : item.id)}
                                            className="text-gray-900 dark:text-white hover:scale-110 transition-transform flex items-center justify-center"
                                        >
                                            <MessageCircle className="w-7 h-7" />
                                        </button>
                                        <button className="text-gray-900 dark:text-white hover:scale-110 transition-transform flex items-center justify-center">
                                            <Send className="w-7 h-7 -rotate-45 mt-2" />
                                        </button>
                                    </div>
                                    <div className="font-bold text-sm mb-1 text-gray-900 dark:text-white">
                                        {item.likes} likes
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        <span className="font-bold mr-2">{item.user.name}</span>
                                        {item.caption}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {item.tags.map((tag: string, idx: number) => (
                                            <span key={idx} className="text-xs text-blue-500 hover:underline cursor-pointer">#{tag}</span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePostClick(item)}
                                        className="text-gray-500 text-sm mt-1 hover:text-gray-900 dark:hover:text-gray-300"
                                    >
                                        View all {item.comments} comments
                                    </button>

                                    {/* Inline Comment Input */}
                                    {commentingPostId === item.id && (
                                        <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <input
                                                id={`inline-comment-${item.id}`}
                                                type="text"
                                                value={inlineComment}
                                                onChange={(e) => setInlineComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleInlineCommentSubmit(item.id)}
                                                placeholder="Add a comment..."
                                                className="flex-1 bg-gray-100 dark:bg-[#333] border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleInlineCommentSubmit(item.id)}
                                                disabled={!inlineComment.trim()}
                                                className="text-blue-500 font-bold text-sm disabled:opacity-50 hover:text-blue-600 transition-colors px-2"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    )}

                                    {!commentingPostId && (
                                        <button
                                            onClick={() => setCommentingPostId(item.id)}
                                            className="text-gray-400 text-xs mt-2 block hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            Add a comment...
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-[#222] rounded-3xl border border-gray-200 dark:border-[#333]">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-[#333] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No posts found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
            {/* Right Sidebar (Desktop) */}
            <div className="hidden lg:block space-y-6">
                {/* Search */}
                <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-3xl p-6 sticky top-24">
                    <div className="relative mb-6">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full text-xs font-bold transition-colors",
                                    activeTag === tag
                                        ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                                        : "bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#333]"
                                )}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div >

                {/* Suggested Creators */}
                <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Suggested</h2>
                        <button className="text-xs font-bold text-blue-500 hover:text-blue-400">See All</button>
                    </div>
                    <div className="space-y-4">
                        {suggestedUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between">
                                <Link href={`/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-[#333] bg-gray-100 dark:bg-[#333] flex items-center justify-center">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.handle}</div>
                                    </div>
                                </Link>
                                <button className="text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
