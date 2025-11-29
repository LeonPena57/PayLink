"use client";

import { Search, Filter, Download, MoreHorizontal, ArrowUpRight, Package, Clock, CheckCircle2, AlertCircle, FolderOpen, MessageSquare, TrendingUp, DollarSign, Inbox, Copy, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function OrdersPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchInvoices();
        }
    }, [user]);

    const fetchInvoices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('seller_id', user!.id)
            .order('created_at', { ascending: false });

        if (data) {
            setInvoices(data);
        }
        setLoading(false);
    };

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

    const handleExport = () => {
        alert("Exporting CSV...");
    };

    const handleNewInvoice = () => {
        window.location.href = '/create/invoice';
    };

    const handleFilter = () => {
        alert("Filter options would appear here.");
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
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-background text-foreground pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-header font-bold italic tracking-tight">Orders & Receipts</h1>
                    <p className="text-muted-foreground text-sm mt-1">Track your active projects and transaction history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link
                        href="/create/invoice"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        New Invoice
                    </Link>
                </div>
            </div>

            {/* Summary Cards (Desktop Only) */}
            <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">
                        ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">Lifetime earnings</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Package className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Active Orders</span>
                    </div>
                    <div className="text-2xl font-bold">{activeInvoices.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Pending payment</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Completed</span>
                    </div>
                    <div className="text-2xl font-bold">{historyInvoices.filter(i => i.status === 'paid').length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Paid invoices</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-2xl font-bold">{activeInvoices.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Action required</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border mb-8">
                <button
                    onClick={() => setActiveTab("active")}
                    className={clsx(
                        "pb-4 text-sm font-bold tracking-wide transition-all relative",
                        activeTab === "active" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Active Orders
                    {activeTab === "active" && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={clsx(
                        "pb-4 text-sm font-bold tracking-wide transition-all relative",
                        activeTab === "history" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Transaction History
                    {activeTab === "history" && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {filteredActive.length > 0 ? (
                            filteredActive.map((invoice) => (
                                <div key={invoice.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
                                    <div className="flex gap-4 mb-4">
                                        {/* Image Preview */}
                                        <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0 border border-border">
                                            {invoice.items && invoice.items[0]?.image ? (
                                                <img src={invoice.items[0].image} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Package className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                                                    PENDING PAYMENT
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">#{invoice.id.slice(0, 8)}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground truncate">{invoice.description || "Untitled Invoice"}</h3>
                                            <div className="text-2xl font-black text-foreground mt-1">${invoice.amount.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-6">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Created {new Date(invoice.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => copyLink(invoice.id)}
                                            className="flex-1 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </button>
                                        <Link
                                            href={`/pay/${invoice.id}`}
                                            className="px-4 py-3 bg-card border border-border hover:bg-muted rounded-xl transition-colors flex items-center justify-center"
                                        >
                                            <ExternalLink className="w-4 h-4 text-foreground" />
                                        </Link>
                                        <button
                                            onClick={() => deleteInvoice(invoice.id)}
                                            className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-colors flex items-center justify-center"
                                            title="Delete Invoice"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">No Active Orders</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                        You don't have any orders in progress right now.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Add New Order Placeholder */}
                        <Link href="/create/invoice" className="border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[250px] active:scale-[0.99]">
                            <div className="w-16 h-16 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Package className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-bold text-lg">Create New PayLink</span>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Filters & Search */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search transactions..."
                                    className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="px-5 py-3 bg-card border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground shadow-sm"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Table Container (Desktop) */}
                        <div className="hidden md:block bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5 min-h-[300px]">
                            {filteredHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-6 py-5 font-semibold text-muted-foreground">ID</th>
                                                <th className="px-6 py-5 font-semibold text-muted-foreground">Date</th>
                                                <th className="px-6 py-5 font-semibold text-muted-foreground">Description</th>
                                                <th className="px-6 py-5 font-semibold text-muted-foreground">Status</th>
                                                <th className="px-6 py-5 font-semibold text-muted-foreground text-right">Amount</th>
                                                <th className="px-6 py-5 font-semibold text-muted-foreground"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {filteredHistory.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{tx.id.slice(0, 8)}</td>
                                                    <td className="px-6 py-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 font-medium">{tx.description}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                            tx.status === 'paid' ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                                                        )}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold">${tx.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                        <Inbox className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No transactions found.</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Card List */}
                        <div className="md:hidden space-y-4">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((tx) => (
                                    <div key={tx.id} className="bg-card border border-border rounded-2xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-foreground">{tx.description}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">${tx.amount.toFixed(2)}</div>
                                                <span className={clsx(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    tx.status === 'paid' ? "text-green-500" : "text-gray-500"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                    <p className="text-muted-foreground font-medium">No transactions found.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
