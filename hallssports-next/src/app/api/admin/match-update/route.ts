/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const { matchId, ...data }: { matchId: string; [key: string]: any } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    const { error } = await (supabase.from("matches") as any)
      .update(data)
      .eq("id", matchId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating match:", error);
    return NextResponse.json({ error: "Failed to update match: " + (error?.message || String(error)) }, { status: 500 });
  }
}