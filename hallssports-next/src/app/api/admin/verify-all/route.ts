import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient();

    const tables = ["matches", "match_events", "players", "announcements", "highlights"];
    let totalVerified = 0;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .update({ is_verified: true } as never)
        .eq("is_verified", false)
        .select("id");
      
      if (!error && data) {
        totalVerified += data.length;
      }
    }

    return NextResponse.json({ success: true, count: totalVerified });
  } catch (error) {
    console.error("Error verifying all items:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to verify all items";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
