"use client";

import { QrCode, Share2, Download } from "lucide-react";

export default function QrPage() {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My PayLink QR Code',
                text: 'Scan to commission me!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Share functionality not supported on this device.");
        }
    };

    const handleDownload = () => {
        alert("Downloading QR Code...");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary/20 mb-8 transform transition-transform hover:scale-105 duration-300">
                <QrCode className="w-64 h-64 text-black" />
            </div>
            <h1 className="text-3xl font-header font-bold italic text-foreground mb-2">
                SCAN TO COMMISSION
            </h1>
            <p className="text-muted-foreground mb-8">
                Share this code with clients to get paid instantly.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-bold text-foreground hover:bg-muted transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                    Share
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Download className="w-5 h-5" />
                    Download
                </button>
            </div>
        </div>
    );
}
