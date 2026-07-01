-- Create spots table
CREATE TABLE IF NOT EXISTS public.spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.spots TO anon;
GRANT ALL ON TABLE public.spots TO authenticated;
GRANT ALL ON TABLE public.spots TO service_role;

-- Policies for spots
-- 1. Anyone can view all spots (since it's a public map)
CREATE POLICY "Spots are visible to everyone" ON public.spots
  FOR SELECT USING (true);

-- 2. Authenticated users (including anonymous) can create their own spots
CREATE POLICY "Users can create spots" ON public.spots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own spots
CREATE POLICY "Users can update own spots" ON public.spots
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Users can only delete their own spots
CREATE POLICY "Users can delete own spots" ON public.spots
  FOR DELETE USING (auth.uid() = user_id);

-- Insert Mock Data using an existing anonymous user or a dummy one for testing
-- We will dynamically generate some dummy spots for visual testing
-- (In a real app, users generate these, but we need some initial data to see the clusters on map)
DO $$
DECLARE
  v_user_id UUID;
  v_lat DOUBLE PRECISION := -23.55052;
  v_lng DOUBLE PRECISION := -46.633308;
BEGIN
  -- We just grab the first available user in public.users to act as the owner of mock spots
  SELECT id INTO v_user_id FROM public.users LIMIT 1;

  -- If there is a user, let's insert some mock spots
  IF v_user_id IS NOT NULL THEN
    FOR i IN 1..50 LOOP
      INSERT INTO public.spots (user_id, lat, lng, title)
      VALUES (
        v_user_id,
        v_lat + (random() - 0.5) * 0.05,
        v_lng + (random() - 0.5) * 0.05,
        'Spot Mock #' || i
      );
    END LOOP;
  END IF;
END $$;
