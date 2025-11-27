"use client";

import { CheckCircle2, Lock, Circle } from "lucide-react";
import clsx from "clsx";

interface Milestone {
    id: string;
    title: string;
    amount: number;
    status: "paid" | "current" | "locked";
}

const milestones: Milestone[] = [
    { id: "1", title: "Sketch Phase", amount: 50, status: "paid" },
    { id: "2", title: "Lineart Phase", amount: 50, status: "current" },
    { id: "3", title: "Final Render", amount: 100, status: "locked" },
];

export function MilestoneInvoice() {
    const handlePay = () => {
        alert("Opening payment gateway...");
    };

    return (
        <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Milestones</h3>
            <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-muted" />

                {milestones.map((step) => (
                    <div key={step.id} className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div className={clsx(
                            "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                            step.status === "paid" ? "bg-success border-success text-white" :
                                step.status === "current" ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                                    "bg-muted border-muted-foreground/30 text-muted-foreground"
                        )}>
                            {step.status === "paid" ? <CheckCircle2 className="w-4 h-4" /> :
                                step.status === "current" ? <Circle className="w-4 h-4 fill-current" /> :
                                    <Lock className="w-4 h-4" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h4 className={clsx(
                                    "font-bold",
                                    step.status === "locked" ? "text-muted-foreground" : "text-foreground"
                                )}>
                                    {step.title}
                                </h4>
                                <span className={clsx(
                                    "font-mono",
                                    step.status === "locked" ? "text-muted-foreground" : "text-muted-foreground"
                                )}>
                                    ${step.amount}
                                </span>
                            </div>

                            {step.status === "current" && (
                                <button
                                    onClick={handlePay}
                                    className="mt-3 w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-colors shadow-lg shadow-primary/20"
                                >
                                    Pay Invoice
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
