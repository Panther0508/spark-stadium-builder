import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface Setting {
  key: string;
  value: string;
}

export async function GET() {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data, error } = await supabase.from("settings").select("*");

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    // Convert array of {key, value} to object map
    const settingsMap = (data as Setting[] | null)?.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>) || {};

    return NextResponse.json(settingsMap);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
