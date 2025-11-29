"use client";

import { Home, Receipt, QrCode, User, Plus, Menu, ChevronLeft, ChevronRight, LogOut, Settings, Sun, Moon, FolderOpen, MessageCircle, ShoppingBag, Globe, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useUser } from "@/context/UserContext";

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { theme, setTheme } = useTheme();
    const { user, profile } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Hide navigation on auth pages
    if (pathname === "/login" || pathname === "/signup") {
        return null;
    }

    // ... (items arrays remain same)

    const handleSettingsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (pathname === "/settings") {
            router.push("/dashboard");
        } else {
            router.push("/settings");
        }
    };

    // Items specifically for the Desktop Sidebar (Main)
    const desktopSidebarItems = [
        { name: "Home", href: "/home", icon: Home },
        { name: "Messages", href: "/messages", icon: MessageCircle },
        { name: "Shop", href: "/shop", icon: ShoppingBag },
        { name: "Files", href: "/drive", icon: FolderOpen },
        { name: "Orders", href: "/receipts", icon: Receipt },
        { name: "Account", href: "/settings", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "About", href: "/", icon: Globe },
    ];

    // Items for the Mobile Bottom Bar (Key Features - 5 items for centered Create)
    const bottomNavItems = [
        { name: "Home", href: "/home", icon: Home },
        { name: "QR Code", href: "/qr", icon: QrCode },
        { name: "Create", href: "/create", icon: Plus },
        { name: "Orders", href: "/receipts", icon: Receipt },
        { name: "Account", href: "/settings", icon: User },
    ];

    // Unauthenticated Navigation
    if (!user) {
        return (
            <>
                {/* Desktop Header (Unauthenticated) */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 h-20 flex items-center justify-between px-6 transition-colors duration-300">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/PayLinkLOGO.svg" alt="PayLink Logo" className="w-10 h-10 object-contain invert dark:invert-0" />
                            <span className="font-black tracking-tighter text-2xl italic bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">PAYLINK</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-400">
                            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
                            <Link href="/#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
                            <Link href="/#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How it Works</Link>
                            <Link href="/#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
                            <Link href="/home" className={clsx("hover:text-black dark:hover:text-white transition-colors", pathname === "/home" ? "text-blue-500 dark:text-blue-400" : "")}>Explore</Link>
                        </nav>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link href="/login" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors px-4 py-2">
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button className="text-black dark:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-20 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 p-6 flex flex-col gap-4 z-[60] md:hidden shadow-2xl"
                        >
                            <Link href="/" className="text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link href="/#features" className="text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                            <Link href="/#how-it-works" className="text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
                            <Link href="/#pricing" className="text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                            <Link href="/home" className="text-lg font-bold text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
                            <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
                            <Link href="/login" className="text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                            <Link href="/signup" className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-center font-bold rounded-full hover:opacity-90 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <>
            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] sticky top-0 z-50 w-full">
                <div className="flex items-center gap-8">
                    <Link href="/home" className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/PayLinkLOGO.svg" alt="PayLink" className="w-full h-full object-contain invert dark:invert-0" />
                        </div>
                        <span className="font-black text-xl tracking-tighter italic text-black dark:text-white">PAYLINK</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/home"
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                pathname === "/home" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            HOME
                        </Link>
                        <Link
                            href="/receipts"
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                pathname === "/receipts" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            ORDERS
                        </Link>
                        <Link
                            href="/create"
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                pathname === "/create" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            CREATE
                        </Link>
                        <Link
                            href="/messages"
                            className={clsx(
                                "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                pathname === "/messages" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            MESSAGES
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/qr" className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <QrCode className="w-5 h-5" />
                    </Link>
                    <Link href={user ? "/settings" : "/login"} className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-[#333] hover:ring-2 ring-blue-500 transition-all">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-500" />
                            </div>
                        )}
                    </Link>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-blue-600 rounded-full px-2 py-3 grid grid-cols-5 items-center shadow-2xl z-50 shadow-blue-900/40">
                <Link
                    href="/home"
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        pathname === "/home" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="h-8 flex items-center justify-center">
                        <Home className="w-6 h-6 shrink-0" fill={pathname === "/home" ? "currentColor" : "none"} />
                    </div>
                    <span className="text-[10px] font-bold">HOME</span>
                </Link>
                <Link
                    href="/receipts"
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        pathname === "/receipts" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="h-8 flex items-center justify-center">
                        <Receipt
                            className="w-6 h-6 shrink-0"
                            fill={pathname === "/receipts" ? "white" : "none"}
                            stroke={pathname === "/receipts" ? "#2563eb" : "currentColor"}
                        />
                    </div>
                    <span className="text-[10px] font-bold">ORDERS</span>
                </Link>
                <Link
                    href="/create"
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        pathname === "/create" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
                        <Plus className="w-5 h-5 text-blue-600" strokeWidth={4} />
                    </div>
                    <span className="text-[10px] font-bold">CREATE</span>
                </Link>
                <Link
                    href="/messages"
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        pathname === "/messages" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="h-8 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 shrink-0" fill={pathname === "/messages" ? "currentColor" : "none"} />
                    </div>
                    <span className="text-[10px] font-bold">MESSAGES</span>
                </Link>
                <Link
                    href={user ? "/settings" : "/login"}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        pathname === "/settings" ? "text-white" : "text-blue-200 hover:text-white"
                    )}
                >
                    <div className="h-8 flex items-center justify-center">
                        <div className={clsx("w-6 h-6 rounded-full overflow-hidden border border-current shrink-0", pathname === "/settings" ? "ring-2 ring-white" : "")}>
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" fill={pathname === "/settings" ? "currentColor" : "none"} />
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold">{user ? "ACCOUNT" : "LOGIN"}</span>
                </Link>
            </div>
        </>
    );
}
