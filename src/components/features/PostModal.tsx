"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Send, Check, User } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/types/paylink";
import { ShareModal } from "./ShareModal";

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate?: (updatedPost: any) => void;
}

export function PostModal({ isOpen, onClose, post, onUpdate }: PostModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchComments = async () => {
            if (!post) return;
            setLoadingComments(true);
            const { data: commentsData } = await supabase
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

            if (commentsData) {
                const commentIds = commentsData.map(c => c.id);

                // Fetch likes for these comments
                const { data: likesData } = await supabase
                    .from('comment_likes')
                    .select('comment_id, user_id')
                    .in('comment_id', commentIds);

                const commentsWithLikes = commentsData.map(comment => {
                    const likes = likesData?.filter(l => l.comment_id === comment.id) || [];
                    return {
                        ...comment,
                        likes_count: likes.length,
                        user_has_liked: user ? likes.some(l => l.user_id === user.id) : false
                    };
                });

                setComments(commentsWithLikes);
                setTimeout(scrollToBottom, 100);
            }
            setLoadingComments(false);
        };

        if (isOpen && post) {
            // Initialize from props
            setLikesCount(post.likes || 0);
            setIsLiked(post.user_has_liked || false);
            fetchComments();
        }
    }, [isOpen, post, user]);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLikeToggle = async () => {
        if (!user) {
            toast("Please login to like posts.", "error");
            return;
        }

        const previousLiked = isLiked;
        const previousCount = likesCount;

        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

        if (previousLiked) {
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('portfolio_item_id', post.id);

            if (error) {
                setIsLiked(previousLiked);
                setLikesCount(previousCount);
                toast(`Error unliking post: ${error.message}`, "error");
            }
        } else {
            const { error } = await supabase
                .from('likes')
                .insert({
                    user_id: user.id,
                    portfolio_item_id: post.id
                });

            if (error) {
                if (error.code === '23505') {
                    setIsLiked(true);
                } else {
                    setIsLiked(previousLiked);
                    setLikesCount(previousCount);
                    toast(`Error liking post: ${error.message}`, "error");
                }
            }
        }

        if (onUpdate) {
            onUpdate({
                ...post,
                likes: newLikedState ? likesCount + 1 : likesCount - 1,
                user_has_liked: newLikedState
            });
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
                content: newComment.trim(),
                parent_id: replyTo ? replyTo.id : null
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
            setComments(prev => [...prev, { ...data, likes_count: 0, user_has_liked: false }]);
            setNewComment("");
            setReplyTo(null);
            setTimeout(scrollToBottom, 100);

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

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;

        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const isLiked = c.user_has_liked;
                return {
                    ...c,
                    likes_count: (c.likes_count || 0) + (isLiked ? -1 : 1),
                    user_has_liked: !isLiked
                };
            }
            return c;
        }));

        try {
            const { error } = await supabase
                .from('comment_likes')
                .insert({ comment_id: commentId, user_id: user.id });

            if (error) {
                if (error.code === '23505') {
                    await supabase
                        .from('comment_likes')
                        .delete()
                        .match({ comment_id: commentId, user_id: user.id });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    const isLiked = !c.user_has_liked;
                    return {
                        ...c,
                        likes_count: (c.likes_count || 0) + (isLiked ? -1 : 1),
                        user_has_liked: !isLiked
                    };
                }
                return c;
            }));
            toast("Failed to like comment", "error");
        }
    };

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
                <div className="hidden md:flex relative w-full h-full max-w-5xl max-h-[85vh] bg-background rounded-xl overflow-hidden flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-border/50">
                    {/* Image Section */}
                    <div className="flex-1 bg-black flex items-center justify-center relative group overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={post.image_url}
                                alt={post.title}
                                fill
                                className="object-contain"
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
                                            <Image
                                                src={post.user?.avatar || post.profiles?.avatar_url}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-4 h-4 text-muted-foreground">
                                                <User className="w-full h-full p-0.5" />
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
                                <CommentList
                                    comments={comments}
                                    user={user}
                                    post={post}
                                    onDelete={handleDeleteComment}
                                    onReply={(comment: Comment) => {
                                        setReplyTo(comment);
                                        document.getElementById('comment-input-desktop')?.focus();
                                    }}
                                    onLike={handleLikeComment}
                                />
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
                            <Image
                                src={post.image_url}
                                alt={post.title}
                                fill
                                className="object-contain"
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
                                        <Image
                                            src={post.user?.avatar || post.profiles?.avatar_url}
                                            alt="Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-5 h-5 text-muted-foreground">
                                            <User className="w-full h-full p-0.5" />
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
                                <CommentList
                                    comments={comments}
                                    user={user}
                                    post={post}
                                    onDelete={handleDeleteComment}
                                    onReply={(comment: Comment) => {
                                        setReplyTo(comment);
                                        document.getElementById('comment-input-mobile')?.focus();
                                    }}
                                    onLike={handleLikeComment}
                                />
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    No comments yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer (Input) */}
                    <div className="p-4 border-t border-border bg-background shrink-0 sticky bottom-0 z-50">
                        {replyTo && (
                            <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5 mb-2 rounded-lg text-xs">
                                <span className="text-muted-foreground">Replying to <span className="font-bold text-foreground">@{replyTo.profiles?.username}</span></span>
                                <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-muted rounded-full">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <input
                                id="comment-input-mobile"
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                placeholder={replyTo ? `Reply to @${replyTo.profiles?.username}...` : "Add a comment..."}
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

// Helper Component for Recursive Comments
interface CommentListProps {
    comments: Comment[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: any;
    onDelete: (id: string) => void;
    onReply: (comment: Comment) => void;
    onLike: (commentId: string) => void;
}

function CommentItem({ comment, comments, user, post, onDelete, onReply, onLike }: {
    comment: Comment;
    comments: Comment[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: any;
    onDelete: (id: string) => void;
    onReply: (comment: Comment) => void;
    onLike: (commentId: string) => void;
}) {
    const [showReplies, setShowReplies] = useState(false);
    const replies = comments.filter(c => c.parent_id === comment.id);
    const hasReplies = replies.length > 0;

    return (
        <div className="group">
            <div className="flex gap-3">
                <Link href={`/${comment.profiles?.username}`} className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                    {comment.profiles?.avatar_url ? (
                        <Image
                            src={comment.profiles?.avatar_url}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-4 h-4 text-muted-foreground">
                            <User className="w-full h-full p-0.5" />
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
                        <button
                            onClick={() => onLike(comment.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            <Heart className={clsx("w-3 h-3", comment.user_has_liked && "fill-red-500 text-red-500")} />
                            {comment.likes_count && comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        <button
                            onClick={() => onReply(comment)}
                            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Reply
                        </button>
                        {(user?.id === comment.user_id || user?.id === post.user_id) && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {hasReplies && (
                        <div className="mt-2">
                            {!showReplies ? (
                                <button
                                    onClick={() => setShowReplies(true)}
                                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground my-1"
                                >
                                    <div className="w-6 h-px bg-border" />
                                    View {replies.length} replies
                                </button>
                            ) : (
                                <div className="pl-8 border-l-2 border-border/50 mt-2 space-y-4">
                                    {replies.map(reply => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            comments={comments}
                                            user={user}
                                            post={post}
                                            onDelete={onDelete}
                                            onReply={onReply}
                                            onLike={onLike}
                                        />
                                    ))}
                                    <button
                                        onClick={() => setShowReplies(false)}
                                        className="text-xs font-bold text-muted-foreground hover:text-foreground mt-2"
                                    >
                                        Hide replies
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CommentList({ comments, user, post, onDelete, onReply, onLike }: CommentListProps) {
    const rootComments = comments.filter((c: Comment) => !c.parent_id);

    return (
        <div className="space-y-4">
            {rootComments.map((comment: Comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    comments={comments}
                    user={user}
                    post={post}
                    onDelete={onDelete}
                    onReply={onReply}
                    onLike={onLike}
                />
            ))}
        </div>
    );
}
