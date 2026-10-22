-- ==========================================================
-- ANISTRA SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  username_changed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Case-insensitive unique index for username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (LOWER(username));

-- Enforce username minimum length
ALTER TABLE public.profiles ADD CONSTRAINT username_min_length CHECK (char_length(username) >= 4);

-- Trigger to enforce 14-day username change restriction
CREATE OR REPLACE FUNCTION public.check_username_change_cooldown()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.username IS DISTINCT FROM NEW.username) THEN
    -- If username was changed in the last 14 days, reject
    IF OLD.username_changed_at IS NOT NULL AND (NOW() - OLD.username_changed_at) < INTERVAL '14 days' THEN
      RAISE EXCEPTION 'Username can only be changed once every 14 days. Days remaining: %',
        CEIL(EXTRACT(EPOCH FROM ((OLD.username_changed_at + INTERVAL '14 days') - NOW())) / 86400);
    END IF;
    NEW.username_changed_at = NOW();
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_username_cooldown ON public.profiles;
CREATE TRIGGER tr_check_username_cooldown
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_username_change_cooldown();

-- 2. ANIME_LIST TABLE (WATCHLIST)
CREATE TABLE IF NOT EXISTS public.anime_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, anime_id)
);

-- 3. WATCHED_EPISODES TABLE (INDIVIDUAL TRACKING)
CREATE TABLE IF NOT EXISTS public.watched_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  season_number INT NOT NULL DEFAULT 1,
  episode_number INT NOT NULL,
  watched_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (user_id, anime_id, season_number, episode_number)
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  contains_spoiler BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ANIME_CACHE TABLE (OPTIONAL LOCAL CACHING OF API METADATA)
CREATE TABLE IF NOT EXISTS public.anime_cache (
  anime_id TEXT PRIMARY KEY,
  title JSONB NOT NULL,
  description TEXT,
  cover_image TEXT,
  banner_image TEXT,
  genres TEXT[],
  episodes INT,
  status TEXT,
  year INT,
  season TEXT,
  studio TEXT,
  rating NUMERIC(4,2),
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watched_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Anime List: Users manage their own list, public can view (or private)
CREATE POLICY "Users can view their own watchlist" 
ON public.anime_list FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist" 
ON public.anime_list FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist" 
ON public.anime_list FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist" 
ON public.anime_list FOR DELETE USING (auth.uid() = user_id);

-- Watched Episodes: Users manage their own tracked episodes
CREATE POLICY "Users can view their watched episodes" 
ON public.watched_episodes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark episodes watched" 
ON public.watched_episodes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove watched episodes" 
ON public.watched_episodes FOR DELETE USING (auth.uid() = user_id);

-- Reviews: Public can view, author can insert/update/delete
CREATE POLICY "Anyone can view reviews" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Anime Cache: Public read, authenticated users can write cache
CREATE POLICY "Anyone can view anime cache" 
ON public.anime_cache FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert/update anime cache" 
ON public.anime_cache FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================================
-- STORAGE BUCKETS (FOR AVATARS)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their avatars" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

