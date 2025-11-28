"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, FileText, Mail, DollarSign, Calendar, User, ShoppingBag, X, Image as ImageIcon, Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

export default function CreateInvoicePage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    // Form State
    // Form State
    const [title, setTitle] = useState(""); // Invoice Title
    const [items, setItems] = useState([{ id: 1, name: "", price: "", image: null as File | null, preview: null as string | null, saveAsService: false }]);
    const [paymentType, setPaymentType] = useState("full"); // 'full', '50-50'
    const [dueDate, setDueDate] = useState("");
    const [services, setServices] = useState<any[]>([]);

    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    useEffect(() => {
        const fetchServices = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('services')
                .select('*')
                .eq('seller_id', user.id);
            if (data) setServices(data);
        };
        fetchServices();
    }, [user]);

    const addItem = () => {
        setItems([...items, { id: Date.now(), name: "", price: "", image: null, preview: null, saveAsService: false }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleServiceSelect = (id: number, serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setItems(items.map(item => item.id === id ? {
                ...item,
                name: service.title,
                price: service.price.toString(),
                preview: service.image_url,
                saveAsService: false
            } : item));
        }
    };

    const handleItemImageSelect = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateItem(id, 'preview', reader.result as string);
                updateItem(id, 'image', file);
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title) return;

        setLoading(true);
        try {
            // 1. Upload Images & Create Services if needed
            const processedItems = await Promise.all(items.map(async (item) => {
                let imageUrl = item.preview; // Default to existing preview (URL) if no new file

                if (item.image) {
                    const fileExt = item.image.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `invoice-items/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('public-images')
                        .upload(filePath, item.image);

                    if (!uploadError) {
                        const { data } = supabase.storage.from('public-images').getPublicUrl(filePath);
                        imageUrl = data.publicUrl;
                    }
                }

                // Create new service if requested
                if (item.saveAsService && item.name && item.price) {
                    await supabase.from('services').insert({
                        seller_id: user.id,
                        title: item.name,
                        description: `Service created from PayLink: ${title}`,
                        price: parseFloat(item.price),
                        image_url: imageUrl
                    });
                }

                return {
                    name: item.name,
                    price: parseFloat(item.price) || 0,
                    image_url: imageUrl
                };
            }));

            // 2. Create Invoice
            const { error } = await supabase
                .from('invoices')
                .insert({
                    seller_id: user.id,
                    amount: calculateTotal(),
                    currency: 'USD',
                    description: title,
                    due_date: dueDate || null,
                    status: 'pending',
                });

            if (error) throw error;

            router.push('/receipts');
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice');
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
                    <h1 className="text-lg font-bold text-foreground">New PayLink</h1>
                </div>
                <button
                    type="submit"
                    form="create-invoice-form"
                    disabled={loading || !title || calculateTotal() <= 0}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Link"}
                </button>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Client Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Project Details
                        </h2>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Project Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Website Redesign Commission"
                                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                Items / Services
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="bg-card border border-border rounded-2xl p-4 relative group animate-in fade-in slide-in-from-bottom-4 space-y-4">
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="absolute -top-2 -right-2 bg-destructive text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Service Selection */}
                                    {services.length > 0 && (
                                        <select
                                            onChange={(e) => handleServiceSelect(item.id, e.target.value)}
                                            className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select from your services...</option>
                                            {services.map(service => (
                                                <option key={service.id} value={service.id}>
                                                    {service.title} - ${service.price}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    <div className="flex gap-4">
                                        {/* Item Image */}
                                        <div
                                            onClick={() => fileInputRefs.current[item.id]?.click()}
                                            className="w-24 h-24 bg-muted rounded-xl shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border border-border"
                                        >
                                            {item.preview ? (
                                                <img src={item.preview} alt="Item" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                                            )}
                                            <input
                                                type="file"
                                                ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                                onChange={(e) => handleItemImageSelect(item.id, e)}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                placeholder="Item Name (e.g. Logo Design)"
                                                className="w-full bg-transparent border-b border-border focus:border-primary px-0 py-1 font-bold text-foreground focus:outline-none transition-colors"
                                                required
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground font-bold">$</span>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-32 bg-transparent border-b border-border focus:border-primary px-0 py-1 font-medium text-foreground focus:outline-none transition-colors"
                                                    required
                                                    min="0"
                                                />
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer group/check">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.saveAsService ? 'bg-primary border-primary' : 'border-muted-foreground group-hover/check:border-primary'}`}>
                                                    {item.saveAsService && <Check className="w-3 h-3 text-primary-foreground" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={item.saveAsService}
                                                    onChange={(e) => updateItem(item.id, 'saveAsService', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <span className="text-xs font-medium text-muted-foreground group-hover/check:text-foreground transition-colors">Save to my Services</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground font-bold hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>

                    {/* Payment Terms */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Payment Terms
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setPaymentType('full')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${paymentType === 'full' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
                            >
                                <div className="font-bold text-foreground mb-1">Full Payment</div>
                                <div className="text-xs text-muted-foreground">Client pays 100% upfront</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType('50-50')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${paymentType === '50-50' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
                            >
                                <div className="font-bold text-foreground mb-1">50/50 Split</div>
                                <div className="text-xs text-muted-foreground">50% now, 50% on completion</div>
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Platform Fee (0%)</span>
                            <span>$0.00</span>
                        </div>
                        <div className="border-t border-border pt-4 flex items-center justify-between font-bold text-xl text-foreground">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
