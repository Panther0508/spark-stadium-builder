import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { withRetry } from '@/lib/retry';

const DEV_KEY = process.env.DEV_KEY || "HallsSports_Dev_2025_Secure";

export async function GET(request: NextRequest) {
  // Authenticate using devkey query param (same as developer page)
  const searchParams = request.nextUrl.searchParams;
  const devkey = searchParams.get('devkey');
  if (devkey !== DEV_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Fetch database size via RPC
    const { data: dbSizeData } = await withRetry(
      async () => {
        const { data } = await supabase.rpc('get_database_size');
        return { data };
      },
      { data: null }
    );

    // Fetch connection count via RPC (may fail if function not accessible)
    let connectionCount: number | null = null;
    try {
      const { data: connData } = await supabase.rpc('get_connection_count');
      connectionCount = typeof connData === 'number' ? connData : Number(connData) || null;
    } catch (e) {
      console.warn('Could not fetch connection count:', e);
    }

    const dbSizeBytes = dbSizeData ?? 0;
    const dbSizeMB = dbSizeBytes / (1024 * 1024);

    let status: 'green' | 'orange' | 'red' = 'green';
    if (dbSizeMB > 450) {
      status = 'red';
    } else if (dbSizeMB >= 400) {
      status = 'orange';
    }

    return NextResponse.json({
      databaseSizeBytes: dbSizeBytes,
      databaseSizeMB: parseFloat(dbSizeMB.toFixed(2)),
      connectionCount,
      status,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}