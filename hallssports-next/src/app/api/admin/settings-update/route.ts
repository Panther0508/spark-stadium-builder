import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type SettingRow = { key: string; value: string };

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const data = await request.json();

    if (!data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    const updates = Array.isArray(data) ? data as SettingRow[] : [data as SettingRow];

    for (const update of updates) {
      if (!update.key) {
        return NextResponse.json({ error: "Setting key is required for each update" }, { status: 400 });
      }
    }

    const { error } = await supabase
      .from("settings")
      .upsert(updates as unknown as never[], { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
