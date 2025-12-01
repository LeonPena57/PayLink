"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, DollarSign, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";

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

    const categories = [
        "Graphic Design", "Digital Art", "Video Editing", "Writing", "Programming", "Music & Audio", "Business", "Other"
    ];

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

    const removeThumbnail = () => {
        setThumbnail(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
                    .from('public-images')
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
            {/* Minimal Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </Link>
                <div className="font-bold text-lg">New Service</div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-10">
                <form id="create-service-form" onSubmit={handleSubmit} className="space-y-10">

                    {/* Big Title Input */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="I will..."
                            className="w-full text-center text-3xl md:text-4xl font-black bg-transparent border-none placeholder:text-muted-foreground/30 focus:ring-0 p-0"
                            autoFocus
                            required
                        />
                        <div className="h-1 w-24 bg-primary mx-auto rounded-full opacity-20" />
                    </div>

                    {/* Price Bubble */}
                    <div className="flex justify-center">
                        <div className="bg-muted/30 rounded-full px-6 py-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mr-2">Starts at</span>
                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="bg-transparent font-bold text-xl w-24 border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50"
                                required
                                min="1"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Category Chips */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Category</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={clsx(
                                        "px-4 py-2 rounded-full text-sm font-bold transition-all shrink-0 snap-start border",
                                        category === cat
                                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Thumbnail Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Thumbnail</label>
                        {thumbnailPreview ? (
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-border group shadow-sm">
                                <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <button
                                    type="button"
                                    onClick={removeThumbnail}
                                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video rounded-3xl bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center cursor-pointer gap-3 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-foreground">Upload Thumbnail</p>
                                    <p className="text-xs text-muted-foreground mt-1">16:9 Recommended</p>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    {/* Description Bubble */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Description</label>
                        <div className="bg-muted/30 rounded-3xl p-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your service, what's included, and your process..."
                                className="w-full bg-transparent border-none focus:ring-0 p-0 min-h-[200px] resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                                required
                            />
                        </div>
                    </div>

                    {/* Floating Action Button */}
                    <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20">
                        <button
                            type="submit"
                            disabled={loading || !title || !description || !price}
                            className="w-full max-w-md py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    Publish Service
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
