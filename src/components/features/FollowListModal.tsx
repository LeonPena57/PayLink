"use client";

import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import clsx from "clsx";

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'followers' | 'following';
    userId: string;
}

export function FollowListModal({ isOpen, onClose, type, userId }: FollowListModalProps) {
    const { user: currentUser } = useUser();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            let data: any[] = [];
            let error: any = null;

            if (type === 'followers') {
                // 1. Get follower IDs
                const { data: follows, error: followsError } = await supabase
                    .from('follows')
                    .select('follower_id')
                    .eq('following_id', userId);

                if (followsError) {
                    error = followsError;
                } else if (follows && follows.length > 0) {
                    const ids = follows.map((f: any) => f.follower_id);
                    // 2. Get profiles
                    const { data: profiles, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, verification_status')
                        .in('id', ids);

                    if (profiles) data = profiles;
                    if (profilesError) error = profilesError;
                }
            } else {
                // 1. Get following IDs
                const { data: follows, error: followsError } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', userId);

                if (followsError) {
                    error = followsError;
                } else if (follows && follows.length > 0) {
                    const ids = follows.map((f: any) => f.following_id);
                    // 2. Get profiles
                    const { data: profiles, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, verification_status')
                        .in('id', ids);

                    if (profiles) data = profiles;
                    if (profilesError) error = profilesError;
                }
            }

            if (error) {
                console.error("Error fetching users:", error);
            } else {
                // Check if current user follows them
                if (currentUser) {
                    const { data: myFollows } = await supabase
                        .from('follows')
                        .select('following_id')
                        .eq('follower_id', currentUser.id)
                        .in('following_id', data.map(u => u.id));

                    const myFollowIds = new Set(myFollows?.map((f: any) => f.following_id));

                    data = data.map(u => ({
                        ...u,
                        is_following: myFollowIds.has(u.id)
                    }));
                }
                setUsers(data);
            }
            setLoading(false);
        };

        if (isOpen && userId) {
            fetchUsers();
        }
    }, [isOpen, type, userId, currentUser]);

    const handleFollowToggle = async (targetUserId: string, isFollowing: boolean) => {
        if (!currentUser) return;

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, is_following: !isFollowing } : u));

        if (isFollowing) {
            // Unfollow
            await supabase
                .from('follows')
                .delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', targetUserId);
        } else {
            // Follow
            await supabase
                .from('follows')
                .insert({
                    follower_id: currentUser.id,
                    following_id: targetUserId
                });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-background w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                    <h2 className="font-bold text-lg capitalize">{type}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-1">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl transition-colors">
                                    <Link href={`/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0" onClick={onClose}>
                                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                                            {user.avatar_url ? (
                                                <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate flex items-center gap-1">
                                                {user.full_name}
                                                {user.verification_status === 'verified' && (
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                                                        <span className="text-[8px] text-white font-bold">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                                        </div>
                                    </Link>
                                    {currentUser && currentUser.id !== user.id && (
                                        <button
                                            onClick={() => handleFollowToggle(user.id, user.is_following)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                                user.is_following
                                                    ? "bg-muted text-foreground hover:bg-muted/80"
                                                    : "bg-primary text-primary-foreground hover:opacity-90"
                                            )}
                                        >
                                            {user.is_following ? (
                                                <>Following</>
                                            ) : (
                                                <>Follow</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No {type} found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
