-- Run this script to update your database schema without conflicting with existing tables.

-- Add Stripe Connect columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_connected boolean DEFAULT false;

-- Add is_admin column to profiles table if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- NOTE: By default, the 'profiles' table allows users to update their own rows. 
-- This means a user could technically set 'is_admin' to true if they know how to make the API call.
-- For a production app, you should move 'is_admin' to a separate table (e.g., 'user_roles') 
-- or use a Database Trigger to prevent users from changing this column.
