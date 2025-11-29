export type ServiceTier = {
    id: string;
    service_id: string;
    name: 'Basic' | 'Standard' | 'Premium';
    description: string | null;
    price: number;
    delivery_days: number;
    revisions: number;
    features: string[];
    created_at: string;
};

export type Service = {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    thumbnail_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    tiers?: ServiceTier[];
};

export type OrderStatus = 'incomplete' | 'active' | 'delivered' | 'in_revision' | 'completed' | 'cancelled' | 'disputed';

export type Order = {
    id: string;
    buyer_id: string;
    seller_id: string;
    service_id: string | null;
    tier_id: string | null;
    status: OrderStatus;
    price: number;
    requirements: string | null;
    dispute_reason: string | null;
    is_paused: boolean;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
};

export type Transaction = {
    id: string;
    order_id: string;
    amount: number;
    status: 'held' | 'released' | 'refunded';
    created_at: string;
    released_at: string | null;
};

export type OrderFile = {
    id: string;
    order_id: string;
    uploader_id: string;
    file_name: string;
    file_url: string;
    file_size: number | null;
    version: number;
    is_latest: boolean;
    created_at: string;
};

export type SellerMetrics = {
    seller_id: string;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    avg_rating: number;
    on_time_delivery_rate: number;
    avg_response_time_minutes: number;
    updated_at: string;
};

export type ProfileStats = {
    followers: number;
    following: number;
    is_following: boolean;
};

export type Comment = {
    id: string;
    user_id: string;
    portfolio_item_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    profiles?: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string | null;
    };
    likes_count?: number;
    user_has_liked?: boolean;
};

export type InvoiceItem = {
    title: string;
    price: number;
    image: string | null;
    size: string | null;
    date: string;
};

export type Invoice = {
    id: string;
    seller_id: string;
    amount: number;
    currency: string;
    description: string;
    status: 'pending' | 'paid' | 'cancelled';
    created_at: string;
    items: InvoiceItem[] | null;
};

export type PortfolioItem = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    image_url: string;
    section: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    user?: {
        name: string;
        username: string;
        avatar: string | null;
        verification_status?: string;
    };
    profiles?: {
        full_name: string;
        username: string;
        avatar_url: string | null;
        verification_status?: string;
    };
    likes?: { count: number }[];
    comments?: { count: number }[];
};
