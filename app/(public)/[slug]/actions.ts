'use server';

import { createAdminSupabase } from '@/lib/supabase/server';

interface SubmitInput {
  templateId: string;
  categoryId: string;
  clientName: string | null;
  productName: string | null;
  answers: { questionKey: string; questionTitle: string; value: string }[];
}

export async function submitBriefing(
  input: SubmitInput
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  // Validação básica
  if (!input.templateId || !input.categoryId) {
    return { success: false, error: 'Dados inválidos.' };
  }
  if (!input.answers || input.answers.length === 0) {
    return { success: false, error: 'Nenhuma resposta recebida.' };
  }

  const supabase = createAdminSupabase();

  const rawPayload: Record<string, string> = {};
  for (const a of input.answers) rawPayload[a.questionKey] = a.value;

  const { data: briefing, error: bErr } = await supabase
    .from('briefings')
    .insert({
      category_id: input.categoryId,
      template_id: input.templateId,
      client_name: input.clientName,
      product_name: input.productName,
      raw_payload: rawPayload,
      source: 'web',
    })
    .select('id')
    .single();

  if (bErr || !briefing) {
    return { success: false, error: bErr?.message || 'Falha ao salvar briefing.' };
  }

  const rows = input.answers.map((a) => ({
    briefing_id: briefing.id,
    question_key: a.questionKey,
    question_title: a.questionTitle,
    value: a.value,
  }));

  const { error: aErr } = await supabase.from('briefing_answers').insert(rows);
  if (aErr) {
    // rollback simples: deletar briefing pra evitar lixo parcial
    await supabase.from('briefings').delete().eq('id', briefing.id);
    return { success: false, error: aErr.message };
  }

  return { success: true, id: briefing.id };
}
