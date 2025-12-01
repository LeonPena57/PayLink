"use client";

import { useState } from "react";
import { X, AlertTriangle, Flag, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'user' | 'service' | 'product' | 'post' | 'order';
}

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
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
                .from('reports')
                .insert({
                    reporter_id: user.id,
                    target_id: targetId,
                    target_type: targetType,
                    reason: reason,
                    status: 'pending'
                });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason("");
            }, 2000);
        } catch (error) {
            console.error("Error submitting report:", error);
            toast("Failed to submit report", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-2 text-destructive">
                        <Flag className="w-5 h-5" />
                        Report Content
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
                        <h3 className="text-xl font-bold">Report Submitted</h3>
                        <p className="text-muted-foreground">
                            Thank you for keeping our community safe. We will review this shortly.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="bg-muted/30 p-4 rounded-xl flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                Reports are anonymous and serious. Please only report content that violates our community guidelines.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Reason for reporting</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-muted/30 border-transparent focus:border-destructive focus:bg-background rounded-xl px-4 py-3 font-medium transition-all min-h-[120px] resize-none"
                                placeholder="Please describe the issue..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !reason.trim()}
                            className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-destructive/20"
                        >
                            {loading ? "Submitting..." : "Submit Report"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
