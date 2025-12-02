"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Clock, RefreshCw, Check, Star, ShoppingBag, ShieldCheck } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { PaymentModal } from "@/components/payment/PaymentModal";

export default function ServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: serviceId } = use(params);
    const { user } = useUser();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [service, setService] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Tiers State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tiers, setTiers] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedTier, setSelectedTier] = useState<any>(null);

    // Extras State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

    useEffect(() => {
        const fetchService = async () => {
            const { data, error } = await supabase
                .from('services')
                .select(`
                    *,
                    profiles (
                        id,
                        full_name,
                        username,
                        avatar_url,
                        verification_status,
                        vacation_mode,
                        vacation_message
                    ),
                    service_tiers (*)
                `)
                .eq('id', serviceId)
                .single();

            if (error) {
                console.error("Error fetching service:", error);
            } else {
                setService(data);

                // Sort tiers: Basic -> Standard -> Premium
                const sortedTiers = data.service_tiers?.sort((a: any, b: any) => {
                    const order = { "Basic": 1, "Standard": 2, "Premium": 3 };
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return (order[a.name as keyof typeof order] || 99) - (order[b.name as keyof typeof order] || 99);
                }) || [];

                setTiers(sortedTiers);
                if (sortedTiers.length > 0) {
                    setSelectedTier(sortedTiers[0]);
                } else {
                    // Fallback if no tiers exist (legacy services)
                    const defaultTier = {
                        name: "Basic",
                        description: "Standard Package",
                        price: data.price,
                        delivery_days: 3,
                        revisions: 1
                    };
                    setTiers([defaultTier]);
                    setSelectedTier(defaultTier);
                }

                // Fetch reviews
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select('*, profiles:buyer_id(full_name, avatar_url)')
                    .eq('service_id', serviceId)
                    .order('created_at', { ascending: false });

                if (reviewsData) setReviews(reviewsData);
            }
            setLoading(false);
        };

        fetchService();
    }, [serviceId]);

    const toggleExtra = (extra: any) => {
        if (selectedExtras.find(e => e.title === extra.title)) {
            setSelectedExtras(selectedExtras.filter(e => e.title !== extra.title));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const calculateTotal = () => {
        if (!selectedTier) return 0;
        const extrasTotal = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
        return selectedTier.price + extrasTotal;
    };

    const handlePurchase = async () => {
        if (!user) {
            alert("Please login to purchase");
            return;
        }

        setProcessingPayment(true);

        const totalAmount = calculateTotal();

        // 1. Create Order
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                buyer_id: user.id,
                seller_id: service.seller_id,
                service_id: service.id,
                amount: totalAmount,
                status: 'pending_requirements',
                description: `Order for ${service.title} (${selectedTier.name} Package)`,
                selected_extras: selectedExtras
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating order:", error);
            alert("Failed to create order");
            setProcessingPayment(false);
            return;
        }

        // 2. Redirect to Order Page
        router.push(`/orders/${order.id}`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!service) return <div className="min-h-screen flex items-center justify-center">Service not found</div>;

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header Image */}
            <div className="relative h-64 md:h-96 w-full">
                {service.thumbnail_url ? (
                    <Image src={service.thumbnail_url} alt={service.title} fill className="object-cover" priority />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                    </div>
                )}
                <Link href="/home" className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-md">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border">
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">{service.title}</h1>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border">
                                    {service.profiles?.avatar_url ? (
                                        <Image src={service.profiles.avatar_url} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-muted" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-foreground text-lg">{service.profiles?.full_name}</div>
                                    <div className="text-sm text-muted-foreground">@{service.profiles?.username}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 fill-current" />
                                    {service.rating_avg ? service.rating_avg.toFixed(1) : "New"}
                                    {service.rating_count > 0 && <span className="text-muted-foreground text-xs ml-1">({service.rating_count})</span>}
                                </div>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <h3 className="font-bold text-xl mb-2">About this Gig</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{service.description}</p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-border">
                                <h3 className="font-bold text-2xl mb-6">Reviews ({reviews.length})</h3>
                                {reviews.length === 0 ? (
                                    <p className="text-muted-foreground">No reviews yet.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="bg-muted/30 rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                                                        {review.profiles?.avatar_url ? (
                                                            <Image src={review.profiles.avatar_url} alt="" fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                                                {review.profiles?.full_name?.[0] || "?"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{review.profiles?.full_name || "Anonymous"}</div>
                                                        <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            {review.rating}.0
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-foreground/80">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg sticky top-24">

                            {/* Tier Tabs */}
                            {tiers.length > 1 && (
                                <div className="flex p-1 bg-muted/50 rounded-xl mb-6">
                                    {tiers.map((tier) => (
                                        <button
                                            key={tier.name}
                                            onClick={() => setSelectedTier(tier)}
                                            className={clsx(
                                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                                selectedTier?.name === tier.name
                                                    ? "bg-background text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {tier.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedTier && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={selectedTier.name}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-black text-xl text-foreground">{selectedTier.name}</h3>
                                        <div className="text-2xl font-black text-primary">${selectedTier.price}</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium mb-6 min-h-[40px]">{selectedTier.description}</p>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {selectedTier.delivery_days} Days Delivery
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <RefreshCw className="w-4 h-4 text-primary" />
                                            {selectedTier.revisions === 999 ? "Unlimited" : selectedTier.revisions} Revisions
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                                            <Check className="w-4 h-4 text-primary" />
                                            Source File Included
                                        </div>
                                    </div>

                                    {/* Gig Extras Selection */}
                                    {service.extras && service.extras.length > 0 && (
                                        <div className="mb-8 space-y-3 pt-6 border-t border-border">
                                            <h4 className="font-bold text-sm">Add Extras</h4>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {service.extras.map((extra: any, idx: number) => {
                                                const isSelected = selectedExtras.some(e => e.title === extra.title);
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => toggleExtra(extra)}
                                                        className={clsx(
                                                            "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                                            isSelected
                                                                ? "bg-primary/5 border-primary"
                                                                : "bg-background border-border hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                                                isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                                            )}>
                                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm">{extra.title}</div>
                                                                <div className="text-xs text-muted-foreground">{extra.description}</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-sm">+${extra.price}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsPaymentOpen(true)}
                                        disabled={service.profiles?.vacation_mode}
                                        className={clsx(
                                            "w-full py-4 rounded-xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2",
                                            service.profiles?.vacation_mode
                                                ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                                                : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                        )}
                                    >
                                        {service.profiles?.vacation_mode ? "Seller on Vacation" : `Continue ($${calculateTotal()})`}
                                    </button>

                                    {service.profiles?.vacation_mode && (
                                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-600 font-medium text-center">
                                            {service.profiles.vacation_message || "This seller is currently taking a break."}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                Secure Payment via PayLink Escrow
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handlePurchase}
                subtotal={calculateTotal()}
                isProcessing={processingPayment}
            />
        </div>
    );
}
