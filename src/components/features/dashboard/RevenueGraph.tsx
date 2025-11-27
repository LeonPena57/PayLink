"use client";

import { TrendingUp } from "lucide-react";

export function RevenueGraph() {
    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Revenue</h3>
                <TrendingUp className="text-[#30D158] w-5 h-5" />
            </div>
            <div className="flex-1 flex items-end justify-center relative text-primary">
                {/* Mock Chart */}
                <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0 50 L0 30 Q 20 10, 40 30 T 80 20 T 100 5 L 100 50 Z"
                        fill="url(#gradient)"
                    />
                    <path
                        d="M0 30 Q 20 10, 40 30 T 80 20 T 100 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Tooltip placeholder */}
                <div className="absolute top-0 right-10 bg-popover text-xs px-2 py-1 rounded border border-border text-primary shadow-sm">
                    $2.4k
                </div>
            </div>
        </div>
    );
}
