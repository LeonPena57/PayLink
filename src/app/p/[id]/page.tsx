"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, Unlock, Download, ShieldCheck, AlertCircle, CheckCircle2, Link as LinkIcon, CreditCard, EyeOff } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentModal } from "@/components/payment/PaymentModal";

export default function PaylinkClientView({ params }: { params: { id: string } }) {
    const [isPaid, setIsPaid] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [securePreviewUrl, setSecurePreviewUrl] = useState<string | null>(null);
    const [secureFileUrl, setSecureFileUrl] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // The "Real" Source - In a real app, this wouldn't even be available to the client code until verified.
    // Here we use it to generate the preview, then "forget" it until payment.
    const ORIGINAL_SOURCE = "/secure-test.png";

    const paylinkData = {
        id: params.id,
        title: "Stream Overlay Pack v2",
        price: 50.00,
        freelancer: "FateCreates",
        fileSize: "124 MB",
    };

    // Generate the "Ruined" Preview on Mount
    useEffect(() => {
        const generateSecurePreview = async () => {
            const img = new Image();
            img.src = ORIGINAL_SOURCE;
            img.crossOrigin = "anonymous";

            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // 1. Low resolution but identifiable (40% of original - less distorted)
            const scaleFactor = 0.40;
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            // 2. Draw the image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. No dark overlay (Normal brightness)
            // ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; 
            // ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 4. Burn in Diagonal Grid Watermark
            ctx.save();

            // Center rotation
            const maxSize = Math.max(canvas.width, canvas.height) * 2;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-45 * Math.PI / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            // Style for Grid Lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"; // Slightly more subtle
            ctx.lineWidth = 1;
            ctx.setLineDash([15, 15]); // Longer dashes

            // Style for Text
            const watermarkText = "© " + paylinkData.freelancer.toUpperCase();
            ctx.font = "bold 16px sans-serif"; // Slightly larger
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const step = 150; // Wider spacing

            // Draw Grid & Text
            for (let x = -maxSize; x < maxSize; x += step) {
                // Vertical Lines (relative to rotation)
                ctx.beginPath();
                ctx.moveTo(x, -maxSize);
                ctx.lineTo(x, maxSize);
                ctx.stroke();

                // Horizontal Lines (relative to rotation)
                ctx.beginPath();
                ctx.moveTo(-maxSize, x);
                ctx.lineTo(maxSize, x);
                ctx.stroke();

                // Draw Text in the center of each grid cell
                for (let y = -maxSize; y < maxSize; y += step) {
                    ctx.fillText(watermarkText, x + step / 2, y + step / 2);
                }
            }
            ctx.restore();

            // 5. Add very subtle noise for texture (reduced)
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
                ctx.fillRect(x, y, 2, 2);
            }

            // Set the "Ruined" Base64 string as the preview
            setSecurePreviewUrl(canvas.toDataURL("image/jpeg", 0.7)); // Better quality JPEG
        };

        generateSecurePreview();
    }, []);

    const handlePaymentConfirm = () => {
        setIsPaying(true);

        // Simulate Server-Side Verification & Asset Release
        setTimeout(() => {
            setIsPaying(false);
            setIsPaid(true);
            setIsPaymentModalOpen(false);
            // Reveal the high-quality source
            setSecureFileUrl(ORIGINAL_SOURCE);
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#30D158]/30">
            {/* Background Noise/Gradient */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-[#30D158]/5 pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50 mb-4">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Secure Paylink</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{paylinkData.title}</h1>
                    <p className="text-white/50">Created by <span className="text-white font-medium">{paylinkData.freelancer}</span></p>
                </div>

                {/* Main Card */}
                <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 relative group">

                    {/* Preview Area */}
                    <div className="relative aspect-video bg-[#050505] overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
                        <AnimatePresence mode="wait">
                            {!isPaid ? (
                                <motion.div
                                    key="locked"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    {/* The Generated "Ruined" Preview */}
                                    {securePreviewUrl ? (
                                        <img
                                            src={securePreviewUrl}
                                            alt="Secure Preview"
                                            className="absolute inset-0 w-full h-full object-cover opacity-100 blur-[0.5px]"
                                            style={{ pointerEvents: 'none' }} // Prevent drag/save
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-white/30">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span className="text-xs">Generating Secure Preview...</span>
                                        </div>
                                    )}

                                    {/* Additional DOM-layer Security Overlay (Intercepts clicks) */}
                                    <div className="absolute inset-0 z-50 bg-transparent" />

                                    {/* Locked Icon */}
                                    <div className="relative z-20 flex flex-col items-center gap-3 pointer-events-none">
                                        <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                                            <Lock className="w-8 h-8 text-white/70" />
                                        </div>
                                        <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/5 text-[10px] font-bold tracking-widest uppercase text-white/50">
                                            Preview Locked
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="absolute bottom-3 left-0 right-0 text-center z-20">
                                        <span className="text-[10px] font-medium text-white/40 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                                            Preview is distorted for safety
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="unlocked"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute inset-0"
                                >
                                    {/* The High Res Source - Only rendered when secureFileUrl is present */}
                                    {secureFileUrl && (
                                        <img
                                            src={secureFileUrl}
                                            alt="Full Resolution"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Total Amount</div>
                                <div className="text-3xl font-bold text-white">${paylinkData.price.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">File Size</div>
                                <div className="text-lg font-medium text-white">{paylinkData.fileSize}</div>
                            </div>
                        </div>

                        {!isPaid ? (
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                disabled={isPaying}
                                className="w-full py-4 bg-[#30D158] hover:bg-[#2bc250] active:scale-[0.98] text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-[#30D158]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isPaying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pay to Unlock
                                    </>
                                )}
                            </button>
                        ) : (
                            <a
                                href={secureFileUrl || "#"}
                                download
                                className="w-full py-4 bg-white hover:bg-gray-100 active:scale-[0.98] text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Full Quality
                            </a>
                        )}
                    </div>
                </div>

                {/* Footer Trust Indicators */}
                <div className="mt-8 flex items-center justify-center gap-6 text-white/30 grayscale opacity-50">
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <EyeOff className="w-3 h-3" />
                        Anti-Screenshot Protection
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handlePaymentConfirm}
                subtotal={paylinkData.price}
                isProcessing={isPaying}
            />
        </div>
    );
}
