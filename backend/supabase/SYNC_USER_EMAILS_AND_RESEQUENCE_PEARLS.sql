-- ====================================================================
-- THE PEARL CLUB SANCTUARY - FIX USER EMAILS & RESEQUENCE PEARL NUMBERS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqfeekkbxcincwlvabdq/sql/new
--
-- 1. Adds 'email' column to public.profiles if not already present.
-- 2. Copies the real, original sign-up Gmail from auth.users into public.profiles for all users!
-- 3. Resequences all pearl_number values in public.profiles to clean 1, 2, 3, 4, 5... N
--    ordered strictly by registration date (created_at ASC).
-- 4. Exposes RPC function `get_admin_user_directory()` so admin dashboard can fetch real emails.
-- ====================================================================

-- 1. Ensure email column exists on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Populate public.profiles.email with real sign-up emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Resequence pearl numbers strictly by created_at date (1, 2, 3... N without gaps)
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS clean_pearl_no
  FROM public.profiles
)
UPDATE public.profiles p
SET pearl_number = r.clean_pearl_no
FROM renumbered r
WHERE p.id = r.id;

-- 4. Reset pearl_number sequence counter if sequence exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'pearl_number_seq') THEN
    PERFORM setval('public.pearl_number_seq', COALESCE((SELECT MAX(pearl_number) FROM public.profiles), 0));
  END IF;
END $$;

-- 5. Create RPC function for secure admin access to user directory with real emails
CREATE OR REPLACE FUNCTION public.get_admin_user_directory()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  username text,
  pearl_number integer,
  role text,
  is_admin boolean,
  is_early_member boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    COALESCE(p.email, u.email, '') AS email,
    COALESCE(p.name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS name,
    COALESCE(p.username, u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)) AS username,
    p.pearl_number,
    COALESCE(p.role, 'user') AS role,
    COALESCE(p.is_admin, false) AS is_admin,
    COALESCE(p.is_early_member, true) AS is_early_member,
    p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at ASC;
$$;

-- Grant execution to authenticated users, service role, & anon
GRANT EXECUTE ON FUNCTION public.get_admin_user_directory() TO authenticated, service_role, anon;
