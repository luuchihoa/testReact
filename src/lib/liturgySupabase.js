import { createClient } from '@supabase/supabase-js';

const liturgyUrl = import.meta.env.VITE_LITURGY_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const liturgyAnonKey = import.meta.env.VITE_LITURGY_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const liturgySupabase = createClient(liturgyUrl, liturgyAnonKey);
