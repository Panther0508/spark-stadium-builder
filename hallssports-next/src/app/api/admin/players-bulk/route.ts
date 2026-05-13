import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const players = await request.json();

    if (!Array.isArray(players)) {
      return NextResponse.json({ error: "Input must be an array of players" }, { status: 400 });
    }

    // Format players for insertion
    const playersToInsert = players.map(p => ({
      name: p.name,
      team_id: p.team_id,
      position: p.position || "Unknown",
      number: parseInt(p.number) || 0,
      is_verified: false,
    }));

    const { data, error } = await supabase
      .from("players")
      .insert(playersToInsert as never)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, count: data.length });
  } catch (error) {
    console.error("Error bulk creating players:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to bulk create players";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
