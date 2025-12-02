"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, X, ChevronDown } from "lucide-react";

interface Option {
    label: string;
    value: string | number;
}

interface ResponsiveSelectProps {
    label?: string;
    value: string | number;
    onChange: (value: string) => void;
    options: Option[];
    icon?: React.ReactNode;
    placeholder?: string;
}

export function ResponsiveSelect({ label, value, onChange, options, icon, placeholder }: ResponsiveSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value == value);

    return (
        <>
            {/* Desktop: Standard Select */}
            <div className="hidden md:block relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-0 rounded-xl p-2.5 pr-10 text-sm font-bold appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* Mobile: Bottom Sheet Trigger */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl p-3 text-sm font-bold flex items-center justify-between group border border-transparent hover:border-border"
                >
                    <span className={clsx("truncate", !selectedOption && "text-muted-foreground")}>
                        {selectedOption ? selectedOption.label : placeholder || "Select..."}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors rotate-90" />
                </button>
            </div>

            {/* Mobile Bottom Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[2rem] border-t border-border p-6 z-[101] md:hidden max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6 sticky top-0 bg-background z-10 pb-2 border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <h3 className="text-xl font-bold">{label || "Select Option"}</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {options.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value.toString());
                                            setIsOpen(false);
                                        }}
                                        className={clsx(
                                            "p-4 rounded-xl font-bold text-left transition-all flex items-center justify-between",
                                            value == opt.value
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {opt.label}
                                        {value == opt.value && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                            <div className="h-8" /> {/* Safe area */}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
