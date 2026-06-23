/**
 * Popula categorias + form_templates + template_questions
 * a partir dos arquivos em lib/templates.
 *
 * Uso:
 *   npm run seed:templates
 *
 * Ler env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (.env.local).
 *
 * Roda idempotente: ON CONFLICT em slug/question_key.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { ALL_TEMPLATES } from '../lib/templates';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  for (let i = 0; i < ALL_TEMPLATES.length; i++) {
    const t = ALL_TEMPLATES[i];

    // 1. Upsert da categoria
    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .upsert({ slug: t.categorySlug, name: t.categoryName, position: i }, { onConflict: 'slug' })
      .select()
      .single();

    if (catErr || !cat) {
      console.error(`Falha na categoria ${t.categorySlug}:`, catErr);
      continue;
    }

    // 2. Verifica se já existe um template ativo pra essa categoria
    const { data: existing } = await supabase
      .from('form_templates')
      .select('id')
      .eq('category_id', cat.id)
      .eq('is_active', true)
      .maybeSingle();

    let templateId = existing?.id;

    if (!templateId) {
      const { data: tmpl, error: tmplErr } = await supabase
        .from('form_templates')
        .insert({
          category_id: cat.id,
          version: 1,
          is_active: true,
          intro: t.intro as any,
        })
        .select()
        .single();

      if (tmplErr || !tmpl) {
        console.error(`Falha no template ${t.categorySlug}:`, tmplErr);
        continue;
      }

      templateId = tmpl.id;
    } else {
      // mantém intro atualizado nesse seed; perguntas só inserimos se ainda não existirem
      await supabase
        .from('form_templates')
        .update({ intro: t.intro as any })
        .eq('id', templateId);
    }

    // 3. Insere perguntas (skip se question_key já existir)
    for (let p = 0; p < t.questions.length; p++) {
      const q = t.questions[p];
      const { error: qErr } = await supabase.from('template_questions').upsert(
        {
          template_id: templateId,
          question_key: q.id,
          position: p,
          type: q.type,
          title: q.title,
          hint: q.hint ?? null,
          placeholder: q.placeholder ?? null,
          options: q.options ?? [],
          required: q.required ?? true,
          config: q.config ?? {},
        },
        { onConflict: 'template_id,question_key' }
      );
      if (qErr) console.error(`  ⚠️ pergunta ${q.id}:`, qErr.message);
    }

    console.log(`✓ ${t.categorySlug} — ${t.questions.length} perguntas`);
  }

  console.log('\nSeed concluído.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
