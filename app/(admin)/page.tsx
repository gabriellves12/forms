import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import BriefingRow from '@/components/admin/BriefingRow';
import DraftRow, { type DraftRowData } from '@/components/admin/DraftRow';
import NewBriefingButton from '@/components/admin/NewBriefingButton';
import type { QuestionCardData } from '@/components/admin/QuestionCard';

export const dynamic = 'force-dynamic';

interface SearchParams {
  cat?: string;
  status?: string;
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'waiting', label: 'Aguardando' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'new', label: 'Novos' },
  { key: 'seen', label: 'Vistos' },
  { key: 'archived', label: 'Arquivados' },
];

type StatusBucket = {
  all: number;
  waiting: number;
  in_progress: number;
  new: number;
  seen: number;
  archived: number;
};
const EMPTY_BUCKET = (): StatusBucket => ({
  all: 0,
  waiting: 0,
  in_progress: 0,
  new: 0,
  seen: 0,
  archived: 0,
});

type MergedRow =
  | { kind: 'briefing'; date: string; data: any }
  | { kind: 'draft'; date: string; data: DraftRowData };

export default async function AdminHome({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabase();

  const [catsRes, allBriefingsRes, allDraftsRes] = await Promise.all([
    supabase.from('categories').select('id, slug, name').order('position'),
    supabase.from('briefings').select('category_id, status, draft_id'),
    supabase.from('briefing_drafts').select('id, category_id'),
  ]);
  const cats = catsRes.data ?? [];
  const allBriefings = (allBriefingsRes.data ?? []) as {
    category_id: string;
    status: string;
    draft_id: string | null;
  }[];
  const allDrafts = (allDraftsRes.data ?? []) as { id: string; category_id: string }[];

  const usedDraftIds = new Set<string>();
  for (const b of allBriefings) if (b.draft_id) usedDraftIds.add(b.draft_id);

  const bucketsByCatId = new Map<string, StatusBucket>();
  for (const c of cats) bucketsByCatId.set(c.id, EMPTY_BUCKET());
  for (const row of allBriefings) {
    const bucket = bucketsByCatId.get(row.category_id);
    if (!bucket) continue;
    bucket.all++;
    if (row.status in bucket) bucket[row.status as keyof StatusBucket]++;
  }
  for (const d of allDrafts) {
    if (usedDraftIds.has(d.id)) continue;
    const bucket = bucketsByCatId.get(d.category_id);
    if (!bucket) continue;
    bucket.all++;
    bucket.waiting++;
  }

  const counts: Record<string, number> = {};
  for (const c of cats) counts[c.slug] = bucketsByCatId.get(c.id)?.all ?? 0;

  const activeSlug = searchParams.cat ?? cats[0]?.slug ?? '';
  const activeCat = cats.find((c) => c.slug === activeSlug);
  const activeStatus = searchParams.status ?? 'all';

  let briefings: any[] = [];
  let drafts: DraftRowData[] = [];
  let templateId: string | null = null;
  let templateQuestions: QuestionCardData[] = [];
  const statusCounts: StatusBucket = activeCat
    ? bucketsByCatId.get(activeCat.id) ?? EMPTY_BUCKET()
    : EMPTY_BUCKET();

  if (activeCat) {
    let listQuery = supabase
      .from('briefings')
      .select('id, client_name, product_name, status, submitted_at')
      .eq('category_id', activeCat.id)
      .order('submitted_at', { ascending: false })
      .limit(200);
    if (activeStatus !== 'all' && activeStatus !== 'waiting') {
      listQuery = listQuery.eq('status', activeStatus);
    }

    let draftsQuery = supabase
      .from('briefing_drafts')
      .select('id, client_label, share_slug, share_token, created_at')
      .eq('category_id', activeCat.id)
      .order('created_at', { ascending: false })
      .limit(200);

    const [briefingsRes, draftsRes, tmplRes] = await Promise.all([
      // Filter waiting → no briefings rows
      activeStatus === 'waiting'
        ? Promise.resolve({ data: [] as any[] })
        : listQuery,
      draftsQuery,
      supabase
        .from('form_templates')
        .select('id')
        .eq('category_id', activeCat.id)
        .eq('is_active', true)
        .maybeSingle(),
    ]);
    briefings = briefingsRes.data ?? [];
    drafts = (draftsRes.data ?? []).filter((d: any) => !usedDraftIds.has(d.id)) as DraftRowData[];

    if (tmplRes.data) {
      templateId = tmplRes.data.id;
      const { data: tq } = await supabase
        .from('template_questions')
        .select('question_key, position, type, title, hint, placeholder, options, required, config')
        .eq('template_id', templateId)
        .order('position', { ascending: true });
      templateQuestions = (tq ?? []).map((r: any) => ({
        question_key: r.question_key,
        position: r.position,
        type: r.type,
        title: r.title,
        hint: r.hint ?? '',
        placeholder: r.placeholder ?? '',
        options: Array.isArray(r.options) ? r.options : [],
        required: r.required ?? true,
        config: r.config ?? {},
      }));
    }
  }

  const showBriefings = activeStatus !== 'waiting';
  const showDrafts = activeStatus === 'all' || activeStatus === 'waiting';

  const merged: MergedRow[] = [];
  if (showBriefings) {
    for (const b of briefings) merged.push({ kind: 'briefing', date: b.submitted_at, data: b });
  }
  if (showDrafts) {
    for (const d of drafts) merged.push({ kind: 'draft', date: d.created_at, data: d });
  }
  merged.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const buildHref = (cat: string, status: string) => {
    const sp = new URLSearchParams();
    sp.set('cat', cat);
    if (status !== 'all') sp.set('status', status);
    return `/?${sp.toString()}`;
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Histórico de briefings</h1>
          <p className="admin-subtitle">Todas as respostas recebidas, separadas por categoria.</p>
        </div>
        {activeCat && templateId && (
          <NewBriefingButton
            categoryName={activeCat.name}
            categorySlug={activeCat.slug}
            categoryId={activeCat.id}
            templateId={templateId}
            templateQuestions={templateQuestions}
          />
        )}
      </header>

      <div className="admin-tabs">
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={buildHref(c.slug, 'all')}
            className={`admin-tab ${c.slug === activeSlug ? 'active' : ''}`}
          >
            {c.name}
            <span className="admin-tab__count">{counts[c.slug] ?? 0}</span>
          </Link>
        ))}
      </div>

      {activeCat && statusCounts.all > 0 && (
        <div className="admin-filters">
          {STATUS_FILTERS.map((f) => {
            const n = statusCounts[f.key as keyof StatusBucket] ?? 0;
            if (f.key !== 'all' && n === 0) return null;
            return (
              <Link
                key={f.key}
                href={buildHref(activeCat.slug, f.key)}
                className={`admin-filter ${activeStatus === f.key ? 'active' : ''}`}
              >
                {f.key !== 'all' && (
                  <span className={`status-dot status-dot--${f.key}`} aria-hidden />
                )}
                {f.label}
                <span className="admin-filter__count">{n}</span>
              </Link>
            );
          })}
        </div>
      )}

      {merged.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <p className="admin-empty__title">
            {activeStatus === 'all'
              ? 'Nenhum briefing nessa categoria ainda.'
              : 'Nenhum briefing com esse status.'}
          </p>
          <p className="admin-empty__sub">
            {activeStatus === 'all'
              ? 'Gere um link customizado pra mandar pro cliente preencher.'
              : 'Tente outro filtro ou crie um novo briefing.'}
          </p>
          {activeCat && templateId && activeStatus === 'all' && (
            <NewBriefingButton
              categoryName={activeCat.name}
              categorySlug={activeCat.slug}
              categoryId={activeCat.id}
              templateId={templateId}
              templateQuestions={templateQuestions}
              variant="large"
              label={`Iniciar um briefing de ${activeCat.name}`}
            />
          )}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Produto / Empresa</th>
              <th>Status</th>
              <th>Recebido em</th>
              <th style={{ width: 220, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {merged.map((row) =>
              row.kind === 'briefing' ? (
                <BriefingRow key={`b-${row.data.id}`} b={row.data} />
              ) : (
                <DraftRow key={`d-${row.data.id}`} d={row.data} />
              )
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
