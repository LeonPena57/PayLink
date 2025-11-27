"use client";

import { Heart, DollarSign } from "lucide-react";

export function TipWidget() {
    return (
        <div className="bg-card rounded-3xl p-6 border border-border h-full flex flex-col justify-between shadow-lg shadow-black/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 bg-[#30D158]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center text-[#30D158]">
                        <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Support the Creator</h3>
                        <p className="text-xs text-muted-foreground font-medium">Love the work? Send a tip!</p>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground italic">
                        "Your support helps me create more amazing content and overlays. Thank you! 💖"
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-6">
                <button className="w-full py-3 bg-[#30D158] text-white font-bold rounded-xl hover:bg-[#30D158]/90 transition-all shadow-lg shadow-[#30D158]/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                    <DollarSign className="w-5 h-5" />
                    Send a Tip
                </button>
                <p className="text-[10px] text-center text-muted-foreground font-bold mt-3 uppercase tracking-wider opacity-60">
                    100% goes to creator • No fees
                </p>
            </div>
        </div>
    );
}
