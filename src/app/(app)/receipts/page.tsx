"use client";

import { Search, Package, Clock, CheckCircle2, AlertCircle, DollarSign, Copy, Plus, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function OrdersPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [searchQuery, setSearchQuery] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invoices, setInvoices] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);

    const fetchInvoices = useCallback(async () => {
        if (!user) return;

        const { data } = await supabase
            .from('invoices')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setInvoices(data);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        // Use setTimeout to avoid "synchronous setState" lint warning, though function is async
        const timer = setTimeout(() => {
            fetchInvoices();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchInvoices]);

    const deleteInvoice = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) {
            toast("Error deleting invoice", "error");
        } else {
            toast("Invoice deleted", "success");
            setInvoices(invoices.filter(inv => inv.id !== id));
        }
    };

    const copyLink = (id: string) => {
        const link = `${window.location.origin}/pay/${id}`;
        navigator.clipboard.writeText(link);
        toast("PayLink copied to clipboard!", "success");
    };

    const activeInvoices = invoices.filter(inv => inv.status === 'pending');
    const historyInvoices = invoices.filter(inv => inv.status !== 'pending');

    const filteredActive = activeInvoices.filter(tx =>
        (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredHistory = historyInvoices.filter(tx =>
        (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-32 p-4 md:p-8 max-w-5xl mx-auto">
            {/* Minimal Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-4 px-4 py-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/home" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </Link>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Orders</h1>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Summary Bubbles (Horizontal Scroll) */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 mb-8 custom-scrollbar snap-x">
                <div className="min-w-[160px] p-5 bg-muted/30 rounded-[2rem] snap-start">
                    <div className="flex items-center gap-2 mb-3 text-green-500">
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toFixed(0)}
                    </div>
                </div>
                <div className="min-w-[160px] p-5 bg-muted/30 rounded-[2rem] snap-start">
                    <div className="flex items-center gap-2 mb-3 text-blue-500">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Package className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{activeInvoices.length}</div>
                </div>
                <div className="min-w-[160px] p-5 bg-muted/30 rounded-[2rem] snap-start">
                    <div className="flex items-center gap-2 mb-3 text-purple-500">
                        <div className="p-2 bg-purple-500/10 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{historyInvoices.filter(i => i.status === 'paid').length}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-muted/30 rounded-full mb-8 w-fit">
                <button
                    onClick={() => setActiveTab("active")}
                    className={clsx(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all",
                        activeTab === "active" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Active
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={clsx(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all",
                        activeTab === "history" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    History
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === "active" ? (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {filteredActive.length > 0 ? (
                            filteredActive.map((invoice) => (
                                <Link href={`/pay/${invoice.id}`} key={invoice.id} className="block bg-muted/30 rounded-[2rem] p-5 animate-in slide-in-from-bottom-2 hover:bg-muted/50 transition-colors">
                                    <div className="flex gap-4">
                                        {/* Image Bubble */}
                                        <div className="relative w-16 h-16 bg-background rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                                            {invoice.items && invoice.items[0]?.image ? (
                                                <Image src={invoice.items[0].image} alt="" fill className="object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-muted-foreground/50" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                                    Pending
                                                </span>
                                                <span className="text-xs font-bold text-muted-foreground">#{invoice.id.slice(0, 4)}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground truncate">{invoice.description || "Untitled"}</h3>
                                            <div className="text-xl font-black text-foreground mt-0.5">${invoice.amount.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                copyLink(invoice.id);
                                            }}
                                            className="flex-1 py-3 bg-background rounded-xl font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteInvoice(invoice.id);
                                            }}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-20 space-y-4 opacity-50">
                                <Package className="w-12 h-12 mx-auto text-muted-foreground" />
                                <p className="font-bold text-muted-foreground">No active orders</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                    >
                        {/* Search Bubble */}
                        <div className="bg-muted/30 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search history..."
                                className="bg-transparent border-none focus:ring-0 p-0 w-full font-medium placeholder:text-muted-foreground/50"
                            />
                        </div>

                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((tx) => (
                                <Link href={`/pay/${tx.id}`} key={tx.id} className="bg-muted/30 rounded-3xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-2 hover:bg-muted/50 transition-colors block">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                        tx.status === 'paid' ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                                    )}>
                                        {tx.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-foreground truncate">{tx.description || "Untitled"}</div>
                                        <div className="text-xs text-muted-foreground font-medium">{new Date(tx.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-foreground">${tx.amount.toFixed(2)}</div>
                                        <div className={clsx(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            tx.status === 'paid' ? "text-green-500" : "text-muted-foreground"
                                        )}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-20 space-y-4 opacity-50">
                                <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
                                <p className="font-bold text-muted-foreground">No history found</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20 pointer-events-none">
                <Link
                    href="/create/invoice"
                    className="pointer-events-auto px-6 py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-6 h-6" />
                    New PayLink
                </Link>
            </div>
        </div>
    );
}
