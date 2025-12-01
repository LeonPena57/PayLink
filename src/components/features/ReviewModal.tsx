"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    revieweeId: string;
    onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, orderId, revieweeId, onSuccess }: ReviewModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            toast("Please select a rating", "error");
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('reviews')
            .insert({
                order_id: orderId,
                buyer_id: user?.id,
                seller_id: revieweeId,
                rating,
                comment
            });

        if (error) {
            console.error(error);
            toast("Failed to submit review", "error");
        } else {
            toast("Review submitted successfully!", "success");
            if (onSuccess) onSuccess();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-foreground mb-2">Rate Your Experience</h2>
                    <p className="text-muted-foreground">How was working with this user?</p>
                </div>

                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={clsx(
                                    "w-10 h-10 transition-colors",
                                    (hoverRating || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-muted text-muted-foreground/30"
                                )}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your feedback (optional)..."
                    className="w-full bg-muted/30 rounded-xl p-4 min-h-[120px] mb-6 resize-none focus:ring-2 focus:ring-primary/20 border-none"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Review"}
                </button>
            </div>
        </div>
    );
}
