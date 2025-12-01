"use client";

import { Check, Clock, Circle } from "lucide-react";
import clsx from "clsx";

interface OrderTimelineProps {
    status: string;
    createdAt: string;
    requirementsSubmittedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
}

export function OrderTimeline({ status, createdAt, requirementsSubmittedAt, deliveredAt, completedAt }: OrderTimelineProps) {
    const steps = [
        {
            id: 'placed',
            label: 'Order Placed',
            date: createdAt,
            completed: true
        },
        {
            id: 'requirements',
            label: 'Requirements',
            date: requirementsSubmittedAt,
            completed: !!requirementsSubmittedAt || ['in_progress', 'delivered', 'completed', 'revision'].includes(status)
        },
        {
            id: 'in_progress',
            label: 'In Progress',
            date: null, // Usually implied by requirements submitted
            completed: ['delivered', 'completed', 'revision'].includes(status)
        },
        {
            id: 'delivered',
            label: 'Delivered',
            date: deliveredAt,
            completed: ['delivered', 'completed'].includes(status)
        },
        {
            id: 'completed',
            label: 'Completed',
            date: completedAt,
            completed: status === 'completed'
        }
    ];

    return (
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm mb-6">
            <h3 className="font-bold text-lg mb-6">Order Timeline</h3>
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-muted" />

                <div className="space-y-6 relative z-10">
                    {steps.map((step, index) => {
                        const isCompleted = step.completed;
                        const isCurrent = !isCompleted && (index === 0 || steps[index - 1].completed);

                        return (
                            <div key={step.id} className="flex gap-4">
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                        isCurrent ? "bg-background border-primary text-primary animate-pulse" :
                                            "bg-background border-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? <Check className="w-4 h-4" /> :
                                        isCurrent ? <Clock className="w-4 h-4" /> :
                                            <Circle className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className={clsx("font-bold text-sm", isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                                        {step.label}
                                    </div>
                                    {step.date && (
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(step.date).toLocaleDateString()} {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
