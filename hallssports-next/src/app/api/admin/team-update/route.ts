import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase.from("teams")
      .update(updateData as unknown as never)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating team:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update team";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
