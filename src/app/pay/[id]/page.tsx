"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Sun, Moon, Download, FileText, Image as ImageIcon, Bell, User, Menu, Grid, ArrowDownAZ, ArrowDown10, Edit2, CloudDownload, X, Trash2, Link as LinkIcon, Plus, QrCode, Home, Receipt, ArrowRight, Sparkles, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { format } from "date-fns";
import { Invoice, InvoiceItem } from "@/types/paylink";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function InvoicePaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const [invoiceId, setInvoiceId] = useState<string | null>(null);
    const { user } = useUser();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [seller, setSeller] = useState<any>(null);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [isPaid, setIsPaid] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSeller = user?.id === invoice?.seller_id;

    const handleDeleteItem = async (index: number) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        const newItems = items.filter((_, i) => i !== index);
        const { error } = await supabase
            .from('invoices')
            .update({ items: newItems })
            .eq('id', invoiceId);

        if (!error) {
            setItems(newItems);
            setActiveMenu(null);
            toast("File deleted successfully", "success");
        } else {
            toast("Failed to delete item", "error");
        }
    };

    useEffect(() => {
        params.then(resolvedParams => {
            setInvoiceId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!invoiceId) return;

        const fetchInvoiceDetails = async () => {
            setLoading(true);
            const { data: invoiceData } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', invoiceId)
                .single();

            if (invoiceData) {
                setInvoice(invoiceData);
                setIsPaid(invoiceData.status === 'paid');

                // Fetch Seller
                const { data: sellerData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', invoiceData.seller_id)
                    .single();

                if (sellerData) setSeller(sellerData);

                // Use real items from the invoice
                if (invoiceData.items && Array.isArray(invoiceData.items)) {
                    setItems(invoiceData.items);
                }
            }
            setLoading(false);
        };
        fetchInvoiceDetails();
    }, [invoiceId]);

    const handlePayment = async () => {
        setProcessingPayment(true);
        setTimeout(async () => {
            if (invoiceId) {
                const { error } = await supabase
                    .from('invoices')
                    .update({ status: 'paid' })
                    .eq('id', invoiceId);

                if (!error) {
                    setIsPaid(true);
                    if (invoice) {
                        setInvoice({ ...invoice, status: 'paid' });
                    }
                }
            }
            setProcessingPayment(false);
        }, 1500);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && invoiceId) {
            // Simple loading indicator could be added here

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `project_files/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('public_previews')
                .upload(filePath, file);

            if (uploadError) {
                console.error(uploadError);
                toast("Upload failed", "error");
                return;
            }

            const { data } = supabase.storage.from('public_previews').getPublicUrl(filePath);
            const imageUrl = data.publicUrl;

            const newItem: InvoiceItem = {
                title: file.name,
                price: 0,
                image: imageUrl,
                size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
                date: format(new Date(), "MMM d, yyyy")
            };

            const newItems = [...items, newItem];
            const { error: updateError } = await supabase
                .from('invoices')
                .update({ items: newItems })
                .eq('id', invoiceId);

            if (!updateError) {
                setItems(newItems);
                toast("File uploaded successfully", "success");
            } else {
                toast("Failed to update invoice", "error");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
                <Link href="/" className="mt-6 px-6 py-2 bg-blue-500 rounded-full font-bold">Go Home</Link>
            </div>
        );
    }

    return (
        <div className={clsx("min-h-screen transition-colors duration-300 font-sans pb-32", darkMode ? "bg-[#1a1a1a] text-white" : "bg-gray-50 text-gray-900")}>
            {/* Header */}
            <div className="hidden md:flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-md">
                {isPaid ? (
                    <div className="flex items-center gap-4">
                        <Menu className="w-8 h-8 text-white" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain brightness-0 invert" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter italic">PAYLINK</span>
                    </div>
                )}

                {isPaid && (
                    <div className="flex items-center gap-2 font-black text-2xl tracking-tighter italic absolute left-1/2 -translate-x-1/2">
                        <div className="relative w-8 h-8 mr-2">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain brightness-0 invert" />
                        </div>
                        PAYLINK
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {isPaid && (
                        <div className="relative">
                            <Bell className="w-6 h-6 text-white" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">3</div>
                        </div>
                    )}
                    <button onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 pt-4">
                {!isPaid ? (
                    /* UNPAID VIEW */
                    <>
                        {/* Seller Header */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <h1 className="text-3xl font-black italic tracking-wider uppercase">{seller?.username || "SELLER"}</h1>
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-gray-800 relative">
                                {seller?.avatar_url ? (
                                    <Image src={seller.avatar_url} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-gray-400" />
                                )}
                                {/* Verified Badge Mock */}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full border border-[#1a1a1a]"></div>
                            </div>
                        </div>

                        {/* Main Card */}
                        <div className="rounded-3xl p-6 relative overflow-hidden border-[4px] border-blue-600 bg-[#1a1a1a] shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            <div className="space-y-8">
                                {items.map((item, idx) => (
                                    <div key={idx} className={clsx("flex gap-4 items-center", idx % 2 !== 0 ? "flex-row-reverse text-right" : "")}>
                                        <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-white/20 relative shadow-lg">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-1">
                                            <div>
                                                <h3 className="font-bold text-lg italic tracking-tight leading-none mb-1">{item.title}</h3>
                                                <div className="text-[10px] text-gray-400 font-medium flex flex-col gap-0.5">
                                                    <span>{item.size}</span>
                                                    <span>{item.date}</span>
                                                </div>
                                            </div>
                                            <div className={clsx("mt-auto", idx % 2 !== 0 ? "self-end" : "self-start")}>
                                                <div className="bg-gray-600/80 px-6 py-1 rounded-lg font-black text-2xl tracking-tight border border-white/10 shadow-inner">
                                                    ${item.price}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-center justify-center mt-8">
                                    <div className="bg-[#333] px-8 py-2 rounded-lg font-black italic text-xl text-gray-400 border border-white/5 shadow-lg">
                                        TOTAL: <span className="text-white text-2xl ml-2">${invoice.amount.toFixed(0)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processingPayment}
                                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-black italic text-4xl py-5 rounded-full shadow-[0_10px_20px_rgba(37,99,235,0.4)] uppercase tracking-widest"
                                >
                                    {processingPayment ? (
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                                    ) : (
                                        "PAY"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Items Seller Sent Section */}
                        <div className="mt-10">
                            <h2 className="text-3xl font-black italic tracking-wider text-center mb-6 text-white drop-shadow-md">Items Seller Sent</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="bg-[#222] border-[3px] border-blue-600/50 rounded-2xl p-1 relative overflow-hidden group">
                                        {/* Header Bar */}
                                        <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 px-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <div className="text-[8px] font-bold text-white/50">MZ</div>
                                        </div>

                                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-800 relative">
                                            {item.image && (
                                                <Image src={item.image} alt={item.title} fill className="object-cover opacity-60" />
                                            )}
                                            {/* Overlay UI Mock */}
                                            <div className="absolute inset-0 flex flex-col justify-between p-4">
                                                <div className="flex justify-between">
                                                    <div className="w-1/3 h-full border-r border-white/10"></div>
                                                    <div className="w-1/3 h-full border-r border-white/10"></div>
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="font-black text-lg text-white italic drop-shadow-lg uppercase leading-none mb-1">Pokémon Overlay</h3>
                                                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            <h3 className="font-medium text-sm text-white">{item.title}</h3>
                                            <div className="flex justify-between items-end mt-1 text-[10px] text-gray-400 font-bold">
                                                <div>
                                                    <div>File Size</div>
                                                    <div className="text-white">{item.size}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div>Date</div>
                                                    <div className="text-white">{item.date}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    /* PAID VIEW (Project Files) */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <h1 className="text-3xl font-black italic tracking-wider text-white uppercase flex-1">PROJECT FILES</h1>
                            <div className="flex gap-2">
                                <button className="p-2 bg-[#333] rounded-lg text-white hover:bg-[#444] transition-colors"><Grid className="w-5 h-5" /></button>
                                <button className="p-2 bg-[#333] rounded-lg text-white hover:bg-[#444] transition-colors"><ArrowDownAZ className="w-5 h-5" /></button>
                                <button className="p-2 bg-[#333] rounded-lg text-white hover:bg-[#444] transition-colors"><ArrowDown10 className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div
                            className="mb-6 border-2 border-dashed border-blue-500/50 rounded-2xl p-6 flex flex-col items-center justify-center bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                                <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                            </div>
                            <p className="text-white font-bold text-lg">Upload Files</p>
                            <p className="text-gray-400 text-sm">Drag & drop or click to upload</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-[#222] border-[3px] border-blue-600 rounded-2xl p-1 relative overflow-hidden group shadow-lg">
                                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-800 relative">
                                        {item.image && (
                                            <Image src={item.image} alt={item.title} fill className="object-cover opacity-80" />
                                        )}

                                        {/* Seller Actions (3 Dots) */}
                                        {isSeller && (
                                            <div className="absolute top-2 right-2 z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === idx ? null : idx);
                                                    }}
                                                    className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-sm"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                {activeMenu === idx && (
                                                    <div className="absolute top-8 right-0 bg-[#333] border border-gray-600 rounded-lg shadow-xl overflow-hidden min-w-[120px] animate-in fade-in zoom-in-95 duration-200">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteItem(idx);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-white/5 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Overlay UI Mock */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="text-center">
                                                <h3 className="font-black text-xl text-white italic drop-shadow-lg uppercase leading-none mb-1 shadow-black">{item.title}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-[#222]">
                                        <h3 className="font-bold text-base text-white mb-2">{item.title}</h3>
                                        <div className="flex justify-between items-end text-[10px] text-gray-400 font-bold border-t border-white/10 pt-2">
                                            <div>
                                                <div>File Size</div>
                                                <div className="text-white">{item.size}</div>
                                            </div>
                                            <div className="text-right">
                                                <div>Date</div>
                                                <div className="text-white">{item.date}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                            <Edit2 className="w-6 h-6" />
                                        </button>
                                        <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                            <CloudDownload className="w-6 h-6" />
                                        </button>
                                        <button className="w-12 h-12 rounded-full bg-gray-400 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-8 flex items-center gap-4">
                            <button className="flex-1 bg-white text-blue-600 font-black italic text-lg py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-gray-100 transition-colors">
                                <LinkIcon className="w-5 h-5" />
                                Create Payment Link
                            </button>
                            <button className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-black hover:bg-gray-400 transition-colors shadow-lg">
                                <Trash2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Navbar Removed (Using Global Nav) */}
        </div>
    );
}
