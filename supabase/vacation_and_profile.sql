-- Add Vacation Mode columns to profiles
alter table public.profiles 
add column if not exists vacation_mode boolean default false,
add column if not exists vacation_message text;

-- Add Skills column to profiles (if not already present)
alter table public.profiles
add column if not exists skills text[] default '{}';

-- Add Bio column to profiles (if not already present, just in case)
alter table public.profiles
add column if not exists bio text;

-- Add Location column to profiles (if not already present)
alter table public.profiles
add column if not exists location text;
