"use client";

import { useState } from "react";
import { X, ShieldAlert, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

export function DisputeModal({ isOpen, onClose, orderId }: DisputeModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('disputes')
                .insert({
                    order_id: orderId,
                    opener_id: user.id,
                    reason: reason,
                    status: 'open'
                });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason("");
            }, 2000);
        } catch (error) {
            console.error("Error opening dispute:", error);
            toast("Failed to open dispute", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-2 text-orange-500">
                        <ShieldAlert className="w-5 h-5" />
                        Open Dispute
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Dispute Opened</h3>
                        <p className="text-muted-foreground">
                            A support agent will review your case and contact you shortly. Funds are held securely.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="bg-orange-500/10 p-4 rounded-xl flex gap-3 items-start">
                            <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Opening a dispute will pause this order and hold funds. Please try to resolve the issue with the seller first.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Reason for dispute</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-muted/30 border-transparent focus:border-orange-500 focus:bg-background rounded-xl px-4 py-3 font-medium transition-all min-h-[120px] resize-none"
                                placeholder="Describe the issue in detail..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !reason.trim()}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                        >
                            {loading ? "Submitting..." : "Open Dispute"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
