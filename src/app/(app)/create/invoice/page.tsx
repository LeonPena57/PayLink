"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, X, Image as ImageIcon, Plus, Sparkles, Search, Briefcase, DollarSign, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { clsx } from "clsx";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

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
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Calendar Helpers
    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    const handleDateSelect = (date: Date) => {
        // Adjust for timezone offset to ensure the date string is correct
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        setDueDate(adjustedDate.toISOString().split('T')[0]);
        setIsDatePickerOpen(false);
    };

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

            <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6 md:space-y-10">
                <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">

                    {/* Big Total Display */}
                    <div className="text-center space-y-1 md:space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Amount</div>
                        <div className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
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
                            className="w-full text-center text-xl md:text-3xl font-bold bg-transparent border-none placeholder:text-muted-foreground/30 focus:ring-0 p-0"
                            autoFocus
                            required
                        />
                        <div className="h-1 w-16 md:w-20 bg-primary mx-auto rounded-full opacity-20" />
                    </div>

                    {/* Due Date Trigger */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => setIsDatePickerOpen(true)}
                            className="inline-flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full hover:bg-muted/50 transition-colors cursor-pointer group active:scale-95"
                        >
                            <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : 'Set Due Date'}
                            </span>
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 md:space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="group flex items-start gap-3 md:gap-4 bg-muted/30 hover:bg-muted/50 p-3 md:p-4 rounded-2xl md:rounded-3xl transition-all animate-in slide-in-from-bottom-2 border border-transparent hover:border-border">
                                {/* Image Bubble */}
                                <div
                                    onClick={() => fileInputRefs.current[item.id]?.click()}
                                    className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-background shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shrink-0 mt-1"
                                >
                                    {item.preview ? (
                                        <Image src={item.preview} alt="" fill className="object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground/40" />
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
                                <div className="flex-1 min-w-0 flex flex-col gap-2 md:gap-3">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="Item name..."
                                        className="w-full bg-transparent font-bold text-base md:text-lg border-none focus:ring-0 p-0 placeholder:text-muted-foreground/50"
                                    />
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="relative flex items-center bg-background rounded-lg md:rounded-xl shadow-sm ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                            <span className="absolute left-2 md:left-3 text-muted-foreground text-base md:text-lg font-bold">$</span>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                                placeholder="0.00"
                                                className="w-24 md:w-32 bg-transparent font-black text-lg md:text-xl border-none focus:ring-0 pl-5 md:pl-7 pr-2 md:pr-3 py-1.5 md:py-2 text-primary placeholder:text-muted-foreground/30"
                                                min="0"
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 ml-auto">
                                            <button
                                                type="button"
                                                onClick={() => updateItem(item.id, 'saveAsService', !item.saveAsService)}
                                                className={clsx(
                                                    "p-2 md:p-2.5 rounded-lg md:rounded-xl transition-colors",
                                                    item.saveAsService ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
                                                )}
                                                title="Save as Service"
                                            >
                                                <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>

                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className={clsx(
                                                        "p-2 md:p-2.5 rounded-lg md:rounded-xl transition-colors",
                                                        "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                                                    )}
                                                >
                                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Buttons */}
                        <div className="flex gap-2 md:gap-3 pt-2">
                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="flex-1 py-3 rounded-xl md:rounded-2xl bg-muted/30 hover:bg-muted text-foreground font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsServicePickerOpen(true)}
                                className="px-4 py-3 rounded-xl md:rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Briefcase className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Payment Terms Toggle (New Design) */}
                    <div className="space-y-3">
                        <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block text-center">Payment Terms</label>
                        <div className="bg-background rounded-3xl border border-border/50 p-1.5 flex relative">
                            <div
                                className={clsx(
                                    "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-2xl transition-all duration-300 shadow-sm",
                                    paymentType === 'full' ? "left-1.5" : "left-[calc(50%+4.5px)]"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setPaymentType('full')}
                                className={clsx(
                                    "flex-1 py-3 rounded-2xl text-sm font-bold relative z-10 transition-colors flex flex-col items-center leading-tight",
                                    paymentType === 'full' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span>Full Payment</span>
                                <span className={clsx("text-[10px] font-medium opacity-80", paymentType === 'full' ? "text-primary-foreground" : "text-muted-foreground")}>100% Upfront</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType('50-50')}
                                className={clsx(
                                    "flex-1 py-3 rounded-2xl text-sm font-bold relative z-10 transition-colors flex flex-col items-center leading-tight",
                                    paymentType === '50-50' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span>50/50 Split</span>
                                <span className={clsx("text-[10px] font-medium opacity-80", paymentType === '50-50' ? "text-primary-foreground" : "text-muted-foreground")}>Deposit & Completion</span>
                            </button>
                        </div>
                    </div>

                    {/* Create Button */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 md:bottom-8 md:px-6 flex justify-center z-40 bg-background/80 backdrop-blur-xl md:bg-transparent border-t md:border-none border-border">
                        <button
                            type="submit"
                            disabled={loading || !title || calculateTotal() <= 0}
                            className="w-full md:max-w-md py-3.5 md:py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-background/95 backdrop-blur-xl border-t md:border border-border w-full md:max-w-md h-[80vh] md:h-auto md:max-h-[70vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsServicePickerOpen(false)}>
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

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
                                <div className="space-y-2">
                                    {filteredServices.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => addServiceItem(service)}
                                            className="w-full flex items-center gap-4 p-4 rounded-3xl bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border transition-all text-left group active:scale-[0.98]"
                                        >
                                            <div className="relative w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 shadow-sm">
                                                {service.thumbnail_url ? (
                                                    <Image src={service.thumbnail_url} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                        <Briefcase className="w-6 h-6 text-primary/40" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="font-bold text-base md:text-lg text-foreground truncate mb-1">{service.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/50 text-sm font-bold text-primary">
                                                        ${service.price}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-medium">Service</span>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                                                <Plus className="w-5 h-5" />
                                            </div>
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
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsServicePickerOpen(false)} />
                </div>
            )}

            {/* Date Picker Modal */}
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
                                <h3 className="text-lg font-black">Select Due Date</h3>
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
                                    const isSelected = dueDate && isSameDay(new Date(dueDate), date);
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
                                    onClick={() => handleDateSelect(addDays(new Date(), 7))}
                                    className="py-3 rounded-xl bg-muted/50 hover:bg-muted text-sm font-bold transition-colors"
                                >
                                    In 1 Week
                                </button>
                                <button
                                    onClick={() => handleDateSelect(addMonths(new Date(), 1))}
                                    className="py-3 rounded-xl bg-muted/50 hover:bg-muted text-sm font-bold transition-colors"
                                >
                                    In 1 Month
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsDatePickerOpen(false)} />
                </div>
            )}
        </div>
    );
}
