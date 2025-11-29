
-- Messages System

create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table conversations enable row level security;

create policy "Users can view conversations they are part of"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = conversations.id
      and user_id = auth.uid()
    )
  );

create table if not exists conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);

alter table conversation_participants enable row level security;

create policy "Users can view participants of their conversations"
  on conversation_participants for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );

-- Allow users to create conversations (simplified: anyone can start a convo)
create policy "Users can create conversation participants"
  on conversation_participants for insert
  with check (auth.uid() = user_id OR true); -- Allow adding others for now

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  is_read boolean default false
);

alter table messages enable row level security;

create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id AND
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
      and user_id = auth.uid()
    )
  );
-- Fix Foreign Key Relationship for portfolio_items
-- This is needed to allow joining portfolio_items with profiles
alter table portfolio_items
drop constraint if exists portfolio_items_user_id_fkey, -- Drop old constraint if it exists
add constraint portfolio_items_user_id_fkey
foreign key (user_id)
references auth.users(id)
on delete cascade;

-- Note: We cannot strictly reference profiles(id) if profiles is not guaranteed to exist for every user,
-- but since we create profile on signup, it should be fine.
-- However, PostgREST joins usually work on the FK.
-- If we want to join 'profiles', we need a FK to 'profiles'.
-- Since profiles.id IS auth.users.id, we can add a second FK or just rely on the fact that they are the same.
-- BUT PostgREST needs an explicit FK to the table we are joining.

alter table portfolio_items
drop constraint if exists portfolio_items_user_id_fkey_profiles;

alter table portfolio_items
add constraint portfolio_items_user_id_fkey_profiles
foreign key (user_id)
references profiles(id)
on delete cascade;


-- Social Features: Likes and Comments (Idempotent)

-- 1. Likes Table
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  portfolio_item_id uuid references portfolio_items(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, portfolio_item_id)
);

alter table likes enable row level security;

create policy "Public likes are viewable by everyone"
  on likes for select using (true);

create policy "Users can like posts"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on likes for delete using (auth.uid() = user_id);

-- 2. Comments Table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  portfolio_item_id uuid references portfolio_items(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table comments enable row level security;

create policy "Public comments are viewable by everyone"
  on comments for select using (true);

create policy "Users can comment on posts"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = user_id);

create policy "Post owners can delete comments on their posts"
  on comments for delete using (
    exists (
      select 1 from portfolio_items
      where portfolio_items.id = comments.portfolio_item_id
      and portfolio_items.user_id = auth.uid()
    )
  );

-- 3. Helper function to get post stats (likes, comments, user_has_liked)
create or replace function get_post_stats(post_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  likes_count integer;
  comments_count integer;
  user_has_liked boolean;
begin
  select count(*) into likes_count
  from likes
  where portfolio_item_id = post_id;

  select count(*) into comments_count
  from comments
  where portfolio_item_id = post_id;

  if auth.uid() is not null then
    select exists(
      select 1 from likes
      where portfolio_item_id = post_id
      and user_id = auth.uid()
    ) into user_has_liked;
  else
    user_has_liked := false;
  end if;

  return json_build_object(
    'likes_count', likes_count,
    'comments_count', comments_count,
    'user_has_liked', user_has_liked
  );
end;
$$;
-- Fix Foreign Key Relationship for portfolio_items
-- This is critical for the feed to work correctly when joining with profiles
DO $$
BEGIN
    -- Drop the constraint if it exists to ensure we can recreate it correctly
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_user_id_fkey_profiles') THEN
        ALTER TABLE portfolio_items DROP CONSTRAINT portfolio_items_user_id_fkey_profiles;
    END IF;

    -- Add the constraint
    ALTER TABLE portfolio_items
    ADD CONSTRAINT portfolio_items_user_id_fkey_profiles
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
END $$;

-- Ensure comments table exists
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  portfolio_item_id uuid REFERENCES portfolio_items(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on comments if not already enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Safely create policies for comments
DO $$
BEGIN
    -- Drop policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON comments;
    DROP POLICY IF EXISTS "Users can comment on posts" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
    DROP POLICY IF EXISTS "Post owners can delete comments on their posts" ON comments;
    
    -- Recreate policies
    CREATE POLICY "Public comments are viewable by everyone"
      ON comments FOR SELECT USING (true);

    CREATE POLICY "Users can comment on posts"
      ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own comments"
      ON comments FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Post owners can delete comments on their posts"
      ON comments FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM portfolio_items
          WHERE portfolio_items.id = comments.portfolio_item_id
          AND portfolio_items.user_id = auth.uid()
        )
      );
