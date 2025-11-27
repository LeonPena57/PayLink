"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Plus, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
    const [step, setStep] = useState(1);

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

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Create New Invoice
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Step {step} of 3: Client Details</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Placeholder */}
                        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                <FileText className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Invoice Builder</h3>
                            <p className="text-muted-foreground max-w-md">
                                This feature is currently being built. Soon you'll be able to create professional invoices, set milestones, and track payments directly from here.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-8">
                                <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                    <span className="font-medium text-foreground">Milestone Payments</span>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col items-center gap-2">
                                    <Calendar className="w-6 h-6 text-blue-500" />
                                    <span className="font-medium text-foreground">Recurring Billing</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                Notify Me When Ready
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
