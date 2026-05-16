/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const data: any = await request.json();

    if (!data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    const updates = Array.isArray(data) ? data : [data];

    for (const update of updates) {
      if (!update.key) {
        return NextResponse.json({ error: "Setting key is required" }, { status: 400 });
      }
    }

    const { error } = await (supabase.from("settings") as any)
      .upsert(updates, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
