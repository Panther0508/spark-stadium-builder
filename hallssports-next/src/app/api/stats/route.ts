import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    // Get goals scored (sum of all goals from standings)
    let goalsScored = 0;
    try {
      const { data } = await supabase.from("standings_with_teams").select("gf").neq("gf", null);
      goalsScored = (data || []).reduce((sum: number, row: { gf: number }) => sum + (row.gf || 0), 0);
    } catch {}

    // Get matches today
    let matchesToday = 0;
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const { count } = await supabase.from("matches")
        .select("id", { count: "exact", head: true })
        .gte("match_date", today)
        .lt("match_date", tomorrow);
      matchesToday = count ?? 0;
    } catch {}

    // Get players count
    let playersCount = 0;
    try {
      const { count } = await supabase.from("players").select("id", { count: "exact", head: true });
      playersCount = count ?? 0;
    } catch {}

    // Get highlights count
    let highlightsCount = 0;
    try {
      const { count } = await supabase.from("highlights")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", true);
      highlightsCount = count ?? 0;
    } catch {}

    return NextResponse.json({
      goalsScored,
      matchesToday,
      playersCount,
      highlightsCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}