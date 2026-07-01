-- Cria o Bucket 'spots' caso ele não exista
INSERT INTO storage.buckets (id, name, public) 
VALUES ('spots', 'spots', true)
ON CONFLICT (id) DO NOTHING;

-- Configura as Políticas de RLS para o Storage
-- 1. Qualquer pessoa (anon ou auth) pode visualizar as imagens do bucket spots
CREATE POLICY "Imagens dos spots sao publicas" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'spots');

-- 2. Apenas contas autenticadas (fantasmas) podem fazer upload (INSERT)
CREATE POLICY "Permitir upload para usuarios autenticados" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'spots');
