"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingBag, X, FileText, Upload, DollarSign, Image as ImageIcon, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
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
        <div className="min-h-screen bg-background pb-32">
            {/* Minimal Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </Link>
                <div className="font-bold text-lg">New Product</div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-10">
                <form id="create-product-form" onSubmit={handleSubmit} className="space-y-10">

                    {/* Big Title Input */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Product Name"
                            className="w-full text-center text-3xl md:text-4xl font-black bg-transparent border-none placeholder:text-muted-foreground/30 focus:ring-0 p-0"
                            autoFocus
                            required
                        />
                        <div className="h-1 w-24 bg-primary mx-auto rounded-full opacity-20" />
                    </div>

                    {/* Price Bubble */}
                    <div className="flex justify-center">
                        <div className="bg-muted/30 rounded-full px-6 py-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="bg-transparent font-bold text-xl w-24 border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Images ({images.length}/5)</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                            {images.map((img, index) => (
                                <div key={index} className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden border border-border snap-start group">
                                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
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
                                    className="w-32 h-32 shrink-0 rounded-2xl bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center cursor-pointer snap-start gap-2"
                                >
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                                        <Plus className="w-5 h-5 text-muted-foreground" />
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

                    {/* Description Bubble */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Description</label>
                        <div className="bg-muted/30 rounded-3xl p-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your product..."
                                className="w-full bg-transparent border-none focus:ring-0 p-0 min-h-[150px] resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                                required
                            />
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">Digital Files ({files.length}/5)</label>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl group">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                                        <FileText className="w-5 h-5 text-primary" />
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
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {files.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-sm"
                                >
                                    <Upload className="w-4 h-4" />
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

                    {/* Floating Action Button */}
                    <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20">
                        <button
                            type="submit"
                            disabled={loading || !title || !description || !price}
                            className="w-full max-w-md py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    Publish Product
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
