/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const { id, category = "Other", ...data }: { id?: string; category?: string; [key: string]: any } = await request.json();

    if (id) {
      const { error } = await (supabase.from("highlights") as any)
        .update({ ...data, category })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await (supabase.from("highlights") as any)
        .insert({ ...data, category, is_verified: true });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating/creating highlight:", error);
    return NextResponse.json({ error: "Failed to update/create highlight: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
