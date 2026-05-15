import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const { id, ...data }: { id?: string; [key: string]: any } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Standing ID is required" }, { status: 400 });
    }

    const { error } = await (supabase.from("standings") as any)
      .update(data)
      .eq("id", id);    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating standing:", error);
    return NextResponse.json({ error: "Failed to update standing" }, { status: 500 });
  }
}
