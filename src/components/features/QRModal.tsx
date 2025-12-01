"use client";

import { QrCode, Share2, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QRModal({ isOpen, onClose }: QRModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: 'My PayLink QR Code',
                text: 'Scan to commission me!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Share functionality not supported on this device.");
        }
    };

    const handleDownload = () => {
        alert("Downloading QR Code...");
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-3xl shadow-2xl z-[101] p-6 overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <div className="flex flex-col items-center text-center pt-4">
                            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-black/5 mb-6">
                                <QrCode className="w-48 h-48 text-black" />
                            </div>

                            <h2 className="text-2xl font-black italic text-foreground mb-2">
                                SCAN TO PAY
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium mb-8 max-w-[200px]">
                                Share this code with clients to get paid instantly.
                            </p>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-muted/50 border border-border rounded-xl font-bold text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    <Download className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
