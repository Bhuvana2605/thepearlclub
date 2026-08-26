-- ====================================================================
-- THE PEARL CLUB - RESEQUENCE PEARL NUMBERS IN SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqfeekkbxcincwlvabdq/sql/new
--
-- This script permanently re-assigns clean 1, 2, 3, 4, 5, 6... sequential
-- pearl numbers to all registered profile rows in the database in order of signup,
-- fixing all skipped numbers in user profile accounts & admin dashboard!
-- ====================================================================

-- 1. Ensure sequence step is strictly 1
ALTER SEQUENCE IF EXISTS public.pearl_number_seq INCREMENT BY 1;

-- 2. Update trigger function to prevent double assignment or sequence skips
CREATE OR REPLACE FUNCTION public.assign_pearl_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pearl_number IS NULL THEN
    NEW.pearl_number := nextval('public.pearl_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Atomically renumber all existing profiles strictly by registration date (created_at ASC)
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS new_pearl_no
  FROM public.profiles
)
UPDATE public.profiles p
SET pearl_number = r.new_pearl_no
FROM renumbered r
WHERE p.id = r.id;

-- 4. Reset pearl_number_seq so next signup gets MAX(pearl_number) + 1
SELECT setval('public.pearl_number_seq', COALESCE((SELECT MAX(pearl_number) FROM public.profiles), 0));
