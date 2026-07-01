-- 1. Criação das tabelas Sociais (Likes e Bookmarks)

CREATE TABLE IF NOT EXISTS public.spot_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, spot_id)
);

CREATE TABLE IF NOT EXISTS public.spot_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, spot_id)
);

-- Habilitar RLS nas tabelas Sociais
ALTER TABLE public.spot_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_bookmarks ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.spot_likes TO anon, authenticated;
GRANT ALL ON TABLE public.spot_bookmarks TO anon, authenticated;

-- Policies para Likes
CREATE POLICY "Public can view likes" ON public.spot_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert own likes" ON public.spot_likes FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.spot_likes FOR DELETE TO anon, authenticated USING (auth.uid() = user_id);

-- Policies para Bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.spot_bookmarks FOR SELECT TO anon, authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.spot_bookmarks FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.spot_bookmarks FOR DELETE TO anon, authenticated USING (auth.uid() = user_id);

-- 2. Refatoração para Múltiplas Fotos por Spot

CREATE TABLE IF NOT EXISTS public.spot_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.spot_photos ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.spot_photos TO anon, authenticated;

CREATE POLICY "Public can view photos" ON public.spot_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can upload photos" ON public.spot_photos FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.spot_photos FOR DELETE TO anon, authenticated USING (auth.uid() = user_id);

-- Migrar a foto atual (da coluna image_url do Spot) para a tabela spot_photos
INSERT INTO public.spot_photos (spot_id, user_id, image_url, created_at)
SELECT id, user_id, image_url, created_at FROM public.spots WHERE image_url IS NOT NULL;

-- Notificar o PostgREST para reconstruir o cache (não vamos deletar a coluna spots.image_url AINDA para não quebrar componentes atuais durante o refactor)
NOTIFY pgrst, 'reload schema';
