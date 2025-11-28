"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { ServicesWidget } from "@/components/features/dashboard/ServicesWidget";
import { EditProfileModal } from "@/components/features/dashboard/EditProfileModal";
import { CreateInvoiceModal } from "@/components/features/dashboard/CreateInvoiceModal";
import { SettingsModal } from "@/components/features/dashboard/SettingsModal";
import { TipWidget } from "@/components/features/dashboard/TipWidget";
import { CartModal } from "@/components/features/dashboard/CartModal";
import { SubscriptionModal } from "@/components/features/dashboard/SubscriptionModal";
import { AddPortfolioItemModal } from "@/components/features/dashboard/AddPortfolioItemModal";
import { CreateProductModal } from "@/components/features/dashboard/CreateProductModal";
import { Mail, Twitter, Instagram, Twitch, Camera, Edit3, MapPin, Link as LinkIcon, Plus, Share2, FileText, TrendingUp, Sun, Moon, Monitor, Check, MessageCircle, User, Palette, Settings, MoreHorizontal, ShoppingBag, Grid as GridIcon, Crown, Package, Heart } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";

const SELLER_TABS = ["SERVICES", "PORTFOLIO", "SHOP"];
const BUYER_TABS = ["ORDERS", "SAVED", "FOLLOWING"];

import { useSearchParams } from "next/navigation";

