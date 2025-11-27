"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard } from "lucide-react";
import { FileItem } from "./FileCard";
import clsx from "clsx";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPay: () => void;
    file: FileItem | null;
}

export function PaymentModal({ isOpen, onClose, onPay, file }: PaymentModalProps) {
    if (!file) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal / Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={clsx(
                            "fixed z-[70] bg-background border border-primary/30 shadow-2xl overflow-hidden",
                            // Mobile: Bottom Sheet
                            "bottom-0 left-0 right-0 rounded-t-3xl p-6",
                            // Desktop: Centered Modal
                            "md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-2xl"
                        )}
                    >
                        {/* Handle for mobile */}
                        <div className="md:hidden w-12 h-1 bg-muted rounded-full mx-auto mb-6" />

                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-header font-bold italic text-foreground">
                                    UNLOCK FILE
                                </h2>
                                <p className="text-muted-foreground text-sm mt-1">{file.name}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {/* File Preview (Mini) */}
                            <div className="flex gap-4 p-3 bg-card rounded-xl border border-border">
                                <div className="w-20 h-12 bg-muted rounded-lg overflow-hidden relative">
                                    {/* Placeholder for thumbnail */}
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <span className="text-xs">IMG</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-foreground">{file.name}</h4>
                                    <p className="text-xs text-muted-foreground">2.4MB • Feb 21, 2025</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xl font-bold text-foreground font-mono">$25</span>
                                </div>
                            </div>

                            {/* Total Price Display */}
                            <div className="bg-muted/50 rounded-xl p-4 border border-border/50 text-center">
                                <span className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Total to Pay</span>
                                <div className="text-4xl font-bold text-foreground font-header italic mt-2">
                                    $25.00
                                </div>
                            </div>

                            {/* Big Blue Pay Button */}
                            <button
                                onClick={onPay}
                                className="w-full py-4 bg-primary text-primary-foreground text-xl font-header font-bold italic rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:bg-primary/90 transition-all transform active:scale-95"
                            >
                                PAY NOW
                            </button>

                            <p className="text-center text-xs text-muted-foreground">
                                Secured by Paylink. Instant delivery upon payment.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
