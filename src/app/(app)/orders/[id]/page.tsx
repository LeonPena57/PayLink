"use client";

import { useState, useEffect, useRef, use } from "react";
import { v4 as uuidv4 } from 'uuid';

import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Upload,
    Check,
    FileText,
    Send,
    X
} from "lucide-react";
import { OrderTimeline } from "@/components/features/OrderTimeline";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import clsx from "clsx";
import { DisputeModal } from "@/components/features/DisputeModal";
import { ReviewModal } from "@/components/features/ReviewModal";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "@/components/ui/Confetti";
import { checkAndPromoteUser } from "@/lib/gamification";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: orderId } = use(params);
    const { user } = useUser();
    const { toast } = useToast();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [requirements, setRequirements] = useState("");
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [revisionComment, setRevisionComment] = useState("");
    const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchOrder = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                service:services(*),
                buyer:buyer_id(*),
                seller:seller_id(*)
            `)
            .eq('id', orderId)
            .single();

        if (error) {
            console.error("Error fetching order:", error);
            // toast("Error loading order", "error");
        } else {
            setOrder(data);
        }
        setLoading(false);
    };

    const fetchReviewStatus = async () => {
        if (!user || !orderId) return;
        const { data } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', orderId)
            .eq('buyer_id', user.id)
            .single();

        if (data) setHasReviewed(true);
    };

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    useEffect(() => {
        if (user && orderId) {
            fetchOrder();
            fetchMessages();
            fetchReviewStatus();

            // Subscribe to changes
            const channel = supabase
                .channel(`order-${orderId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () => {
                    fetchOrder();
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, orderId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const { error } = await supabase.from('messages').insert({
            order_id: orderId,
            sender_id: user.id,
            content: newMessage.trim()
        });

        if (error) {
            toast("Failed to send message", "error");
            console.error(error);
        } else {
            setNewMessage("");
        }
    };

    const submitRequirements = async () => {
        if (!requirements.trim()) return;

        const { error } = await supabase
            .from('orders')
            .update({
                status: 'in_progress',
                requirements_data: { text: requirements },
                started_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            toast("Error submitting requirements", "error");
        } else {
            toast("Requirements submitted! Order started.", "success");
            fetchOrder();
        }
    };

    const deliverWork = async () => {
        if (!deliveryFile) {
            toast("Please upload a file to deliver.", "error");
            return;
        }

        setLoading(true); // Re-use loading state or create a specific one
        const fileExt = deliveryFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${orderId}/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('deliveries')
            .upload(filePath, deliveryFile);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            toast("Error uploading file", "error");
            setLoading(false);
            return;
        }

        // 2. Record in order_files
        const { error: dbError } = await supabase
            .from('order_files')
            .insert({
                order_id: orderId,
                uploader_id: user?.id,
                file_name: deliveryFile.name,
                file_path: filePath,
                file_size: deliveryFile.size,
                file_type: deliveryFile.type
            });

        if (dbError) {
            console.error("DB error:", dbError);
            toast("Error saving file info", "error");
            setLoading(false);
            return;
        }

        // 3. Update Order Status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'delivered',
                delivered_at: new Date().toISOString()
            })
            .eq('id', orderId);

        setLoading(false);

        if (updateError) {
            toast("Error updating order status", "error");
        } else {
            toast("Work delivered successfully!", "success");
            setDeliveryFile(null);
            fetchOrder();
        }
    };

    const acceptDelivery = async () => {
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            toast("Error accepting delivery", "error");
        } else {
            toast("Order completed! Please leave a review.", "success");
            fetchOrder();
            setIsReviewModalOpen(true);

            // Check for promotion
            if (order.seller_id) {
                checkAndPromoteUser(order.seller_id);
            }
        }
    };

    const requestRevision = async () => {
        if (!revisionComment.trim()) return;

        const { error } = await supabase
            .from('orders')
            .update({
                status: 'revision'
            })
            .eq('id', orderId);

        // Also insert into order_revisions table
        await supabase.from('order_revisions').insert({
            order_id: orderId,
            requester_id: user?.id,
            comment: revisionComment
        });

        if (error) {
            toast("Error requesting revision", "error");
        } else {
            toast("Revision requested.", "success");
            setIsRevisionModalOpen(false);
            fetchOrder();
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

    const isBuyer = user?.id === order.buyer_id;
    const isSeller = user?.id === order.seller_id;
    const otherParty = isBuyer ? order.seller : order.buyer;

    return (
        <div className="min-h-screen bg-background pb-32">
            {order.status === 'completed' && <Confetti />}
            <DisputeModal isOpen={isDisputeOpen} onClose={() => setIsDisputeOpen(false)} orderId={orderId} />

            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/receipts" className="p-2 hover:bg-muted rounded-full transition-colors">
                            <AlertCircle className="w-5 h-5 rotate-180" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Order #{order.id.slice(0, 8)}</h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                {order.service?.title || "Custom Order"}
                                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                                <span className="font-bold text-primary">${order.amount}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.div
                            key={order.status}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={clsx(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                                order.status === 'completed' ? "bg-green-500/10 text-green-500" :
                                    order.status === 'in_progress' ? "bg-blue-500/10 text-blue-500" :
                                        "bg-orange-500/10 text-orange-500"
                            )}>
                            {order.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {order.status.replace('_', ' ')}
                        </motion.div>
                        <button
                            onClick={() => setIsDisputeOpen(true)}
                            className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Report Problem
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column: Order Context */}
                <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                    <OrderTimeline
                        status={order.status}
                        createdAt={order.created_at}
                        requirementsSubmittedAt={order.started_at} // Using started_at as proxy for requirements submitted
                        deliveredAt={order.delivered_at}
                        completedAt={order.completed_at}
                    />

                    {/* Status Actions */}
                    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Action Required</h2>

                        {/* PENDING REQUIREMENTS */}
                        {order.status === 'pending_requirements' && (
                            <div className="space-y-4">
                                <div className="bg-orange-500/10 text-orange-600 p-4 rounded-2xl flex gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">
                                        {isBuyer ? "Please submit the requirements to start the order." : "Waiting for buyer to submit requirements."}
                                    </p>
                                </div>
                                {isBuyer && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold">Requirements</label>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            className="w-full bg-muted/30 rounded-xl p-3 min-h-[100px] text-sm"
                                            placeholder="Describe what you need..."
                                        />
                                        <button
                                            onClick={submitRequirements}
                                            className="w-full py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
                                        >
                                            Start Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* IN PROGRESS */}
                        {order.status === 'in_progress' && (
                            <div className="space-y-4">
                                <div className="bg-blue-500/10 text-blue-600 p-4 rounded-2xl flex gap-3">
                                    <Clock className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">
                                        Order is in progress. Expected delivery: {new Date(Date.now() + 86400000 * 3).toLocaleDateString()}
                                    </p>
                                </div>
                                {isSeller && (
                                    <div className="space-y-3">
                                        <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                                            />
                                            {deliveryFile ? (
                                                <div className="flex items-center gap-2 text-primary font-bold">
                                                    <FileText className="w-6 h-6" />
                                                    {deliveryFile.name}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setDeliveryFile(null);
                                                        }}
                                                        className="p-1 hover:bg-red-500/10 text-red-500 rounded-full z-10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                                    <p className="text-sm font-bold text-foreground">Upload Deliverables</p>
                                                    <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={deliverWork}
                                            disabled={!deliveryFile}
                                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Deliver Work
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DELIVERED */}
                        {order.status === 'delivered' && (
                            <div className="space-y-4">
                                <div className="bg-purple-500/10 text-purple-600 p-4 rounded-2xl flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">
                                        {isSeller ? "Work delivered! Waiting for buyer approval." : "Seller has delivered the work. Please review."}
                                    </p>
                                </div>
                                {isBuyer && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setIsRevisionModalOpen(true)}
                                            className="py-2 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80"
                                        >
                                            Request Revision
                                        </button>
                                        <button
                                            onClick={acceptDelivery}
                                            className="py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600"
                                        >
                                            Accept & Complete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* COMPLETED */}
                        {order.status === 'completed' && (
                            <div className="space-y-4">
                                <div className="bg-green-500/10 text-green-600 p-4 rounded-2xl flex gap-3">
                                    <Check className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">
                                        Order completed! Funds have been released.
                                    </p>
                                </div>
                                {isBuyer && !hasReviewed && (
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        Leave a Review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Requirements Data Display */}
                    {order.requirements_data && (
                        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Requirements
                            </h3>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
                                {order.requirements_data.text}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Chat/Activity */}
                <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm flex flex-col h-[500px] md:h-[600px] overflow-hidden order-1 lg:order-2">
                    <div className="p-4 border-b border-border bg-muted/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {otherParty?.avatar_url ? (
                                <Image src={otherParty.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                <div className="font-bold text-muted-foreground">{otherParty?.full_name?.[0]}</div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-foreground">{otherParty?.full_name}</div>
                            <div className="text-xs text-muted-foreground">@{otherParty?.username}</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* System Message */}
                        <div className="flex justify-center">
                            <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
                                Order started {new Date(order.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {messages.map((msg: any) => (
                            <div key={msg.id} className={clsx("flex gap-3", msg.sender_id === user?.id ? "flex-row-reverse" : "")}>
                                <div className={clsx(
                                    "p-3 rounded-2xl max-w-[80%] text-sm",
                                    msg.sender_id === user?.id
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted text-foreground rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-border bg-background">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-muted/30 border-none rounded-xl px-4 focus:ring-2 focus:ring-primary/20"
                            />
                            <button type="submit" className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Revision Modal */}
            {isRevisionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4">Request Revision</h3>
                        <textarea
                            value={revisionComment}
                            onChange={(e) => setRevisionComment(e.target.value)}
                            className="w-full bg-muted/30 rounded-xl p-3 min-h-[120px] mb-4"
                            placeholder="What needs to be changed?"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsRevisionModalOpen(false)}
                                className="flex-1 py-3 bg-muted rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={requestRevision}
                                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                orderId={orderId}
                revieweeId={order.seller_id}
                onSuccess={() => setHasReviewed(true)}
            />
        </div>
    );
}
