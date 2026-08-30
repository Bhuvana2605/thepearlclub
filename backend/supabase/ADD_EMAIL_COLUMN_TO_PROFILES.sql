-- ====================================================================
-- THE PEARL CLUB - ADD EMAIL COLUMN TO PUBLIC.PROFILES IN SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqfeekkbxcincwlvabdq/sql/new
--
-- This script adds the email column to public.profiles and automatically
-- populates it with all original sign-up email addresses from auth.users!
-- ====================================================================

-- 1. Add email column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Populate email column from auth.users for all registered profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 3. Auto-sync trigger for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
