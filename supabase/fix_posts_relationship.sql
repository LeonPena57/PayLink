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
