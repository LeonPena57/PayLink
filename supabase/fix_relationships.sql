-- Fix comments relationship for PostgREST joins
-- We need an explicit foreign key to the profiles table for the join to work
DO $$
BEGIN
    -- Drop existing constraint if it references auth.users (optional, but cleaner to reference profiles)
    -- Actually, we can keep both or just add the one to profiles. 
    -- PostgREST prefers a clear path. Let's add the constraint to profiles.
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_id_fkey_profiles') THEN
        ALTER TABLE comments
        ADD CONSTRAINT comments_user_id_fkey_profiles
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;

    -- Do the same for likes if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_fkey_profiles') THEN
            ALTER TABLE likes
            ADD CONSTRAINT likes_user_id_fkey_profiles
            FOREIGN KEY (user_id)
            REFERENCES profiles(id)
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
