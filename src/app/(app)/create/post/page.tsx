"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image as ImageIcon, X, Hash, Smile, MapPin, Calendar, Globe, Send } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";

const TAGS = ["Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation", "Sketch", "Tutorial"];

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
            {/* Minimal Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </Link>
                <div className="font-bold text-lg">New Post</div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-8">

                {/* User Info (Optional, adds context) */}
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary/10" />
                        )}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                        Posting as <span className="text-primary">@{profile?.username || 'user'}</span>
                    </div>
                </div>

                {/* Title Input */}
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="w-full text-3xl font-black bg-transparent border-none placeholder:text-muted-foreground/30 focus:ring-0 p-0"
                        autoFocus
                    />
                </div>

                {/* Description Input */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full bg-transparent text-lg border-none focus:ring-0 p-0 min-h-[120px] resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                    />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="relative rounded-3xl overflow-hidden border border-border group shadow-sm bg-muted/10 animate-in zoom-in-95 duration-300">
                        <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-[500px]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                            onClick={removeImage}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Tag Selection */}
                <div className="space-y-3 pt-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Select Topic
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {TAGS.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTag(t)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold transition-all border",
                                    tag === t
                                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Add Image"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-px bg-border" />
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                        <MapPin className="w-5 h-5" />
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                    accept="image/*"
                />

                {/* Floating Action Button */}
                <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !image}
                        className="w-full max-w-md py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                Post Now
                                <Send className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
