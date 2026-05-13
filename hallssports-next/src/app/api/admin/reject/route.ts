import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const { table, id } = await request.json();

    if (!table || !id) {
      return NextResponse.json({ error: "Table and id are required" }, { status: 400 });
    }

    // Delete the item
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting item:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to reject item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}