"use client";

import { Search, Filter, Download, MoreHorizontal, ArrowUpRight, Package, Clock, CheckCircle2, AlertCircle, FolderOpen, MessageSquare } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data for Active Orders
const ACTIVE_ORDERS = [
    {
        id: "ORD-2025-001",
        client: "FateCreates",
        project: "Stream Overlay Package",
        status: "In Progress",
        dueDate: "Feb 28, 2025",
        progress: 65,
        avatar: "F",
        driveLink: "/drive?orderId=ORD-2025-001",
        hubLink: "/project"
    },
    {
        id: "ORD-2025-004",
        client: "TechStart Inc",
        project: "App UI Redesign",
        status: "Review",
        dueDate: "Mar 05, 2025",
        progress: 90,
        avatar: "T",
        driveLink: "/drive?orderId=ORD-2025-004",
        hubLink: "/project"
    }
];

// Mock Data for Transaction History
const TRANSACTIONS = [
    {
        id: "TX-9823",
        client: "FateCreates",
        project: "Stream Overlay Package - Deposit",
        date: "Feb 22, 2025",
        amount: 49.00,
        status: "Paid",
        type: "incoming",
        avatar: "F"
    },
    {
        id: "TX-9822",
        client: "DesignStudio",
        project: "Logo Design",
        date: "Feb 21, 2025",
        amount: 150.00,
        status: "Pending",
        type: "incoming",
        avatar: "D"
    },
    {
        id: "TX-9821",
        client: "Adobe Creative Cloud",
        project: "Subscription",
        date: "Feb 20, 2025",
        amount: 54.99,
        status: "Paid",
        type: "outgoing",
        avatar: "A"
    },
    {
        id: "TX-9820",
        client: "Twitch Payout",
        project: "Ad Revenue",
        date: "Feb 18, 2025",
        amount: 234.50,
        status: "Paid",
        type: "incoming",
        avatar: "T"
    },
];

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");
    const [searchQuery, setSearchQuery] = useState("");

    const handleExport = () => {
        alert("Exporting CSV...");
    };

    const handleNewInvoice = () => {
        alert("Opening invoice creator...");
    };

    const handleFilter = () => {
        alert("Filter options would appear here.");
    };

    const handleDetails = (id: string) => {
        alert(`Opening details for transaction ${id}`);
    };

    const filteredTransactions = TRANSACTIONS.filter(tx =>
        tx.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                    <button
                        onClick={handleNewInvoice}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        New Invoice
                    </button>
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
                        {ACTIVE_ORDERS.map((order) => (
                            <div key={order.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/10 shadow-sm group-hover:scale-105 transition-transform">
                                            {order.avatar}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-foreground tracking-tight">{order.project}</h3>
                                            <p className="text-sm text-muted-foreground font-medium">{order.client}</p>
                                        </div>
                                    </div>
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-bold border shadow-sm whitespace-nowrap",
                                        order.status === "In Progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            order.status === "Review" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                                "bg-muted text-muted-foreground border-border"
                                    )}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Progress</span>
                                        <span className="font-mono font-bold text-primary">{order.progress}%</span>
                                    </div>
                                    <div className="w-full bg-muted/50 h-2.5 rounded-full overflow-hidden border border-border/50">
                                        <div
                                            className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                            style={{ width: `${order.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/30 w-fit px-3 py-1.5 rounded-lg">
                                        <Clock className="w-3.5 h-3.5" />
                                        Due {order.dueDate}
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3 relative z-10">
                                    <Link href={order.hubLink} className="flex-1">
                                        <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.98]">
                                            <MessageSquare className="w-4 h-4" />
                                            Project Hub
                                        </button>
                                    </Link>
                                    <Link href={order.driveLink} className="flex-1">
                                        <button className="w-full py-3 bg-card border border-border text-foreground rounded-xl font-bold text-sm hover:bg-muted transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:shadow-md">
                                            <FolderOpen className="w-4 h-4" />
                                            View Files
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* Add New Order Placeholder */}
                        <button onClick={handleNewInvoice} className="border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[250px] active:scale-[0.99]">
                            <div className="w-16 h-16 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Package className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-bold text-lg">Create New Order</span>
                        </button>
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
                        <div className="hidden md:block bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-6 py-5 font-semibold text-muted-foreground">Transaction ID</th>
                                            <th className="px-6 py-5 font-semibold text-muted-foreground">Date</th>
                                            <th className="px-6 py-5 font-semibold text-muted-foreground">Client / Project</th>
                                            <th className="px-6 py-5 font-semibold text-muted-foreground">Status</th>
                                            <th className="px-6 py-5 font-semibold text-muted-foreground text-right">Amount</th>
                                            <th className="px-6 py-5 font-semibold text-muted-foreground"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredTransactions.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                onClick={() => handleDetails(tx.id)}
                                                className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-5 font-mono text-muted-foreground group-hover:text-primary transition-colors font-medium">
                                                    {tx.id}
                                                </td>
                                                <td className="px-6 py-5 text-muted-foreground font-medium">
                                                    {tx.date}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs border border-border shadow-sm">
                                                            {tx.avatar}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{tx.project}</div>
                                                            <div className="text-xs text-muted-foreground font-medium">{tx.client}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                        tx.status === "Paid"
                                                            ? "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20"
                                                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                    )}>
                                                        {tx.status === "Paid" && <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />}
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-mono font-bold text-base">
                                                    <span className={tx.type === "incoming" ? "text-foreground" : "text-muted-foreground"}>
                                                        {tx.type === "incoming" ? "+" : "-"}${tx.amount.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDetails(tx.id); }}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination / Footer */}
                            <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium bg-muted/10">
                                <div>Showing {filteredTransactions.length} transactions</div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 font-bold" disabled>Previous</button>
                                    <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 font-bold" disabled>Next</button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Card List */}
                        <div className="md:hidden space-y-4">
                            {filteredTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    onClick={() => handleDetails(tx.id)}
                                    className="bg-card p-5 rounded-3xl border border-border active:scale-[0.98] transition-transform cursor-pointer shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-bold text-sm border border-border shadow-sm">
                                                {tx.avatar}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground text-sm">{tx.client}</div>
                                                <div className="text-xs text-muted-foreground font-medium">{tx.date}</div>
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            "font-mono font-bold text-base",
                                            tx.type === "incoming" ? "text-[#30D158]" : "text-foreground"
                                        )}>
                                            {tx.type === "incoming" ? "+" : "-"}${tx.amount.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                                tx.status === "Paid"
                                                    ? "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20"
                                                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                            )}>
                                                {tx.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono font-medium">{tx.id}</span>
                                        </div>
                                        <button className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg">
                                            Details <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
