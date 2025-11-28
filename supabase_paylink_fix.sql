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
