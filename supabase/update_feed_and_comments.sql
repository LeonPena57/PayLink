-- 1. Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public comment likes are viewable by everyone"
  ON comment_likes FOR SELECT USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- 2. Add parent_id to comments for threading (replies)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- 3. Create RPC to fetch feed with counts and user_has_liked status
-- This solves the "0 likes/comments" issue on the home page
CREATE OR REPLACE FUNCTION get_home_feed(limit_val int DEFAULT 50, offset_val int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  title text,
  description text,
  image_url text,
  section text,
  user_id uuid,
  user_data jsonb,
  likes_count bigint,
  comments_count bigint,
  user_has_liked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.created_at,
    pi.title,
    pi.description,
    pi.image_url,
    pi.section,
    pi.user_id,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'verification_status', p.verification_status
    ) as user_data,
    (SELECT count(*) FROM likes l WHERE l.portfolio_item_id = pi.id) as likes_count,
    (SELECT count(*) FROM comments c WHERE c.portfolio_item_id = pi.id) as comments_count,
    (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM likes l WHERE l.portfolio_item_id = pi.id AND l.user_id = auth.uid())) as user_has_liked
  FROM portfolio_items pi
  JOIN profiles p ON p.id = pi.user_id
  ORDER BY pi.created_at DESC
  LIMIT limit_val OFFSET offset_val;
END;
$$;

-- 4. Create RPC to fetch comments with their like counts and user_has_liked status
CREATE OR REPLACE FUNCTION get_post_comments(post_id_val uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  content text,
  user_id uuid,
  parent_id uuid,
  user_data jsonb,
  likes_count bigint,
  user_has_liked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.created_at,
    c.content,
    c.user_id,
    c.parent_id,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) as user_data,
    (SELECT count(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
    (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = auth.uid())) as user_has_liked
  FROM comments c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.portfolio_item_id = post_id_val
  ORDER BY c.created_at ASC;
END;
$$;
