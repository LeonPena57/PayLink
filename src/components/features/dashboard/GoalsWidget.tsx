"use client";

import { Users, DollarSign } from "lucide-react";

export function GoalsWidget() {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <div className="bg-card rounded-xl p-4 border border-border flex flex-col justify-between shadow-lg shadow-black/5">
                <div className="flex justify-between items-start">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Clients</span>
                    <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-foreground">12</span>
                    <div className="w-full bg-muted h-1 rounded-full mt-2">
                        <div className="bg-primary h-1 rounded-full w-3/4" />
                    </div>
                </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border flex flex-col justify-between shadow-lg shadow-black/5">
                <div className="flex justify-between items-start">
                    <span className="text-muted-foreground text-xs uppercase font-bold">Income</span>
                    <DollarSign className="w-4 h-4 text-[#30D158]" />
                </div>
                <div>
                    <span className="text-2xl font-bold text-foreground">$850</span>
                    <div className="w-full bg-muted h-1 rounded-full mt-2">
                        <div className="bg-[#30D158] h-1 rounded-full w-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
