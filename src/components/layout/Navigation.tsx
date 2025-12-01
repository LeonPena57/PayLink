"use client";

import { Home, Receipt, QrCode, User, Plus, Menu, LogOut, Settings, Sun, Moon, FolderOpen, MessageCircle, ShoppingBag, Globe, X, Zap, DollarSign } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeHash, setActiveHash] = useState("");

    const { theme, setTheme } = useTheme();
    const { user, profile } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Set initial hash
        setActiveHash(window.location.hash);

        // Listen for hash changes
        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    if (!mounted) return null;

    // Hide navigation on auth pages
    // if (pathname === "/login" || pathname === "/signup") {
    //     return null;
    // }

    // Hide navigation on PayLink pages as they have their own layout
    // if (pathname?.startsWith("/pay/")) {
    //     return null;
    // }

    const navItems = user ? [
        { name: "HOME", href: "/home", icon: Home },
        { name: "ORDERS", href: "/receipts", icon: Receipt },
        { name: "CREATE", href: "/create", icon: Plus, variant: "special" },
        { name: "MESSAGES", href: "/messages", icon: MessageCircle },
        { name: "ACCOUNT", href: "/settings", icon: User }
    ] : [
        { name: "HOME", href: "/", icon: Home },
        { name: "EXPLORE", href: "/home", icon: Globe },
        { name: "FEATURES", href: "/#features", icon: Zap },
        { name: "PRICING", href: "/#pricing", icon: DollarSign },
        { name: "LOGIN", href: "/login", icon: User }
    ];

    const isActive = (href: string) => {
        if (href.startsWith("/#")) {
            return pathname === "/" && activeHash === href.substring(1);
        }
        if (href === "/") {
            return pathname === "/" && !activeHash;
        }
        return pathname === href;
    };

    return (
        <>
            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] sticky top-0 z-50 w-full">
                <div className="flex items-center gap-8">
                    <Link href={user ? "/home" : "/"} className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <Image src="/logo.png" alt="PayLink" fill className="object-contain brightness-0 dark:brightness-100 dark:invert-0" sizes="32px" />
                        </div>
                        <span className="font-black text-xl tracking-tighter italic text-black dark:text-white">PAYLINK</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        {navItems.slice(0, 4).map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => {
                                    if (item.href.startsWith("/#")) {
                                        setActiveHash(item.href.substring(1));
                                    } else {
                                        setActiveHash("");
                                    }
                                }}
                                className={clsx(
                                    "text-sm font-bold transition-colors hover:text-black dark:hover:text-white",
                                    isActive(item.href) ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/qr" className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <QrCode className="w-5 h-5" />
                    </Link>
                    {user ? (
                        <Link href="/settings" className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-[#333] hover:ring-2 ring-primary transition-all">
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} alt="User" fill className="object-cover" sizes="32px" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                            )}
                        </Link>
                    ) : (
                        <Link href="/login" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:scale-105 transition-transform">
                            Login
                        </Link>
                    )}
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-primary rounded-full px-2 py-3 grid grid-cols-5 items-center shadow-2xl z-[100] shadow-primary/40">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                                if (item.href.startsWith("/#")) {
                                    setActiveHash(item.href.substring(1));
                                } else {
                                    setActiveHash("");
                                }
                            }}
                            className={clsx(
                                "flex flex-col items-center gap-1 transition-colors",
                                active ? "text-white" : "text-white/60 hover:text-white"
                            )}
                        >
                            {item.variant === "special" ? (
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/10 shrink-0">
                                    <item.icon className="w-5 h-5 text-primary" strokeWidth={4} />
                                </div>
                            ) : (
                                <div className="h-8 flex items-center justify-center">
                                    {item.name === "ACCOUNT" || item.name === "LOGIN" ? (
                                        <div className={clsx("relative w-6 h-6 rounded-full overflow-hidden border border-current shrink-0", active ? "ring-2 ring-white" : "")}>
                                            {user && profile?.avatar_url ? (
                                                <Image src={profile.avatar_url} alt="User" fill className="object-cover" sizes="24px" />
                                            ) : (
                                                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                                    <item.icon className="w-4 h-4 text-white" fill={active ? "currentColor" : "none"} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <item.icon
                                            className="w-6 h-6 shrink-0"
                                            fill={active ? (item.name === "ORDERS" ? "white" : "currentColor") : "none"}
                                            stroke={active && item.name === "ORDERS" ? "currentColor" : "currentColor"}
                                        />
                                    )}
                                </div>
                            )}
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
