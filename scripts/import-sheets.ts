/**
 * Importa o histórico do Google Sheets (CSV exportado) pro Supabase.
 *
 * Pré-requisitos:
 *   1. .env.local com NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   2. seed-templates já rodado (categorias + perguntas já existem)
 *   3. Arquivo CSV exportado do Sheets em ./sheets-export.csv
 *
 * Layout esperado do CSV (mesma ordem do COLUMNS no apps-script.gs):
 *   Data/Hora, 1. Nome do cliente, ... 22. Marcas admiradas
 *
 * Uso: npm run import:sheets [-- --file=./outro.csv] [-- --dry-run]
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// Mesmas chaves do apps-script.gs / template identidade-visual
const COLUMN_MAP: { csvHeader: string; key: string }[] = [
  { csvHeader: '1. Nome do cliente', key: 'cliente_nome' },
  { csvHeader: '2. Nome do produto/empresa', key: 'produto_nome' },
  { csvHeader: '3. Significado do nome', key: 'nome_significado' },
  { csvHeader: '4. Descrição do produto', key: 'descricao_produto' },
  { csvHeader: '5. Diferencial no mercado', key: 'diferencial' },
  { csvHeader: '6. Slogan', key: 'slogan' },
  { csvHeader: '7. Concorrentes', key: 'concorrentes' },
  { csvHeader: '8. O que concorrentes oferecem', key: 'concorrentes_oferecem' },
  { csvHeader: '9. Público-alvo', key: 'publico_alvo' },
  { csvHeader: '10. Classe social', key: 'classe_social' },
  { csvHeader: '11. Faixa etária', key: 'faixa_etaria' },
  { csvHeader: '12. Gênero', key: 'genero' },
  { csvHeader: '13. Quem são os clientes', key: 'clientes_quem' },
  { csvHeader: '14. Como gostaria de ser descrito', key: 'como_descrito' },
  { csvHeader: '15. Características que deve transmitir', key: 'caracteristicas' },
  { csvHeader: '16. Top 3 características', key: 'caracteristicas_top3' },
  { csvHeader: '17. Características que NÃO transmitir', key: 'caracteristicas_nao' },
  { csvHeader: '18. Cor obrigatória', key: 'cor_obrigatoria' },
  { csvHeader: '19. Cor proibida', key: 'cor_proibida' },
  { csvHeader: '20. Elemento gráfico desejado', key: 'elemento_desejado' },
  { csvHeader: '21. Elemento gráfico proibido', key: 'elemento_proibido' },
  { csvHeader: '22. Marcas admiradas', key: 'marcas_admiradas' },
];

const argv = process.argv.slice(2);
const fileArg = argv.find((a) => a.startsWith('--file='))?.split('=')[1] ?? './sheets-export.csv';
const dryRun = argv.includes('--dry-run');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Resolve categoria Identidade Visual + template ativo
  const { data: cat } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('slug', 'identidade-visual')
    .maybeSingle();
  if (!cat) {
    console.error('Categoria identidade-visual não encontrada. Rode npm run seed:templates primeiro.');
    process.exit(1);
  }

  const { data: tmpl } = await supabase
    .from('form_templates')
    .select('id')
    .eq('category_id', cat.id)
    .eq('is_active', true)
    .maybeSingle();
  if (!tmpl) {
    console.error('Template ativo não encontrado.');
    process.exit(1);
  }

  // 2. Carrega títulos das perguntas pra preencher question_title histórico
  const { data: questions } = await supabase
    .from('template_questions')
    .select('question_key, title')
    .eq('template_id', tmpl.id);
  const titleMap = new Map<string, string>();
  for (const q of questions ?? []) titleMap.set(q.question_key, q.title);

  // 3. Lê CSV
  const csvPath = resolve(fileArg);
  const raw = readFileSync(csvPath, 'utf-8');
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`Lendo ${records.length} respostas de ${csvPath}`);
  if (dryRun) console.log('[DRY RUN] nenhum write será feito.\n');

  let imported = 0;
  let skipped = 0;
  for (const row of records) {
    const timestamp = row['Data/Hora'] || row['Timestamp'] || '';
    const submittedAt = parseDate(timestamp);
    if (!submittedAt) {
      console.warn(`  ⚠️ linha sem timestamp válido — pulando: ${timestamp}`);
      skipped++;
      continue;
    }

    const rawPayload: Record<string, string> = {};
    for (const m of COLUMN_MAP) rawPayload[m.key] = row[m.csvHeader] ?? '';

    const clientName = rawPayload.cliente_nome || null;
    const productName = rawPayload.produto_nome || null;

    if (dryRun) {
      console.log(`  → ${submittedAt.toISOString()} — ${clientName} (${productName})`);
      imported++;
      continue;
    }

    const { data: briefing, error: bErr } = await supabase
      .from('briefings')
      .insert({
        category_id: cat.id,
        template_id: tmpl.id,
        client_name: clientName,
        product_name: productName,
        raw_payload: rawPayload,
        source: 'sheets-import',
        submitted_at: submittedAt.toISOString(),
        status: 'seen',
      })
      .select('id')
      .single();

    if (bErr || !briefing) {
      console.error(`  ❌ falha:`, bErr?.message);
      skipped++;
      continue;
    }

    const answerRows = COLUMN_MAP.map((m) => ({
      briefing_id: briefing.id,
      question_key: m.key,
      question_title: titleMap.get(m.key) ?? m.csvHeader,
      value: rawPayload[m.key],
    }));

    const { error: aErr } = await supabase.from('briefing_answers').insert(answerRows);
    if (aErr) {
      console.error(`  ❌ respostas (rollback):`, aErr.message);
      await supabase.from('briefings').delete().eq('id', briefing.id);
      skipped++;
      continue;
    }

    imported++;
    console.log(`  ✓ ${submittedAt.toISOString()} — ${clientName ?? '(sem nome)'}`);
  }

  console.log(`\nImportados: ${imported}  Pulados: ${skipped}`);
}

/** Aceita "DD/MM/AAAA HH:MM:SS", ISO, ou Date sortable. */
function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  // BR: 23/06/2026 14:35:21
  const br = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (br) {
    const [, d, m, y, h, mi, s] = br;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(mi), Number(s ?? '0'));
  }
  const iso = new Date(trimmed);
  return isNaN(iso.getTime()) ? null : iso;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
