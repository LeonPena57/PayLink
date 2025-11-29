"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Send, MoreHorizontal, Trash2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShareModal } from "./ShareModal";

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate?: (updatedPost: any) => void; // Callback to update parent state
}

export function PostModal({ isOpen, onClose, post, onUpdate }: PostModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && post) {
            fetchPostDetails();
            fetchComments();
        }
    }, [isOpen, post]);

    const fetchPostDetails = async () => {
        if (!post) return;

        // Use the RPC function to get accurate stats
        const { data, error } = await supabase
            .rpc('get_post_stats', { post_id: post.id });

        if (data) {
            setLikesCount(data.likes_count);
            setIsLiked(data.user_has_liked);
        }
    };

    const fetchComments = async () => {
        if (!post) return;
        setLoadingComments(true);
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles:user_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('portfolio_item_id', post.id)
            .order('created_at', { ascending: true });

        if (data) {
            setComments(data);
            setTimeout(scrollToBottom, 100);
        }
        setLoadingComments(false);
    };

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLikeToggle = async () => {
        if (!user) {
            toast("Please login to like posts.", "error");
            return;
        }

        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        if (previousLiked) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('portfolio_item_id', post.id);

            if (error) {
                // Revert
                setIsLiked(previousLiked);
                setLikesCount(previousCount);
                toast(`Error liking post: ${error.message}`, "error");
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
                // Revert
                setIsLiked(previousLiked);
                setLikesCount(previousCount);
                toast(`Error liking post: ${error.message}`, "error");
            }
        }

        // Notify parent of update if needed
        if (onUpdate) {
            onUpdate({ ...post, likes: isLiked ? likesCount - 1 : likesCount + 1, user_has_liked: !isLiked });
        }
    };

    const handlePostComment = async () => {
        if (!user) {
            toast("Please login to comment.", "error");
            return;
        }
        if (!newComment.trim()) return;
        setSubmittingComment(true);

        const { data, error } = await supabase
            .from('comments')
            .insert({
                user_id: user.id,
                portfolio_item_id: post.id,
                content: newComment.trim()
            })
            .select(`
                *,
                profiles:user_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .single();

        if (error) {
            toast(`Error posting comment: ${error.message}`, "error");
        }

        if (data) {
            setComments(prev => [...prev, data]);
            setNewComment("");
            setTimeout(scrollToBottom, 100);

            // Notify parent
            if (onUpdate) {
                onUpdate({ ...post, comments: (post.comments || 0) + 1 });
            }
        }
        setSubmittingComment(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (!error) {
            setComments(prev => prev.filter(c => c.id !== commentId));
            if (onUpdate) {
                onUpdate({ ...post, comments: Math.max(0, (post.comments || 0) - 1) });
            }
        }
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (!isOpen || !post) return null;

    return (
        <>
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={`${window.location.origin}/${post.user?.username || post.profiles?.username}`}
                title={`Check out this post by ${post.user?.name || post.profiles?.full_name}`}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center md:p-6">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

                {/* DESKTOP LAYOUT (Split View) */}
                <div className="hidden md:flex relative w-full h-full max-w-5xl h-[85vh] bg-background rounded-xl overflow-hidden flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-border/50">
                    {/* Image Section */}
                    <div className="flex-1 bg-black flex items-center justify-center relative group overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="w-[350px] lg:w-[400px] flex flex-col bg-background border-l border-border h-full">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Link href={`/${post.user?.username || post.profiles?.username}`} className="block">
                                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border flex items-center justify-center">
                                        {(post.user?.avatar || post.profiles?.avatar_url) ? (
                                            <img
                                                src={post.user?.avatar || post.profiles?.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-4 h-4 text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <Link href={`/${post.user?.username || post.profiles?.username}`} className="font-bold hover:underline text-sm flex items-center gap-1">
                                    {post.user?.name || post.profiles?.full_name || "Unknown User"}
                                    {(post.user?.verification_status === 'verified' || post.user?.username === 'leonp') && (
                                        <div className="bg-blue-500 text-white p-0.5 rounded-full">
                                            <Check className="w-2 h-2 stroke-[4]" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Caption */}
                            <div className="px-1">
                                <div className="text-sm">
                                    <Link href={`/${post.user?.username || post.profiles?.username}`} className="font-bold mr-2 hover:underline inline-flex items-center gap-1">
                                        {post.user?.name || post.profiles?.full_name}
                                        {(post.user?.verification_status === 'verified' || post.user?.username === 'leonp') && (
                                            <div className="bg-blue-500 text-white p-0.5 rounded-full">
                                                <Check className="w-2 h-2 stroke-[4]" />
                                            </div>
                                        )}
                                    </Link>
                                    {post.description || post.caption}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </p>
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* Comments List */}
                            {loadingComments ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <Link href={`/${comment.profiles?.username}`} className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                                            {comment.profiles?.avatar_url ? (
                                                <img
                                                    src={comment.profiles?.avatar_url}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-4 h-4 text-muted-foreground">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between">
                                                <p className="text-sm">
                                                    <Link href={`/${comment.profiles?.username}`} className="font-bold mr-2 hover:underline">
                                                        {comment.profiles?.full_name}
                                                    </Link>
                                                    {comment.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </span>
                                                {(user?.id === comment.user_id || user?.id === post.user_id) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No comments yet. Be the first to say something!
                                </div>
                            )}
                            <div ref={commentsEndRef} />
                        </div>

                        {/* Actions & Input */}
                        <div className="p-4 border-t border-border bg-background shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={handleLikeToggle} className="group flex items-center gap-1.5 transition-colors">
                                        <Heart className={clsx("w-7 h-7 transition-all active:scale-75", isLiked ? "fill-red-500 text-red-500" : "text-foreground group-hover:text-red-500")} />
                                    </button>
                                    <button onClick={() => document.getElementById('comment-input-desktop')?.focus()} className="group flex items-center gap-1.5 transition-colors">
                                        <MessageCircle className="w-7 h-7 text-foreground group-hover:text-blue-500 transition-colors" />
                                    </button>
                                    <button onClick={() => setIsShareModalOpen(true)} className="group flex items-center gap-1.5 transition-colors">
                                        <Send className="w-7 h-7 text-foreground group-hover:text-green-500 transition-colors -rotate-45 mt-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="font-bold text-sm mb-4">{likesCount} likes</div>
                            <div className="flex items-center gap-3">
                                <input
                                    id="comment-input-desktop"
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <button
                                    onClick={handlePostComment}
                                    disabled={!newComment.trim() || submittingComment}
                                    className="text-primary font-bold text-sm disabled:opacity-50 hover:text-primary/80 transition-colors"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE LAYOUT (Single Scrollable View) */}
                <div className="md:hidden relative w-full h-full bg-background flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {/* Floating Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Image */}
                        <div className="w-full bg-black min-h-[40vh] flex items-center justify-center">
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />
                        </div>

                        {/* Actions */}
                        <div className="p-4 pb-2">
                            <div className="flex items-center gap-4 mb-3">
                                <button onClick={handleLikeToggle} className="group flex items-center gap-1.5 transition-colors">
                                    <Heart className={clsx("w-7 h-7 transition-all active:scale-75", isLiked ? "fill-red-500 text-red-500" : "text-foreground group-hover:text-red-500")} />
                                </button>
                                <button onClick={() => document.getElementById('comment-input-mobile')?.focus()} className="group flex items-center gap-1.5 transition-colors">
                                    <MessageCircle className="w-7 h-7 text-foreground group-hover:text-blue-500 transition-colors" />
                                </button>
                                <button onClick={() => setIsShareModalOpen(true)} className="group flex items-center gap-1.5 transition-colors">
                                    <Send className="w-7 h-7 text-foreground group-hover:text-green-500 transition-colors -rotate-45 mt-1" />
                                </button>
                            </div>
                            <div className="font-bold text-sm">{likesCount} likes</div>
                        </div>

                        {/* Caption with Avatar */}
                        <div className="px-4 pb-4">
                            <div className="flex gap-3">
                                <Link href={`/${post.user?.username || post.profiles?.username}`} className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                                    {(post.user?.avatar || post.profiles?.avatar_url) ? (
                                        <img
                                            src={post.user?.avatar || post.profiles?.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-5 h-5 text-muted-foreground">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1">
                                    <div className="text-sm">
                                        <Link href={`/${post.user?.username || post.profiles?.username}`} className="font-bold mr-2 hover:underline inline-flex items-center gap-1">
                                            {post.user?.name || post.profiles?.full_name}
                                            {(post.user?.verification_status === 'verified' || post.user?.username === 'leonp') && (
                                                <div className="bg-blue-500 text-white p-0.5 rounded-full">
                                                    <Check className="w-2 h-2 stroke-[4]" />
                                                </div>
                                            )}
                                        </Link>
                                        {post.description || post.caption}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/50 mx-4 mb-4" />

                        {/* Comments */}
                        <div className="px-4 pb-20 space-y-4">
                            {loadingComments ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <Link href={`/${comment.profiles?.username}`} className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                                            {comment.profiles?.avatar_url ? (
                                                <img
                                                    src={comment.profiles?.avatar_url}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-4 h-4 text-muted-foreground">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between">
                                                <p className="text-sm">
                                                    <Link href={`/${comment.profiles?.username}`} className="font-bold mr-2 hover:underline">
                                                        {comment.profiles?.full_name}
                                                    </Link>
                                                    {comment.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </span>
                                                {(user?.id === comment.user_id || user?.id === post.user_id) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-xs text-red-500 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No comments yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer (Input) */}
                    <div className="p-4 border-t border-border bg-background shrink-0 sticky bottom-0 z-50">
                        <div className="flex items-center gap-3">
                            <input
                                id="comment-input-mobile"
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                placeholder="Add a comment..."
                                className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button
                                onClick={handlePostComment}
                                disabled={!newComment.trim() || submittingComment}
                                className="text-primary font-bold text-sm disabled:opacity-50 hover:text-primary/80 transition-colors"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
