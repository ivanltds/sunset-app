ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Forçar o Supabase (PostgREST) a atualizar o schema cache localmente
NOTIFY pgrst, 'reload schema';
