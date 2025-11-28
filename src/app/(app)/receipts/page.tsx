"use client";

import { Search, Filter, Download, MoreHorizontal, ArrowUpRight, Package, Clock, CheckCircle2, AlertCircle, FolderOpen, MessageSquare, TrendingUp, DollarSign, Inbox } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Empty Data for No Data State
const ACTIVE_ORDERS: any[] = [];
const TRANSACTIONS: any[] = [];

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

            {/* Summary Cards (Desktop Only) */}
            <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">$0.00</div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">No data available</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Package className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Active Orders</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground mt-1">No active orders</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Completed</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground mt-1">Lifetime projects</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
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
                        {ACTIVE_ORDERS.length > 0 ? (
                            ACTIVE_ORDERS.map((order) => (
                                <div key={order.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
                                    {/* ... Order Card Content ... */}
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
                        <div className="hidden md:block bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5 min-h-[300px]">
                            {filteredTransactions.length > 0 ? (
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
                                                <tr key={tx.id} /* ... */>
                                                    {/* ... Transaction Row ... */}
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
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <div key={tx.id} /* ... */>
                                        {/* ... Mobile Transaction Card ... */}
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
