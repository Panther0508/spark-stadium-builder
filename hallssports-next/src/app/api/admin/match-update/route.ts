import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const { matchId, match_date, duration_minutes, status, image_url, admin_post, venue } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (match_date !== undefined) updateData.match_date = match_date;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (status !== undefined) updateData.status = status;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (admin_post !== undefined) updateData.admin_post = admin_post;
    if (venue !== undefined) updateData.venue = venue;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase.from("matches")
      .update(updateData as unknown as never)
      .eq("id", matchId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating match:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update match";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
