"use client";

import { FileText, ShoppingBag, Briefcase, ArrowRight, Image as ImageIcon, LayoutTemplate, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatePage() {
    const router = useRouter();

    const createOptions = [
        {
            title: "New Post",
            description: "Share your latest work with the community.",
            icon: ImageIcon,
            color: "bg-pink-500",
            link: "/create/post"
        },
        {
            title: "New Invoice",
            description: "Send a professional invoice to a client.",
            icon: FileText,
            color: "bg-blue-500",
            link: "/create/invoice"
        },
        {
            title: "New Service",
            description: "Add a new service to your commission list.",
            icon: Briefcase,
            color: "bg-purple-500",
            link: "/create/service"
        },
        {
            title: "New Product",
            description: "Upload a digital product to your shop.",
            icon: ShoppingBag,
            color: "bg-green-500",
            link: "/create/product"
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-32 p-4 md:p-10 max-w-7xl mx-auto">
            <div className="mb-8 md:mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">Create New</h1>
                <p className="text-muted-foreground text-lg">What would you like to create today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {createOptions.map((option, index) => (
                    <Link
                        key={index}
                        href={option.link}
                        className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer active:scale-[0.99] flex flex-col h-full"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${option.color}/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 mb-6`}>
                            <option.icon className={`w-7 h-7 ${option.color.replace("bg-", "text-")}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{option.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{option.description}</p>
                        </div>

                        <div className="mt-8 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                            Start Creating <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Drafts / Templates Section */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Recent Drafts</h2>
                    <button className="text-sm font-bold text-primary hover:underline">View All</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="aspect-[4/3] bg-muted rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                <LayoutTemplate className="w-8 h-8 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="font-bold text-foreground text-sm mb-1 truncate">Untitled Draft {i}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>2d ago</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
