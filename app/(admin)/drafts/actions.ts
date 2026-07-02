'use server';

import { randomBytes } from 'node:crypto';
import { createServerSupabase } from '@/lib/supabase/server';
import type { QuestionPayload } from '../templates/[slug]/actions';

function randomToken() {
  return randomBytes(16).toString('base64url');
}

// O upsert de briefing_answers usa (briefing_id, question_key) como conflict target.
// Se o draft tiver question_key vazio ou duplicado, a submissão do cliente quebra
// com "ON CONFLICT DO UPDATE command cannot affect row a second time".
function validateQuestionKeys(questions: { question_key: string }[]): string | null {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const q of questions) {
    const key = (q.question_key ?? '').trim();
    if (!key) return 'Há pergunta sem identificador (question_key).';
    if (seen.has(key)) dupes.push(key);
    seen.add(key);
  }
  if (dupes.length > 0) {
    return `Identificadores de pergunta duplicados: ${Array.from(new Set(dupes)).join(', ')}.`;
  }
  return null;
}

function padN(n: number) {
  return n < 100 ? String(n).padStart(2, '0') : String(n);
}

async function pickNextShareSlug(
  supabase: ReturnType<typeof createServerSupabase>,
  categorySlug: string,
  categoryId: string,
): Promise<string> {
  const { data } = await supabase
    .from('briefing_drafts')
    .select('share_slug')
    .eq('category_id', categoryId)
    .not('share_slug', 'is', null);

  const prefix = `${categorySlug}-`;
  let max = 0;
  for (const row of data ?? []) {
    const slug = (row as { share_slug: string | null }).share_slug;
    if (!slug || !slug.startsWith(prefix)) continue;
    const n = parseInt(slug.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${categorySlug}-${padN(max + 1)}`;
}

export async function createBriefingDraft(input: {
  templateId: string;
  categoryId: string;
  categorySlug: string;
  questions: QuestionPayload[];
  intro?: Record<string, any> | null;
  clientLabel?: string | null;
  notes?: string | null;
}): Promise<
  | { success: true; id: string; shareToken: string; shareSlug: string; shareUrl: string }
  | { success: false; error: string }
> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  if (!input.questions || input.questions.length === 0) {
    return { success: false, error: 'O briefing precisa ter pelo menos uma pergunta.' };
  }
  const keyErr = validateQuestionKeys(input.questions);
  if (keyErr) return { success: false, error: keyErr };

  const token = randomToken();
  const basePayload = {
    template_id: input.templateId,
    category_id: input.categoryId,
    questions: input.questions.map((q, i) => ({ ...q, position: i })),
    intro: input.intro ?? null,
    client_label: input.clientLabel ?? null,
    notes: input.notes ?? null,
    share_token: token,
    created_by: user.id,
  };

  let lastError: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const share_slug = await pickNextShareSlug(supabase, input.categorySlug, input.categoryId);
    const { data, error } = await supabase
      .from('briefing_drafts')
      .insert({ ...basePayload, share_slug })
      .select('id, share_token, share_slug')
      .single();

    if (data) {
      return {
        success: true,
        id: data.id,
        shareToken: data.share_token,
        shareSlug: data.share_slug,
        shareUrl: `/${data.share_slug}`,
      };
    }

    lastError = error?.message || 'Falha ao criar draft.';
    // 23505 = unique_violation — outra criação simultânea pegou esse N; tenta de novo.
    if (error?.code !== '23505') break;
  }

  return { success: false, error: lastError ?? 'Falha ao criar draft.' };
}

export async function deleteBriefingDraft(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from('briefing_drafts').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getBriefingDraft(id: string): Promise<
  | {
      success: true;
      draft: {
        id: string;
        client_label: string | null;
        notes: string | null;
        questions: QuestionPayload[];
      };
    }
  | { success: false; error: string }
> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('briefing_drafts')
    .select('id, client_label, notes, questions')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return { success: false, error: error?.message ?? 'Draft não encontrado.' };
  return {
    success: true,
    draft: {
      id: data.id,
      client_label: data.client_label,
      notes: data.notes,
      questions: Array.isArray(data.questions) ? (data.questions as QuestionPayload[]) : [],
    },
  };
}

export async function updateBriefingDraft(input: {
  id: string;
  clientLabel?: string | null;
  notes?: string | null;
  questions: QuestionPayload[];
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autenticado.' };

  if (!input.questions || input.questions.length === 0) {
    return { success: false, error: 'O briefing precisa ter pelo menos uma pergunta.' };
  }
  const keyErr = validateQuestionKeys(input.questions);
  if (keyErr) return { success: false, error: keyErr };

  const { error } = await supabase
    .from('briefing_drafts')
    .update({
      client_label: input.clientLabel ?? null,
      notes: input.notes ?? null,
      questions: input.questions.map((q, i) => ({ ...q, position: i })),
    })
    .eq('id', input.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
