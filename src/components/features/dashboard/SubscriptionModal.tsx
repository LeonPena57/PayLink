"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Zap, Shield, Crown, X } from "lucide-react";
import clsx from "clsx";

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const plans = [
        {
            name: "Free",
            price: 0,
            period: "forever",
            description: "Essential tools for casual users.",
            features: [
                "Basic Profile",
                "5% Transaction Fee",
                "Standard Payouts (1-3 days)",
                "1GB File Storage",
                "Community Support"
            ],
            icon: Zap,
            color: "bg-blue-500",
            buttonText: "Current Plan",
            popular: false
        },
        {
            name: "Pro",
            price: billingCycle === "monthly" ? 9.99 : 99.99,
            period: billingCycle === "monthly" ? "/mo" : "/yr",
            description: "Power up your freelance career.",
            features: [
                "2% Transaction Fee",
                "Instant Payouts",
                "50GB File Storage",
                "Priority Support",
                "Custom Profile Branding"
            ],
            icon: Star,
            color: "bg-purple-500",
            buttonText: "Upgrade to Pro",
            popular: true
        },
        {
            name: "Business",
            price: billingCycle === "monthly" ? 29.99 : 299.99,
            period: billingCycle === "monthly" ? "/mo" : "/yr",
            description: "For agencies and power sellers.",
            features: [
                "Everything in Pro",
                "0% Transaction Fee",
                "Unlimited Storage",
                "White-label Invoicing",
                "Team Accounts (up to 5)",
                "Dedicated Account Manager"
            ],
            icon: Crown,
            color: "bg-orange-500",
            buttonText: "Contact Sales",
            popular: false
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[61] bg-background md:rounded-3xl shadow-2xl w-full md:w-[900px] md:max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex flex-col h-full md:h-auto md:block relative">
                            {/* Mobile Sticky Header */}
                            <div className="md:hidden sticky top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
                                <span className="font-bold text-lg">Subscription Plans</span>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Desktop Close Button */}
                            <button
                                onClick={onClose}
                                className="hidden md:block absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
                            >
                                <X className="w-6 h-6 text-muted-foreground" />
                            </button>

                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">

                                <div className="text-center mb-8">
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                                        Upgrade your experience
                                    </h2>
                                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                        Unlock lower fees, faster payouts, and powerful tools to grow your business.
                                    </p>

                                    {/* Billing Toggle */}
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        <span className={clsx("text-sm font-bold", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                                        <button
                                            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                                            className="w-14 h-7 bg-muted rounded-full relative transition-colors border border-border"
                                        >
                                            <motion.div
                                                animate={{ x: billingCycle === "monthly" ? 2 : 26 }}
                                                className="absolute top-1 left-0 w-5 h-5 bg-primary rounded-full shadow-sm"
                                            />
                                        </button>
                                        <span className={clsx("text-sm font-bold", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
                                            Yearly <span className="text-green-500 text-xs ml-1">(Save 20%)</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.name}
                                            className={clsx(
                                                "relative p-6 rounded-2xl border transition-all hover:shadow-xl flex flex-col",
                                                plan.popular ? "border-primary shadow-lg shadow-primary/10 bg-card" : "border-border bg-muted/30"
                                            )}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                                    Most Popular
                                                </div>
                                            )}

                                            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg", plan.color)}>
                                                <plan.icon className="w-6 h-6" />
                                            </div>

                                            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{plan.description}</p>

                                            <div className="mb-6">
                                                <span className="text-3xl font-black">${plan.price}</span>
                                                <span className="text-muted-foreground font-medium">{plan.period}</span>
                                            </div>

                                            <ul className="space-y-3 mb-8 flex-1">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" strokeWidth={3} />
                                                        <span className="text-muted-foreground font-medium">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
                                                className={clsx(
                                                    "w-full py-3 rounded-xl font-bold transition-all active:scale-95",
                                                    plan.popular
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                                                        : "bg-muted text-foreground border border-border hover:bg-muted/80"
                                                )}
                                            >
                                                {plan.buttonText}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Maybe Later Button */}
                            <div className="md:hidden p-4 border-t border-border bg-background pb-safe">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 text-muted-foreground font-bold hover:text-foreground transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