function DashboardContent() {
    const { userMode, toggleUserMode, profile, uploadAvatar, uploadBanner, loading } = useUser();
    const { user } = useUser(); // Need user object for ID
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    const [activeTab, setActiveTab] = useState(
        tabParam && (userMode === "SELLER" ? SELLER_TABS : BUYER_TABS).includes(tabParam)
            ? tabParam
            : (userMode === "SELLER" ? "SERVICES" : "ORDERS")
    );
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Modal States
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Upload States
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    const [loadingPortfolio, setLoadingPortfolio] = useState(false);

    const [followingList, setFollowingList] = useState<any[]>([]);
    const [loadingFollowing, setLoadingFollowing] = useState(false);

    useEffect(() => {
        setMounted(true);
        setActiveTab(userMode === "SELLER" ? "SERVICES" : "ORDERS");
        if (userMode === "SELLER") {
            fetchPortfolio();
        }
    }, [userMode]);

    useEffect(() => {
        if (activeTab === "FOLLOWING" && userMode === "BUYER") {
            fetchFollowing();
        }
    }, [activeTab, userMode]);

    const fetchPortfolio = async () => {
        if (!user) return;
        setLoadingPortfolio(true);
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setPortfolioItems(data);
        setLoadingPortfolio(false);
    };

    const fetchFollowing = async () => {
        if (!user) return;
        setLoadingFollowing(true);

        // 1. Get IDs of people I follow
        const { data: follows, error: followsError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

        if (follows && follows.length > 0) {
            const followingIds = follows.map(f => f.following_id);

            // 2. Get their profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', followingIds);

            if (profiles) setFollowingList(profiles);
        } else {
            setFollowingList([]);
        }
        setLoadingFollowing(false);
    };

    // Group portfolio items by section
    const portfolioSections = portfolioItems.reduce((acc: any, item: any) => {
        const section = item.section || 'General';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    const handleShareProfile = () => {
        navigator.clipboard.writeText(`https://paylink.com/${profile?.username || "user"}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleBannerClick = () => {
        bannerInputRef.current?.click();
    };

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingBanner(true);
            await uploadBanner(file);
            setIsUploadingBanner(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingAvatar(true);
            await uploadAvatar(file);
            setIsUploadingAvatar(false);
        }
    };

    const accentColor = profile?.accent_color || "#3b82f6";
    const tabs = userMode === "SELLER" ? SELLER_TABS : BUYER_TABS;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32 selection:bg-primary/30 transition-colors duration-300">
            {/* Modals */}
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
            <CreateInvoiceModal isOpen={isCreateInvoiceOpen} onClose={() => setIsCreateInvoiceOpen(false)} />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onOpenSubscription={() => {
                    setIsSettingsOpen(false);
                    setIsSubscriptionOpen(true);
                }}
            />
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
            <AddPortfolioItemModal isOpen={isAddProjectOpen} onClose={() => setIsAddProjectOpen(false)} onSuccess={fetchPortfolio} />
            <CreateProductModal isOpen={isCreateProductOpen} onClose={() => setIsCreateProductOpen(false)} />

            <input
                type="file"
                ref={bannerInputRef}
                onChange={handleBannerChange}
                className="hidden"
                accept="image/*"
            />
            <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
            />

            {/* Profile Header */}
            <div className="relative group pb-4">
                {/* Immersive Banner */}
                <div className="h-64 md:h-96 w-full relative overflow-hidden group/banner">
                    {profile?.banner_url ? (
                        <div className="absolute inset-0 animate-in fade-in duration-700">
                            <img src={profile.banner_url} alt="Profile Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/50 to-background" />
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl uppercase tracking-widest">
                                No Banner
                            </div>
                        </>
                    )}

                    {isUploadingBanner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}

                    {/* Banner Actions */}
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 z-20">
                        {/* Edit Profile Pencil */}
                        <button
                            onClick={() => setIsEditProfileOpen(true)}
                            className="p-2.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:text-white hover:bg-black/40 transition-all shadow-lg active:scale-95"
                            title="Edit Profile"
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>

                        {/* Upload Banner Camera */}
                        <button
                            onClick={handleBannerClick}
                            className="p-2.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:text-white hover:bg-black/40 transition-all shadow-lg active:scale-95"
                            title="Change Banner"
                        >
                            <Camera className="w-5 h-5" />
                        </button>

                        {/* Settings Button */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:text-white hover:bg-black/40 transition-all shadow-lg active:scale-95"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-32 md:-mt-40">
                    <div className="flex flex-col md:flex-row items-end gap-6 md:gap-10">
                        {/* Avatar */}
                        <div className="relative group/avatar shrink-0 mx-auto md:mx-0">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] p-1.5 bg-background shadow-2xl shadow-black/20 rotate-3 hover:rotate-0 transition-all duration-500 ease-out">
                                <div className="w-full h-full rounded-[2rem] bg-muted overflow-hidden relative border border-border">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <User className="w-20 h-20 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Avatar Upload Overlay */}
                                    <div
                                        onClick={handleAvatarClick}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                                    >
                                        {isUploadingAvatar ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                        ) : (
                                            <Camera className="w-10 h-10 text-white" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Verified Badge - Only if Verified */}
                            {profile?.verification_status === 'verified' && (
                                <div className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2 bg-background p-1.5 rounded-full shadow-lg">
                                    <div className="text-white p-1.5 rounded-full" style={{ backgroundColor: accentColor }}>
                                        <Check className="w-4 h-4 stroke-[4]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 flex flex-col md:flex-row items-end justify-between gap-6 w-full text-center md:text-left pb-4">
                            <div className="space-y-4 flex-1 w-full">
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none mb-2">
                                        {profile?.full_name || "No Name"}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground font-medium text-lg">
                                        <span className="text-foreground">@{profile?.username || "username"}</span>
                                        {profile?.location && (
                                            <>
                                                <span className="hidden md:inline">•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {profile.location}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
                                    {profile?.bio || "No bio information provided yet."}
                                </p>

                                {/* Social Pills */}
                                <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        {profile?.social_links?.twitter && (
                                            <a href={`https://twitter.com/${profile.social_links.twitter}`} target="_blank" className="px-4 py-2 bg-card border border-border rounded-xl hover:border-blue-400/50 hover:bg-blue-400/5 hover:text-[#1DA1F2] transition-all flex items-center gap-2 font-bold text-sm">
                                                <Twitter className="w-4 h-4" />
                                                Twitter
                                            </a>
                                        )}
                                        {profile?.social_links?.instagram && (
                                            <a href={`https://instagram.com/${profile.social_links.instagram}`} target="_blank" className="px-4 py-2 bg-card border border-border rounded-xl hover:border-pink-500/50 hover:bg-pink-500/5 hover:text-[#E1306C] transition-all flex items-center gap-2 font-bold text-sm">
                                                <Instagram className="w-4 h-4" />
                                                Instagram
                                            </a>
                                        )}
                                        {profile?.social_links?.twitch && (
                                            <a href={`https://twitch.tv/${profile.social_links.twitch}`} target="_blank" className="px-4 py-2 bg-card border border-border rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-[#9146FF] transition-all flex items-center gap-2 font-bold text-sm">
                                                <Twitch className="w-4 h-4" />
                                                Twitch
                                            </a>
                                        )}
                                        {!profile?.social_links?.twitter && !profile?.social_links?.instagram && !profile?.social_links?.twitch && (
                                            <span className="text-sm text-muted-foreground italic">No social links added.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-12 border-b border-border">
                        <div className="flex gap-8 overflow-x-auto max-w-full pb-px no-scrollbar justify-center md:justify-start">
                            {tabs.map((tab) => (
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
                                    {tab === "SERVICES" && <MoreHorizontal className="w-4 h-4" />}
                                    {tab === "PORTFOLIO" && <GridIcon className="w-4 h-4" />}
                                    {tab === "SHOP" && <ShoppingBag className="w-4 h-4" />}
                                    {tab === "ORDERS" && <Package className="w-4 h-4" />}
                                    {tab === "SAVED" && <Heart className="w-4 h-4" />}
                                    {tab === "FOLLOWING" && <User className="w-4 h-4" />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto mt-2 pb-20">
                {userMode === "SELLER" ? (
                    <>
                        {activeTab === "SERVICES" && (
                            <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <ServicesWidget />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "PORTFOLIO" && (
                            <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                {loadingPortfolio ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : portfolioItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <GridIcon className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">No Portfolio Items</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                                Showcase your best work to attract more clients.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsAddProjectOpen(true)}
                                            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                                        >
                                            Add Project
                                        </button>
                                    </div>
                                ) : (
                                    Object.entries(portfolioSections).map(([sectionName, items]: [string, any]) => (
                                        <div key={sectionName} className="space-y-4">
                                            <h3 className="text-xl font-bold text-foreground px-1 flex items-center gap-2">
                                                <span className="w-1 h-6 bg-primary rounded-full" />
                                                {sectionName}
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                                {items.map((item: any) => (
                                                    <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-muted border border-border shadow-sm hover:shadow-md transition-all">
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                            <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                                                            {item.description && <p className="text-white/70 text-xs truncate">{item.description}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Add Item Button for this section (optional, or global add) */}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Global Add Project Button if items exist */}
                                {portfolioItems.length > 0 && (
                                    <div className="flex justify-center pt-8">
                                        <button
                                            onClick={() => setIsAddProjectOpen(true)}
                                            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add New Project
                                        </button>
                                    </div>
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
                                            Start selling digital products and assets.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsCreateProductOpen(true)}
                                        className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                                    >
                                        Create Product
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {activeTab === "ORDERS" && (
                            <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">No Orders Yet</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                            When you purchase services or products, they will appear here.
                                        </p>
                                    </div>
                                    <Link href="/home" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                                        Browse Services
                                    </Link>
                                </div>
                            </div>
                        )}

                        {activeTab === "SAVED" && (
                            <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                        <Heart className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">No Saved Items</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                            Save services and products you like to find them easily later.
                                        </p>
                                    </div>
                                    <Link href="/home" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                                        Explore
                                    </Link>
                                </div>
                            </div>
                        )}

                        {activeTab === "FOLLOWING" && (
                            <div className="p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {loadingFollowing ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : followingList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <User className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">Not Following Anyone</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                                Follow creators to see them here.
                                            </p>
                                        </div>
                                        <Link href="/home" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                                            Find Creators
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {followingList.map((followedUser) => (
                                            <Link key={followedUser.id} href={`/${followedUser.username}`} className="block">
                                                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group">
                                                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                                                        {followedUser.avatar_url ? (
                                                            <img src={followedUser.avatar_url} alt={followedUser.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                                                {followedUser.full_name?.substring(0, 2).toUpperCase() || "??"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {followedUser.full_name}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground truncate">@{followedUser.username}</p>
                                                    </div>
                                                    <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                        View
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
