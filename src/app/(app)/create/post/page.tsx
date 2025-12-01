"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image as ImageIcon, X, Hash, MapPin, Calendar, Send, ChevronLeft, ChevronRight, Globe, Lock, Tag, Clock, Smile } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

const TAGS = ["Digital Art", "Graphic Design", "Photography", "3D Modeling", "Animation", "Sketch", "Tutorial", "Other"];

export default function CreatePostPage() {
    const router = useRouter();
    const { user, profile } = useUser();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState(TAGS[0]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Schedule State
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Tag State
    const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);

    const [showLocation, setShowLocation] = useState(false);
    const [location, setLocation] = useState("");
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
                    section: tag,
                    scheduled_at: scheduledDate || null,
                    location: location || null
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

    // Calendar Helpers
    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    const handleDateSelect = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        setScheduledDate(adjustedDate.toISOString().split('T')[0]);
        setIsDatePickerOpen(false);
    };

    return (
        <div className="min-h-screen bg-muted/10 md:flex md:items-center md:justify-center md:h-screen">

            {/* =================================================================================
               MOBILE LAYOUT (Restored Original Look)
               Visible only on md:hidden
               ================================================================================= */}
            <div className="md:hidden w-full min-h-screen flex flex-col relative">
                {/* Mobile Header */}
                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
                    <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </Link>
                    <div className="font-bold text-lg">New Post</div>
                    <div className="w-10" />
                </div>

                <div className="flex-1 p-4 space-y-6 pb-32">
                    {/* User Info Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} alt="User" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">@{profile?.username || 'user'}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full w-fit">
                                <Globe className="w-3 h-3" />
                                <span>Public</span>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your post a title..."
                            className="w-full text-2xl font-black bg-transparent border-none placeholder:text-muted-foreground/30 focus:ring-0 p-0"
                            autoFocus
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-transparent text-lg border-none focus:ring-0 p-0 min-h-[100px] resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                        />
                    </div>

                    {/* Image Preview (Mobile) */}
                    {imagePreview && (
                        <div className="relative rounded-3xl overflow-hidden border border-border shadow-sm">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                width={500}
                                height={500}
                                className="w-full h-auto object-cover"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Actions & Chips */}
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                        {/* Add Photo */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-foreground">Photo</span>
                        </button>

                        {/* Location */}
                        {(showLocation || location) ? (
                            <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
                                <MapPin className="w-4 h-4 text-primary" />
                                {showLocation && !location ? (
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="City..."
                                        className="bg-transparent border-none p-0 text-sm font-bold text-primary placeholder:text-primary/50 focus:ring-0 w-24"
                                        autoFocus
                                        onBlur={() => { if (!location) setShowLocation(false); }}
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-primary">{location}</span>
                                )}
                                <button onClick={() => { setLocation(""); setShowLocation(false); }} className="ml-1"><X className="w-3 h-3 text-primary/50" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowLocation(true)}
                                className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">Location</span>
                            </button>
                        )}

                        {/* Schedule */}
                        {scheduledDate ? (
                            <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-primary">{format(new Date(scheduledDate), 'MMM d')}</span>
                                <button onClick={() => setScheduledDate("")} className="ml-1"><X className="w-3 h-3 text-primary/50" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsDatePickerOpen(true)}
                                className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">Schedule</span>
                            </button>
                        )}

                        {/* Tag */}
                        <button
                            onClick={() => setIsTagPickerOpen(true)}
                            className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                            <Hash className="w-4 h-4 text-primary" />
                            <div className="text-sm font-bold text-foreground">{tag}</div>
                        </button>
                    </div>
                </div>

                {/* Mobile Post Button (Fixed Bottom) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border z-40">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !image}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-[2.5rem] font-black text-xl shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                Post Now
                                <Send className="w-6 h-6" />
                            </>
                        )}
                    </button>
                </div>
            </div>


            {/* =================================================================================
               DESKTOP LAYOUT (New Split Pane)
               Visible only on md:flex
               ================================================================================= */}
            <div className="hidden md:flex w-full h-full md:max-w-6xl md:h-[85vh] bg-background md:rounded-3xl md:shadow-2xl md:border border-border overflow-hidden flex-col md:flex-row">

                {/* Left Column: Media */}
                <div className="w-full md:w-[60%] bg-muted/30 flex flex-col relative border-b md:border-b-0 md:border-r border-border">
                    {/* Image Area */}
                    <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-dots-pattern relative">
                        {imagePreview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full border-3 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                            >
                                <div className="w-24 h-24 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-black text-foreground">Drag photos here</h3>
                                    <p className="text-muted-foreground mt-2">or click to browse</p>
                                </div>
                                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm mt-2">
                                    Select from computer
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="w-full md:w-[40%] flex flex-col bg-background h-full">
                    {/* Desktop Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="font-bold text-lg">Create new post</div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !title || !image}
                            className="text-primary font-bold text-sm hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sharing..." : "Share"}
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                                {profile?.avatar_url ? (
                                    <Image src={profile.avatar_url} alt="User" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10" />
                                )}
                            </div>
                            <div className="font-bold text-sm">@{profile?.username || 'user'}</div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Write a title..."
                                className="w-full text-xl font-bold bg-transparent border-none placeholder:text-muted-foreground/50 focus:ring-0 p-0"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Write a caption..."
                                className="w-full bg-transparent text-base border-none focus:ring-0 p-0 min-h-[150px] resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground border-b border-border pb-4">
                                <Smile className="w-5 h-5 cursor-pointer hover:text-foreground" />
                                <span>{description.length}/2,200</span>
                            </div>
                        </div>

                        {/* Settings List */}
                        <div className="space-y-0 divide-y divide-border">
                            {/* Location */}
                            <div className="py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-bold text-muted-foreground">Add Location</div>
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Where was this taken?"
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
                                />
                            </div>

                            {/* Schedule */}
                            <div className="py-3">
                                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setIsDatePickerOpen(true)}>
                                    <div className="text-sm font-bold text-muted-foreground">Schedule Post</div>
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                </div>
                                {scheduledDate ? (
                                    <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                                        <span className="text-sm font-bold text-primary">{format(new Date(scheduledDate), 'MMM d, yyyy')}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setScheduledDate(""); }}><X className="w-4 h-4 text-primary" /></button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground/50 italic cursor-pointer" onClick={() => setIsDatePickerOpen(true)}>Post immediately</div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="py-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-bold text-muted-foreground">Topic</div>
                                    <Hash className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTag(t)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                                tag === t
                                                    ? "bg-foreground text-background border-foreground"
                                                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
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

            {/* Date Picker Modal (Shared) */}
            {isDatePickerOpen && (
                <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-background/95 backdrop-blur-xl border-t md:border border-border w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsDatePickerOpen(false)}>
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black">Schedule Post</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="font-bold text-sm w-32 text-center">
                                        {format(currentMonth, 'MMMM yyyy')}
                                    </span>
                                    <button
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-xs font-bold text-muted-foreground uppercase py-2">
                                        {day}
                                    </div>
                                ))}
                                {daysInMonth.map((date, i) => {
                                    const isSelected = scheduledDate && isSameDay(new Date(scheduledDate), date);
                                    const isCurrentMonth = isSameDay(date, startOfMonth(currentMonth)) || (date >= startOfMonth(currentMonth) && date <= endOfMonth(currentMonth));

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleDateSelect(date)}
                                            className={clsx(
                                                "aspect-square rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                                !isCurrentMonth && "opacity-30",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                                    : "hover:bg-muted text-foreground",
                                                isToday(date) && !isSelected && "text-primary ring-1 ring-primary ring-inset"
                                            )}
                                        >
                                            {format(date, 'd')}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => handleDateSelect(addDays(new Date(), 1))}
                                    className="py-3 rounded-xl bg-muted/50 hover:bg-muted text-sm font-bold transition-colors"
                                >
                                    Tomorrow
                                </button>
                                <button
                                    onClick={() => handleDateSelect(addDays(new Date(), 7))}
                                    className="py-3 rounded-xl bg-muted/50 hover:bg-muted text-sm font-bold transition-colors"
                                >
                                    Next Week
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsDatePickerOpen(false)} />
                </div>
            )}

            {/* Tag Picker Modal (Shared) */}
            {isTagPickerOpen && (
                <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-background/95 backdrop-blur-xl border-t md:border border-border w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300 max-h-[70vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsTagPickerOpen(false)}>
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black">Select Topic</h3>
                                <button onClick={() => setIsTagPickerOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {TAGS.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => { setTag(t); setIsTagPickerOpen(false); }}
                                        className={clsx(
                                            "p-4 rounded-2xl text-left font-bold transition-all border-2",
                                            tag === t
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-muted/30 border-transparent hover:bg-muted hover:border-border"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash className="w-4 h-4 opacity-50" />
                                            <span className="text-sm">{t}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsTagPickerOpen(false)} />
                </div>
            )}
        </div>
    );
}
