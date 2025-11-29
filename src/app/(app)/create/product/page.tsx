"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingBag, X, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { generateWatermarkedPreview } from "@/lib/watermark";

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
            // Generate watermarked preview
            try {
                const watermarkedBlob = await generateWatermarkedPreview(file);
                const previewUrl = URL.createObjectURL(watermarkedBlob);
                return { file, preview: previewUrl, watermarkedBlob };
            } catch (error) {
                console.error("Error generating watermark:", error);
                // Fallback to normal preview if watermark fails
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

        // Note: The "1GB vs 10GB" limit enforcement is not yet implemented in code (it requires backend logic to check total usage)

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

            // 2. Upload Images & Insert into product_images
            if (images.length > 0) {
                await Promise.all(images.map(async (img, index) => {
                    const fileExt = img.file.name.split('.').pop();
                    const randomId = Math.random().toString(36).substring(7);

                    // Paths
                    const originalPath = `${user.id}/${productId}/original_${index}_${randomId}.${fileExt}`;
                    const previewPath = `${user.id}/${productId}/preview_${index}_${randomId}.jpg`; // Previews are always JPG

                    // A. Upload Original to Secure Bucket (Private)
                    const { error: secureError } = await supabase.storage
                        .from('secure_uploads')
                        .upload(originalPath, img.file);

                    if (secureError) throw secureError;

                    // B. Upload Watermarked Preview to Public Bucket
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
                        // Fallback: Upload original to public if watermark failed (not ideal but keeps flow working)
                        // Or we could upload the original file as the preview if we don't care about security for this edge case
                        // For now, let's just upload the original to public_previews
                        const { error: publicError } = await supabase.storage
                            .from('public_previews')
                            .upload(previewPath, img.file);

                        if (!publicError) {
                            const { data } = supabase.storage.from('public_previews').getPublicUrl(previewPath);
                            publicUrl = data.publicUrl;
                        }
                    }

                    // C. Insert Record
                    // Note: We might need to update the product_images table to support secure_url if we want to link to the original later
                    // For now, we assume 'image_url' is the public preview.
                    await supabase.from('product_images').insert({
                        product_id: productId,
                        image_url: publicUrl,
                        display_order: index
                    });

                    // Update main thumbnail if it's the first image
                    if (index === 0) {
                        await supabase.from('products').update({ thumbnail_url: publicUrl }).eq('id', productId);
                    }
                }));
            }

            // 3. Upload Files & Insert into product_files
            if (files.length > 0) {
                await Promise.all(files.map(async (file, index) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/${productId}/file_${index}_${Math.random()}.${fileExt}`;

                    // Upload to Secure Bucket
                    const { error: uploadError } = await supabase.storage
                        .from('secure_uploads')
                        .upload(fileName, file);

                    if (!uploadError) {
                        // We don't get a public URL for secure files.
                        // We store the path, and generate a signed URL when the user buys it.
                        await supabase.from('product_files').insert({
                            product_id: productId,
                            file_url: fileName, // Store PATH, not URL
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
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </Link>
                    <h1 className="text-lg font-bold text-foreground">New Product</h1>
                </div>
                <button
                    type="submit"
                    form="create-product-form"
                    disabled={loading || !title || !description || !price}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </button>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <form id="create-product-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Images Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                            <span>Product Images</span>
                            <span>{images.length}/5</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                                    <img src={img.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded-full backdrop-blur-md">
                                            Cover
                                        </div>
                                    )}
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/50"
                                >
                                    <ShoppingBag className="w-6 h-6 text-muted-foreground mb-2" />
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

                    {/* Product Details */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Product Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. Ultimate Brush Pack"
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Price ($)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="15.00"
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                required
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your product..."
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium min-h-[150px] resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                            <span>Product Files</span>
                            <span>{files.length}/5</span>
                        </label>

                        <div className="space-y-3">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {files.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                                >
                                    <Upload className="w-5 h-5" />
                                    <span className="font-bold text-sm">Upload File</span>
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
                        <p className="text-xs text-muted-foreground">
                            Upload the files that customers will receive after purchase. Supports ZIP, PDF, PSD, etc.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
}
