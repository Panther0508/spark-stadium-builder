/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const payload: { id?: string; status?: string; [key: string]: any } = await request.json();
    const { id, status, ...data } = payload;

    if (id) {
      const { error } = await (supabase.from("matches") as any)
        .update({ ...data, status })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await (supabase.from("matches") as any)
        .insert({ ...data, status: status || "scheduled", is_verified: true });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating/creating match:", error);
    return NextResponse.json({ error: "Failed to update/create match: " + (error?.message || JSON.stringify(error)) }, { status: 500 });
  }
}
