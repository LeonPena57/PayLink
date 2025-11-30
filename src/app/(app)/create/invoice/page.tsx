"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, X, Image as ImageIcon, Plus, Sparkles, Search, Briefcase, DollarSign } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";

export default function CreateInvoicePage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    interface InvoiceCreationItem {
        id: number;
        name: string;
        price: string;
        image: File | null;
        preview: string | null;
        saveAsService: boolean;
    }

    // Form State
    const [title, setTitle] = useState("");
    const [items, setItems] = useState<InvoiceCreationItem[]>([{ id: 1, name: "", price: "", image: null, preview: null, saveAsService: false }]);
    const [paymentType, setPaymentType] = useState("full");
    const [dueDate, setDueDate] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [services, setServices] = useState<any[]>([]);

    // UI State
    const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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

    const addCustomItem = () => {
        setItems([...items, { id: Date.now(), name: "", price: "", image: null, preview: null, saveAsService: false }]);
    };

    const addServiceItem = (service: any) => {
        setItems([...items, {
            id: Date.now(),
            name: service.title || "",
            price: (service.price !== undefined && service.price !== null) ? service.price.toString() : "",
            image: null,
            preview: service.thumbnail_url || null,
            saveAsService: false
        }]);
        setIsServicePickerOpen(false);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateItem = (id: number, field: keyof InvoiceCreationItem, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
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
            const processedItems = await Promise.all(items.map(async (item) => {
                let imageUrl = item.preview;

                if (item.image) {
                    const fileExt = item.image.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `invoice-items/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('public_previews')
                        .upload(filePath, item.image);

                    if (!uploadError) {
                        const { data } = supabase.storage.from('public_previews').getPublicUrl(filePath);
                        imageUrl = data.publicUrl;
                    }
                }

                if (item.saveAsService && item.name && item.price) {
                    await supabase.from('services').insert({
                        seller_id: user.id,
                        title: item.name,
                        description: `Service created from PayLink: ${title}`,
                        price: parseFloat(item.price),
                        thumbnail_url: imageUrl
                    });
                }

                return {
                    title: item.name,
                    price: parseFloat(item.price) || 0,
                    image: imageUrl,
                    size: "2.4MB",
                    date: new Date().toLocaleDateString()
                };
            }));

            const { data: invoiceData, error } = await supabase
                .from('invoices')
                .insert({
                    seller_id: user.id,
                    amount: calculateTotal(),
                    currency: 'USD',
                    description: title,
                    due_date: dueDate || null,
                    status: 'pending',
                    items: processedItems
                })
                .select()
                .single();

            if (error) throw error;

            const payLink = `${window.location.origin}/pay/${invoiceData.id}`;
            await navigator.clipboard.writeText(payLink);
            alert(`PayLink created successfully!\n\nLink copied to clipboard:\n${payLink}\n\nShare this link with your client to receive payment.`);
            router.push('/receipts');
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create PayLink. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Simple Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <Link href="/create" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </Link>
                <div className="font-bold text-lg">New Invoice</div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-10">
                <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-10">

                    {/* Big Total Display */}
                    <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Amount</div>
                        <div className="text-6xl md:text-7xl font-black text-foreground tracking-tighter">
                            ${calculateTotal().toFixed(2)}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's this for?"
                            className="w-full text-center text-2xl md:text-3xl font-bold bg-transparent border-none placeholder:text-muted-foreground/30 focus:ring-0 p-0"
                            autoFocus
                            required
                        />
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full opacity-20" />
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="group flex items-center gap-3 bg-muted/30 hover:bg-muted/50 p-2 rounded-2xl transition-all animate-in slide-in-from-bottom-2">
                                {/* Image Bubble */}
                                <div
                                    onClick={() => fileInputRefs.current[item.id]?.click()}
                                    className="w-14 h-14 rounded-xl bg-background shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shrink-0"
                                >
                                    {item.preview ? (
                                        <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                                    )}
                                    <input
                                        type="file"
                                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                        onChange={(e) => handleItemImageSelect(item.id, e)}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>

                                {/* Inputs */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="Item name..."
                                        className="w-full bg-transparent font-bold text-base border-none focus:ring-0 p-0 placeholder:text-muted-foreground/50"
                                    />
                                    <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground text-sm font-bold">$</span>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                            placeholder="0"
                                            className="w-24 bg-transparent font-bold text-sm border-none focus:ring-0 p-0 text-primary"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Delete Action */}
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-muted-foreground/30 hover:text-destructive transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Add Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="flex-1 py-3 rounded-2xl bg-muted/30 hover:bg-muted text-foreground font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsServicePickerOpen(true)}
                                className="px-4 py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Briefcase className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Payment Terms Toggle */}
                    <div className="flex justify-center">
                        <div className="bg-muted/30 p-1 rounded-full inline-flex">
                            <button
                                type="button"
                                onClick={() => setPaymentType('full')}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold transition-all",
                                    paymentType === 'full' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Full Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType('50-50')}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold transition-all",
                                    paymentType === '50-50' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                50/50 Split
                            </button>
                        </div>
                    </div>

                    {/* Create Button */}
                    <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20">
                        <button
                            type="submit"
                            disabled={loading || !title || calculateTotal() <= 0}
                            className="w-full max-w-md py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    Create PayLink
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Minimal Service Picker Modal */}
            {isServicePickerOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border w-full max-w-md max-h-[70vh] rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                        <div className="p-4 flex items-center gap-3 border-b border-border/50">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-base font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => setIsServicePickerOpen(false)} className="p-1 hover:bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {filteredServices.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredServices.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => addServiceItem(service)}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                                {service.thumbnail_url ? (
                                                    <img src={service.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{service.title}</div>
                                                <div className="text-xs text-muted-foreground">${service.price}</div>
                                            </div>
                                            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    No services found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
