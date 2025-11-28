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
    User
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useUserMode, useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";

const PROFILE_TABS = ["HOME", "SERVICES", "PORTFOLIO", "SHOP"];
const TAGS = ["All", "Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation"];

import { EditProfileModal } from "@/components/features/dashboard/EditProfileModal";



export default function HomePage() {
    const { userMode } = useUserMode();
    const { user, profile, uploadAvatar, uploadBanner, isConfigured, loading } = useUser();
    const [activeProfileTab, setActiveProfileTab] = useState("HOME");
    const [isFollowing, setIsFollowing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTag, setActiveTag] = useState("All");
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingAvatar(true);
            await uploadAvatar(file);
            setIsUploadingAvatar(false);
        }
    };

    // Mock Data for Demo Parity
    const feedItems: any[] = [];

    const portfolioItems: any[] = [];

    const services: any[] = [];

    const filteredFeed = feedItems.filter(item => {
        const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
        const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
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
            <input type="file" ref={bannerInputRef} onChange={handleBannerChange} className="hidden" accept="image/*" />
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />

            {userMode === "SELLER" ? (
                /* SELLER DASHBOARD */
                <>
                    {/* Profile Header */}
                    <div className="relative group pb-4">
                        {/* Immersive Banner */}
                        <div className="h-48 md:h-80 w-full relative overflow-hidden group/banner rounded-b-3xl">
                            {profile?.banner_url ? (
                                <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-[#2a2a2a] dark:to-[#1a1a1a]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-[#1a1a1a]" />

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

                            {/* Edit Profile Button (Replaces Camera) */}
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover/banner:opacity-100 transition-opacity hover:bg-black/70 z-30"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 md:-mt-32">
                            <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8">
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

                                            {/* Upload Avatar Overlay */}
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
                                <div className="flex-1 flex flex-col md:flex-row items-end justify-between gap-6 w-full text-center md:text-left pb-2">
                                    <div className="space-y-2 flex-1 w-full">
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 justify-between">
                                            <div>
                                                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-1 text-gray-900 dark:text-white">
                                                    {profile?.full_name || "New User"}
                                                </h1>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">
                                                    <span className="text-gray-400 dark:text-gray-300">@{profile?.username || "username"}</span>
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
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setIsFollowing(!isFollowing)}
                                                    className={clsx(
                                                        "px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2",
                                                        isFollowing
                                                            ? "bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#444]"
                                                            : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                                    )}
                                                >
                                                    {isFollowing ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-4 h-4" />
                                                            Follow
                                                        </>
                                                    )}
                                                </button>
                                                <button className="p-2 rounded-full bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#444] transition-colors">
                                                    <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
                                                </button>
                                                <button className="p-2 rounded-full bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#444] transition-colors">
                                                    <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400 fill-current" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                                            {profile?.bio || "No bio yet."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="mt-8 border-b border-gray-200 dark:border-[#333]">
                                <div className="flex gap-4 overflow-x-auto max-w-full pb-px no-scrollbar px-4 md:px-0">
                                    {PROFILE_TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveProfileTab(tab)}
                                            className={clsx(
                                                "py-3 px-4 text-xs font-bold tracking-widest border-b-[3px] transition-all flex items-center gap-2 uppercase min-w-max",
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
                                                        {service.previews.map((preview: any, idx: number) => (
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
                                            <div key={item.id} className="aspect-square relative group cursor-pointer bg-gray-100 dark:bg-[#222]">
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
                </>
            ) : (
                /* BUYER FEED */
                <div className="pt-20 px-4 pb-32 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Feed Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Mobile Header & Search (Hidden on Desktop) */}
                            <div className="lg:hidden flex flex-col gap-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">For You</h1>
                                </div>

                                {/* Search & Tags */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search creators, tags..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                        {TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setActiveTag(tag)}
                                                className={clsx(
                                                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                                                    activeTag === tag
                                                        ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                                                        : "bg-white dark:bg-[#222] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#333]"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feed Items */}
                            <div className="space-y-6">
                                {filteredFeed.length > 0 ? (
                                    filteredFeed.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-[#333]">
                                                        <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{item.user.name}</div>
                                                        <div className="text-xs text-gray-500">{item.user.handle}</div>
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="aspect-square w-full bg-gray-100 dark:bg-[#1a1a1a]">
                                                <img src={item.image} alt="Post" className="w-full h-full object-cover" />
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <button className="text-gray-900 dark:text-white hover:scale-110 transition-transform">
                                                        <Heart className="w-6 h-6" />
                                                    </button>
                                                    <button className="text-gray-900 dark:text-white hover:scale-110 transition-transform">
                                                        <MessageCircle className="w-6 h-6" />
                                                    </button>
                                                    <button className="text-gray-900 dark:text-white hover:scale-110 transition-transform">
                                                        <Share2 className="w-6 h-6" />
                                                    </button>
                                                </div>
                                                <div className="font-bold text-sm mb-1 text-gray-900 dark:text-white">{item.likes.toLocaleString()} likes</div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="font-bold text-gray-900 dark:text-white mr-2">{item.user.handle}</span>
                                                    {item.caption}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="text-[10px] font-bold text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300">View all {item.comments} comments</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border-2 border-dashed border-gray-200 dark:border-[#333] rounded-3xl bg-gray-50/50 dark:bg-[#222]/30">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center animate-pulse">
                                            <Search className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Posts Yet</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                                Your feed is currently empty. Follow creators or explore tags to see amazing work here.
                                            </p>
                                        </div>
                                        <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                            <UserPlus className="w-5 h-5" />
                                            Find Creators
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Sidebar (Right) */}
                        <div className="hidden lg:block space-y-6">
                            {/* Desktop Search & Tags */}
                            <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-3xl p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Explore</h2>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search creators, tags..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500"
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
                                </div>
                            </div>

                            {/* Suggested Creators */}
                            <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-3xl p-6 sticky top-[280px]">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Suggested</h2>
                                    <button className="text-xs font-bold text-blue-500 hover:text-blue-400">See All</button>
                                </div>
                                <div className="space-y-4">
                                    {feedItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-[#333]">
                                                    <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{item.user.name}</div>
                                                    <div className="text-xs text-gray-500">{item.user.handle}</div>
                                                </div>
                                            </div>
                                            <button className="text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                                Follow
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
