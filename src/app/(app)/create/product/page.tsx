"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, X, FileText, Upload, DollarSign, Sparkles, Plus, Image as ImageIcon, AlignLeft, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { generateWatermarkedPreview } from "@/lib/watermark";
import { clsx } from "clsx";

export default function CreateProductPage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    // Multiple Images
    const [images, setImages] = useState<{ file: File, preview: string, watermarkedBlob?: Blob }[]>([]);

    // Multiple Files
    const [files, setFiles] = useState<File[]>([]);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (images.length + selectedFiles.length > 5) {
            alert("You can only upload up to 5 images.");
            return;
        }

        const newImages = await Promise.all(selectedFiles.map(async (file) => {
            try {
                const watermarkedBlob = await generateWatermarkedPreview(file);
                const previewUrl = URL.createObjectURL(watermarkedBlob);
                return { file, preview: previewUrl, watermarkedBlob };
            } catch (error) {
                console.error("Error generating watermark:", error);
                return { file, preview: URL.createObjectURL(file) };
            }
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (files.length + selectedFiles.length > 5) {
            alert("You can only upload up to 5 files.");
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !description || !price) return;

        setLoading(true);
        try {
            // 1. Create Product
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert({
                    seller_id: user.id,
                    title,
                    description,
                    price: parseFloat(price),
                })
                .select()
                .single();

            if (productError) throw productError;
            const productId = product.id;

            // 2. Upload Images
            if (images.length > 0) {
                await Promise.all(images.map(async (img, index) => {
                    const fileExt = img.file.name.split('.').pop();
                    const randomId = Math.random().toString(36).substring(7);
                    const originalPath = `${user.id}/${productId}/original_${index}_${randomId}.${fileExt}`;
                    const previewPath = `${user.id}/${productId}/preview_${index}_${randomId}.jpg`;

                    const { error: secureError } = await supabase.storage
                        .from('secure_uploads')
                        .upload(originalPath, img.file);

                    if (secureError) throw secureError;

                    let publicUrl = "";
                    if (img.watermarkedBlob) {
                        const { error: publicError } = await supabase.storage
                            .from('public_previews')
                            .upload(previewPath, img.watermarkedBlob);

                        if (!publicError) {
                            const { data } = supabase.storage.from('public_previews').getPublicUrl(previewPath);
                            publicUrl = data.publicUrl;
                        }
                    } else {
                        const { error: publicError } = await supabase.storage
                            .from('public_previews')
                            .upload(previewPath, img.file);

                        if (!publicError) {
                            const { data } = supabase.storage.from('public_previews').getPublicUrl(previewPath);
                            publicUrl = data.publicUrl;
                        }
                    }

                    await supabase.from('product_images').insert({
                        product_id: productId,
                        image_url: publicUrl,
                        display_order: index
                    });

                    if (index === 0) {
                        await supabase.from('products').update({ thumbnail_url: publicUrl }).eq('id', productId);
                    }
                }));
            }

            // 3. Upload Files
            if (files.length > 0) {
                await Promise.all(files.map(async (file, index) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/${productId}/file_${index}_${Math.random()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('secure_uploads')
                        .upload(fileName, file);

                    if (!uploadError) {
                        await supabase.from('product_files').insert({
                            product_id: productId,
                            file_url: fileName,
                            file_name: file.name,
                            file_size: file.size
                        });
                    }
                }));
            }

            router.push('/home?tab=SHOP');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
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
                    <h1 className="font-bold text-xl">Create Product</h1>
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
                                Publish Product
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
                <div className="font-bold text-lg">New Product</div>
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
                                Product Details
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Product Name</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. 3D Model Pack Vol. 1"
                                    className="w-full text-lg font-medium bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl p-4 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your product..."
                                    className="w-full min-h-[200px] bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl p-4 transition-all resize-y text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* Images Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    Images
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">{images.length}/5</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-sm bg-muted/10">
                                        <Image src={img.preview} alt="" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 backdrop-blur-md"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-full backdrop-blur-md">
                                                Cover
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="aspect-square rounded-2xl bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer gap-2 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground">Add Image</span>
                                        <input
                                            type="file"
                                            ref={imageInputRef}
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Files Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <Package className="w-5 h-5 text-primary" />
                                    Digital Files
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">{files.length}/5</span>
                            </div>

                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl group border border-transparent hover:border-primary/20 transition-all">
                                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{file.name}</div>
                                            <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="p-2 text-muted-foreground/50 hover:text-destructive transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {files.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-sm group"
                                    >
                                        <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Upload File
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    multiple
                                />
                            </div>
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
                                <label className="text-sm font-bold text-muted-foreground ml-1">Price</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</div>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full text-lg font-bold bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl pl-8 p-4 transition-all"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
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
                            Publish Product
                            <Sparkles className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
