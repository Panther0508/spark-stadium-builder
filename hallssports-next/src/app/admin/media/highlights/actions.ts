'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function getHighlights() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from('highlights')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  return (data || []) as Array<{
    id: string;
    title?: string;
    description?: string;
    media_url: string;
    media_type: 'image' | 'video';
    is_verified?: boolean;
    created_at: string;
    order_index?: number;
  }>;
}

export async function createHighlight(data: {
  title: string;
  media_url: string;
  media_type: 'image' | 'video';
  match_id?: string;
}) {
  const supabase = getSupabaseAdminClient();

  const { error } = await (supabase as any).from('highlights').insert({
    title: data.title,
    media_url: data.media_url,
    media_type: data.media_type,
    match_id: data.match_id || null,
    is_verified: false,
  });

  if (error) {
    console.error('Failed to create highlight:', error);
    throw new Error(error.message);
  }

  revalidatePath('/highlights');
  revalidatePath('/admin/media/highlights');
  return { success: true };
}

export async function deleteHighlight(id: string) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('highlights').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete highlight:', error);
    throw new Error(error.message);
  }

  revalidatePath('/highlights');
  revalidatePath('/admin/media/highlights');
  return { success: true };
}
