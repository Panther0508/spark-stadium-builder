import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { sanitizeHtml } from '@/lib/sanitize';
/* eslint-disable @typescript-eslint/no-explicit-any */

// In-memory rate limiter for feedback
const rateLimits = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_FEEDBACK = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, subject, description, pageUrl, userContact } = body;

    if (!type || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, subject, and description are required' },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = ip;
    const now = Date.now();
    const timestamps = rateLimits.get(key) || [];
    const recent = timestamps.filter((t) => now - t < WINDOW_MS);

    if (recent.length >= MAX_FEEDBACK) {
      return NextResponse.json(
        { error: 'Too many feedback submissions. Please try again later.' },
        { status: 429 }
      );
    }

    recent.push(now);
    rateLimits.set(key, recent);

    const sanitizedSubject = sanitizeHtml(subject.trim());
    const sanitizedDescription = sanitizeHtml(description.trim());
    const sanitizedPageUrl = sanitizeHtml((pageUrl || '').trim());
    const sanitizedContact = userContact ? sanitizeHtml(userContact.trim()) : null;

    const supabase = getSupabaseAdminClient();
    const { error: insertError } = await supabase
      .from('feedback')
      .insert({
        type,
        subject: sanitizedSubject,
        description: sanitizedDescription,
        page_url: sanitizedPageUrl || null,
        user_contact: sanitizedContact,
        status: 'pending',
        created_at: new Date().toISOString(),
      } as any);

    if (insertError) {
      console.error('Feedback insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
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