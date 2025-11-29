"use client";

import { Copy, Send, Share2, X } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
}

export function ShareModal({ isOpen, onClose, url, title = "Check this out!" }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: title,
                    url: url,
                });
                onClose();
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            // Fallback to copy if Web Share API not supported
            handleCopy();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-background rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Share</h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleShare}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">Share via...</div>
                            <div className="text-xs text-muted-foreground">Send to other apps</div>
                        </div>
                    </button>

                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <Copy className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">{copied ? "Copied!" : "Copy Link"}</div>
                            <div className="text-xs text-muted-foreground">{url}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
