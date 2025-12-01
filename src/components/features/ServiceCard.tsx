"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ServiceCard({ service }: { service: any }) {
    return (
        <Link href={`/services/${service.id}`} className="block group">
            <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                    {service.thumbnail_url ? (
                        <Image src={service.thumbnail_url} alt={service.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium">
                            No Image
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-muted overflow-hidden relative shrink-0">
                            {service.profiles?.avatar_url && (
                                <Image src={service.profiles.avatar_url} alt="" fill className="object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground truncate">{service.profiles?.full_name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                                {service.profiles?.seller_level || 'New Seller'}
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
                        {service.title}
                    </h3>

                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-500 mb-4">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{service.rating_avg || "0.0"}</span>
                        <span className="text-muted-foreground font-medium">({service.rating_count || 0})</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <button className="text-muted-foreground hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                        <div className="text-right">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Starting at</span>
                            <div className="text-lg font-black text-foreground">${service.price}</div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
