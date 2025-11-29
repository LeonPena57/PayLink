-- Fix Foreign Key Relationship for portfolio_items
-- This is critical for the feed to work correctly when joining with profiles
DO $$
BEGIN
    -- Drop the constraint if it exists to ensure we can recreate it correctly
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_user_id_fkey_profiles') THEN
        ALTER TABLE portfolio_items DROP CONSTRAINT portfolio_items_user_id_fkey_profiles;
    END IF;

    -- Add the constraint
    ALTER TABLE portfolio_items
    ADD CONSTRAINT portfolio_items_user_id_fkey_profiles
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
END $$;

-- Ensure comments table exists
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  portfolio_item_id uuid REFERENCES portfolio_items(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on comments if not already enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Safely create policies for comments
DO $$
BEGIN
    -- Drop policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON comments;
    DROP POLICY IF EXISTS "Users can comment on posts" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
    DROP POLICY IF EXISTS "Post owners can delete comments on their posts" ON comments;
    
    -- Recreate policies
    CREATE POLICY "Public comments are viewable by everyone"
      ON comments FOR SELECT USING (true);

    CREATE POLICY "Users can comment on posts"
      ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own comments"
      ON comments FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Post owners can delete comments on their posts"
      ON comments FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM portfolio_items
          WHERE portfolio_items.id = comments.portfolio_item_id
          AND portfolio_items.user_id = auth.uid()
        )
      );
END $$;

-- Update get_post_stats function (this is always safe to replace)
CREATE OR REPLACE FUNCTION get_post_stats(post_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  likes_count integer;
  comments_count integer;
  user_has_liked boolean;
BEGIN
  SELECT count(*) INTO likes_count
  FROM likes
  WHERE portfolio_item_id = post_id;

  SELECT count(*) INTO comments_count
  FROM comments
  WHERE portfolio_item_id = post_id;

  IF auth.uid() IS NOT NULL THEN
    SELECT exists(
      SELECT 1 FROM likes
      WHERE portfolio_item_id = post_id
      AND user_id = auth.uid()
    ) INTO user_has_liked;
  ELSE
    user_has_liked := false;
  END IF;

  RETURN json_build_object(
    'likes_count', likes_count,
    'comments_count', comments_count,
    'user_has_liked', user_has_liked
  );
END;
$$;
