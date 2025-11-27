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
returns trigger as c:\Users\leonp\Desktop\PayLink
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
c:\Users\leonp\Desktop\PayLink language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

