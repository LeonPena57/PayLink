"use client";
import { useUser } from "@/context/UserContext";

export default function TestLayoutPage() {
    const { userMode, isConfigured } = useUser();
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Test Layout Page</h1>
            <p>If you can see this, AppLayout and UserProvider are working.</p>
            <p>User Mode: {userMode}</p>
            <p>Configured: {isConfigured.toString()}</p>
        </div>
    );
}
