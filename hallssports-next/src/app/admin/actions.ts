'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

type Filter = Record<string, any>;

export async function adminInsert(table: string, data: any) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from(table).insert(data as any);
  if (error) {
    console.error(`adminInsert error (${table}):`, error);
    throw new Error(error.message);
  }
  revalidatePath('/');
  revalidatePath(`/admin/${table}`);
  return { success: true };
}

export async function adminUpdate(table: string, filters: Filter, data: any) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any).from(table).update(data).match(filters);
  if (error) {
    console.error(`adminUpdate error (${table}):`, error);
    throw new Error(error.message);
  }
  revalidatePath('/');
  revalidatePath(`/admin/${table}`);
  return { success: true };
}

export async function adminDelete(table: string, filters: Filter) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any).from(table).delete().match(filters);
  if (error) {
    console.error(`adminDelete error (${table}):`, error);
    throw new Error(error.message);
  }
  revalidatePath('/');
  revalidatePath(`/admin/${table}`);
  return { success: true };
}

export async function adminSelect(table: string, filters?: Filter, options?: { order?: { field: string; ascending?: boolean } }) {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from(table).select('*');
  if (filters) {
    query = (query as any).match(filters);
  }
  if (options?.order) {
    query = query.order(options.order.field, { ascending: options.order.ascending ?? false });
  }
  const { data, error } = await query;
  if (error) {
    console.error(`adminSelect error (${table}):`, error);
    return [];
  }
  return data || [];
}

export async function adminCount(table: string, filters?: Filter) {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filters) {
    query = (query as any).match(filters);
  }
  const { count, error } = await query;
  if (error) {
    console.error(`adminCount error (${table}):`, error);
    return 0;
  }
  return count || 0;
}

export async function adminUpsert(table: string, data: any, onConflict: string = 'key') {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from(table).upsert(data, { onConflict });
  if (error) {
    console.error(`adminUpsert error (${table}):`, error);
    throw error;
  }
  revalidatePath('/');
  revalidatePath(`/admin/${table}`);
  return { success: true };
}

export async function adminFetchAll(table: string, filters?: Filter, options?: { order?: { field: string; ascending?: boolean } }) {
  return adminSelect(table, filters, options);
}
