"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image as ImageIcon, X, Hash, Smile } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

const TAGS = ["Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation"];

export default function CreatePostPage() {
    const router = useRouter();
    const { user, profile } = useUser();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState(TAGS[0]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!user || !title || !image) return;

        setLoading(true);
        try {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `portfolio/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, image);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('public-images')
                .getPublicUrl(filePath);

            const { error } = await supabase
                .from('portfolio_items')
                .insert({
                    user_id: user.id,
                    title,
                    description,
                    image_url: publicUrl,
                    section: tag
                });

            if (error) throw error;

            router.push('/home?tab=PORTFOLIO');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
                <Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Cancel
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !title || !image}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </button>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:pt-8">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted overflow-hidden border border-border">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10" />
                            )}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Title (optional)"
                                className="w-full bg-transparent text-xl font-bold text-foreground placeholder:text-muted-foreground/50 border-none focus:ring-0 p-0"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's happening?"
                                className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/50 border-none focus:ring-0 p-0 min-h-[150px] resize-none leading-relaxed"
                            />
                        </div>

                        {/* Tag Selection */}
                        <div className="flex flex-wrap gap-2">
                            {TAGS.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTag(t)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${tag === t
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative rounded-2xl overflow-hidden border border-border group shadow-sm bg-muted/10">
                                <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-[500px]" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="pt-4 border-t border-border flex items-center gap-4 text-primary">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 -ml-2 rounded-full hover:bg-primary/10 transition-colors"
                                title="Add Image"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </div>
    );
}
