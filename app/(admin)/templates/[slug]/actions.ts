'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

export interface QuestionPayload {
  id?: string;
  question_key: string;
  position: number;
  type: string;
  title: string;
  hint: string | null;
  placeholder: string | null;
  options: string[];
  required: boolean;
  config: Record<string, any>;
}

export async function saveTemplate(input: {
  templateId: string;
  categorySlug: string;
  intro: Record<string, any>;
  questions: QuestionPayload[];
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabase();

  // Bloqueia duplicatas de question_key: o upsert (template_id, question_key) é único,
  // e perguntas duplicadas quebram a submissão do briefing (Postgres ON CONFLICT em batch).
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const q of input.questions) {
    const key = (q.question_key ?? '').trim();
    if (!key) {
      return { success: false, error: 'Há pergunta sem identificador (question_key).' };
    }
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
  }
  if (duplicates.length > 0) {
    return {
      success: false,
      error: `Identificadores de pergunta duplicados: ${Array.from(new Set(duplicates)).join(', ')}.`,
    };
  }

  // 1. Atualiza intro
  const { error: introErr } = await supabase
    .from('form_templates')
    .update({ intro: input.intro })
    .eq('id', input.templateId);
  if (introErr) return { success: false, error: introErr.message };

  // 2. Pega ids atuais pra fazer diff
  const { data: existing } = await supabase
    .from('template_questions')
    .select('id, question_key')
    .eq('template_id', input.templateId);

  const incomingKeys = new Set(input.questions.map((q) => q.question_key));
  const toDelete = (existing ?? [])
    .filter((e) => !incomingKeys.has(e.question_key))
    .map((e) => e.id);

  if (toDelete.length > 0) {
    await supabase.from('template_questions').delete().in('id', toDelete);
  }

  // 3. Upsert das perguntas
  for (const q of input.questions) {
    const { error } = await supabase.from('template_questions').upsert(
      {
        template_id: input.templateId,
        question_key: q.question_key,
        position: q.position,
        type: q.type,
        title: q.title,
        hint: q.hint,
        placeholder: q.placeholder,
        options: q.options,
        required: q.required,
        config: q.config,
      },
      { onConflict: 'template_id,question_key' }
    );
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/templates/${input.categorySlug}`);
  revalidatePath(`/${input.categorySlug}`);
  return { success: true };
}
