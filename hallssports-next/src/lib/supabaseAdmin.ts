import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | undefined;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseAdminClient() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured. Ensure SUPABASE_SERVICE_ROLE_KEY is set.');
  }
  return supabaseAdmin;
}

export type SupabaseAdminClient = ReturnType<typeof createClient>;
