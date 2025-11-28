-- 1. Drop the existing foreign key constraint on profiles.id
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Re-add the constraint with ON DELETE CASCADE
-- This ensures that when a user is deleted from auth.users, their profile is also deleted automatically.
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. (Optional) Do the same for other tables that reference auth.users if needed
-- For example, verification_requests
ALTER TABLE public.verification_requests
DROP CONSTRAINT IF EXISTS verification_requests_user_id_fkey;

ALTER TABLE public.verification_requests
ADD CONSTRAINT verification_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- For portfolio_items
ALTER TABLE public.portfolio_items
DROP CONSTRAINT IF EXISTS portfolio_items_user_id_fkey;

ALTER TABLE public.portfolio_items
ADD CONSTRAINT portfolio_items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- For follows (follower)
ALTER TABLE public.follows
DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;

ALTER TABLE public.follows
ADD CONSTRAINT follows_follower_id_fkey
FOREIGN KEY (follower_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- For follows (following)
ALTER TABLE public.follows
DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE public.follows
ADD CONSTRAINT follows_following_id_fkey
FOREIGN KEY (following_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- INSTRUCTIONS:
-- 1. Copy the SQL above.
-- 2. Go to your Supabase Dashboard -> SQL Editor.
-- 3. Paste and run the code.
-- 4. Now you can delete users from the Authentication tab without errors.
