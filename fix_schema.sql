-- Drop tables if they exist to ensure clean creation with correct columns
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS tips CASCADE;

-- Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  service_id UUID REFERENCES services(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tips Table
CREATE TABLE tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to Services for Search & Analytics
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_time_days INTEGER DEFAULT 3;
ALTER TABLE services ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Add columns to Profiles for Seller Level
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seller_level TEXT DEFAULT 'New Seller';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Add columns to Orders for Timeline
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requirements_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS revision_requested_at TIMESTAMP WITH TIME ZONE;

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own tips" ON tips FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert tips" ON tips FOR INSERT WITH CHECK (auth.uid() = sender_id);
