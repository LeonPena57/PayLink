"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Link as LinkIcon, Twitter, Instagram, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
    const { user, refreshProfile } = useUser();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [evidenceText, setEvidenceText] = useState("");
    const [idFile, setIdFile] = useState<File | null>(null);
    const [links, setLinks] = useState({
        twitter: "",
        instagram: "",
        website: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            let idDocumentUrl = null;

            // Upload ID if present
            if (idFile) {
                const fileExt = idFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const { error: uploadError, data } = await supabase.storage
                    .from('verification_docs')
                    .upload(fileName, idFile);

                if (uploadError) throw uploadError;
                idDocumentUrl = data.path;
            }

            // 1. Create verification request
            const { error: requestError } = await supabase
                .from('verification_requests')
                .insert({
                    user_id: user.id,
                    evidence_text: evidenceText,
                    evidence_links: links,
                    id_document_url: idDocumentUrl,
                    status: 'pending'
                });

            if (requestError) throw requestError;

            // 2. Update profile status
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ verification_status: 'pending' })
                .eq('id', user.id);

            if (profileError) throw profileError;

            await refreshProfile();
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setEvidenceText("");
                setLinks({ twitter: "", instagram: "", website: "" });
                setIdFile(null);
            }, 2000);

        } catch (err: any) {
            console.error("Verification request failed:", err);
            setError(err.message || "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Check className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                                Request Verification
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">Request Submitted!</h3>
                                    <p className="text-muted-foreground">
                                        We've received your verification request. We'll review it shortly.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <div className="text-sm text-muted-foreground">
                                                <p className="font-bold text-foreground mb-1">Verification Requirements</p>
                                                To verify your identity, please either connect your existing social accounts OR upload a government-issued ID.
                                            </div>
                                        </div>

                                        {/* Option 1: Social Links */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground">Option 1: Connect Accounts</label>
                                            <p className="text-xs text-muted-foreground mb-2">Link your established presence on other platforms.</p>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <Twitter className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                                    <input
                                                        type="url"
                                                        placeholder="Twitter Profile URL"
                                                        value={links.twitter}
                                                        onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Instagram className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                                    <input
                                                        type="url"
                                                        placeholder="Instagram Profile URL"
                                                        value={links.instagram}
                                                        onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                                    <input
                                                        type="url"
                                                        placeholder="Personal Website / Portfolio"
                                                        value={links.website}
                                                        onChange={(e) => setLinks({ ...links, website: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-border" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                                            </div>
                                        </div>

                                        {/* Option 2: ID Upload */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground">Option 2: Upload ID</label>
                                            <p className="text-xs text-muted-foreground mb-2">Upload a photo of your government-issued ID (Driver's License, Passport).</p>
                                            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                {idFile ? (
                                                    <div className="flex items-center gap-2 text-primary font-bold">
                                                        <Check className="w-5 h-5" />
                                                        {idFile.name}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-2">
                                                            <LinkIcon className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">Click to upload ID</span>
                                                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <label className="text-sm font-bold text-foreground">Message to Reviewer</label>
                                            <textarea
                                                placeholder="Explain why you are requesting verification (e.g. 'I am the artist known as X', 'This is my business account')..."
                                                value={evidenceText}
                                                onChange={(e) => setEvidenceText(e.target.value)}
                                                className="w-full p-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] resize-none"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading || ((!links.twitter && !links.instagram && !links.website) && !idFile)}
                                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                "Submit Request"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
