"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, DollarSign, Image as ImageIcon, X, Layers, AlignLeft, Clock, RefreshCw, ChevronRight, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveSelect } from "@/components/ui/ResponsiveSelect";

export default function CreateServicePage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Graphic Design");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mobile Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
    const totalSteps = 3;

    // Tiers State
    const [activeTierTab, setActiveTierTab] = useState<"Basic" | "Standard" | "Premium">("Basic");
    const [tiers, setTiers] = useState({
        Basic: { price: "", delivery_days: "3", revisions: "1", description: "Starter package for simple tasks" },
        Standard: { price: "", delivery_days: "5", revisions: "3", description: "Most popular package with standard features" },
        Premium: { price: "", delivery_days: "7", revisions: "Unlimited", description: "Full VIP treatment with all files included" }
    });

    // Extras State
    const [extras, setExtras] = useState<{ title: string; description: string; price: number; additional_days: number }[]>([]);

    // Features Matrix State
    const [features, setFeatures] = useState([
        { id: 1, name: "Source File", Basic: false, Standard: true, Premium: true },
        { id: 2, name: "Commercial Use", Basic: false, Standard: false, Premium: true },
        { id: 3, name: "High Resolution", Basic: true, Standard: true, Premium: true },
    ]);

    const toggleFeature = (id: number, tier: "Basic" | "Standard" | "Premium") => {
        setFeatures(features.map(f => f.id === id ? { ...f, [tier]: !f[tier] } : f));
    };

    const addFeature = () => {
        setFeatures([...features, { id: Date.now(), name: "", Basic: false, Standard: false, Premium: false }]);
    };

    const removeFeature = (id: number) => {
        setFeatures(features.filter(f => f.id !== id));
    };

    const updateFeatureName = (id: number, name: string) => {
        setFeatures(features.map(f => f.id === id ? { ...f, name } : f));
    };

    const addExtra = () => {
        setExtras([...extras, { title: "", description: "", price: 0, additional_days: 0 }]);
    };

    const removeExtra = (index: number) => {
        setExtras(extras.filter((_, i) => i !== index));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateExtra = (index: number, field: string, value: any) => {
        const newExtras = [...extras];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newExtras[index] as any)[field] = value;
        setExtras(newExtras);
    };

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

    const updateTier = (tier: "Basic" | "Standard" | "Premium", field: string, value: string) => {
        setTiers(prev => ({
            ...prev,
            [tier]: { ...prev[tier], [field]: value }
        }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(c => c + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || !description || !tiers.Basic.price) return;

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
                    price: parseFloat(tiers.Basic.price), // Base price for listing
                    thumbnail_url: thumbnailUrl,
                    extras: extras.filter(e => e.title && e.price > 0)
                })
                .select()
                .single();

            if (serviceError) throw serviceError;

            // 2. Create Tiers
            const tiersData = Object.entries(tiers).map(([name, data]) => {
                if (!data.price) return null; // Skip empty tiers if any (though Basic is required)
                return {
                    service_id: serviceData.id,
                    name,
                    description: data.description,
                    price: parseFloat(data.price),
                    delivery_days: parseInt(data.delivery_days) || 3,
                    revisions: data.revisions === "Unlimited" ? 999 : parseInt(data.revisions) || 1,
                    features: features.filter(f => f[name as "Basic" | "Standard" | "Premium"]).map(f => f.name)
                };
            }).filter(Boolean);

            const { error: tierError } = await supabase
                .from('service_tiers')
                .insert(tiersData);

            if (tierError) throw tierError;

            router.push('/home?tab=SERVICES');
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    const CategorySelector = () => (
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
    );

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
                        disabled={loading || !title || !description || !tiers.Basic.price}
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

            {/* Mobile Header with Progress */}
            <div className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={currentStep === 1 ? () => router.back() : prevStep} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <div className="font-bold text-lg">
                        {currentStep === 1 && "Service Details"}
                        {currentStep === 2 && "Add Media"}
                        {currentStep === 3 && "Pricing & Packages"}
                    </div>
                    <div className="w-10" />
                </div>
                {/* Progress Bar */}
                <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                        <div
                            key={step}
                            className={clsx(
                                "h-1 flex-1 rounded-full transition-all duration-300",
                                step <= currentStep ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

                    {/* Left Column: Main Content */}
                    <div className="space-y-6">

                        {/* Step 1: Basic Info & Category (Mobile: Step 1, Desktop: Always Visible) */}
                        <div className={clsx("space-y-6", currentStep !== 1 ? "hidden md:block" : "block")}>

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

                            {/* Category Card - Mobile Only (Bottom Sheet Trigger) */}
                            <div className="md:hidden bg-background rounded-3xl border border-border p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                    <Layers className="w-5 h-5 text-primary" />
                                    Category
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCategorySheetOpen(true)}
                                    className="w-full bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl p-4 text-base font-medium flex items-center justify-between group"
                                >
                                    <span className="text-foreground">{category}</span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors rotate-90" />
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Media (Mobile: Step 2, Desktop: Always Visible) */}
                        <div className={clsx("space-y-6", currentStep !== 2 ? "hidden md:block" : "block")}>
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
                    </div>

                    {/* Right Column: Pricing & Category (Desktop) (Mobile: Step 3, Desktop: Always Visible) */}
                    <div className={clsx("space-y-6", currentStep !== 3 ? "hidden md:block" : "block")}>

                        {/* Category Card - Desktop Only */}
                        <div className="hidden md:block">
                            <CategorySelector />
                        </div>

                        {/* Pricing Tiers Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <DollarSign className="w-5 h-5 text-primary" />
                                Service Packages
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-muted/50 rounded-xl">
                                {(["Basic", "Standard", "Premium"] as const).map((tier) => (
                                    <button
                                        key={tier}
                                        type="button"
                                        onClick={() => setActiveTierTab(tier)}
                                        className={clsx(
                                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                            activeTierTab === tier
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {tier}
                                    </button>
                                ))}
                            </div>

                            {/* Active Tier Form */}
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300" key={activeTierTab}>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</div>
                                        <input
                                            type="number"
                                            value={tiers[activeTierTab].price}
                                            onChange={(e) => updateTier(activeTierTab, 'price', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full text-lg font-bold bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl pl-8 p-3 transition-all"
                                            min="5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={tiers[activeTierTab].description}
                                        onChange={(e) => updateTier(activeTierTab, 'description', e.target.value)}
                                        placeholder={`What's included in the ${activeTierTab} package?`}
                                        className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl p-3 text-sm min-h-[80px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Delivery
                                        </label>
                                        <ResponsiveSelect
                                            label="Delivery Time"
                                            value={tiers[activeTierTab].delivery_days}
                                            onChange={(val) => updateTier(activeTierTab, 'delivery_days', val)}
                                            icon={<Clock className="w-5 h-5 text-primary" />}
                                            options={[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map(d => ({
                                                label: `${d} Days`,
                                                value: d
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3" /> Revisions
                                        </label>
                                        <ResponsiveSelect
                                            label="Revisions"
                                            value={tiers[activeTierTab].revisions}
                                            onChange={(val) => updateTier(activeTierTab, 'revisions', val)}
                                            icon={<RefreshCw className="w-5 h-5 text-primary" />}
                                            options={[0, 1, 2, 3, 5, 999].map(r => ({
                                                label: r === 999 ? "Unlimited" : r.toString(),
                                                value: r === 999 ? "Unlimited" : r
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Matrix */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Package Features
                                </div>
                                <button type="button" onClick={addFeature} className="text-xs font-bold text-primary hover:underline">+ Add Feature</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 font-bold text-muted-foreground w-1/3">Feature</th>
                                            <th className="text-center py-2 font-bold text-muted-foreground">Basic</th>
                                            <th className="text-center py-2 font-bold text-muted-foreground">Standard</th>
                                            <th className="text-center py-2 font-bold text-muted-foreground">Premium</th>
                                            <th className="w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {features.map(feature => (
                                            <tr key={feature.id}>
                                                <td className="py-3">
                                                    <input
                                                        type="text"
                                                        value={feature.name}
                                                        onChange={(e) => updateFeatureName(feature.id, e.target.value)}
                                                        placeholder="Feature name..."
                                                        className="w-full bg-transparent border-none p-0 font-medium focus:ring-0"
                                                    />
                                                </td>
                                                {(["Basic", "Standard", "Premium"] as const).map(tier => (
                                                    <td key={tier} className="text-center py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={feature[tier]}
                                                            onChange={() => toggleFeature(feature.id, tier)}
                                                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="py-3 text-right">
                                                    <button type="button" onClick={() => removeFeature(feature.id)} className="text-muted-foreground hover:text-destructive">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Gig Extras Card */}
                        <div className="bg-background rounded-3xl border border-border p-6 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <Plus className="w-5 h-5 text-primary" />
                                    Gig Extras
                                </div>
                                <button
                                    type="button"
                                    onClick={addExtra}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    + Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {extras.map((extra, index) => (
                                    <div key={index} className="bg-muted/30 rounded-xl p-4 space-y-3 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeExtra(index)}
                                            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={extra.title}
                                                onChange={(e) => updateExtra(index, 'title', e.target.value)}
                                                placeholder="Extra Title (e.g. Fast Delivery)"
                                                className="w-full bg-transparent border-none p-0 font-bold placeholder:text-muted-foreground focus:ring-0"
                                            />
                                            <input
                                                type="text"
                                                value={extra.description}
                                                onChange={(e) => updateExtra(index, 'description', e.target.value)}
                                                placeholder="Description..."
                                                className="w-full bg-transparent border-none p-0 text-sm text-muted-foreground focus:ring-0"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={extra.price}
                                                    onChange={(e) => updateExtra(index, 'price', parseFloat(e.target.value))}
                                                    className="w-full bg-background rounded-lg px-2 py-1 text-sm font-bold border border-border"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Extra Days</label>
                                                <input
                                                    type="number"
                                                    value={extra.additional_days}
                                                    onChange={(e) => updateExtra(index, 'additional_days', parseFloat(e.target.value))}
                                                    className="w-full bg-background rounded-lg px-2 py-1 text-sm font-bold border border-border"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {extras.length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground italic">
                                        No extras added yet.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </form>
            </div>

            {/* Mobile Bottom Bar (Navigation) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40">
                {currentStep < totalSteps ? (
                    <button
                        onClick={nextStep}
                        className="w-full py-3.5 bg-foreground text-background rounded-full font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Next Step
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !description || !tiers.Basic.price}
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Publish Service
                                <Sparkles className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Mobile Category Sheet */}
            <AnimatePresence>
                {isCategorySheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCategorySheetOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[2rem] border-t border-border p-6 z-50 md:hidden max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6 sticky top-0 bg-background z-10 pb-2 border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-primary" />
                                    <h3 className="text-xl font-bold">Select Category</h3>
                                </div>
                                <button
                                    onClick={() => setIsCategorySheetOpen(false)}
                                    className="p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setIsCategorySheetOpen(false);
                                        }}
                                        className={clsx(
                                            "p-4 rounded-xl font-bold text-left transition-all flex items-center justify-between",
                                            category === cat
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {cat}
                                        {category === cat && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                            <div className="h-8" /> {/* Safe area */}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
