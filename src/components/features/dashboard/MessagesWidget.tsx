"use client";

import { useState } from "react";
import { Search, MoreVertical, Shield, User, Star, Clock, Check, Settings, Filter, Grid, ArrowDownAZ, ArrowUpAZ, ChevronRight } from "lucide-react";
import clsx from "clsx";

export function MessagesWidget() {
    const [activeFilter, setActiveFilter] = useState("Main");

    // Mock Messages Data
    const messages = [
        { id: 1, name: "FateCreates", message: "This is a preview text..", time: "2m", unread: true, category: "Main", avatar: "/avatars/fate.png", color: "bg-red-500" },
        { id: 2, name: "HaveFates", message: "This is a preview text..", time: "1h", unread: false, category: "Main", avatar: "/avatars/have.png", color: "bg-purple-500" },
        { id: 3, name: "FatesHave", message: "This is a preview text..", time: "3h", unread: false, category: "General", avatar: "/avatars/fates.png", color: "bg-white" },
        { id: 4, name: "New Client", message: "Hi, are you open for commissions?", time: "1d", unread: true, category: "Requests", avatar: "NC", color: "bg-green-500" },
        { id: 5, name: "Spam Bot", message: "Buy followers cheap!!!", time: "2d", unread: false, category: "Requests", avatar: "SB", color: "bg-red-500" },
    ];

    const filteredMessages = messages.filter(m => m.category === activeFilter);

    return (
        <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-header italic tracking-tight text-foreground">Messages</h1>
                <div className="flex gap-2">
                    <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Grid className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <ArrowDownAZ className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <ArrowUpAZ className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Message List */}
            <div className="space-y-4">
                {messages.slice(0, 3).map((msg) => (
                    <div key={msg.id} className="bg-card/95 backdrop-blur-sm border border-border/50 p-4 rounded-3xl flex items-center gap-4 shadow-lg shadow-black/5 hover:scale-[1.02] transition-all cursor-pointer group">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-white/20 to-transparent shrink-0">
                            <div className={`w-full h-full rounded-full ${msg.color} flex items-center justify-center overflow-hidden border-2 border-background`}>
                                {msg.avatar.length <= 2 ? (
                                    <span className="font-bold text-white text-lg">{msg.avatar}</span>
                                ) : (
                                    // Placeholder for actual image if path provided
                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                        <span className="font-bold text-white text-lg">{msg.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl text-foreground tracking-tight mb-1">{msg.name}</h3>
                            <p className="text-muted-foreground text-sm font-medium truncate">{msg.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-2 bg-muted/50 hover:bg-muted text-foreground font-bold text-sm rounded-xl transition-colors border border-border/50">
                                Read
                            </button>
                            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                    </div>
                ))}

                <div className="text-center py-8">
                    <p className="text-muted-foreground font-bold italic text-lg opacity-50">No more messages...</p>
                </div>
            </div>
        </div>
    );
}
