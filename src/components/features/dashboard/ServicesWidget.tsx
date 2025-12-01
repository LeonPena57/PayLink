"use client";

import { MoreHorizontal, Plus, ArrowRight, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

export function ServicesWidget() {
    const { user } = useUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('services')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setServices(data);
            setLoading(false);
        };
        fetchServices();
    }, [user]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                {services.length > 0 ? (
                    services.map((service) => (
                        <Link href={`/service/${service.id}`} key={service.id} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.99] shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-foreground text-[15px]">{service.title}</div>
                                    <div className="text-xs text-muted-foreground font-medium">Starting at</div>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <div className="font-bold text-lg text-foreground tracking-tight">${service.price}</div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold text-foreground">No Services Yet</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">Add a service to start selling.</p>
                    </div>
                )}
            </div>

            <Link href="/create/service" className="mt-6 w-full py-4 rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-bold hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                </div>
                Add New Service
            </Link>
        </div>
    );
}
