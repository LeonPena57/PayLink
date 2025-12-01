"use client";

import { useState } from "react";
import { ShieldCheck, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    subtotal: number;
    isProcessing: boolean;
}

export function PaymentModal({ isOpen, onClose, onConfirm, subtotal, isProcessing }: PaymentModalProps) {
    const feePercentage = 0.05;
    const feeAmount = subtotal * feePercentage;
    const total = subtotal + feeAmount;

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">Confirm Payment</h2>
                            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal (Freelancer Rate)</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[#30D158]">
                                    <div className="flex items-center gap-2">
                                        <span>Secure Transaction Fee (5%)</span>
                                        <div className="group relative">
                                            <Info className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover border border-border rounded-lg text-[10px] text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                                                Funds held in Escrow until file delivery is verified.
                                            </div>
                                        </div>
                                    </div>
                                    <span>${feeAmount.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between text-xl font-bold text-foreground">
                                    <span>Total Due</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="bg-[#30D158]/10 border border-[#30D158]/20 rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#30D158] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-[#30D158]">100% Secure Transaction</h4>
                                    <p className="text-xs text-[#30D158]/80 mt-1">
                                        Your payment is protected. The freelancer only gets paid once you have successfully unlocked the file.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-muted/50 border-t border-border">
                            <button
                                onClick={onConfirm}
                                disabled={isProcessing}
                                className="w-full py-3 bg-[#30D158] hover:bg-[#2bc250] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#30D158]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    "Confirm & Pay"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
