"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase/client";
import { X, Trash2, Edit, Link as LinkIcon, ExternalLink, Flag } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

import { PortfolioItem } from "@/types/paylink";

interface PostOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PortfolioItem;
    onDelete?: () => void;
}

export function PostOptionsModal({ isOpen, onClose, post, onDelete }: PostOptionsModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !post) return null;

    const isOwner = user?.id === post.user_id;

    const handleCopyLink = () => {
        const url = `${window.location.origin}/p/${post.id}`;
        navigator.clipboard.writeText(url);
        toast("Link copied to clipboard", "success");
        onClose();
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        setIsDeleting(true);
        const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', post.id);

        if (error) {
            toast("Error deleting post", "error");
            setIsDeleting(false);
        } else {
            toast("Post deleted", "success");
            if (onDelete) onDelete();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xs bg-white dark:bg-[#262626] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-[#363636]">
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full p-3.5 text-sm font-bold text-red-500 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    )}

                    {isOwner && (
                        <button
                            onClick={() => {
                                toast("Edit functionality coming soon", "info");
                                onClose();
                            }}
                            className="w-full p-3.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                        >
                            Edit
                        </button>
                    )}

                    <button
                        onClick={handleCopyLink}
                        className="w-full p-3.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                    >
                        Copy link
                    </button>

                    <Link
                        href={`/p/${post.id}`}
                        onClick={onClose}
                        className="w-full p-3.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#333] transition-colors text-center block"
                    >
                        Go to post
                    </Link>

                    <button
                        onClick={() => {
                            toast("Report functionality coming soon", "info");
                            onClose();
                        }}
                        className="w-full p-3.5 text-sm font-bold text-red-500 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                    >
                        Report
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full p-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
