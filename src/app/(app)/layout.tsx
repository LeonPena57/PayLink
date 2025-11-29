"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // Removed strict session check to allow public access to /home
    // Individual protected pages should handle their own redirects if needed.

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
