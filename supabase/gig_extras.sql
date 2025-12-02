-- Add extras to services table
alter table public.services 
add column if not exists extras jsonb default '[]'::jsonb;

-- Example extras structure:
-- [
--   { "title": "Fast Delivery", "description": "I will deliver in 1 day", "price": 20, "additional_days": -2 },
--   { "title": "Source File", "description": "I will provide the source file", "price": 10, "additional_days": 0 }
-- ]

-- Add selected_extras to orders table
alter table public.orders
add column if not exists selected_extras jsonb default '[]'::jsonb;
