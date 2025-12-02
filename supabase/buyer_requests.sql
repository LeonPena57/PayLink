-- Create Buyer Requests Table
create table public.buyer_requests (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  category text not null,
  budget numeric not null,
  delivery_days integer not null,
  status text default 'open' check (status in ('open', 'closed')),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.buyer_requests enable row level security;

-- Policies
create policy "Anyone can view open requests"
  on public.buyer_requests for select
  using (status = 'open');

create policy "Users can create requests"
  on public.buyer_requests for insert
  with check (auth.uid() = buyer_id);

create policy "Users can manage their own requests"
  on public.buyer_requests for update
  using (auth.uid() = buyer_id);
