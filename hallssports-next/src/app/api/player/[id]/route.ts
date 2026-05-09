import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playerId = searchParams.get('id');

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await withRetry(async () => {
      const result = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();
      return result;
    }, { data: null });

    if (!data) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}