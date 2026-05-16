import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

interface Setting {
  key: string;
  value: string;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase.from("settings").select("*");

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    // Convert array of {key, value} to object map
    // Pre-parse organizers/contributors JSON arrays
    const settingsMap = (data as Setting[] | null)?.reduce((acc, row) => {
      if (row.key === 'organizers' || row.key === 'contributors') {
        try {
          acc[row.key] = JSON.parse(row.value);
        } catch {
          acc[row.key] = [];
        }
      } else {
        acc[row.key] = row.value;
      }
      return acc;
    }, {} as Record<string, unknown>) || {};

    return NextResponse.json(settingsMap);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
