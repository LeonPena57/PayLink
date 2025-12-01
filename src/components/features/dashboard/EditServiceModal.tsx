"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";

interface EditServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: any;
    onUpdate: (updatedService: any) => void;
}

export function EditServiceModal({ isOpen, onClose, service, onUpdate }: EditServiceModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (service) {
            setTitle(service.title || "");
            setDescription(service.description || "");
            setPrice(service.price?.toString() || "");
            setThumbnailUrl(service.thumbnail_url || null);
        }
    }, [service]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalThumbnailUrl = service.thumbnail_url;

            if (thumbnailFile) {
                const fileExt = thumbnailFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `service-thumbnails/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('public_previews')
                    .upload(filePath, thumbnailFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('public_previews').getPublicUrl(filePath);
                finalThumbnailUrl = data.publicUrl;
            }

            const { data, error } = await supabase
                .from('services')
                .update({
                    title,
                    description,
                    price: parseFloat(price),
                    thumbnail_url: finalThumbnailUrl
                })
                .eq('id', service.id)
                .select()
                .single();

            if (error) throw error;

            toast("Service updated successfully", "success");
            onUpdate(data);
            onClose();
        } catch (error) {
            console.error("Error updating service:", error);
            toast("Failed to update service", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h2 className="text-2xl font-black">Edit Service</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Thumbnail Upload */}
                    <div className="flex justify-center">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-full h-48 bg-muted/30 rounded-3xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden"
                        >
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground">Upload Thumbnail</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 font-bold transition-all"
                                placeholder="Service Title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Price ($)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 font-bold transition-all"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 font-medium transition-all min-h-[100px] resize-none"
                                placeholder="Describe your service..."
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
