-- Create Notifications Table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('order', 'message', 'system', 'level_up', 'dispute')),
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true); -- Ideally restricted, but for now open for app logic

-- Realtime
alter publication supabase_realtime add table public.notifications;
