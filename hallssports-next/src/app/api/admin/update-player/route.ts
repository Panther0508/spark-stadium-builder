import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const { id, ...data }: { id?: string; [key: string]: any } = await request.json();

    if (id) {
      const { error } = await (supabase.from("players") as any)
        .update(data)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await (supabase.from("players") as any)
        .insert({ ...data, is_verified: false });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating/creating player:", error);
    return NextResponse.json({ error: "Failed to update/create player: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
