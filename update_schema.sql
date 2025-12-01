-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Favorites/Collections Table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT one_target_only CHECK (
        (service_id IS NOT NULL AND product_id IS NULL AND portfolio_item_id IS NULL) OR
        (service_id IS NULL AND product_id IS NOT NULL AND portfolio_item_id IS NULL) OR
        (service_id IS NULL AND product_id IS NULL AND portfolio_item_id IS NOT NULL)
    )
);

-- 3. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    opener_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- ID of the user, service, or content being reported
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'service', 'product', 'post', 'order')),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order Revisions Table
CREATE TABLE IF NOT EXISTS order_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add Requirements to Services
ALTER TABLE services ADD COLUMN IF NOT EXISTS requirements TEXT;

-- 7. Add Requirements Data to Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requirements_data JSONB;
-- Ensure status column exists and is text (or compatible)
-- We won't alter the type here to avoid errors if it's an enum, but we assume it supports our statuses.

-- RLS Policies (Basic)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_revisions ENABLE ROW LEVEL SECURITY;

-- Reviews: Public read, Authenticated create
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Favorites: Private read/write
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Disputes: Involved parties read, Opener create
CREATE POLICY "Parties can view disputes" ON disputes FOR SELECT USING (
    auth.uid() = opener_id OR 
    EXISTS (SELECT 1 FROM orders WHERE orders.id = disputes.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()))
);
CREATE POLICY "Users can open disputes" ON disputes FOR INSERT WITH CHECK (auth.uid() = opener_id);

-- Reports: Reporter view, Authenticated create
CREATE POLICY "Reporters can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Revisions: Involved parties read, Requester create
CREATE POLICY "Parties can view revisions" ON order_revisions FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_revisions.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()))
);
CREATE POLICY "Users can request revisions" ON order_revisions FOR INSERT WITH CHECK (auth.uid() = requester_id);
