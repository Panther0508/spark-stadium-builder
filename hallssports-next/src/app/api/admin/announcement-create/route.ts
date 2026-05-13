import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const data = await request.json();

    const { error } = await supabase.from("announcements").insert({
      ...data,
      is_verified: false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating announcement:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create announcement";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
