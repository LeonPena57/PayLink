"use client";

import { X, ShoppingBag, Trash2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
    // Mock Cart Items
    const cartItems = [
        { id: 1, title: "Cyberpunk Overlay Pack", price: 25.00, image: "bg-cyan-500" },
        { id: 2, title: "Twitch Panel Bundle", price: 10.00, image: "bg-purple-500" },
    ];

    const total = cartItems.reduce((acc, item) => acc + item.price, 0);

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
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
                                        <div className={`w-20 h-20 rounded-xl ${item.image} opacity-80 flex items-center justify-center shrink-0`}>
                                            <ShoppingBag className="text-white/50 w-8 h-8" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-foreground line-clamp-1">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">Digital Product</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                                                <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                                    <ShoppingBag className="w-16 h-16 opacity-20" />
                                    <p>Your cart is empty.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-card/50 backdrop-blur-xl space-y-4">
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span className="text-muted-foreground">Total</span>
                                <span className="text-foreground">${total.toFixed(2)}</span>
                            </div>
                            <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.98]">
                                <CreditCard className="w-5 h-5" />
                                Checkout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