END $$;

-- Update get_post_stats function (this is always safe to replace)
CREATE OR REPLACE FUNCTION get_post_stats(post_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  likes_count integer;
  comments_count integer;
  user_has_liked boolean;
BEGIN
  SELECT count(*) INTO likes_count
  FROM likes
  WHERE portfolio_item_id = post_id;

  SELECT count(*) INTO comments_count
  FROM comments
  WHERE portfolio_item_id = post_id;

  IF auth.uid() IS NOT NULL THEN
    SELECT exists(
      SELECT 1 FROM likes
      WHERE portfolio_item_id = post_id
      AND user_id = auth.uid()
    ) INTO user_has_liked;
  ELSE
    user_has_liked := false;
  END IF;

  RETURN json_build_object(
    'likes_count', likes_count,
    'comments_count', comments_count,
    'user_has_liked', user_has_liked
  );
END;
$$;
-- Fix comments relationship for PostgREST joins
-- We need an explicit foreign key to the profiles table for the join to work
DO $$
BEGIN
    -- Drop existing constraint if it references auth.users (optional, but cleaner to reference profiles)
    -- Actually, we can keep both or just add the one to profiles. 
    -- PostgREST prefers a clear path. Let's add the constraint to profiles.
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_id_fkey_profiles') THEN
        ALTER TABLE comments
        ADD CONSTRAINT comments_user_id_fkey_profiles
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;

    -- Do the same for likes if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_fkey_profiles') THEN
            ALTER TABLE likes
            ADD CONSTRAINT likes_user_id_fkey_profiles
            FOREIGN KEY (user_id)
            REFERENCES profiles(id)
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
-- 1. Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- 2. Force a schema cache reload (by notifying pgrst)
NOTIFY pgrst, 'reload config';

-- 3. Populate/Update the profile for the user
-- NOTE: avatar_url is set to NULL to use the new placeholder icon
INSERT INTO public.profiles (id, username, full_name, bio, location, accent_color, verification_status, avatar_url, banner_url, social_links)
VALUES (
  '40e74a9b-fd26-4f2f-905e-e518ba1ba085', -- Your UID
  'havefate',
  'HaveFate',
  'Professional Graphic Designer specializing in branding, stream assets, and illustrations. Let''s create something amazing together.',
  'Digital World',
  '#3b82f6',
  'verified',
  NULL, -- Set to NULL for placeholder
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
  '{"twitter": "havefate", "instagram": "havefate", "twitch": "havefate"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  accent_color = EXCLUDED.accent_color,
  verification_status = EXCLUDED.verification_status,
  avatar_url = EXCLUDED.avatar_url,
  banner_url = EXCLUDED.banner_url,
  social_links = EXCLUDED.social_links,
  updated_at = now();
-- Update profile for specific user to match demo data
INSERT INTO public.profiles (id, username, full_name, bio, location, accent_color, verification_status, avatar_url, banner_url, social_links)
VALUES (
  '40e74a9b-fd26-4f2f-905e-e518ba1ba085', -- User's UID
  'leonpena', -- Username (you can change this)
  'Leon Pena', -- Full Name
  'Digital Artist & Designer creating premium assets for streamers and content creators. Specialized in motion graphics and UI design.', -- Bio
  'San Francisco, CA', -- Location
  '#3b82f6', -- Accent Color (Blue)
  'verified', -- Verification Status
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop', -- Demo Avatar
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', -- Demo Banner
  '{"twitter": "leonpena", "instagram": "leon_art", "twitch": "leonstream"}'::jsonb -- Social Links
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  accent_color = EXCLUDED.accent_color,
  verification_status = EXCLUDED.verification_status,
  avatar_url = EXCLUDED.avatar_url,
  banner_url = EXCLUDED.banner_url,
  social_links = EXCLUDED.social_links,
  updated_at = now();
-- Remove avatar for HaveFate user to show the placeholder icon
UPDATE public.profiles
SET avatar_url = NULL
WHERE username = 'HaveFate';

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload config';
-- 1. Drop the existing foreign key constraint on profiles.id
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Re-add the constraint with ON DELETE CASCADE
-- This ensures that when a user is deleted from auth.users, their profile is also deleted automatically.
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. (Optional) Do the same for other tables that reference auth.users if needed
-- For example, verification_requests
ALTER TABLE public.verification_requests
DROP CONSTRAINT IF EXISTS verification_requests_user_id_fkey;

ALTER TABLE public.verification_requests
ADD CONSTRAINT verification_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- For portfolio_items
ALTER TABLE public.portfolio_items
DROP CONSTRAINT IF EXISTS portfolio_items_user_id_fkey;

ALTER TABLE public.portfolio_items
ADD CONSTRAINT portfolio_items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- For follows (follower)
ALTER TABLE public.follows
DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;

ALTER TABLE public.follows
ADD CONSTRAINT follows_follower_id_fkey
FOREIGN KEY (follower_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- For follows (following)
ALTER TABLE public.follows
DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE public.follows
ADD CONSTRAINT follows_following_id_fkey
FOREIGN KEY (following_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- INSTRUCTIONS:
-- 1. Copy the SQL above.
-- 2. Go to your Supabase Dashboard -> SQL Editor.
-- 3. Paste and run the code.
-- 4. Now you can delete users from the Authentication tab without errors.

-- Messages System

create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table conversations enable row level security;

create policy "Users can view conversations they are part of"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = conversations.id
      and user_id = auth.uid()
    )
  );

create table if not exists conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);

alter table conversation_participants enable row level security;

create policy "Users can view participants of their conversations"
  on conversation_participants for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );

-- Allow users to create conversations (simplified: anyone can start a convo)
create policy "Users can create conversation participants"
  on conversation_participants for insert
  with check (auth.uid() = user_id OR true); -- Allow adding others for now

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  is_read boolean default false
);

