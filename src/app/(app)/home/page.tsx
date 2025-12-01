"use client";

import { useState, useEffect, useRef } from "react";
import {
    Grid as GridIcon,
    ShoppingBag,
    MoreHorizontal,
    Check,
    TrendingUp,
    RefreshCw,
    Star,
    Home,
    MessageCircle,
    Search,
    UserPlus,
    Heart,
    Camera,
    DollarSign,
    Twitter,
    Instagram,
    Twitch,
    Edit3,
    User,
    Maximize2,
    Send,
    X,
    Briefcase,
    Flag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useUserMode, useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";

const PROFILE_TABS = ["HOME", "SERVICES", "PORTFOLIO", "SHOP"];
const TAGS = ["All", "Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation"];

import { EditProfileModal } from "@/components/features/dashboard/EditProfileModal";
import { EditServiceModal } from "@/components/features/dashboard/EditServiceModal";
import { PostModal } from "@/components/features/PostModal";
import { ReportModal } from "@/components/features/ReportModal";

export default function HomePage() {
    const { userMode } = useUserMode();
    const { user, profile, uploadAvatar, uploadBanner, loading } = useUser();
    const { toast } = useToast();
    const [activeProfileTab, setActiveProfileTab] = useState("HOME");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTag, setActiveTag] = useState("All");
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0, is_following: false });

    // Feed State
    const [feedTab, setFeedTab] = useState<'foryou' | 'following'>('foryou');

    // Scroll Direction State for Mobile Header
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                // Hide on scroll down (if > 100px), show on scroll up
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setIsHeaderVisible(false);
                } else {
                    setIsHeaderVisible(true);
                }
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, []);

    // Post Modal State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // Edit Service State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
    const [activeServiceDropdown, setActiveServiceDropdown] = useState<string | null>(null);

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState<{ id: string, type: 'user' | 'service' | 'product' | 'post' | 'order' } | null>(null);
    const [activeFeedMenuId, setActiveFeedMenuId] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReport = (item: any) => {
        setReportTarget({ id: item.id, type: item.type });
        setIsReportModalOpen(true);
        setActiveFeedMenuId(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePostClick = (post: any) => {
        setSelectedPost(post);
        setIsPostModalOpen(true);
    };

    const fetchStats = async () => {
        if (!profile) return;
        const { data } = await supabase
            .rpc('get_profile_stats', { target_user_id: profile.id });

        if (data) {
            setStats(data);
        }
    };

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchStats();
        }
    }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

    // Upload States
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => avatarInputRef.current?.click();

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadBanner(file);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim().length === 0) {
                setSearchedUsers([]);
                return;
            }

            const { data } = await supabase
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
            await uploadAvatar(file);
        }
    };

    // Fetch Feed Items (All Portfolio Items for now, simulating a public feed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [feedItems, setFeedItems] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loadingFeed, setLoadingFeed] = useState(false);




    const fetchFeed = async () => {
        setLoadingFeed(true);

        // 1. Fetch Portfolio Items (Posts)
        const { data: posts } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                profiles (id, username, full_name, avatar_url, verification_status),
                comments (count),
                likes (count)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        // 2. Fetch Services
        const { data: servicesData } = await supabase
            .from('services')
            .select(`
                *,
                profiles (id, username, full_name, avatar_url, verification_status)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        // 3. Fetch Products
        const { data: productsData } = await supabase
            .from('products')
            .select(`
                *,
                profiles (id, username, full_name, avatar_url, verification_status),
                product_images (image_url)
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        const combinedFeed = [];

        // Process Posts
        if (posts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            combinedFeed.push(...posts.map((item: any) => ({
                type: 'post',
                id: item.id,
                user: {
                    name: item.profiles?.full_name || "Unknown User",
                    handle: `@${item.profiles?.username || "unknown"}`,
                    avatar: item.profiles?.avatar_url,
                    username: item.profiles?.username,
                    verification_status: item.profiles?.verification_status
                },
                image: item.image_url,
                title: item.title,
                caption: item.description || item.title,
                likes: item.likes?.[0]?.count || 0,
                comments: item.comments?.[0]?.count || 0,
                tags: item.section ? [item.section] : ["Creative"],
                created_at: item.created_at
            })));
        }

        // Process Services
        if (servicesData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            combinedFeed.push(...servicesData.map((item: any) => ({
                type: 'service',
                id: item.id,
                user: {
                    name: item.profiles?.full_name || "Unknown User",
                    handle: `@${item.profiles?.username || "unknown"}`,
                    avatar: item.profiles?.avatar_url,
                    username: item.profiles?.username,
                    verification_status: item.profiles?.verification_status
                },
                image: item.thumbnail_url,
                title: item.title,
                caption: item.description,
                price: item.price,
                tags: ["Service"],
                created_at: item.created_at
            })));
        }

        // Process Products
        if (productsData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            combinedFeed.push(...productsData.map((item: any) => ({
                type: 'product',
                id: item.id,
                user: {
                    name: item.profiles?.full_name || "Unknown User",
                    handle: `@${item.profiles?.username || "unknown"}`,
                    avatar: item.profiles?.avatar_url,
                    username: item.profiles?.username,
                    verification_status: item.profiles?.verification_status
                },
                image: item.product_images?.[0]?.image_url,
                title: item.title,
                caption: item.description,
                price: item.price,
                tags: ["Product"],
                created_at: item.created_at
            })));
        }

        // Sort by Date
        combinedFeed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setFeedItems(combinedFeed);
        setLoadingFeed(false);
    };



    useEffect(() => {
        // Fetch feed if in BUYER mode OR if user is not logged in (public view)
        if (userMode === "BUYER" || !user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchFeed();
        }
    }, [userMode, user]);

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
                if (error.code === '23505') {
                    // Already liked, do nothing (optimistic update was correct)
                } else {
                    toast("Error liking post", "error");
                    // Revert
                    setFeedItems(prev => prev.map(item =>
                        item.id === post.id
                            ? { ...item, likes: post.likes, user_has_liked: false }
                            : item
                    ));
                }
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [services, setServices] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);

    const deleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            toast("Error deleting product", "error");
        } else {
            toast("Product deleted", "success");
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    const deleteService = async (serviceId: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);

        if (error) {
            toast("Error deleting service", "error");
        } else {
            toast("Service deleted", "success");
            setServices(prev => prev.filter(s => s.id !== serviceId));
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditService = (service: any) => {
        setSelectedService(service);
        setIsEditServiceOpen(true);
        setActiveServiceDropdown(null);
    };

    // Inline Comment State
    const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
    const [inlineComment, setInlineComment] = useState("");



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
                previews: s.thumbnail_url ? [s.thumbnail_url] : []
            }));
            setServices(formattedServices);
        }


        // Fetch Products (Shop)
        const { data: productsData } = await supabase
            .from('products')
            .select(`
                *,
                product_images (
                    image_url
                )
            `)
            .eq('seller_id', profile!.id)
            .order('created_at', { ascending: false });

        if (productsData) {
            setProducts(productsData);
        }
    };

    useEffect(() => {
        if (userMode === "SELLER" && profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchSellerData();
        }
    }, [userMode, profile]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredFeed = feedItems.filter(item => {
        const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
        const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className={clsx(
            "min-h-screen text-gray-900 dark:text-white pb-32 selection:bg-red-500/30 transition-colors duration-300 font-sans",
            userMode === "SELLER" ? "bg-gray-50 dark:bg-[#1a1a1a]" : "bg-white dark:bg-[#222]"
        )}>

            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
            <EditServiceModal
                isOpen={isEditServiceOpen}
                onClose={() => setIsEditServiceOpen(false)}
                service={selectedService}
                onUpdate={(updatedService) => {
                    setServices(prev => prev.map(s => s.id === updatedService.id ? { ...s, ...updatedService, previews: updatedService.thumbnail_url ? [updatedService.thumbnail_url] : [] } : s));
                }}
            />
            {reportTarget && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    targetId={reportTarget.id}
                    targetType={reportTarget.type}
                />
            )}
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
                                <Image src={profile.banner_url} alt="Banner" fill className="object-cover" sizes="100vw" priority />
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
                                                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" sizes="(max-width: 768px) 128px, 192px" />
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

                    {/* Tabs */}
                    <div className="w-full mt-6 py-4">
                        <div className="flex gap-2 overflow-x-auto w-full px-4 md:px-0 no-scrollbar justify-start md:justify-center">
                            {PROFILE_TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveProfileTab(tab)}
                                    className={clsx(
                                        "px-6 py-3 rounded-full text-xs font-black tracking-wider transition-all flex items-center gap-2 uppercase min-w-max",
                                        activeProfileTab === tab
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                <div className="bg-card rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm border border-border/50">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black italic tracking-tight text-foreground">REVENUE</h3>
                                            <p className="text-muted-foreground font-medium">Your earnings over time.</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold bg-primary/10 px-4 py-2 rounded-full text-primary">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            2025
                                        </div>
                                    </div>

                                    <div className="h-64 w-full relative flex items-center justify-center bg-muted/30 rounded-[2rem] border-2 border-dashed border-border/50">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <DollarSign className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <p className="text-foreground font-bold text-lg">No Data Available</p>
                                            <p className="text-sm text-muted-foreground mt-1 font-medium">Revenue data will appear here once you start selling.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-card rounded-[2.5rem] p-8 shadow-sm border border-border/50">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-xl font-black italic text-foreground">WEEKLY STATS</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-muted/30 rounded-[2rem] p-6 flex flex-col items-center justify-center aspect-square hover:bg-muted/50 transition-colors group">
                                                <TrendingUp className="w-8 h-8 text-foreground mb-3 group-hover:scale-110 transition-transform" />
                                                <span className="text-3xl font-black text-foreground">0</span>
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Orders</span>
                                            </div>
                                            <div className="bg-primary/5 rounded-[2rem] p-6 flex flex-col items-center justify-center aspect-square hover:bg-primary/10 transition-colors group">
                                                <UserPlus className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                                <span className="text-3xl font-black text-foreground">0</span>
                                                <span className="text-xs font-bold text-primary uppercase tracking-wider mt-1">Visits</span>
                                            </div>
                                            <div className="bg-muted/30 rounded-[2rem] p-6 flex flex-col items-center justify-center aspect-square hover:bg-muted/50 transition-colors group">
                                                <Star className="w-8 h-8 text-yellow-500 mb-3 fill-current group-hover:scale-110 transition-transform" />
                                                <span className="text-3xl font-black text-foreground">0.0</span>
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Rating</span>
                                            </div>
                                            <div className="bg-muted/30 rounded-[2rem] p-6 flex flex-col items-center justify-center aspect-square hover:bg-muted/50 transition-colors group">
                                                <RefreshCw className="w-8 h-8 text-foreground mb-3 group-hover:scale-110 transition-transform" />
                                                <span className="text-3xl font-black text-foreground">0</span>
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Refunds</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <DollarSign className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="text-xl font-black italic mb-8">EARNINGS</h4>
                                            <div className="space-y-6">
                                                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/20">
                                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80 block mb-1">This Week</span>
                                                    <span className="text-4xl font-black tracking-tight">$0.00</span>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/20">
                                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80 block mb-1">Total</span>
                                                    <span className="text-4xl font-black tracking-tight">$0.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeProfileTab === "SERVICES" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-2xl font-black text-foreground tracking-tight">Active Services</h3>
                                        <button className="text-sm font-bold text-primary hover:underline">Manage</button>
                                    </div>
                                    <div className="space-y-4">
                                        {services.length > 0 ? (
                                            services.map((service) => (
                                                <div key={service.id} className="bg-card rounded-[2rem] p-6 shadow-sm border border-border/50 hover:shadow-md transition-all">
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                                <service.icon className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-lg text-foreground">{service.title}</h4>
                                                                <p className="text-sm text-primary font-bold">Starting at ${service.price}</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setActiveServiceDropdown(activeServiceDropdown === service.id ? null : service.id)}
                                                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreHorizontal className="w-5 h-5" />
                                                            </button>
                                                            {activeServiceDropdown === service.id && (
                                                                <div className="absolute right-0 top-full mt-2 w-32 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                                    <button
                                                                        onClick={() => handleEditService(service)}
                                                                        className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-muted transition-colors flex items-center gap-2"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteService(service.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                        {service.previews.map((preview: string, idx: number) => (
                                                            <div key={idx} className="w-40 h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-border/50 bg-muted/30 relative">
                                                                <Image src={preview} alt="Preview" fill className="object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/50">
                                                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground">No services yet</h3>
                                                <p className="text-muted-foreground font-medium mt-1">Create your first service to start selling.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeProfileTab === "PORTFOLIO" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {portfolioItems.length > 0 ? (
                                        portfolioItems.map((item) => (
                                            <div key={item.id} onClick={() => handlePostClick(item)} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-muted border border-border shadow-sm hover:shadow-md transition-all">
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                    <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                                                    {item.description && <p className="text-white/70 text-xs truncate">{item.description}</p>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-muted/10">
                                            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
                                                <GridIcon className="w-10 h-10 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-foreground">No Portfolio Items</h3>
                                                <p className="text-muted-foreground font-medium max-w-sm mx-auto mt-2">
                                                    Showcase your best work to attract more clients.
                                                </p>
                                            </div>
                                            <Link
                                                href="/create/post"
                                                className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                                            >
                                                Add Project
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeProfileTab === "SHOP" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <div key={product.id} className="group bg-card rounded-[2rem] border border-border/50 overflow-hidden hover:shadow-xl transition-all flex flex-col">
                                                <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                                                    {product.product_images?.[0]?.image_url ? (
                                                        <Image
                                                            src={product.product_images[0].image_url}
                                                            alt={product.title}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                                            <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <div className="bg-background/80 backdrop-blur-md text-foreground text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                                                            ${product.price}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteProduct(product.id);
                                                        }}
                                                        className="absolute top-3 left-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                                        title="Delete Product"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h4 className="font-bold text-foreground truncate text-lg mb-1">{product.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-medium">{product.description}</p>
                                                    <button className="w-full mt-auto bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-muted/10">
                                            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
                                                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-foreground">Shop is Empty</h3>
                                                <p className="text-muted-foreground font-medium max-w-sm mx-auto mt-2">
                                                    You haven&apos;t listed any products yet.
                                                </p>
                                            </div>
                                            <Link
                                                href="/create/product"
                                                className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                                            >
                                                Create Product
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-6xl mx-auto pb-24 md:pt-8 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className={clsx(
                                "fixed top-0 left-0 right-0 z-20 bg-white/95 dark:bg-[#222]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#333] transition-transform duration-300 md:hidden",
                                isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                            )}>
                                <div className="px-4 py-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search creators..."
                                            className="w-full bg-gray-100 dark:bg-[#2a2a2a] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-[#333] placeholder:text-gray-500"
                                        />
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {searchQuery && searchedUsers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl overflow-hidden shadow-xl max-h-[60vh] overflow-y-auto">
                                            {searchedUsers.map(user => (
                                                <Link
                                                    key={user.id}
                                                    href={`/${user.username}`}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-[#333] bg-gray-100 dark:bg-[#333] flex items-center justify-center relative">
                                                        {user.avatar_url ? (
                                                            <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                                                            {user.full_name}
                                                            {user.verification_status === 'verified' && (
                                                                <div className="bg-primary text-white p-0.5 rounded-full">
                                                                    <Check className="w-2 h-2 stroke-[4]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Feed Tabs */}
                                <div className="flex border-t border-gray-200 dark:border-[#333]">
                                    <button
                                        onClick={() => setFeedTab('foryou')}
                                        className={clsx(
                                            "flex-1 py-3 text-sm font-bold text-center relative",
                                            feedTab === 'foryou' ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                        )}
                                    >
                                        For You
                                        {feedTab === 'foryou' && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-900 dark:bg-white rounded-t-full" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setFeedTab('following')}
                                        className={clsx(
                                            "flex-1 py-3 text-sm font-bold text-center relative",
                                            feedTab === 'following' ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                        )}
                                    >
                                        Following
                                        {feedTab === 'following' && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-900 dark:bg-white rounded-t-full" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Tabs (Sticky) */}
                            <div className="hidden md:flex sticky top-24 z-10 bg-white/95 dark:bg-[#222]/95 backdrop-blur-md border border-gray-200 dark:border-[#333] rounded-2xl mb-6 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setFeedTab('foryou')}
                                    className={clsx(
                                        "flex-1 py-3 text-sm font-bold text-center relative hover:bg-gray-50 dark:hover:bg-[#333] transition-colors",
                                        feedTab === 'foryou' ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                    )}
                                >
                                    For You
                                    {feedTab === 'foryou' && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-900 dark:bg-white rounded-t-full" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setFeedTab('following')}
                                    className={clsx(
                                        "flex-1 py-3 text-sm font-bold text-center relative hover:bg-gray-50 dark:hover:bg-[#333] transition-colors",
                                        feedTab === 'following' ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                    )}
                                >
                                    Following
                                    {feedTab === 'following' && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-900 dark:bg-white rounded-t-full" />
                                    )}
                                </button>
                            </div>

                            <div className="pt-[100px] md:pt-0 px-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Tag Filter (Hidden on Desktop, moved to sidebar) */}
                                {feedTab === 'foryou' && (
                                    <div className="md:hidden flex items-center gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar px-4">
                                        {TAGS.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => setActiveTag(tag)}
                                                className={clsx(
                                                    "px-4 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap border",
                                                    activeTag === tag
                                                        ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent"
                                                        : "bg-transparent border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Feed Items */}
                                {filteredFeed.length > 0 ? (
                                    filteredFeed.map((item) => (
                                        <div key={item.id} className="w-full bg-white dark:bg-[#222] border-y md:border border-gray-200 dark:border-[#333] md:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/${item.user.username}`} className="block">
                                                        <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-[#333] bg-gray-100 dark:bg-[#333] flex items-center justify-center relative">
                                                            {item.user.avatar ? (
                                                                <Image src={item.user.avatar} alt={item.user.name} fill className="object-cover" />
                                                            ) : (
                                                                <User className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </Link>
                                                    <div className="leading-tight">
                                                        <Link href={`/${item.user.username}`} className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-sm hover:underline">
                                                            {item.user.name}
                                                            {(item.user.username === "leonp" || item.user.username === "paylink") && (
                                                                <div className="bg-primary text-white p-0.5 rounded-full">
                                                                    <Check className="w-2 h-2 stroke-[4]" />
                                                                </div>
                                                            )}
                                                        </Link>
                                                        <Link href={`/${item.user.username}`} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                                            {item.user.handle}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveFeedMenuId(activeFeedMenuId === item.id ? null : item.id)}
                                                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                                                    >
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                    {activeFeedMenuId === item.id && (
                                                        <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <button
                                                                onClick={() => handleReport(item)}
                                                                className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                                                            >
                                                                <Flag className="w-4 h-4" />
                                                                Report
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className="aspect-square w-full bg-gray-100 dark:bg-[#1a1a1a] relative group"
                                            >
                                                {item.image ? (
                                                    <Image src={item.image} alt="Post" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                                        {item.type === 'service' ? <Briefcase className="w-12 h-12 text-muted-foreground/50" /> : <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />}
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                <div className="absolute top-3 right-3">
                                                    {item.type === 'service' && (
                                                        <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                            <Briefcase className="w-3 h-3" />
                                                            Service
                                                        </div>
                                                    )}
                                                    {item.type === 'product' && (
                                                        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                            <ShoppingBag className="w-3 h-3" />
                                                            Shop
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price Tag for Services/Products */}
                                                {(item.type === 'service' || item.type === 'product') && (
                                                    <div className="absolute bottom-3 left-3">
                                                        <div className="bg-black/60 backdrop-blur-md text-white text-sm font-black px-4 py-2 rounded-xl shadow-lg border border-white/10">
                                                            ${item.price}
                                                        </div>
                                                    </div>
                                                )}

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
                                                    <div className="font-bold text-sm mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                                                        {item.type === 'post' ? (
                                                            <span>{item.likes} likes</span>
                                                        ) : (
                                                            <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors">
                                                                {item.type === 'service' ? 'Book Now' : 'Buy Now'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        <span className="font-bold mr-2">{item.user.name}</span>
                                                        {item.caption}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {item.tags.map((tag: string, idx: number) => (
                                                            <span key={idx} className="text-xs text-primary hover:underline cursor-pointer">#{tag}</span>
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
                                                                className="flex-1 bg-gray-100 dark:bg-[#333] border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleInlineCommentSubmit(item.id)}
                                                                disabled={!inlineComment.trim()}
                                                                className="text-primary font-bold text-sm disabled:opacity-50 hover:text-primary/80 transition-colors px-2"
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
                        </div >

                        {/* Right Sidebar - Desktop Only */}
                        < div className="hidden lg:block space-y-6 sticky top-24 h-fit" >
                            {/* Search Widget */}
                            < div className="bg-white dark:bg-[#222] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-sm" >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search creators..."
                                        className="w-full bg-gray-100 dark:bg-[#2a2a2a] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-[#333] placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Search Results Dropdown */}
                                {
                                    searchQuery && searchedUsers.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {searchedUsers.map(user => (
                                                <Link
                                                    key={user.id}
                                                    href={`/${user.username}`}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#333] rounded-xl transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-[#333] bg-gray-100 dark:bg-[#333] flex items-center justify-center relative">
                                                        {user.avatar_url ? (
                                                            <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1 truncate">
                                                            {user.full_name}
                                                            {user.verification_status === 'verified' && (
                                                                <div className="bg-primary text-white p-0.5 rounded-full shrink-0">
                                                                    <Check className="w-2 h-2 stroke-[4]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">@{user.username}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )
                                }
                            </div >

                            {/* Tags Widget */}
                            < div className="bg-white dark:bg-[#222] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm" >
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setActiveTag(tag)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-full font-bold text-xs transition-all border",
                                                activeTag === tag
                                                    ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent"
                                                    : "bg-transparent border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div >

                            {/* Footer Links */}
                            < div className="flex flex-wrap gap-x-4 gap-y-2 px-2" >
                                <Link href="#" className="text-xs text-gray-400 hover:underline">Terms of Service</Link>
                                <Link href="#" className="text-xs text-gray-400 hover:underline">Privacy Policy</Link>
                                <Link href="#" className="text-xs text-gray-400 hover:underline">Cookie Policy</Link>
                                <Link href="#" className="text-xs text-gray-400 hover:underline">Accessibility</Link>
                                <Link href="#" className="text-xs text-gray-400 hover:underline">Ads Info</Link>
                                <div className="text-xs text-gray-400 mt-2 w-full">© 2024 PayLink, Inc.</div>
                            </div >
                        </div >
                    </div >
                </div >
            )
            }
        </div >
    );
}
