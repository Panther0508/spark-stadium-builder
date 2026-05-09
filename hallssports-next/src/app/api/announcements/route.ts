import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  verified: boolean;
  // add other fields as needed
}

// In-memory cache: { data: Announcement[], timestamp: number }
let cache: { data: Announcement[]; timestamp: number } | null = null;

const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

   try {
     const supabase = getSupabaseAdminClient();
     const { data } = await withRetry(async () => {
       const result = await supabase
         .from('announcements')
         .select('*')
         .eq('verified', true)
         .order('created_at', { ascending: false })
         .limit(10);
       return result;
     }, { data: [] });

    cache = { data: data || [], timestamp: now };
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
