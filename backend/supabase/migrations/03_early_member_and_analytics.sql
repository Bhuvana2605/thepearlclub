-- ===================================================
-- THE PEARL CLUB - SUPABASE BACKEND DATABASE SCHEMA
-- Migration 03: Atomic Registration Pearl Number & Admin Authorization
-- ===================================================

-- 1. PROFILES TABLE ENHANCEMENTS (ROLE & PEARL NUMBER)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS pearl_number INT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Dedicated PostgreSQL Sequence for Atomic Pearl Number Assignment
CREATE SEQUENCE IF NOT EXISTS public.pearl_number_seq START WITH 1 INCREMENT BY 1;

-- Function & Trigger to automatically assign permanent sequential pearl_number upon profile creation
CREATE OR REPLACE FUNCTION public.assign_pearl_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pearl_number IS NULL THEN
    NEW.pearl_number := nextval('public.pearl_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_pearl_number ON public.profiles;
CREATE TRIGGER trigger_assign_pearl_number
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_pearl_number();

-- Backfill existing profiles sorted strictly by actual registration creation order (created_at ASC)
DO $$
DECLARE
  r RECORD;
  n INT := 1;
BEGIN
  FOR r IN SELECT id FROM public.profiles ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET pearl_number = n WHERE id = r.id;
    n := n + 1;
  END LOOP;
  PERFORM setval('public.pearl_number_seq', GREATEST(n - 1, 1));
END $$;

-- 2. SECURITY: PREVENT NON-ADMIN USERS FROM PROMOTING THEMSELVES TO ADMIN ROLE
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent client from mutating role or is_admin unless authorized by backend/service_role
  IF OLD.role IS DISTINCT FROM NEW.role OR OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF auth.role() != 'service_role' AND (OLD.role != 'admin' AND OLD.is_admin != TRUE) THEN
      NEW.role := OLD.role;
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- 3. PRIVACY-SAFE ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can record privacy-safe aggregate activity events
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- STRICT RLS: Only users with role = 'admin' or is_admin = true can SELECT analytics events
CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );

-- 4. USER SESSIONS / VISITS TABLE
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert session start
CREATE POLICY "Anyone can record user sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own session end"
  ON public.user_sessions FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- STRICT RLS: Only Admins can view user sessions data
CREATE POLICY "Admins can view user sessions"
  ON public.user_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );
