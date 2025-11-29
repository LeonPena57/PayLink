"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase/client";
import { Shield, Users, DollarSign, AlertTriangle, Search, User } from "lucide-react";
import clsx from "clsx";

export default function AdminPage() {
    const { user, profile } = useUser();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 12500, // Mocked
        activeDisputes: 3
    });
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if user is admin
                if (!user) return;

                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();

                if (!profileData?.is_admin) {
                    // Redirect or show access denied
                    setLoading(false);
                    return;
                }

                // Fetch users count
                const { count } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true });

                setStats(prev => ({ ...prev, totalUsers: count || 0 }));

                // Fetch recent users
                const { data: recentUsers } = await supabase
                    .from("profiles")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(10);

                setUsers(recentUsers || []);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    if (!loading && (!user || (profile as any)?.is_admin === false)) {
        // We can do a better check here, but for now relying on the fetch logic or profile context if updated
        // Ideally profile context should have is_admin
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8 pb-32 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-header italic tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Platform overview and moderation.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-card border border-border rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-bold">Total Users</div>
                            <div className="text-2xl font-black">{stats.totalUsers}</div>
                        </div>
                    </div>
                    <div className="p-6 bg-card border border-border rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-bold">Total Revenue</div>
                            <div className="text-2xl font-black">${stats.totalRevenue.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="p-6 bg-card border border-border rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-bold">Active Disputes</div>
                            <div className="text-2xl font-black">{stats.activeDisputes}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-lg">Recent Users</h3>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="pl-9 pr-4 py-2 bg-muted/50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-bold">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Joined</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-muted rounded-full overflow-hidden">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-4 h-4 m-2 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{u.full_name || "Unknown"}</div>
                                                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-bold",
                                                u.verification_status === 'verified' ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                                            )}>
                                                {u.verification_status || 'none'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(u.created_at || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary hover:underline font-bold">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
