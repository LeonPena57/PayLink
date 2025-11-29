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
