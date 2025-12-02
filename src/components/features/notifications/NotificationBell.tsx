"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

export function NotificationBell() {
    const { user } = useUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        };

        fetchNotifications();

        // Realtime subscription
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user?.id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <h3 className="font-bold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={clsx(
                                                "p-4 hover:bg-muted/50 transition-colors relative group",
                                                !notification.is_read && "bg-primary/5"
                                            )}
                                        >
                                            <Link
                                                href={notification.link || '#'}
                                                onClick={() => {
                                                    if (!notification.is_read) markAsRead(notification.id);
                                                    setIsOpen(false);
                                                }}
                                                className="block"
                                            >
                                                <div className="flex gap-3">
                                                    <div className={clsx(
                                                        "w-2 h-2 mt-2 rounded-full shrink-0",
                                                        !notification.is_read ? "bg-primary" : "bg-transparent"
                                                    )} />
                                                    <div className="flex-1 space-y-1">
                                                        <p className={clsx("text-sm font-medium leading-snug", !notification.is_read ? "text-foreground" : "text-muted-foreground")}>
                                                            {notification.title}
                                                        </p>
                                                        {notification.message && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                        )}
                                                        <p className="text-[10px] text-muted-foreground/50 font-medium pt-1">
                                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
