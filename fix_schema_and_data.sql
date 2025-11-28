-- 1. Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- 2. Force a schema cache reload (by notifying pgrst)
NOTIFY pgrst, 'reload config';

-- 3. Populate/Update the profile for the user
INSERT INTO public.profiles (id, username, full_name, bio, location, accent_color, verification_status, avatar_url, banner_url, social_links)
VALUES (
  '40e74a9b-fd26-4f2f-905e-e518ba1ba085', -- Your UID
  'havefate',
  'HaveFate',
  'Professional Graphic Designer specializing in branding, stream assets, and illustrations. Let''s create something amazing together.',
  'Digital World',
  '#3b82f6',
  'verified',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
  '{"twitter": "havefate", "instagram": "havefate", "twitch": "havefate"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  accent_color = EXCLUDED.accent_color,
  verification_status = EXCLUDED.verification_status,
  avatar_url = EXCLUDED.avatar_url,
  banner_url = EXCLUDED.banner_url,
  social_links = EXCLUDED.social_links,
  updated_at = now();
