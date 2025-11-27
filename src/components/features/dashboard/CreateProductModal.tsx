"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold text-foreground">Create Product</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">Coming Soon</h3>
                            <p className="text-muted-foreground">
                                Product creation will be available in the next update. You will be able to sell digital assets, files, and services.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all mt-4"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
