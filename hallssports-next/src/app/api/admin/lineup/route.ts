import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const supabase = getSupabaseAdminClient();
  const body = await req.json();
  const { match_id, team_id, formation, positions } = body;

  if (!match_id || !team_id || !formation || !positions) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

try {
     const { error } = await supabase.from('lineups').upsert({
       match_id,
       team_id,
       formation,
       positions,
     } as unknown as never, { onConflict: 'match_id,team_id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
  }
}
