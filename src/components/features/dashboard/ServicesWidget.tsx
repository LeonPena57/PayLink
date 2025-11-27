"use client";

import { MoreHorizontal, Plus, Sparkles, Palette, Gamepad2, ArrowRight } from "lucide-react";

const services = [
    { name: "Stream Overlays", price: "$50+", icon: Gamepad2, color: "text-[#BF5AF2]", bg: "bg-[#BF5AF2]/10" },
    { name: "Emote Pack (5)", price: "$35", icon: Sparkles, color: "text-[#FFD60A]", bg: "bg-[#FFD60A]/10" },
    { name: "Logo Design", price: "$100", icon: Palette, color: "text-[#0A84FF]", bg: "bg-[#0A84FF]/10" },
];

export function ServicesWidget() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Services</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-0.5">Manage your offerings</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3 flex-1">
                {services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.99] shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center ${service.color}`}>
                                <service.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-foreground text-[15px]">{service.name}</div>
                                <div className="text-xs text-muted-foreground font-medium">Starting at</div>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <div className="font-bold text-lg text-foreground tracking-tight">{service.price}</div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-6 w-full py-4 rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-bold hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                </div>
                Add New Service
            </button>
        </div>
    );
}
