-- Update profile for specific user to match demo data
INSERT INTO public.profiles (id, username, full_name, bio, location, accent_color, verification_status, avatar_url, banner_url, social_links)
VALUES (
  '40e74a9b-fd26-4f2f-905e-e518ba1ba085', -- User's UID
  'leonpena', -- Username (you can change this)
  'Leon Pena', -- Full Name
  'Digital Artist & Designer creating premium assets for streamers and content creators. Specialized in motion graphics and UI design.', -- Bio
  'San Francisco, CA', -- Location
  '#3b82f6', -- Accent Color (Blue)
  'verified', -- Verification Status
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop', -- Demo Avatar
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', -- Demo Banner
  '{"twitter": "leonpena", "instagram": "leon_art", "twitch": "leonstream"}'::jsonb -- Social Links
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
