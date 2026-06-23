'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export async function markBriefingAsSeen(id: string) {
  const supabase = createServerSupabase();
  await supabase.from('briefings').update({ status: 'seen' }).eq('id', id);
}

export async function updateBriefingStatus(formData: FormData) {
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || 'seen');
  if (!id) return;

  const supabase = createServerSupabase();
  await supabase.from('briefings').update({ status }).eq('id', id);
  revalidatePath(`/briefings/${id}`);
  revalidatePath('/');
}

export async function deleteBriefing(formData: FormData) {
  const id = String(formData.get('id') || '');
  const categorySlug = String(formData.get('categorySlug') || '');
  if (!id) return;

  const supabase = createServerSupabase();
  await supabase.from('briefings').delete().eq('id', id);
  revalidatePath('/');
  redirect(categorySlug ? `/?cat=${categorySlug}` : '/');
}
