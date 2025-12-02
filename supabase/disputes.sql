-- Drop table if it exists to ensure clean schema
drop table if exists public.disputes cascade;

-- Create Disputes Table
create table public.disputes (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  initiator_id uuid references public.profiles(id) not null,
  reason text not null,
  status text default 'open' check (status in ('open', 'resolved_refund', 'resolved_release', 'dismissed')),
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);

-- Enable RLS
alter table public.disputes enable row level security;

-- Policies
create policy "Admins can view all disputes"
  on public.disputes for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Users can view their own disputes"
  on public.disputes for select
  using (initiator_id = auth.uid());

create policy "Users can create disputes"
  on public.disputes for insert
  with check (auth.uid() = initiator_id);
