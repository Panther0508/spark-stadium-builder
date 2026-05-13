import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const { id, title, body, image_url } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("announcements")
      .update({
        title,
        body,
        image_url,
        is_verified: false, // Re-verify on edit
      } as never)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating announcement:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update announcement";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
