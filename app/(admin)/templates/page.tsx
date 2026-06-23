import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const supabase = createServerSupabase();
  const { data: cats } = await supabase
    .from('categories')
    .select('id, slug, name')
    .order('position');

  const rows: any[] = [];
  for (const c of cats ?? []) {
    const { data: t } = await supabase
      .from('form_templates')
      .select('id, version, updated_at')
      .eq('category_id', c.id)
      .eq('is_active', true)
      .maybeSingle();
    let count = 0;
    if (t) {
      const { count: qc } = await supabase
        .from('template_questions')
        .select('id', { count: 'exact', head: true })
        .eq('template_id', t.id);
      count = qc ?? 0;
    }
    rows.push({ ...c, template: t, count });
  }

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
