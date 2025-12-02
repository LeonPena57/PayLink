"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ServiceCard } from "@/components/features/ServiceCard";
import { Search, SlidersHorizontal, ArrowLeft, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { ResponsiveSelect } from "@/components/ui/ResponsiveSelect";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("q") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filters State
    const [category, setCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState(query);
    const [sort, setSort] = useState("recommended"); // recommended, price_asc, price_desc, newest
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            let queryBuilder = supabase
                .from('services')
                .select(`
                    *,
                    profiles (id, full_name, avatar_url, seller_level)
                `);

            // Search Query
            if (query) {
                queryBuilder = queryBuilder.ilike('title', `%${query}%`);
            }

            // Category Filter
            if (category !== "All") {
                queryBuilder = queryBuilder.eq('category', category);
            }

            // Price Filter
            if (minPrice) {
                queryBuilder = queryBuilder.gte('price', parseFloat(minPrice));
            }
            if (maxPrice) {
                queryBuilder = queryBuilder.lte('price', parseFloat(maxPrice));
            }

            // Sorting
            switch (sort) {
                case 'price_asc':
                    queryBuilder = queryBuilder.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    queryBuilder = queryBuilder.order('price', { ascending: false });
                    break;
                case 'newest':
                    queryBuilder = queryBuilder.order('created_at', { ascending: false });
                    break;
                default:
                    // Recommended (default) - usually complex, for now just newest or random
                    queryBuilder = queryBuilder.order('created_at', { ascending: false });
            }

            const { data } = await queryBuilder;
            if (data) setServices(data);
            setLoading(false);
        };

        fetchServices();
    }, [query, category, sort, minPrice, maxPrice]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    const clearFilters = () => {
        setCategory("All");
        setSort("recommended");
        setMinPrice("");
        setMaxPrice("");
    };

    const activeFiltersCount = (category !== "All" ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (sort !== "recommended" ? 1 : 0);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border transition-all">
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
                                className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-3 font-medium focus:ring-2 focus:ring-primary/20 border-none outline-none transition-all"
                            />
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={clsx(
                                "p-3 rounded-xl transition-colors relative",
                                showFilters || activeFiltersCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                            )}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            {activeFiltersCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white border border-background">
                                    {activeFiltersCount}
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Filter Tags (Horizontal Scroll) */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                        {["All", "Graphic Design", "Digital Art", "Video Editing", "Writing", "Programming", "Music & Audio", "Business"].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border",
                                    category === cat
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-2xl border border-border animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
                                <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Sort */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Sort By</label>
                                    <div className="relative">
                                        <ResponsiveSelect
                                            value={sort}
                                            onChange={(val) => setSort(val)}
                                            options={[
                                                { label: "Recommended", value: "recommended" },
                                                { label: "Newest Arrivals", value: "newest" },
                                                { label: "Price: Low to High", value: "price_asc" },
                                                { label: "Price: High to Low", value: "price_desc" }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Price Range</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full bg-background border border-border rounded-xl pl-6 pr-3 py-2.5 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <span className="text-muted-foreground">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full bg-background border border-border rounded-xl pl-6 pr-3 py-2.5 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No services found</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                            We couldn't find any services matching your search. Try adjusting your filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:scale-105 transition-transform"
                        >
                            Clear Filters
                        </button>
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
