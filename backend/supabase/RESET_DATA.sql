-- ====================================================================
-- THE PEARL CLUB - DEVELOPMENT DATA RESET SCRIPT
-- Copy and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqfeekkbxcincwlvabdq/sql/new
--
-- IMPORTANT SAFETY GUARANTEE:
-- - Clears test content and user rows ONLY.
-- - DO NOT drop tables, schemas, functions, triggers, sequences, or RLS policies.
-- - Resets pearl_number_seq so the next signup receives Pearl #001.
-- ====================================================================

-- 1. CLEAR CONTENT & ACTIVITY ROWS (CASPADES SAFELY)
TRUNCATE TABLE public.bottle_messages CASCADE;
TRUNCATE TABLE public.bottle_matches CASCADE;
TRUNCATE TABLE public.bottles CASCADE;
TRUNCATE TABLE public.reports CASCADE;
TRUNCATE TABLE public.post_likes CASCADE;
TRUNCATE TABLE public.comments CASCADE;
TRUNCATE TABLE public.posts CASCADE;
TRUNCATE TABLE public.analytics_events CASCADE;
TRUNCATE TABLE public.user_sessions CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 2. CLEAR DEVELOPMENT AUTH ACCOUNTS (auth.users)
DELETE FROM auth.users;

-- 3. RESTART PEARL NUMBER SEQUENCE TO 1 (NEXT SIGNUP RECEIVES PEARL #001)
ALTER SEQUENCE public.pearl_number_seq RESTART WITH 1;
