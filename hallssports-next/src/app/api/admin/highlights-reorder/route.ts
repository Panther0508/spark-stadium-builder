import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const updates = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Input must be an array of updates" }, { status: 400 });
    }

    // We can't do true bulk update with different values per row easily in supabase-js
    // unless we use a rpc or multiple calls. Since it's usually few highlights,
    // we'll do it in a loop or a single rpc if available.
    // For simplicity and safety, we'll try a loop but ideally use rpc.
    
    const results = await Promise.all(updates.map(u => 
      supabase.from("highlights").update({ order_index: u.order_index } as never).eq("id", u.id)
    ));

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error("Some reorder updates failed:", errors);
      throw new Error("Failed to save some reorder positions");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering highlights:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to reorder highlights";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
