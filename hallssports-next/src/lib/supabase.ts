import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | undefined;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase }

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  return supabase;
}

// Type for supabase client
export type SupabaseClient = NonNullable<typeof supabase>;