"use client";

import { FileText, ShoppingBag, Briefcase, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateInvoiceModal } from "@/components/features/dashboard/CreateInvoiceModal";

export default function CreatePage() {
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const createOptions = [
        {
            title: "New Invoice",
            description: "Send a professional invoice to a client.",
            icon: FileText,
            color: "bg-blue-500",
            action: () => setIsInvoiceModalOpen(true),
            link: null
        },
        {
            title: "New Service",
            description: "Add a new service to your commission list.",
            icon: Briefcase,
            color: "bg-purple-500",
            action: null,
            link: "/dashboard?tab=SERVICES" // Ideally this would open a modal or go to a specific create service flow
        },
        {
            title: "New Product",
            description: "Upload a digital product to your shop.",
            icon: ShoppingBag,
            color: "bg-green-500",
            action: null,
            link: "/dashboard?tab=SHOP" // Similarly, this would go to product creation
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-32 p-6 md:p-8 max-w-3xl mx-auto flex flex-col justify-center">
            <CreateInvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />

            <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">Create New</h1>
                <p className="text-muted-foreground text-lg">What would you like to create today?</p>
            </div>

            <div className="grid gap-4">
                {createOptions.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (option.action) option.action();
                            // If it's a link, the Link component handles it, but if it's a div acting as button we need logic.
                            // For simplicity, we'll wrap content in Link if link exists, or div if not.
                        }}
                        className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer active:scale-[0.99]"
                    >
                        {option.link ? (
                            <Link href={option.link} className="absolute inset-0 z-10" />
                        ) : null}

                        <div className="flex items-center gap-6 relative z-0">
                            <div className={`w-16 h-16 rounded-2xl ${option.color}/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                                <option.icon className={`w-8 h-8 ${option.color.replace("bg-", "text-")}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{option.title}</h3>
                                <p className="text-muted-foreground font-medium">{option.description}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
