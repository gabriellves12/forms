import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import BriefingRow from '@/components/admin/BriefingRow';

export const dynamic = 'force-dynamic';

interface SearchParams {
  cat?: string;
  status?: string;
}

export default async function AdminHome({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabase();

  const { data: cats } = await supabase
    .from('categories')
    .select('id, slug, name')
    .order('position');

  // Conta por categoria pra mostrar nos tabs
  const counts: Record<string, number> = {};
  for (const c of cats ?? []) {
    const { count } = await supabase
      .from('briefings')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', c.id);
    counts[c.slug] = count ?? 0;
  }

  const activeSlug = searchParams.cat ?? cats?.[0]?.slug ?? '';
  const activeCat = cats?.find((c) => c.slug === activeSlug);

  let briefings: any[] = [];
  if (activeCat) {
    let q = supabase
      .from('briefings')
      .select('id, client_name, product_name, status, submitted_at')
      .eq('category_id', activeCat.id)
      .order('submitted_at', { ascending: false })
      .limit(200);

    if (searchParams.status) {
      q = q.eq('status', searchParams.status);
    }
    const { data } = await q;
    briefings = data ?? [];
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Histórico de briefings</h1>
          <p className="admin-subtitle">Todas as respostas recebidas, separadas por categoria.</p>
        </div>
        {activeCat && (
          <Link
            href={`/${activeCat.slug}`}
            target="_blank"
            rel="noopener"
            className="admin-btn admin-btn--primary"
          >
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
            Novo briefing de {activeCat.name}
          </Link>
        )}
      </header>

      <div className="admin-tabs">
        {(cats ?? []).map((c) => (
          <Link
            key={c.slug}
            href={`/?cat=${c.slug}`}
            className={`admin-tab ${c.slug === activeSlug ? 'active' : ''}`}
          >
            {c.name}
            <span className="admin-tab__count">{counts[c.slug] ?? 0}</span>
          </Link>
        ))}
      </div>

      {briefings.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhum briefing nessa categoria ainda.</p>
          {activeCat && (
            <Link
              href={`/${activeCat.slug}`}
              target="_blank"
              rel="noopener"
              className="admin-btn admin-btn--primary"
              style={{ marginTop: 16 }}
            >
              <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
              Iniciar um briefing de {activeCat.name}
            </Link>
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
            {briefings.map((b) => (
              <BriefingRow key={b.id} b={b} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
