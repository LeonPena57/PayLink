-- Fix relationships and add items to orders

-- 1. Add Foreign Key from portfolio_items to profiles for easier joining
-- We first drop the existing constraint if it exists to avoid conflicts, though we might just add a new one.
-- Actually, referencing auth.users is fine, but referencing profiles allows PostgREST to see the relationship to 'profiles'.
-- We can have multiple FKs on the same column, or we can just alter the existing one.
-- Let's try to add a specific FK to profiles.
alter table portfolio_items
add constraint portfolio_items_user_id_fkey_profiles
foreign key (user_id)
references profiles(id)
on delete cascade;

-- 2. Add 'items' column to orders to store line items (JSONB)
-- Structure: [{ title: "Item Name", price: 25.00, image_url: "...", ... }]
alter table orders
add column if not exists items jsonb default '[]'::jsonb;

-- 3. Add 'title' and 'description' to orders if they don't exist (useful for generic invoices)
alter table orders
add column if not exists title text,
add column if not exists description text;

-- 4. Update the 'get_post_stats' function to be safe (already done but good to ensure)
