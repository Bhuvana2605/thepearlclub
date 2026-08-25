-- ====================================================================
-- THE PEARL CLUB - RESEQUENCE PEARL NUMBERS IN SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqfeekkbxcincwlvabdq/sql/new
--
-- This script re-assigns clean 1, 2, 3, 4, 5... sequential pearl numbers
-- to all registered profiles in order of signup date, removing all gaps!
-- ====================================================================

WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS new_pearl_no
  FROM public.profiles
)
UPDATE public.profiles p
SET pearl_number = r.new_pearl_no
FROM renumbered r
WHERE p.id = r.id;

-- Reset pearl_number sequence for new signups
SELECT setval('pearl_number_seq', (SELECT MAX(pearl_number) FROM public.profiles));
