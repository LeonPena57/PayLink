"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";
import { Plus, Search, Clock, DollarSign, MapPin, Briefcase, Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";

export default function BuyerRequestsPage() {
    const { user, userMode } = useUser();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Digital Art");
    const [budget, setBudget] = useState("");
    const [days, setDays] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('buyer_requests')
            .select(`
                *,
                profiles:buyer_id(full_name, username, avatar_url, seller_level)
            `)
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreateRequest = async () => {
        if (!user || !title || !description || !budget || !days) return;

        const { error } = await supabase
            .from('buyer_requests')
            .insert({
                buyer_id: user.id,
                title,
                description,
                category,
                budget: parseFloat(budget),
                delivery_days: parseInt(days)
            });

        if (!error) {
            setIsCreateModalOpen(false);
            setTitle("");
            setDescription("");
            setBudget("");
            setDays("");
            fetchRequests();
        }
    };

    const handleContactBuyer = (buyerId: string, requestTitle: string) => {
        if (!user) return;
        // Pre-fill message or just open chat
        router.push(`/messages?chat_with=${buyerId}`);
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-black tracking-tight">Buyer Requests</h1>
                    {userMode === 'BUYER' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Post Request
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border rounded-[2.5rem] bg-muted/30">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">No Requests Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Be the first to post a request or check back later.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((req) => (
                            <div key={req.id} className="group bg-card rounded-[2rem] border border-border p-6 hover:shadow-xl transition-all flex flex-col relative overflow-hidden">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={req.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${req.profiles?.full_name}`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{req.profiles?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">@{req.profiles?.username}</div>
                                        </div>
                                    </div>
                                    <div className="bg-muted px-3 py-1 rounded-full text-xs font-bold text-muted-foreground">
                                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{req.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">{req.description}</p>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        {req.delivery_days} Days
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-lg">
                                        <DollarSign className="w-4 h-4" />
                                        {req.budget}
                                    </div>
                                    <div className="ml-auto text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                        {req.category}
                                    </div>
                                </div>

                                {userMode === 'SELLER' && user?.id !== req.buyer_id && (
                                    <button
                                        onClick={() => handleContactBuyer(req.buyer_id, req.title)}
                                        className="w-full py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        Send Offer
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-2xl p-8 animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-black mb-6">Post a Request</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="I need a logo for my coffee shop..."
                                    className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe exactly what you are looking for..."
                                    className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 min-h-[120px] font-medium focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Budget ($)</label>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder="50"
                                        className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Delivery (Days)</label>
                                    <input
                                        type="number"
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                        placeholder="3"
                                        className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1 block">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 appearance-none"
                                >
                                    {["Digital Art", "Graphic Design", "Web Development", "Writing", "Video Editing", "Music & Audio"].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleCreateRequest}
                                disabled={!title || !description || !budget || !days}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                Post Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
