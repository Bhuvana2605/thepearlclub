-- ====================================================================
-- THE PEARL CLUB - COMPLETE MASTER SUPABASE DATABASE MIGRATION SCRIPT
-- Copy and run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bqfeekkbxcincwlvabdq/sql/new
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. CORE TABLES SCHEMA (01_schema.sql)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT 'Finding a little quiet space.',
  avatar_url TEXT DEFAULT 'pearl',
  role TEXT DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,
  pearl_number INT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.bottles (
  id TEXT PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'approved'
);

CREATE TABLE IF NOT EXISTS public.bottle_matches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bottle_id TEXT REFERENCES public.bottles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.bottle_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id TEXT REFERENCES public.bottle_matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. PEARL NUMBER SEQUENCE & ATOMIC TRIGGER (03_early_member_and_analytics.sql)
-- --------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.pearl_number_seq START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.pearl_number_seq INCREMENT BY 1;

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

-- Backfill existing accounts sorted strictly by registration creation order (created_at ASC)
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS new_pearl_no
  FROM public.profiles
)
UPDATE public.profiles p
SET pearl_number = r.new_pearl_no
FROM renumbered r
WHERE p.id = r.id;

SELECT setval('public.pearl_number_seq', COALESCE((SELECT MAX(pearl_number) FROM public.profiles), 0));

-- Role protection security trigger
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
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

-- Analytics & Session Tables
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES (02_rls.sql)
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts Policies
DROP POLICY IF EXISTS "Active posts are viewable by everyone" ON public.posts;
CREATE POLICY "Active posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (status = 'active' OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Comments Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Post Likes Policies
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.post_likes;
CREATE POLICY "Likes viewable by everyone"
  ON public.post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle likes" ON public.post_likes;
CREATE POLICY "Authenticated users can toggle likes"
  ON public.post_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;
CREATE POLICY "Users can delete own likes"
  ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Reports Policies
DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.reports;
CREATE POLICY "Authenticated users can submit reports"
  ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bottles Policies
DROP POLICY IF EXISTS "Active bottles viewable anonymously" ON public.bottles;
CREATE POLICY "Active bottles viewable anonymously"
  ON public.bottles FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can release bottles" ON public.bottles;
CREATE POLICY "Authenticated users can release bottles"
  ON public.bottles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bottle Matches & Messages Policies
ALTER TABLE public.bottle_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottle_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients can view matches" ON public.bottle_matches;
CREATE POLICY "Recipients can view matches"
  ON public.bottle_matches FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Match senders/recipients can message" ON public.bottle_messages;
CREATE POLICY "Match senders/recipients can message"
  ON public.bottle_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can send bottle messages" ON public.bottle_messages;
CREATE POLICY "Authenticated users can send bottle messages"
  ON public.bottle_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Analytics Policies
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view analytics events" ON public.analytics_events;
CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );

DROP POLICY IF EXISTS "Anyone can record user sessions" ON public.user_sessions;
CREATE POLICY "Anyone can record user sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view user sessions" ON public.user_sessions;
CREATE POLICY "Admins can view user sessions"
  ON public.user_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.is_admin = TRUE)
    )
  );
