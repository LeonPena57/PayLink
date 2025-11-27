"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

interface AddPortfolioItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddPortfolioItemModal({ isOpen, onClose, onSuccess }: AddPortfolioItemModalProps) {
    const { user } = useUser();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [section, setSection] = useState("General");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !imageFile || !title) return;

        setLoading(true);
        try {
            // 1. Upload Image
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath);

            // 2. Insert Record
            const { error: insertError } = await supabase
                .from('portfolio_items')
                .insert({
                    user_id: user.id,
                    title,
                    description,
                    section,
                    image_url: publicUrl
                });

            if (insertError) throw insertError;

            onSuccess();
            onClose();
            // Reset form
            setTitle("");
            setDescription("");
            setSection("General");
            setImageFile(null);
            setPreviewUrl(null);

        } catch (error) {
            console.error("Error adding portfolio item:", error);
            alert("Failed to add project. Please try again.");
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold text-foreground">Add New Project</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video bg-muted/50 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-all relative overflow-hidden group"
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground font-medium">Click to upload image</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                    required={!previewUrl}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Project Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                                    placeholder="e.g. Neon Cyberpunk Character"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Section (Optional)</label>
                                <input
                                    type="text"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                                    placeholder="e.g. Character Design"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary resize-none h-20"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Add Project
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
