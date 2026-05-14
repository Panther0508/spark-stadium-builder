import { getSupabaseAdminClient } from "../hallssports-next/src/lib/supabaseAdmin";

async function check() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('match_events').select('*').limit(1);
  if (error) {
    console.error("Error fetching match_events:", error);
  } else {
    console.log("Columns in match_events:", Object.keys(data[0] || {}));
  }
}
// check();
