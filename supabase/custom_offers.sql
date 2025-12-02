-- Add support for custom offers in messages
alter table public.messages 
add column if not exists message_type text default 'text' check (message_type in ('text', 'offer')),
add column if not exists offer_details jsonb;

-- Example offer_details structure:
-- {
--   "title": "I will build your website",
--   "price": 500,
--   "delivery_days": 7
-- }
