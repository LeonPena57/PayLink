"use client";

import { useState } from "react";
import { ShoppingBag, Plus, Search, Filter } from "lucide-react";
import { CartModal } from "@/components/features/dashboard/CartModal";

export default function ShopPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const products = [
        { title: "Cyberpunk Overlay Pack", price: 25.00, sales: 124, color: "bg-cyan-500" },
        { title: "Cozy Vibes Emotes", price: 15.00, sales: 89, color: "bg-orange-500" },
        { title: "Twitch Panel Bundle", price: 10.00, sales: 256, color: "bg-purple-500" },
        { title: "Animated Alerts", price: 30.00, sales: 45, color: "bg-pink-500" },
        { title: "Stinger Transitions", price: 20.00, sales: 67, color: "bg-primary" },
        { title: "Stream Schedule Template", price: 5.00, sales: 312, color: "bg-green-500" },
    ];

    return (
        <div className="min-h-screen bg-background pb-32 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-header font-bold italic text-foreground tracking-tight">
                        Shop
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Browse premium digital assets.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-5 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        View Cart
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="flex-1 bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                    />
                </div>
                <button className="px-4 py-3 bg-card border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((item, index) => (
                    <div key={index} className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-card border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
                        <div className={`h-2/3 w-full ${item.color}/20 group-hover:${item.color}/30 transition-colors relative overflow-hidden`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShoppingBag className={`w-12 h-12 ${item.color.replace('bg-', 'text-')} opacity-50`} />
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between bg-card">
                            <div>
                                <h3 className="font-bold text-foreground text-lg leading-tight mb-1">{item.title}</h3>
                                <p className="text-xs text-muted-foreground">{item.sales} sales</p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                                <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
