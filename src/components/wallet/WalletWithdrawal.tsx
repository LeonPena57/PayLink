"use client";

import { Wallet, ArrowRight, Zap, Building2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface WalletWithdrawalProps {
    balance: number;
}

export function WalletWithdrawal({ balance }: WalletWithdrawalProps) {
    const [selectedOption, setSelectedOption] = useState<'STANDARD' | 'INSTANT' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const instantFee = (balance * 0.015).toFixed(2);

    const handleWithdraw = () => {
        if (!selectedOption) return;
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 2000);
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Withdraw Funds</h2>
                    <p className="text-muted-foreground">Choose how you want to receive your earnings.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Available Balance</div>
                    <div className="text-3xl font-bold text-foreground">${balance.toFixed(2)}</div>
                </div>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {/* Standard Option */}
                <button
                    onClick={() => setSelectedOption('STANDARD')}
                    className={clsx(
                        "relative p-6 rounded-xl border-2 text-left transition-all duration-200 group",
                        selectedOption === 'STANDARD'
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                >
                    {selectedOption === 'STANDARD' && (
                        <div className="absolute top-4 right-4 text-primary">
                            <CheckCircle2 className="w-6 h-6 fill-primary/20" />
                        </div>
                    )}
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">Standard Transfer</h3>
                    <p className="text-sm text-muted-foreground mb-4">1-3 Business Days</p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold">
                        Free ($0.00 Fee)
                    </div>
                </button>

                {/* Instant Option */}
                <button
                    onClick={() => setSelectedOption('INSTANT')}
                    className={clsx(
                        "relative p-6 rounded-xl border-2 text-left transition-all duration-200 group overflow-hidden",
                        selectedOption === 'INSTANT'
                            ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10"
                            : "border-border hover:border-amber-500/50 hover:bg-muted/50"
                    )}
                >
                    {/* Recommended Badge */}
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                        RECOMMENDED
                    </div>

                    {selectedOption === 'INSTANT' && (
                        <div className="absolute top-8 right-4 text-amber-500">
                            <CheckCircle2 className="w-6 h-6 fill-amber-500/20" />
                        </div>
                    )}

                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">Instant Payout</h3>
                    <p className="text-sm text-muted-foreground mb-4">Within minutes (Push-to-Card)</p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
                        1.5% Fee (${instantFee})
                    </div>
                </button>
            </div>

            {/* Action */}
            <button
                onClick={handleWithdraw}
                disabled={!selectedOption || isProcessing}
                className={clsx(
                    "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
                    !selectedOption
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : isProcessing
                            ? "bg-primary/80 text-primary-foreground cursor-wait"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
                )}
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Withdrawal...
                    </>
                ) : (
                    <>
                        Withdraw Funds
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    );
}
