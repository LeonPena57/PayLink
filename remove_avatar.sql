-- Remove avatar for HaveFate user to show the placeholder icon
UPDATE public.profiles
SET avatar_url = NULL
WHERE username = 'HaveFate';

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload config';
