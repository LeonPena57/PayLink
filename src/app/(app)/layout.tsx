import { Navigation } from "@/components/layout/Navigation";
import { UserProvider } from "@/context/UserContext";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <UserProvider>
            <div className="flex flex-col h-screen overflow-hidden">
                <Navigation />
                <main className="flex-1 w-full h-full overflow-y-auto relative bg-background">
                    {children}
                </main>
            </div>
        </UserProvider>
    );
}
