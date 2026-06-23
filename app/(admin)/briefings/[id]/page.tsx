import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateBriefingStatus, deleteBriefing, markBriefingAsSeen } from './actions';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  new: 'Novo',
  seen: 'Visto',
  archived: 'Arquivado',
};

export default async function BriefingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: briefing } = await supabase
    .from('briefings')
    .select(
      'id, client_name, product_name, status, submitted_at, raw_payload, category_id, template_id'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!briefing) notFound();

  const { data: category } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('id', briefing.category_id)
    .maybeSingle();

  // Tenta carregar perguntas do template original; se já foi removido,
  // fallback pra raw_payload.
  let questions: { question_key: string; title: string; position: number }[] = [];
  if (briefing.template_id) {
    const { data } = await supabase
      .from('template_questions')
      .select('question_key, title, position')
      .eq('template_id', briefing.template_id)
      .order('position');
    questions = data ?? [];
  }

  const { data: answers } = await supabase
    .from('briefing_answers')
    .select('question_key, question_title, value')
    .eq('briefing_id', briefing.id);

  const answerMap = new Map<string, { title: string; value: string }>();
  for (const a of answers ?? []) {
    answerMap.set(a.question_key, { title: a.question_title || '', value: a.value || '' });
  }

  // ordena pela posição do template; fallback alphabetical
  const orderedKeys =
    questions.length > 0
      ? questions.map((q) => ({ key: q.question_key, title: q.title }))
      : Array.from(answerMap.entries()).map(([key, v]) => ({ key, title: v.title }));

  // Auto-marca como visto (se ainda 'new')
  if (briefing.status === 'new') {
    await markBriefingAsSeen(briefing.id);
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <p style={{ fontSize: 13, color: 'var(--tb-text-muted)', marginBottom: 6 }}>
            <Link href={`/?cat=${category?.slug ?? ''}`} style={{ color: 'inherit' }}>
              ← {category?.name ?? 'Histórico'}
            </Link>
          </p>
          <h1 className="admin-title">
            {briefing.client_name || 'Briefing'}{' '}
            <span className={`admin-badge admin-badge--${briefing.status}`}>
              {STATUS_LABEL[briefing.status]}
            </span>
          </h1>
          <p className="admin-subtitle">
            {briefing.product_name && `${briefing.product_name} · `}
            {new Date(briefing.submitted_at).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="admin-actions">
          <form action={updateBriefingStatus}>
            <input type="hidden" name="id" value={briefing.id} />
            <input
              type="hidden"
              name="status"
              value={briefing.status === 'archived' ? 'seen' : 'archived'}
            />
            <button className="admin-btn" type="submit">
              {briefing.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
            </button>
          </form>
          <form action={deleteBriefing}>
            <input type="hidden" name="id" value={briefing.id} />
            <input type="hidden" name="categorySlug" value={category?.slug ?? ''} />
            <button className="admin-btn admin-btn--danger" type="submit">
              Excluir
            </button>
          </form>
        </div>
      </header>

      <div className="admin-card">
        <div className="detail-grid">
          {orderedKeys.map(({ key, title }) => {
            const ans = answerMap.get(key);
            const value = ans?.value;
            const displayTitle = title || ans?.title || key;
            return (
              <div className="detail-row" key={key}>
                <div className="detail-row__label">{displayTitle}</div>
                <div
                  className={`detail-row__value ${
                    !value ? 'detail-row__value--muted' : ''
                  }`}
                >
                  {value || 'Sem resposta'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
