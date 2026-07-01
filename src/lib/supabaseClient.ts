import { createClient } from '@supabase/supabase-js';

// No servidor usamos direto o banco de dados. No cliente usamos o proxy (window.location.origin)
const supabaseUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/supabase-api` 
  : 'http://127.0.0.1:54421';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Bypass-Tunnel-Reminder': 'true',
    },
  },
});
