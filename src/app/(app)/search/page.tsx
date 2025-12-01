"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ServiceCard } from "@/components/features/ServiceCard";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("q") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [category, setCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState(query);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            let queryBuilder = supabase
                .from('services')
                .select(`
                    *,
                    profiles (id, full_name, avatar_url, seller_level)
                `);

            if (query) {
                queryBuilder = queryBuilder.ilike('title', `%${query}%`);
            }

            if (category !== "All") {
                queryBuilder = queryBuilder.eq('category', category);
            }

            const { data } = await queryBuilder;
            if (data) setServices(data);
            setLoading(false);
        };

        fetchServices();
    }, [query, category]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex gap-4 items-center">
                        <Link href="/home" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors md:hidden">
                            <ArrowLeft className="w-6 h-6 text-foreground" />
                        </Link>
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="What service are you looking for?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-3 font-medium focus:ring-2 focus:ring-primary/20 border-none outline-none"
                            />
                        </form>
                        <button className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                        {["All", "Graphics & Design", "Digital Marketing", "Writing", "Video", "Music", "Programming"].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${category === cat
                                        ? "bg-foreground text-background"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-foreground">No services found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
