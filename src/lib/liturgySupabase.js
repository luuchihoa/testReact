import { createClient } from '@supabase/supabase-js';

const liturgyUrl =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_LITURGY_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL)) ||
  (typeof process !== 'undefined' && (process.env?.VITE_LITURGY_SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
  'https://placeholder.supabase.co';

const liturgyAnonKey =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_LITURGY_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' && (process.env?.VITE_LITURGY_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
  'placeholder';

export const liturgySupabase = createClient(liturgyUrl, liturgyAnonKey);

