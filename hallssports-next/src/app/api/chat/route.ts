import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { sanitizeHtml } from '@/lib/sanitize';
/* eslint-disable @typescript-eslint/no-explicit-any */

// In-memory rate limiter: Map<username, number[]>
const rateLimits = new Map<string, number[]>();

const WINDOW_MS = 10 * 1000; // 10 seconds
const MAX_MESSAGES = 10;

// In-memory cache for GET responses: Map<matchId, { data, timestamp }>
const cache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 10 * 1000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const matchId = searchParams.get('matchId');

  if (!matchId) {
    return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(matchId);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from('match_chats')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(20);

    const messages = data || [];
    cache.set(matchId, { data: messages, timestamp: now });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, user_name, message } = body;

    if (!match_id || !user_name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const key = user_name.toLowerCase().trim();
    const now = Date.now();
    const timestamps = rateLimits.get(key) || [];

    // Keep only timestamps within the window
    const recent = timestamps.filter((t) => now - t < WINDOW_MS);

    if (recent.length >= MAX_MESSAGES) {
      return NextResponse.json(
        { error: 'Too many messages. Please slow down.' },
        { status: 429 }
      );
    }

    recent.push(now);
    rateLimits.set(key, recent);

    const supabase = getSupabaseAdminClient();
    const { error: insertError } = await supabase
      .from('match_chats')
      .insert({
        match_id,
        user_name,
        message: sanitizeHtml(message.trim()),
        created_at: new Date().toISOString(),
      } as any);

    if (insertError) {
      console.error('Chat insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}