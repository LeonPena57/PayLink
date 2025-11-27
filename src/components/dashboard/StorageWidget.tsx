"use client";

import { HardDrive, AlertTriangle, Zap } from "lucide-react";
import clsx from "clsx";

interface StorageWidgetProps {
    usedGB: number;
    totalGB: number;
    tier: 'FREE' | 'PRO';
}

export function StorageWidget({ usedGB, totalGB, tier }: StorageWidgetProps) {
    const percentage = Math.min((usedGB / totalGB) * 100, 100);
    const isNearFull = percentage > 80;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <HardDrive className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Storage</h3>
                        <p className="text-xs text-muted-foreground">{tier === 'FREE' ? 'Free Plan' : 'Pro Plan'}</p>
                    </div>
                </div>
                {tier === 'FREE' && (
                    <button className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Upgrade
                    </button>
                )}
            </div>

            {/* Meter */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className={clsx(isNearFull ? "text-red-500" : "text-foreground")}>
                        {usedGB.toFixed(1)} GB used
                    </span>
                    <span className="text-muted-foreground">{totalGB} GB total</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            isNearFull ? "bg-red-500" : "bg-primary"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Warning for Free Users */}
            {tier === 'FREE' && isNearFull && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-500/90 font-medium">
                        Storage almost full. Upgrade to Pro for 100GB storage and advanced analytics.
                    </p>
                </div>
            )}
        </div>
    );
}
