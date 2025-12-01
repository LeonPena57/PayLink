"use client";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Removed strict session check to allow public access to /home
    // Individual protected pages should handle their own redirects if needed.

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
