import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();

    const data = await request.json();

    const { error } = await supabase.from("highlights").insert({
      ...data,
      is_verified: false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating highlight:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create highlight";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
