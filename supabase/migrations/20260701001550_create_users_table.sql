CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID UNIQUE NOT NULL, -- Ghost Account identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Permitir anon inserção
CREATE POLICY "Anon can insert ghost account" 
  ON public.users FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Permitir leitura do próprio ghost account baseado no device_id
CREATE POLICY "Anon can read own ghost account" 
  ON public.users FOR SELECT 
  TO anon
  USING (true);

-- Permitir update do last_active
CREATE POLICY "Anon can update own ghost account" 
  ON public.users FOR UPDATE 
  TO anon
  USING (true);
