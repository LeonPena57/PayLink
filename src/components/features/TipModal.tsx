"use client";

import { useState } from "react";
import { X, DollarSign, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    receiverId: string;
    receiverName: string;
    receiverUsername: string;
}

export function TipModal({ isOpen, onClose, receiverId, receiverName, receiverUsername }: TipModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [amount, setAmount] = useState<number>(5);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleTip = async () => {
        if (!user) {
            toast("Please login to send a tip.", "error");
            return;
        }
        if (amount <= 0) {
            toast("Please enter a valid amount.", "error");
            return;
        }

        setLoading(true);

        // 1. Create Tip Record
        const { error } = await supabase
            .from('tips')
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                amount: amount,
                message: message,
                status: 'completed' // In a real app, this would be 'pending' until payment
            });

        if (error) {
            toast("Error sending tip", "error");
        } else {
            toast(`Successfully sent $${amount} to @${receiverUsername}!`, "success");
            onClose();
            setAmount(5);
            setMessage("");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border border-border">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-foreground">Send a Tip</h3>
                        <p className="text-sm text-muted-foreground">Support @{receiverUsername}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Amount Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        {[5, 10, 20].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={`py-3 rounded-xl font-bold border transition-all ${amount === val
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted/30 border-transparent hover:border-primary/50"
                                    }`}
                            >
                                ${val}
                            </button>
                        ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-muted/30 rounded-xl pl-10 pr-4 py-4 font-bold text-lg focus:ring-2 focus:ring-primary/20 border-none"
                            placeholder="Custom Amount"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-bold mb-2 block">Message (Optional)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-muted/30 rounded-xl p-4 min-h-[100px] text-sm font-medium focus:ring-2 focus:ring-primary/20 border-none resize-none"
                            placeholder="Say something nice..."
                        />
                    </div>

                    <button
                        onClick={handleTip}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send ${amount}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
