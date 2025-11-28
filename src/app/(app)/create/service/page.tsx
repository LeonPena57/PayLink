"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

export default function CreateServicePage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Graphic Design");
    const [price, setPrice] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !description || !price) return;

        setLoading(true);
        try {
            let thumbnailUrl = null;

            if (thumbnail) {
                const fileExt = thumbnail.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `service-thumbnails/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('public-images') // Assuming this bucket exists
                    .upload(filePath, thumbnail);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('public-images')
                    .getPublicUrl(filePath);

                thumbnailUrl = publicUrl;
            }

            // 1. Create Service
            const { data: serviceData, error: serviceError } = await supabase
                .from('services')
                .insert({
                    seller_id: user.id,
                    title,
                    description,
                    category,
                    thumbnail_url: thumbnailUrl
                })
                .select()
                .single();

            if (serviceError) throw serviceError;

            // 2. Create Basic Tier (Default)
            const { error: tierError } = await supabase
                .from('service_tiers')
                .insert({
                    service_id: serviceData.id,
                    name: 'Basic',
                    description: 'Standard package',
                    price: parseFloat(price),
                    delivery_days: 3,
                    revisions: 1
                });

            if (tierError) throw tierError;

            router.push('/home?tab=SERVICES');
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </Link>
                    <h1 className="text-lg font-bold text-foreground">New Service</h1>
                </div>
                <button
                    type="submit"
                    form="create-service-form"
                    disabled={loading || !title || !description || !price}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </button>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <form id="create-service-form" onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Thumbnail</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative"
                        >
                            {thumbnailPreview ? (
                                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">Click to upload thumbnail</p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="I will design a..."
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none"
                            >
                                <option>Graphic Design</option>
                                <option>Digital Art</option>
                                <option>Video Editing</option>
                                <option>Writing</option>
                                <option>Programming</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Starting Price ($)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="50.00"
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                required
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your service..."
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium min-h-[150px] resize-none"
                                required
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
