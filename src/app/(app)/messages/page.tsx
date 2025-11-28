"use client";

import { Suspense } from "react";
import { MessagesWidget } from "@/components/features/dashboard/MessagesWidget";

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-background pb-32 p-6">
            <div className="max-w-7xl mx-auto">
                <Suspense fallback={
                    <div className="w-full max-w-2xl mx-auto h-[80vh] flex items-center justify-center bg-card border border-border rounded-3xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                }>
                    <MessagesWidget />
                </Suspense>
            </div>
        </div>
    );
}
