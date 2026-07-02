'use server';

import { createAdminSupabase } from '@/lib/supabase/server';

interface AnswerInput {
  questionKey: string;
  questionTitle: string;
  value: string;
}

interface SubmitInput {
  templateId: string;
  categoryId: string;
  draftId?: string | null;
  inProgressBriefingId?: string | null;
  clientName: string | null;
  productName: string | null;
  answers: AnswerInput[];
}

interface ProgressInput {
  templateId: string;
  categoryId: string;
  draftId: string;
  briefingId: string | null;
  clientName: string | null;
  productName: string | null;
  answers: AnswerInput[];
}

function toRawPayload(answers: AnswerInput[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of answers) out[a.questionKey] = a.value;
  return out;
}

// Garante uma resposta por questionKey antes de enviar ao upsert.
// O Postgres aborta INSERT ... ON CONFLICT DO UPDATE se o batch contém duas linhas
// que conflitam com a mesma linha-alvo (erro: "cannot affect row a second time").
function dedupeAnswers<T extends { questionKey: string }>(answers: T[]): T[] {
  const map = new Map<string, T>();
  for (const a of answers) map.set(a.questionKey, a);
  return Array.from(map.values());
}

// Autosave parcial: chamado enquanto o cliente preenche um briefing gerado por draft.
// Cria a linha em `briefings` na primeira chamada (status='in_progress') e atualiza nas seguintes.
export async function saveBriefingProgress(
  input: ProgressInput
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  if (!input.draftId || !input.templateId || !input.categoryId) {
    return { success: false, error: 'Dados inválidos.' };
  }

  const supabase = createAdminSupabase();
  const answers = dedupeAnswers(input.answers);
  const rawPayload = toRawPayload(answers);

  let briefingId = input.briefingId;

  if (briefingId) {
    // Só atualiza se ainda for in_progress — se já foi submetido, ignora silenciosamente
    const { data, error } = await supabase
      .from('briefings')
      .update({
        client_name: input.clientName,
        product_name: input.productName,
        raw_payload: rawPayload,
      })
      .eq('id', briefingId)
      .eq('status', 'in_progress')
      .select('id')
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!data) {
      // Briefing já foi submetido ou não existe mais; abandona o autosave
      return { success: true, id: briefingId };
    }
  } else {
    const { data, error } = await supabase
      .from('briefings')
      .insert({
        category_id: input.categoryId,
        template_id: input.templateId,
        draft_id: input.draftId,
        client_name: input.clientName,
        product_name: input.productName,
        raw_payload: rawPayload,
        status: 'in_progress',
        source: 'draft',
      })
      .select('id')
      .single();
    if (error || !data) return { success: false, error: error?.message || 'Falha ao salvar progresso.' };
    briefingId = data.id;
  }

  const rows = answers
    .filter((a) => (a.value ?? '').trim() !== '')
    .map((a) => ({
      briefing_id: briefingId!,
      question_key: a.questionKey,
      question_title: a.questionTitle,
      value: a.value,
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from('briefing_answers')
      .upsert(rows, { onConflict: 'briefing_id,question_key' });
    if (error) return { success: false, error: error.message };
  }

  // Remove respostas que foram limpas pelo usuário
  const keepKeys = rows.map((r) => r.question_key);
  if (keepKeys.length > 0) {
    await supabase
      .from('briefing_answers')
      .delete()
      .eq('briefing_id', briefingId)
      .not('question_key', 'in', `(${keepKeys.map((k) => `"${k}"`).join(',')})`);
  } else {
    await supabase.from('briefing_answers').delete().eq('briefing_id', briefingId);
  }

  return { success: true, id: briefingId! };
}

export async function submitBriefing(
  input: SubmitInput
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  if (!input.templateId || !input.categoryId) {
    return { success: false, error: 'Dados inválidos.' };
  }
  if (!input.answers || input.answers.length === 0) {
    return { success: false, error: 'Nenhuma resposta recebida.' };
  }

  const supabase = createAdminSupabase();
  const answers = dedupeAnswers(input.answers);
  const rawPayload = toRawPayload(answers);

  let briefingId = input.inProgressBriefingId ?? null;

  if (briefingId) {
    // Promove o in_progress existente
    const { data, error } = await supabase
      .from('briefings')
      .update({
        client_name: input.clientName,
        product_name: input.productName,
        raw_payload: rawPayload,
        status: 'new',
        source: input.draftId ? 'draft' : 'web',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', briefingId)
      .select('id')
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!data) {
      // Linha sumiu (deletada pelo admin); cai pro insert
      briefingId = null;
    }
  }

  if (!briefingId) {
    const { data: briefing, error: bErr } = await supabase
      .from('briefings')
      .insert({
        category_id: input.categoryId,
        template_id: input.templateId,
        draft_id: input.draftId ?? null,
        client_name: input.clientName,
        product_name: input.productName,
        raw_payload: rawPayload,
        source: input.draftId ? 'draft' : 'web',
      })
      .select('id')
      .single();
    if (bErr || !briefing) {
      return { success: false, error: bErr?.message || 'Falha ao salvar briefing.' };
    }
    briefingId = briefing.id;
  }

  const rows = answers.map((a) => ({
    briefing_id: briefingId!,
    question_key: a.questionKey,
    question_title: a.questionTitle,
    value: a.value,
  }));

  const { error: aErr } = await supabase
    .from('briefing_answers')
    .upsert(rows, { onConflict: 'briefing_id,question_key' });
  if (aErr) {
    return { success: false, error: aErr.message };
  }

  if (input.draftId) {
    await supabase
      .from('briefing_drafts')
      .update({ used_briefing_id: briefingId })
      .eq('id', input.draftId);
  }

  return { success: true, id: briefingId! };
}
