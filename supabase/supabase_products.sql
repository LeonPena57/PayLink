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
