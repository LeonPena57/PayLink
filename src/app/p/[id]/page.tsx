"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Sun, Moon, Download, FileText, Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";


export default function PaylinkPage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const [order, setOrder] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [seller, setSeller] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [isPaid, setIsPaid] = useState(false); // Derived from order status
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock Data Fallback (for development/preview if ID doesn't exist)
    const MOCK_DATA = {
        seller: {
            username: "FATECREATES",
            avatar_url: null, // Replace with actual
        },
        items: [
            {
                id: "1",
                title: "Pokémon Overlay",
                size: "2.4MB",
                date: "Feb 21, 2025",
                price: 25.00,
                image: "https://images.unsplash.com/photo-1613771404798-606476e26f66?q=80&w=1000&auto=format&fit=crop"
            },
            {
                id: "2",
                title: "Pokémon Thumbnail",
                size: "2.4MB",
                date: "Feb 21, 2025",
                price: 25.00,
                image: "https://images.unsplash.com/photo-1627850604058-52e40de1b847?q=80&w=1000&auto=format&fit=crop"
            }
        ],
        total: 50.00,
        status: "incomplete" // or 'completed'
    };





    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            // Try to fetch real order
            const { data: orderData } = await supabase
                .from('orders')
                .select('*')
                .eq('id', params.id)
                .single();

            if (orderData) {
                setOrder(orderData);
                setIsPaid(orderData.status === 'completed' || orderData.status === 'delivered');

                // Fetch Seller
                const { data: sellerData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', orderData.seller_id)
                    .single();

                if (sellerData) setSeller(sellerData);

                // Parse items from JSONB or use mock if empty
                if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
                    setItems(orderData.items);
                } else {
                    // Fallback to service details if no items
                    // For now, let's use the mock items if real items are missing to show the UI
                    setItems(MOCK_DATA.items);
                }
            } else {
                // Use Mock Data if order not found (for demo purposes as requested)
                setSeller(MOCK_DATA.seller);
                setItems(MOCK_DATA.items);
                setOrder({ status: 'incomplete', price: MOCK_DATA.total });
            }
            setLoading(false);
        };
        fetchOrderDetails();
    }, [params.id]);

    const handlePayment = async () => {
        // Simulate payment
        setLoading(true);
        setTimeout(() => {
            setIsPaid(true);
            setLoading(false);
            // In real app, update DB here
        }, 1500);
    };

    if (loading && !seller) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
            {/* Navbar */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    {/* Hamburger Menu Icon (Mock) */}
                    <div className="space-y-1 cursor-pointer">
                        <div className="w-6 h-0.5 bg-current"></div>
                        <div className="w-6 h-0.5 bg-current"></div>
                        <div className="w-6 h-0.5 bg-current"></div>
                    </div>
                </div>

                <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
                    <div className="w-6 h-6 bg-current rounded-sm rotate-45" />
                    PAYLINK
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Bell className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">3</div>
                    </div>
                    {mounted && (
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 pb-20">
                {/* Seller Header */}
                <div className="flex items-center justify-center gap-3 mb-6 mt-4">
                    <h1 className="text-2xl font-black italic tracking-wider uppercase">{seller?.username || "SELLER"}</h1>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border flex items-center justify-center bg-muted">
                        {seller?.avatar_url ? (
                            <Image src={seller.avatar_url} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="border-[3px] border-primary rounded-3xl p-6 relative overflow-hidden bg-card">
                    {!isPaid ? (
                        /* UNPAID STATE */
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm italic truncate">{item.title}</h3>
                                        <div className="flex justify-between items-end mt-1">
                                            <div className="text-[10px] text-muted-foreground">
                                                <div>{item.size}</div>
                                                <div>{item.date}</div>
                                            </div>
                                            <div className="bg-muted/50 px-4 py-1 rounded-lg font-bold text-xl tracking-tight">
                                                ${item.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-center justify-center mt-8 mb-2">
                                <div className="bg-muted/80 px-6 py-2 rounded-lg font-black italic text-xl text-muted-foreground">
                                    TOTAL: <span className="text-foreground">${totalAmount}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all text-primary-foreground font-black italic text-3xl py-4 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest"
                            >
                                PAY
                            </button>
                        </div>
                    ) : (
                        /* PAID STATE */
                        <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black italic tracking-tight leading-none">
                                    Thanks for your<br />commission!
                                </h2>
                            </div>

                            <Link
                                href="/drive"
                                className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all text-primary-foreground font-black italic text-3xl py-4 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest text-center flex items-center justify-center"
                            >
                                TO FILES
                            </Link>
                        </div>
                    )}
                </div>

                {/* Items Seller Sent Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-black italic tracking-wider text-center mb-6 text-foreground">Items Seller Sent</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-card border border-primary/30 rounded-2xl p-3 flex flex-col gap-3">
                                <div className="aspect-video rounded-xl overflow-hidden bg-muted relative group cursor-pointer">
                                    <Image src={item.image} alt={item.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    {/* Overlay for file type/actions */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                        <Download className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-foreground">{item.title}</h3>
                                    <div className="flex justify-between items-end mt-1 text-[10px] text-muted-foreground">
                                        <div>
                                            <div>File Size</div>
                                            <div className="text-foreground">{item.size}</div>
                                        </div>
                                        <div className="text-right">
                                            <div>Date</div>
                                            <div className="text-foreground">{item.date}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation (Mock) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 z-50">
                <Link href="/home" className="flex flex-col items-center gap-1 opacity-100 hover:opacity-80">
                    <HomeIcon className="w-6 h-6 fill-current" />
                    <span className="text-[10px] font-bold">HOME</span>
                </Link>
                <Link href="/receipts" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100">
                    <FileText className="w-6 h-6" />
                    <span className="text-[10px] font-bold">RECEIPTS</span>
                </Link>
                <Link href="/create" className="flex flex-col items-center gap-1 opacity-100 hover:opacity-80 -mt-8">
                    <div className="w-12 h-12 bg-primary-foreground text-primary rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 bg-current rounded-sm rotate-45" /> {/* Plus icon mock */}
                    </div>
                    <span className="text-[10px] font-bold">UPLOAD</span>
                </Link>
                <Link href="/qr" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100">
                    <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
                        <div className="bg-current rounded-[1px]" />
                        <div className="bg-current rounded-[1px]" />
                        <div className="bg-current rounded-[1px]" />
                        <div className="bg-current rounded-[1px]" />
                    </div>
                    <span className="text-[10px] font-bold">QR CODE</span>
                </Link>
                <Link href="/account" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100">
                    <div className="w-6 h-6 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                        {seller?.avatar_url ? (
                            <Image src={seller.avatar_url} alt="Seller Avatar" fill className="object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold">ACCOUNT</span>
                </Link>
            </div>
        </div>
    );
}

function HomeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
    );
}
