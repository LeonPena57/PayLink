"use client";

import { FileText, ShoppingBag, Briefcase, ArrowRight, Image as ImageIcon, LayoutTemplate, Clock, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export default function CreatePage() {
    const router = useRouter();

    const secondaryOptions = [
        {
            title: "New Post",
            description: "Share updates",
            icon: ImageIcon,
            color: "bg-pink-500",
            textColor: "text-pink-500",
            link: "/create/post"
        },
        {
            title: "New Service",
            description: "Offer a commission",
            icon: Briefcase,
            color: "bg-purple-500",
            textColor: "text-purple-500",
            link: "/create/service"
        },
        {
            title: "New Product",
            description: "Sell digital goods",
            icon: ShoppingBag,
            color: "bg-green-500",
            textColor: "text-green-500",
            link: "/create/product"
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-32 p-4 md:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-2">
                    Create
                </h1>
                <p className="text-muted-foreground font-medium">
                    What are we making today?
                </p>
            </div>

            <div className="space-y-4 md:space-y-6 mb-12">
                {/* Hero Option: PayLink */}
                <Link
                    href="/create/invoice"
                    className="group relative overflow-hidden bg-primary text-primary-foreground rounded-[2.5rem] p-8 md:p-10 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/20 cursor-pointer flex flex-col md:flex-row md:items-center gap-6 md:gap-10 animate-in slide-in-from-bottom-6"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>

                    <div className="flex-1 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-2">
                            New PayLink
                        </h2>
                        <p className="text-primary-foreground/80 text-lg font-medium max-w-md">
                            Create a professional invoice link to get paid instantly for your work.
                        </p>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                        <ArrowRight className="w-6 h-6" />
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                </Link>

                {/* Secondary Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {secondaryOptions.map((option, index) => (
                        <Link
                            key={index}
                            href={option.link}
                            className="group bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border rounded-[2rem] p-6 transition-all duration-300 cursor-pointer flex items-center gap-4 animate-in slide-in-from-bottom-8"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                                option.color + "/10"
                            )}>
                                <option.icon className={clsx("w-6 h-6", option.textColor)} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                                    {option.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Drafts Section */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Drafts
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-4 hover:bg-muted/50 transition-all cursor-pointer group hover:-translate-y-1">
                            <div className="aspect-square bg-muted/50 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                                <LayoutTemplate className="w-8 h-8 text-muted-foreground/30 group-hover:scale-110 group-hover:text-primary/50 transition-all" />
                            </div>
                            <h3 className="font-bold text-foreground text-sm mb-1 truncate">Untitled Draft {i}</h3>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Edited 2d ago
                            </div>
                        </div>
                    ))}

                    {/* New Draft Placeholder */}
                    <div className="border-2 border-dashed border-border rounded-3xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                        <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">New Draft</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
