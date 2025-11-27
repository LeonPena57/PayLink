"use client";

import { MessagesWidget } from "@/components/features/dashboard/MessagesWidget";

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-background pb-32 p-6">
            <div className="max-w-7xl mx-auto">
                <MessagesWidget />
            </div>
        </div>
    );
}
