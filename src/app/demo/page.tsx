"use client";

import { useState } from "react";
import {
    Grid as GridIcon,
    ShoppingBag,
    Package,
    MoreHorizontal,
    MapPin,
    Check,
    Plus,
    ArrowLeft,
    TrendingUp,
    RefreshCw,
    Star,
    Home,
    FileText,
    QrCode,
    Settings,
    MessageCircle,
    Bell,
    Search,
    UserPlus,
    ChevronRight,
    LogOut,
    Shield,
    HelpCircle,
    CreditCard,
    Heart,
    Share2,
    Repeat,
    Camera,
    PenTool,
    Monitor,
    DollarSign,
    Send,
    X,
    Image as ImageIcon,
    Sun,
    Moon
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useTheme } from "next-themes";

const PROFILE_TABS = ["HOME", "SERVICES", "PORTFOLIO", "SHOP"];
const TAGS = ["All", "Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation"];

export default function DemoPage() {
    const [activeAppTab, setActiveAppTab] = useState("HOME");
    const [activeProfileTab, setActiveProfileTab] = useState("HOME");
    const [isFollowing, setIsFollowing] = useState(false);
    const [userMode, setUserMode] = useState<"SELLER" | "BUYER">("SELLER");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTag, setActiveTag] = useState("All");
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [activeOrdersTab, setActiveOrdersTab] = useState("ACTIVE");
    const { theme, setTheme } = useTheme();

    // Mock Data
    const profile = {
        full_name: "HaveFate",
        username: "havefate",
        avatar_url: "/demo-avatar.png",
        banner_url: "/demo-banner.jpg",
        location: "Digital World",
        bio: "Professional Graphic Designer specializing in branding, stream assets, and illustrations. Let's create something amazing together.",
        verification_status: "verified",
        social_links: {
            twitter: "havefate",
            instagram: "havefate"
        }
    };

    const feedItems = [
        {
            id: 1,
            user: { name: "Neon Arts", handle: "@neonarts", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" },
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            caption: "Just finished this cyberpunk character commission! 🦾",
            tags: ["Digital Art", "Cyberpunk"],
            likes: 1240,
            comments: 45
        },
        {
            id: 2,
            user: { name: "Studio G", handle: "@studiog", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop" },
            image: "https://images.unsplash.com/photo-1614728853913-1e22ba6e8a1e?q=80&w=2670&auto=format&fit=crop",
            caption: "New 3D weapon pack available in my shop now! 🔫",
            tags: ["3D Modeling", "Game Assets"],
            likes: 856,
            comments: 23
        },
        {
            id: 3,
            user: { name: "Pixel Perfect", handle: "@pixelperfect", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop" },
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
            caption: "Retro vibes only. 🕹️",
            tags: ["Photography", "Retro"],
            likes: 2100,
            comments: 89
        }
    ];

    const portfolioItems = [
        {
            id: 1,
            title: "Stream Overlay Package",
            image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
        },
        {
            id: 2,
            title: "Esports Mascot Logo",
            image_url: "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=2670&auto=format&fit=crop",
        },
        {
            id: 3,
            title: "Cyberpunk Character Art",
            image_url: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2670&auto=format&fit=crop",
        },
        {
            id: 4,
            title: "Abstract 3D Render",
            image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        },
        {
            id: 5,
            title: "Minimalist Poster",
            image_url: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=2670&auto=format&fit=crop",
        },
        {
            id: 6,
            title: "Neon Cityscape",
            image_url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2670&auto=format&fit=crop",
        }
    ];

    const services = [
        {
            id: 1,
            title: "Logo Design",
            price: 150,
            icon: PenTool,
            previews: [
                "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=2670&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?q=80&w=2671&auto=format&fit=crop"
            ]
        },
        {
            id: 2,
            title: "Stream Package",
            price: 300,
            icon: Monitor,
            previews: [
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671&auto=format&fit=crop"
            ]
        },
        {
            id: 3,
            title: "Photography Session",
            price: 200,
            icon: Camera,
            previews: [
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2528&auto=format&fit=crop"
            ]
        }
    ];

    const handleAppNav = (tab: string) => {
        if (tab === "CREATE") {
            setActiveModal("CREATE");
            return;
        }
        setActiveAppTab(tab);
    };

    const handleActionClick = (action: string) => {
        if (action === "Send Tip") {
            setActiveModal("TIP");
            return;
        }
        if (action === "Leave Review") {
            setActiveModal("REVIEW");
            return;
        }
        alert(`${action} feature would open here.`);
    };

    const toggleUserMode = () => {
        setUserMode(prev => prev === "SELLER" ? "BUYER" : "SELLER");
    };

    const filteredFeed = feedItems.filter(item => {
        const matchesTag = activeTag === "All" || item.tags.includes(activeTag);
        const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    // Modal Component
    const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] w-full max-w-md rounded-3xl p-6 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white pb-32 selection:bg-red-500/30 transition-colors duration-300 font-sans">
            {/* Demo Banner */}
            <div className="bg-blue-600 text-white text-[10px] font-bold text-center py-1 sticky top-0 z-[60] uppercase tracking-widest relative">
                <Link href="/" className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                </Link>
                This is a demo version
            </div>

            {/* Modals */}
            {activeModal === "CREATE" && (
                <Modal title="Create New" onClose={() => setActiveModal(null)}>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors border border-gray-200 dark:border-[#333]">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                                <Package className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Service</span>
                        </button>
                        <button className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors border border-gray-200 dark:border-[#333]">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Product</span>
                        </button>
                        <button className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors border border-gray-200 dark:border-[#333]">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Post</span>
                        </button>
                        <button className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors border border-gray-200 dark:border-[#333]">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Invoice</span>
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === "TIP" && (
                <Modal title="Send a Tip" onClose={() => setActiveModal(null)}>
                    <div className="space-y-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-400 leading-relaxed">
                                <span className="font-bold block mb-0.5">Verified Transaction</span>
                                Tips are processed securely. You can tip any user on the platform.
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            {[5, 10, 20, 50].map((amount) => (
                                <button key={amount} className="px-4 py-2 rounded-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#333] hover:border-green-500 hover:text-green-500 text-gray-900 dark:text-white font-bold transition-all">
                                    ${amount}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            placeholder="Custom Amount ($)"
                            className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#333] rounded-xl p-4 text-center font-bold text-xl text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <textarea
                            placeholder="Add a nice message..."
                            className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#333] rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors h-24 resize-none"
                        />
                        <button
                            onClick={() => { alert("Tip Sent!"); setActiveModal(null); }}
                            className="w-full bg-green-500 text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                        >
                            Send Tip
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === "REVIEW" && (
                <Modal title="Leave a Review" onClose={() => setActiveModal(null)}>
                    <div className="space-y-6">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                            <Star className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5 fill-current" />
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                                <span className="font-bold block mb-0.5">Verified Purchase</span>
                                Reviews are only available for users you have successfully commissioned.
                            </p>
                        </div>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} className="text-gray-300 dark:text-gray-600 hover:text-yellow-400 transition-colors">
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Share your experience..."
                            className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#333] rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 transition-colors h-32 resize-none"
                        />
                        <button
                            onClick={() => { alert("Review Submitted!"); setActiveModal(null); }}
                            className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                        >
                            Submit Review
                        </button>
                    </div>
                </Modal>
            )}

            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] sticky top-8 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/PayLinkLOGO.svg" alt="PayLink" className="w-full h-full object-contain invert dark:invert-0" />
                        </div>
                        <span className="font-black text-xl tracking-tighter italic text-black dark:text-white">PAYLINK</span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <button
                            onClick={() => handleAppNav("HOME")}
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                activeAppTab === "HOME" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            HOME
                        </button>
                        <button
                            onClick={() => handleAppNav("ORDERS")}
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                activeAppTab === "ORDERS" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            ORDERS
                        </button>
                        <button
                            onClick={() => handleAppNav("CREATE")}
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                activeAppTab === "CREATE" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            CREATE
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64 transition-all text-gray-900 dark:text-white placeholder-gray-500"
                        />
                    </div>
                    <button onClick={() => handleActionClick("Messages")} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors relative">
                        <MessageCircle className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <button onClick={() => handleActionClick("Notifications")} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                    </button>
                    <button onClick={() => handleAppNav("QR")} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <QrCode className="w-5 h-5" />
                    </button>
                    <button onClick={() => setActiveAppTab("ACCOUNT")} className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-[#333] hover:ring-2 ring-blue-500 transition-all">
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    </button>
                </div>
            </header>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-6 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <Link href="/" className="pointer-events-auto bg-black/20 backdrop-blur-md p-2 rounded-full text-white/80 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                {/* Placeholder for top right actions if needed */}
            </div>

            {/* Main Content Area */}
            {activeAppTab === "HOME" && (
                <>
                    {userMode === "SELLER" ? (
                        /* SELLER DASHBOARD */
                        <>
                            {/* Profile Header */}
                            <div className="relative group pb-4">
                                {/* Immersive Banner */}
                                <div className="h-48 md:h-80 w-full relative overflow-hidden">
                                    <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-[#1a1a1a]" />
                                </div>

                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 md:-mt-32">
                                    <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8">
                                        {/* Avatar */}
                                        <div className="relative shrink-0 mx-auto md:mx-0">
                                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl p-1 bg-white dark:bg-[#1a1a1a] shadow-2xl">
                                                <div className="w-full h-full rounded-2xl overflow-hidden relative border-2 border-gray-200 dark:border-[#333]">
                                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#1a1a1a] p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-[#333]">
                                                <div className="text-white p-1 rounded-full bg-red-500">
                                                    <Check className="w-3 h-3 stroke-[4]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="flex-1 flex flex-col md:flex-row items-end justify-between gap-6 w-full text-center md:text-left pb-2">
                                            <div className="space-y-2 flex-1 w-full">
                                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 justify-between">
                                                    <div>
                                                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-1 text-gray-900 dark:text-white">
                                                            {profile.full_name}
                                                        </h1>
                                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">
                                                            <span className="text-gray-400 dark:text-gray-300">@{profile.username}</span>
                                                            <span className="hidden md:inline">•</span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {profile.location}
                                                            </span>
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
                                                        <button
                                                            onClick={() => handleActionClick("Send Tip")}
                                                            className="p-2 rounded-full bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
                                                        >
                                                            <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleActionClick("Leave Review")}
                                                            className="p-2 rounded-full bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
                                                        >
                                                            <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400 fill-current" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                                                    {profile.bio}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation Tabs (Mobile Only) */}
                                    <div className="md:hidden mt-8 border-b border-[#333]">
                                        <div className="flex gap-4 overflow-x-auto max-w-full pb-px no-scrollbar px-4">
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

                                            <div className="h-48 w-full relative">
                                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 50">
                                                    <defs>
                                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* Grid Lines */}
                                                    <line x1="0" y1="12.5" x2="200" y2="12.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />
                                                    <line x1="0" y1="25" x2="200" y2="25" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />
                                                    <line x1="0" y1="37.5" x2="200" y2="37.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />

                                                    <line x1="40" y1="0" x2="40" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />
                                                    <line x1="80" y1="0" x2="80" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />
                                                    <line x1="120" y1="0" x2="120" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />
                                                    <line x1="160" y1="0" x2="160" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.2" className="text-gray-500" />

                                                    <path
                                                        d="M0,40 C20,35 40,25 60,28 C80,31 100,20 120,22 C140,24 160,10 180,12 L200,5 L200,50 L0,50 Z"
                                                        fill="url(#chartGradient)"
                                                    />
                                                    <path
                                                        d="M0,40 C20,35 40,25 60,28 C80,31 100,20 120,22 C140,24 160,10 180,12 L200,5"
                                                        fill="none"
                                                        stroke="#4ade80"
                                                        strokeWidth="0.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <circle cx="60" cy="28" r="1" fill="#fff" className="dark:fill-white fill-gray-900" />
                                                    <circle cx="120" cy="22" r="1" fill="#fff" className="dark:fill-white fill-gray-900" />
                                                    <circle cx="180" cy="12" r="1" fill="#fff" className="dark:fill-white fill-gray-900" />
                                                </svg>
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
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">5</span>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                        <UserPlus className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-2" />
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">100</span>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                        <Star className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mb-2 fill-current" />
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">4.7</span>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3]">
                                                        <RefreshCw className="w-6 h-6 text-gray-900 dark:text-white mb-2" />
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">32</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl p-6 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 italic mb-6">Earnings</h4>
                                                    <div className="space-y-4">
                                                        <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-6 text-center">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">This Week</span>
                                                            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">$147.45</span>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-xl p-6 text-center">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total</span>
                                                            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">$12,525.45</span>
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
                                                {services.map((service) => (
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
                                                            {service.previews.map((preview, idx) => (
                                                                <div key={idx} className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-[#333]">
                                                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeProfileTab === "PORTFOLIO" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-3 gap-0.5 md:gap-4">
                                            {portfolioItems.map((item) => (
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
                                            ))}
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
                        <div className="pt-20 px-4 pb-32 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col gap-4 mb-6">
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
                                        <button onClick={() => alert("Create Tag feature")} className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white dark:bg-[#222] text-blue-500 dark:text-blue-400 border border-blue-500/30">
                                            + New Tag
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {filteredFeed.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-3xl overflow-hidden">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{item.user.name}</div>
                                                    <div className="text-xs text-gray-500">{item.user.handle}</div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="aspect-square w-full bg-gray-100 dark:bg-[#1a1a1a]">
                                            <img src={item.image} alt="Post" className="w-full h-full object-cover" />
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-4 mb-3">
                                                <button className="text-gray-900 dark:text-white">
                                                    <Heart className="w-6 h-6" />
                                                </button>
                                                <button className="text-gray-900 dark:text-white">
                                                    <MessageCircle className="w-6 h-6" />
                                                </button>
                                                <button className="text-gray-900 dark:text-white">
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
                                            <div className="text-xs text-gray-500 mt-2">View all {item.comments} comments</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}


            {/* Orders View */}
            {activeAppTab === "ORDERS" && (
                <div className="pt-20 px-4 pb-32 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 italic tracking-tight">MY ORDERS</h2>

                    {/* Orders Tabs */}
                    <div className="flex p-1 bg-gray-200 dark:bg-[#333] rounded-xl mb-8">
                        <button
                            onClick={() => setActiveOrdersTab("ACTIVE")}
                            className={clsx(
                                "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
                                activeOrdersTab === "ACTIVE"
                                    ? "bg-white dark:bg-[#222] text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            Active Orders
                        </button>
                        <button
                            onClick={() => setActiveOrdersTab("COMPLETED")}
                            className={clsx(
                                "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
                                activeOrdersTab === "COMPLETED"
                                    ? "bg-white dark:bg-[#222] text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            Completed Orders
                        </button>
                    </div>

                    {activeOrdersTab === "ACTIVE" && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-2xl p-6 text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-[#333] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active orders</h3>
                                <p className="text-gray-500 dark:text-gray-400">New orders will appear here.</p>
                            </div>
                        </div>
                    )}

                    {activeOrdersTab === "COMPLETED" && (
                        <div className="space-y-6">
                            {/* Project Files UI (Mock for latest order) */}
                            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl overflow-hidden">
                                <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#222]">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black italic text-white tracking-tight">PROJECT FILES</h3>
                                        <div className="flex gap-2">
                                            <button className="p-1.5 bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors"><GridIcon className="w-4 h-4" /></button>
                                            <button className="p-1.5 bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4 rotate-90" /></button>
                                            <button className="p-1.5 bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4 -rotate-90" /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="bg-[#222] border border-[#333] rounded-2xl p-4 group hover:border-blue-500 transition-colors relative">
                                            <div className="aspect-video bg-[#1a1a1a] rounded-xl mb-4 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-gray-600" />
                                                </div>
                                                {/* Mock UI elements from image */}
                                                <div className="absolute top-2 left-2 w-full pr-4 flex justify-between">
                                                    <div className="w-16 h-4 bg-[#333] rounded-full" />
                                                    <div className="w-4 h-4 bg-[#333] rounded-full" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-white mb-1">Pokémon Overlay</h4>
                                                    <p className="text-xs text-gray-500">File Size: 2.4MB</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-500 block">Date</span>
                                                    <span className="text-xs text-gray-400">Feb 21, 2025</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"><PenTool className="w-4 h-4" /></button>
                                                <button className="p-2 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"><ArrowLeft className="w-4 h-4 -rotate-90" /></button>
                                                <button className="p-2 bg-gray-500/20 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 border-t border-[#333] bg-[#222] flex justify-between items-center">
                                    <button className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2">
                                        <Link href="#" className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Create Payment Link
                                        </Link>
                                    </button>
                                    <button className="w-12 h-12 bg-[#333] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#444] transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Messages View */}
            {activeAppTab === "MESSAGES" && (
                <div className="pt-20 px-4 pb-32 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 italic tracking-tight">MESSAGES</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">Client {i}</h4>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">2m ago</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Hey, just checking in on the progress of the project...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* QR Code View */}
            {activeAppTab === "QR" && (
                <div className="pt-20 px-4 pb-32 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="bg-white dark:bg-[#222] p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-[#333] mb-8">
                        <div className="w-64 h-64 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                            <QrCode className="w-32 h-32 text-white" />
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-xl mb-2">@{profile.username}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Scan to pay or view profile</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Share Link
                        </button>
                        <button className="px-8 py-3 bg-[#222] hover:bg-[#333] text-white font-bold rounded-full transition-colors border border-[#333] flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Save Image
                        </button>
                    </div>
                </div>
            )}

            {/* Account View */}
            {activeAppTab === "ACCOUNT" && (
                <div className="pt-20 px-4 pb-32 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#333] shadow-xl">
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white">{profile.full_name}</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400">@{profile.username}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Mode Switcher Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group cursor-pointer" onClick={toggleUserMode}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Repeat className="w-5 h-5 text-blue-200" />
                                        <span className="font-bold text-blue-100 text-sm tracking-wider uppercase">Current Mode</span>
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tight">{userMode}</h3>
                                    <p className="text-blue-100 mt-1">Tap to switch to {userMode === "SELLER" ? "Buyer" : "Seller"}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:rotate-180 transition-transform duration-500">
                                    <RefreshCw className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {theme === "dark" ? <Sun className="w-6 h-6 text-purple-500" /> : <Moon className="w-6 h-6 text-purple-500" />}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Appearance</span>
                                    <span className="text-gray-500 text-xs">{theme === "dark" ? "Light" : "Dark"} Mode</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("QR Code")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <QrCode className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">My QR Code</span>
                                    <span className="text-gray-500 text-xs">Share Profile</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("Payment Methods")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Payments</span>
                                    <span className="text-gray-500 text-xs">Cards & Banks</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("Settings")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-gray-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Settings className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Settings</span>
                                    <span className="text-gray-500 text-xs">Account Details</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("Security")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Security</span>
                                    <span className="text-gray-500 text-xs">Password & 2FA</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("Subscriptions")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Repeat className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Subscriptions</span>
                                    <span className="text-gray-500 text-xs">Manage Plans</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("Request Verification")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Verification</span>
                                    <span className="text-gray-500 text-xs">Get Verified</span>
                                </div>
                            </button>

                            <button onClick={() => handleActionClick("Help")} className="bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-left">
                                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <HelpCircle className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">Support</span>
                                    <span className="text-gray-500 text-xs">Get Help</span>
                                </div>
                            </button>
                        </div>

                        <button onClick={() => handleActionClick("Log Out")} className="w-full bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors group mt-8">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <span className="font-bold text-red-500">Log Out</span>
                        </button>
                    </div>
                </div>
            )
            }

            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-blue-600 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl z-50 shadow-blue-900/40">
                <button
                    onClick={() => handleAppNav("HOME")}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        activeAppTab === "HOME" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">HOME</span>
                </button>
                <button
                    onClick={() => handleAppNav("ORDERS")}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        activeAppTab === "ORDERS" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <FileText className="w-6 h-6" />
                    <span className="text-[10px] font-bold">ORDERS</span>
                </button>
                <button
                    onClick={() => handleAppNav("CREATE")}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        activeAppTab === "CREATE" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold">CREATE</span>
                </button>
                <button
                    onClick={() => handleAppNav("MESSAGES")}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        activeAppTab === "MESSAGES" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-[10px] font-bold">MESSAGES</span>
                </button>
                <button
                    onClick={() => handleAppNav("ACCOUNT")}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        activeAppTab === "ACCOUNT" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-current">
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold">ACCOUNT</span>
                </button>
            </div>
        </div >
    );
}