alter table messages enable row level security;

create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id AND
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
      and user_id = auth.uid()
    )
  );
-- Paylink Database Schema Fix
-- This script drops existing tables to ensure a clean slate and avoids "column does not exist" errors.

-- DROP TABLES (Cascade to remove dependent policies and foreign keys)
drop table if exists product_files cascade;
drop table if exists product_images cascade;
drop table if exists products cascade;
drop table if exists seller_metrics cascade;
drop table if exists order_files cascade;
drop table if exists transactions cascade;
drop table if exists orders cascade;
drop table if exists service_tiers cascade;
drop table if exists services cascade;
drop table if exists invoices cascade;
drop type if exists order_status cascade;

-- RECREATE TABLES

-- 1. Services & Tiers
create table services (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  category text not null,
  tags text[] default '{}',
  thumbnail_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table services enable row level security;

create policy "Public services are viewable by everyone"
  on services for select using (true);

create policy "Sellers can insert their own services"
  on services for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own services"
  on services for update using (auth.uid() = seller_id);

create table service_tiers (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references services(id) on delete cascade not null,
  name text not null, -- 'Basic', 'Standard', 'Premium'
  description text,
  price decimal(10, 2) not null,
  delivery_days integer not null,
  revisions integer not null, -- -1 for unlimited
  features text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table service_tiers enable row level security;

create policy "Public service tiers are viewable by everyone"
  on service_tiers for select using (true);

create policy "Sellers can manage tiers for their services"
  on service_tiers for all using (
    exists (
      select 1 from services
      where services.id = service_tiers.service_id
      and services.seller_id = auth.uid()
    )
  );

-- 1.5 Products
create table products (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  price decimal(10, 2) not null,
  thumbnail_url text,
  file_url text, -- For digital downloads
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table products enable row level security;

create policy "Public products are viewable by everyone"
  on products for select using (true);

create policy "Sellers can insert their own products"
  on products for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own products"
  on products for update using (auth.uid() = seller_id);

-- Moved product_files and product_images to after transactions to resolve dependency issues

-- 1.6 Invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references auth.users(id) not null,
  client_email text,
  amount decimal(10, 2) not null,
  currency text default 'USD',
  due_date date,
  description text,
  status text default 'pending', -- 'pending', 'paid', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table invoices enable row level security;

create policy "Sellers can view their own invoices"
  on invoices for select using (auth.uid() = seller_id);

create policy "Sellers can insert their own invoices"
  on invoices for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own invoices"
  on invoices for update using (auth.uid() = seller_id);

-- 2. Orders & State Machine
create type order_status as enum (
  'incomplete', 'active', 'delivered', 'in_revision', 'completed', 'cancelled', 'disputed'
);

create table orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references auth.users(id) not null,
  seller_id uuid references auth.users(id) not null,
  service_id uuid references services(id),
  tier_id uuid references service_tiers(id),
  status order_status default 'incomplete',
  price decimal(10, 2) not null,
  requirements text,
  dispute_reason text,
  is_paused boolean default false, -- For disputes
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

alter table orders enable row level security;

create policy "Users can view orders they are involved in"
  on orders for select using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

create policy "Buyers can create orders"
  on orders for insert with check (auth.uid() = buyer_id);

create policy "Involved users can update orders"
  on orders for update using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

-- 3. Transactions (Escrow)
create table transactions (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) not null,
  amount decimal(10, 2) not null,
  status text default 'held', -- 'held', 'released', 'refunded'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  released_at timestamp with time zone
);

alter table transactions enable row level security;

create policy "Users can view transactions for their orders"
  on transactions for select using (
    exists (
      select 1 from orders
      where orders.id = transactions.order_id
      and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

-- 3.5 Product Images & Files (Moved here to avoid dependency errors)
create table product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table product_images enable row level security;

create policy "Public product images are viewable by everyone"
  on product_images for select using (true);

create policy "Sellers can manage their product images"
  on product_images for all using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.seller_id = auth.uid()
    )
  );

create table product_files (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  file_url text not null,
  file_name text not null,
  file_size bigint,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table product_files enable row level security;

create policy "Sellers can manage their product files"
  on product_files for all using (
    exists (
      select 1 from products
      where products.id = product_files.product_id
      and products.seller_id = auth.uid()
    )
  );

create policy "Buyers can view files of purchased products"
  on product_files for select using (
    exists (
      select 1 from transactions
      join orders on orders.id = transactions.order_id
      where false -- Placeholder for future logic linking orders to products
    )
    or
    exists (
      select 1 from products
      where products.id = product_files.product_id
      and products.seller_id = auth.uid()
    )
  );

-- 4. Files & Versioning
create table order_files (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) not null,
  uploader_id uuid references auth.users(id) not null,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  version integer default 1,
  is_latest boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table order_files enable row level security;

create policy "Users can view files for their orders"
  on order_files for select using (
    exists (
      select 1 from orders
      where orders.id = order_files.order_id
      and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

create policy "Users can upload files to their orders"
  on order_files for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_files.order_id
      and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

-- 5. Seller Metrics
create table seller_metrics (
  seller_id uuid references auth.users(id) primary key,
  total_orders integer default 0,
  completed_orders integer default 0,
  cancelled_orders integer default 0,
  avg_rating decimal(3, 2) default 0.0,
  on_time_delivery_rate decimal(5, 2) default 100.0, -- Percentage
  avg_response_time_minutes integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table seller_metrics enable row level security;

create policy "Public seller metrics are viewable by everyone"
  on seller_metrics for select using (true);

-- 6. Follow Stats Function (Idempotent update)
create or replace function get_profile_stats(target_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  follower_count integer;
  following_count integer;
  is_following boolean;
begin
  select count(*) into follower_count
  from follows
  where following_id = target_user_id;

  select count(*) into following_count
  from follows
  where follower_id = target_user_id;

  if auth.uid() is not null then
    select exists(
      select 1 from follows
      where follower_id = auth.uid()
      and following_id = target_user_id
    ) into is_following;
  else
    is_following := false;
  end if;

  return json_build_object(
    'followers', follower_count,
    'following', following_count,
    'is_following', is_following
  );
end;
$$;

-- Ensure follows constraint exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'follows_check'
  ) then
    alter table follows add constraint follows_check check (follower_id != following_id);
  end if;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- 7. Storage (Fix for "Bucket not found")
insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

-- Storage Policies (Idempotent)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public Access' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Public Access"
      on storage.objects for select
      using ( bucket_id = 'public-images' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated Upload' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Authenticated Upload"
      on storage.objects for insert
      with check ( bucket_id = 'public-images' and auth.role() = 'authenticated' );
  end if;
end $$;
-- Paylink Database Schema Additions

-- 1. Services & Tiers (The "Fiverr" Side)
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  category text not null,
  tags text[] default '{}',
  thumbnail_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table services enable row level security;

create policy "Public services are viewable by everyone"
  on services for select using (true);

create policy "Sellers can insert their own services"
  on services for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own services"
  on services for update using (auth.uid() = seller_id);

create table if not exists service_tiers (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references services(id) on delete cascade not null,
  name text not null, -- 'Basic', 'Standard', 'Premium'
  description text,
  price decimal(10, 2) not null,
  delivery_days integer not null,
  revisions integer not null, -- -1 for unlimited
  features text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table service_tiers enable row level security;

create policy "Public service tiers are viewable by everyone"
  on service_tiers for select using (true);

create policy "Sellers can manage tiers for their services"
  on service_tiers for all using (
    exists (
      select 1 from services
      where services.id = service_tiers.service_id
      and services.seller_id = auth.uid()
    )
  );

-- 2. Orders & State Machine
create type order_status as enum (
  'incomplete', 'active', 'delivered', 'in_revision', 'completed', 'cancelled', 'disputed'
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references auth.users(id) not null,
  seller_id uuid references auth.users(id) not null,
  service_id uuid references services(id),
  tier_id uuid references service_tiers(id),
  status order_status default 'incomplete',
  price decimal(10, 2) not null,
  requirements text,
  dispute_reason text,
  is_paused boolean default false, -- For disputes
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

alter table orders enable row level security;

create policy "Users can view orders they are involved in"
  on orders for select using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

create policy "Buyers can create orders"
  on orders for insert with check (auth.uid() = buyer_id);

create policy "Involved users can update orders"
  on orders for update using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

-- 3. Transactions (Escrow)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) not null,
  amount decimal(10, 2) not null,
  status text default 'held', -- 'held', 'released', 'refunded'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  released_at timestamp with time zone
);

alter table transactions enable row level security;

create policy "Users can view transactions for their orders"
  on transactions for select using (
    exists (
      select 1 from orders
      where orders.id = transactions.order_id
      and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

-- 4. Files & Versioning (The "Google Drive" Side)
create table if not exists order_files (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) not null,
  uploader_id uuid references auth.users(id) not null,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  version integer default 1,
  is_latest boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table order_files enable row level security;

create policy "Users can view files for their orders"
  on order_files for select using (
    exists (
      select 1 from orders
      where orders.id = order_files.order_id
      and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

create policy "Users can upload files to their orders"
  on order_files for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_files.order_id
      and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

-- 5. Seller Metrics
create table if not exists seller_metrics (
  seller_id uuid references auth.users(id) primary key,
  total_orders integer default 0,
  completed_orders integer default 0,
  cancelled_orders integer default 0,
  avg_rating decimal(3, 2) default 0.0,
  on_time_delivery_rate decimal(5, 2) default 100.0, -- Percentage
  avg_response_time_minutes integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table seller_metrics enable row level security;

create policy "Public seller metrics are viewable by everyone"
  on seller_metrics for select using (true);

-- 6. Follow Stats Function
create or replace function get_profile_stats(target_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  follower_count integer;
  following_count integer;
  is_following boolean;
begin
  select count(*) into follower_count
  from follows
  where following_id = target_user_id;

  select count(*) into following_count
  from follows
  where follower_id = target_user_id;

  -- Check if the current authenticated user is following the target user
  if auth.uid() is not null then
    select exists(
      select 1 from follows
      where follower_id = auth.uid()
      and following_id = target_user_id
    ) into is_following;
  else
    is_following := false;
  end if;

  return json_build_object(
    'followers', follower_count,
    'following', following_count,
    'is_following', is_following
  );
end;
$$;

-- Ensure follows constraint exists (idempotent check)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'follows_check'
  ) then
    alter table follows add constraint follows_check check (follower_id != following_id);
  end if;
exception
  when duplicate_object then null;
  when others then null; -- Constraint might have a different name, but we trust the setup script had it.
end $$;
-- Fix relationships and add items to orders

-- 1. Add Foreign Key from portfolio_items to profiles for easier joining
-- We first drop the existing constraint if it exists to avoid conflicts, though we might just add a new one.
-- Actually, referencing auth.users is fine, but referencing profiles allows PostgREST to see the relationship to 'profiles'.
-- We can have multiple FKs on the same column, or we can just alter the existing one.
-- Let's try to add a specific FK to profiles.
alter table portfolio_items
add constraint portfolio_items_user_id_fkey_profiles
foreign key (user_id)
references profiles(id)
on delete cascade;

-- 2. Add 'items' column to orders to store line items (JSONB)
-- Structure: [{ title: "Item Name", price: 25.00, image_url: "...", ... }]
alter table orders
add column if not exists items jsonb default '[]'::jsonb;

-- 3. Add 'title' and 'description' to orders if they don't exist (useful for generic invoices)
alter table orders
add column if not exists title text,
add column if not exists description text;

-- 4. Update the 'get_post_stats' function to be safe (already done but good to ensure)
-- Products Table (The "Shop" Side)
drop table if exists products cascade;

create table products (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references auth.users(id) not null,
  title text not null,
  description text not null,
  price decimal(10, 2) not null,
  thumbnail_url text,
  file_url text, -- For digital downloads
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table products enable row level security;

create policy "Public products are viewable by everyone"
  on products for select using (true);

create policy "Sellers can insert their own products"
  on products for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own products"
  on products for update using (auth.uid() = seller_id);
-- 1. Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- 2. Populate/Update the profile for the user
INSERT INTO public.profiles (id, username, full_name, bio, location, accent_color, verification_status, avatar_url, banner_url, social_links)
VALUES (
  '40e74a9b-fd26-4f2f-905e-e518ba1ba085', -- Your UID
  'havefate',
  'HaveFate',
  'Professional Graphic Designer specializing in branding, stream assets, and illustrations. Let''s create something amazing together.',
  'Digital World',
  '#3b82f6',
  'verified',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
  '{"twitter": "havefate", "instagram": "havefate", "twitch": "havefate"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  accent_color = EXCLUDED.accent_color,
  verification_status = EXCLUDED.verification_status,
  avatar_url = EXCLUDED.avatar_url,
  banner_url = EXCLUDED.banner_url,
  social_links = EXCLUDED.social_links,
  updated_at = now();
-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  banner_url text,
  website text,
  bio text,
  location text,
  accent_color text default '#3b82f6', -- Default blue-500
  social_links jsonb default '{}'::jsonb,
  verification_status text default 'none', -- 'none', 'pending', 'verified', 'rejected'

  constraint username_length check (char_length(username) >= 3)
);

-- If you have already created the table, run these commands to add the new columns:
-- alter table profiles add column if not exists bio text;
-- alter table profiles add column if not exists location text;
-- alter table profiles add column if not exists accent_color text default '#3b82f6';
-- alter table profiles add column if not exists social_links jsonb default '{}'::jsonb;

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set up Storage!
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

-- Set up access controls for storage.
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );

create policy "Banner images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'banners' );

create policy "Anyone can upload a banner."
  on storage.objects for insert
  with check ( bucket_id = 'banners' );

create policy "Anyone can update their own banner."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'banners' );

-- Verification Requests Table
create table if not exists verification_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  evidence_text text,
  evidence_links jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table verification_requests enable row level security;

create policy "Users can insert their own verification requests."
  on verification_requests for insert
  with check ( auth.uid() = user_id );

create policy "Users can view their own verification requests."
  on verification_requests for select
  using ( auth.uid() = user_id );

-- Add ID document URL to verification requests
alter table verification_requests add column if not exists id_document_url text;

-- Portfolio Items Table
create table if not exists portfolio_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  image_url text not null,
  section text default 'General', -- For grouping items
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table portfolio_items enable row level security;

create policy "Portfolio items are viewable by everyone."
  on portfolio_items for select
  using ( true );

create policy "Users can insert their own portfolio items."
  on portfolio_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own portfolio items."
  on portfolio_items for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own portfolio items."
  on portfolio_items for delete
  using ( auth.uid() = user_id );

-- Storage for verification docs (private bucket)
insert into storage.buckets (id, name, public)
values ('verification_docs', 'verification_docs', false) -- Private bucket
on conflict (id) do nothing;

create policy "Users can upload verification docs."
  on storage.objects for insert
  with check ( bucket_id = 'verification_docs' and auth.uid() = owner );

-- Admins (or the user themselves) can view their docs - simplified for now to allow user to view own
create policy "Users can view their own verification docs."
  on storage.objects for select
  using ( bucket_id = 'verification_docs' and auth.uid() = owner );

-- Storage for portfolio images
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Follows Table
create table if not exists follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users not null,
  following_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- RLS for follows
alter table follows enable row level security;

create policy "Users can follow others"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete
  using (auth.uid() = follower_id);

create policy "Everyone can view follows"
  on follows for select
  using (true);

create policy "Portfolio images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'portfolio' );

create policy "Users can upload portfolio images."
  on storage.objects for insert
  with check ( bucket_id = 'portfolio' and auth.uid() = owner );

create policy "Users can update their own portfolio images."
  on storage.objects for update
  using ( bucket_id = 'portfolio' and auth.uid() = owner );

-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add Stripe Connect columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_connected boolean DEFAULT false;

-- Add is_admin column (optional, for future use)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Social Features: Likes and Comments

-- 1. Likes Table
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  portfolio_item_id uuid references portfolio_items(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, portfolio_item_id)
);

alter table likes enable row level security;

create policy "Public likes are viewable by everyone"
  on likes for select using (true);

create policy "Users can like posts"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on likes for delete using (auth.uid() = user_id);

-- 2. Comments Table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  portfolio_item_id uuid references portfolio_items(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table comments enable row level security;

create policy "Public comments are viewable by everyone"
  on comments for select using (true);

create policy "Users can comment on posts"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = user_id);

create policy "Post owners can delete comments on their posts"
  on comments for delete using (
    exists (
      select 1 from portfolio_items
      where portfolio_items.id = comments.portfolio_item_id
      and portfolio_items.user_id = auth.uid()
    )
  );

-- 3. Helper function to get post stats (likes, comments, user_has_liked)
create or replace function get_post_stats(post_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  likes_count integer;
  comments_count integer;
  user_has_liked boolean;
begin
  select count(*) into likes_count
  from likes
  where portfolio_item_id = post_id;

  select count(*) into comments_count
  from comments
  where portfolio_item_id = post_id;

  if auth.uid() is not null then
    select exists(
      select 1 from likes
      where portfolio_item_id = post_id
      and user_id = auth.uid()
    ) into user_has_liked;
  else
    user_has_liked := false;
  end if;

  return json_build_object(
    'likes_count', likes_count,
    'comments_count', comments_count,
    'user_has_liked', user_has_liked
  );
end;
$$;
-- 1. Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public comment likes are viewable by everyone"
  ON comment_likes FOR SELECT USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- 2. Add parent_id to comments for threading (replies)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- 3. Create RPC to fetch feed with counts and user_has_liked status
-- This solves the "0 likes/comments" issue on the home page
CREATE OR REPLACE FUNCTION get_home_feed(limit_val int DEFAULT 50, offset_val int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  title text,
  description text,
  image_url text,
  section text,
  user_id uuid,
  user_data jsonb,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.created_at,
    pi.title,
    pi.description,
    pi.image_url,
    pi.section,
    pi.user_id,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'verification_status', p.verification_status
    ) as user_data,
    (SELECT count(*) FROM likes l WHERE l.portfolio_item_id = pi.id) as likes_count,
    (SELECT count(*) FROM comments c WHERE c.portfolio_item_id = pi.id) as comments_count,
    (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM likes l WHERE l.portfolio_item_id = pi.id AND l.user_id = auth.uid())) as user_has_liked
  FROM portfolio_items pi
  JOIN profiles p ON p.id = pi.user_id
  ORDER BY pi.created_at DESC
  LIMIT limit_val OFFSET offset_val;
END;
$$;

-- 4. Create RPC to fetch comments with their like counts and user_has_liked status
CREATE OR REPLACE FUNCTION get_post_comments(post_id_val uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  content text,
  user_id uuid,
  parent_id uuid,
  user_data jsonb,
  likes_count bigint,
  user_has_liked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.created_at,
    c.content,
    c.user_id,
    c.parent_id,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as user_data,
    (SELECT count(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
    (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = auth.uid())) as user_has_liked
  FROM comments c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.portfolio_item_id = post_id_val
  ORDER BY c.created_at ASC;
END;
$$;
-- Run this script to update your database schema without conflicting with existing tables.

-- Add Stripe Connect columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_connected boolean DEFAULT false;

-- Add is_admin column to profiles table if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- NOTE: By default, the 'profiles' table allows users to update their own rows. 
-- This means a user could technically set 'is_admin' to true if they know how to make the API call.
-- For a production app, you should move 'is_admin' to a separate table (e.g., 'user_roles') 
-- or use a Database Trigger to prevent users from changing this column.
-- Update profiles for reputation system
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_rating float DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_commissions int DEFAULT 0;

-- Create a secure bucket for commission files (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure_uploads', 'secure_uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create a public bucket for watermarked previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_previews', 'public_previews', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Secure Uploads (Strict)
CREATE POLICY "Sellers can upload to secure bucket"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'secure_uploads' AND auth.uid() = owner );

CREATE POLICY "Sellers can view their own secure files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'secure_uploads' AND auth.uid() = owner );

-- Note: We will need a way for Buyers to view the file AFTER payment. 
-- This is usually done via Signed URLs generated by the server, so no RLS policy needed for buyers here.

-- RLS for Public Previews (Open)
CREATE POLICY "Anyone can view previews"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public_previews' );

CREATE POLICY "Sellers can upload previews"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'public_previews' AND auth.uid() = owner );
