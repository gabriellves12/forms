import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const supabase = createServerSupabase();

  const [catsRes, templatesRes] = await Promise.all([
    supabase.from('categories').select('id, slug, name').order('position'),
    supabase
      .from('form_templates')
      .select('id, category_id, version, updated_at')
      .eq('is_active', true),
  ]);
  const cats = catsRes.data ?? [];
  const templates = (templatesRes.data ?? []) as { id: string; category_id: string; version: number; updated_at: string }[];
  const templateByCatId = new Map(templates.map((t) => [t.category_id, t]));

  const templateIds = templates.map((t) => t.id);
  const countsByTemplate = new Map<string, number>();
  if (templateIds.length > 0) {
    const { data: tq } = await supabase
      .from('template_questions')
      .select('template_id')
      .in('template_id', templateIds);
    for (const row of (tq ?? []) as { template_id: string }[]) {
      countsByTemplate.set(row.template_id, (countsByTemplate.get(row.template_id) ?? 0) + 1);
    }
  }

  const rows = cats.map((c) => {
    const t = templateByCatId.get(c.id);
    return { ...c, template: t, count: t ? countsByTemplate.get(t.id) ?? 0 : 0 };
  });

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Templates de formulário</h1>
          <p className="admin-subtitle">
            Edite as perguntas padrão de cada categoria. Mudanças valem só para novas
            respostas — históricos preservam o template original.
          </p>
        </div>
      </header>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Perguntas</th>
            <th>Última edição</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.count}</td>
              <td>
                {r.template?.updated_at
                  ? new Date(r.template.updated_at).toLocaleString('pt-BR')
                  : '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                <Link href={`/templates/${r.slug}`} className="admin-btn">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
