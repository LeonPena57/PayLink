"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, DollarSign, Image as ImageIcon, X, Layers, AlignLeft } from "lucide-react";
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
        <div className="min-h-screen bg-muted/10 pb-32 md:pb-10">
            {/* Desktop Header */}
            <div className="hidden md:flex sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-8 py-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </Link>
                    <h1 className="font-bold text-xl">Create Service</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="px-4 py-2 font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !description || !price}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                                Publish Service
                                <Sparkles className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border">
                <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </Link>
                <div className="font-bold text-lg">New Service</div>
                <div className="w-10" />
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">

                    {/* Left Column: Main Content */}
                    <div className="space-y-6">

                        {/* Basic Info Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <AlignLeft className="w-5 h-5 text-primary" />
                                Service Details
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. I will design a modern logo for your brand"
                                    className="w-full text-lg font-medium bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl p-4 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your service in detail..."
                                    className="w-full min-h-[200px] bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl p-4 transition-all resize-y text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* Media Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                Media
                            </div>

                            {thumbnailPreview ? (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border group shadow-sm">
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
                                    className="aspect-video rounded-2xl bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer gap-4 group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
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
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">

                        {/* Price Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <DollarSign className="w-5 h-5 text-primary" />
                                Pricing
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Starting Price</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</div>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full text-lg font-bold bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl pl-8 p-4 transition-all"
                                        required
                                        min="5"
                                        step="1"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">Minimum price is $5.00</p>
                            </div>
                        </div>

                        {/* Category Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <Layers className="w-5 h-5 text-primary" />
                                Category
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                            category === cat
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </form>
            </div>

            {/* Mobile Publish Button (Fixed Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !title || !description || !price}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            Publish Service
                            <Sparkles className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
