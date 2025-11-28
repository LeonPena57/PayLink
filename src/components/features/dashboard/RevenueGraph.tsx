"use client";

import { TrendingUp, BarChart3 } from "lucide-react";

export function RevenueGraph() {
    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Revenue</h3>
                <TrendingUp className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 opacity-50" />
                </div>
                <span className="text-sm font-medium">No data available</span>
            </div>
        </div>
    );
}
