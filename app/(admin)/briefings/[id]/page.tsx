import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateBriefingStatus, deleteBriefing, markBriefingAsSeen } from './actions';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'Em andamento',
  new: 'Novo',
  seen: 'Visto',
  archived: 'Arquivado',
};

export default async function BriefingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: briefing } = await supabase
    .from('briefings')
    .select(
      'id, client_name, product_name, status, submitted_at, raw_payload, category_id, template_id, draft_id'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!briefing) notFound();

  // Briefings originados de draft devem listar APENAS as perguntas que estavam no
  // snapshot enviado ao cliente — o template pode ter perguntas a mais que foram
  // removidas no draft. Briefings sem draft caem de volta no template.
  const [categoryRes, draftRes, templateQuestionsRes, answersRes] = await Promise.all([
    supabase.from('categories').select('name, slug').eq('id', briefing.category_id).maybeSingle(),
    briefing.draft_id
      ? supabase
          .from('briefing_drafts')
          .select('questions')
          .eq('id', briefing.draft_id)
          .maybeSingle()
      : Promise.resolve({ data: null as { questions: unknown } | null }),
    briefing.template_id && !briefing.draft_id
      ? supabase
          .from('template_questions')
          .select('question_key, title, position')
          .eq('template_id', briefing.template_id)
          .order('position')
      : Promise.resolve({ data: [] as { question_key: string; title: string; position: number }[] }),
    supabase
      .from('briefing_answers')
      .select('question_key, question_title, value')
      .eq('briefing_id', briefing.id),
  ]);

  const category = categoryRes.data;
  const answers = answersRes.data;

  const answerMap = new Map<string, { title: string; value: string }>();
  for (const a of answers ?? []) {
    answerMap.set(a.question_key, { title: a.question_title || '', value: a.value || '' });
  }

  const draftQuestions = (() => {
    const raw = (draftRes.data as { questions: unknown } | null)?.questions;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((q: any) => ({
        key: typeof q?.question_key === 'string' ? q.question_key : '',
        title: typeof q?.title === 'string' ? q.title : '',
      }))
      .filter((q) => q.key);
  })();

  const templateQuestions = (templateQuestionsRes.data ?? []) as {
    question_key: string;
    title: string;
    position: number;
  }[];

  // Prioridade: snapshot do draft > template > chaves vindas das respostas.
  const orderedKeys =
    draftQuestions.length > 0
      ? draftQuestions
      : templateQuestions.length > 0
        ? templateQuestions.map((q) => ({ key: q.question_key, title: q.title }))
        : Array.from(answerMap.entries()).map(([key, v]) => ({ key, title: v.title }));

  // Auto-marca como visto (apenas para briefings finalizados ainda 'new')
  if (briefing.status === 'new') {
    await markBriefingAsSeen(briefing.id);
  }
  // Para in_progress, não muda status — o cliente ainda pode estar preenchendo.

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
            {briefing.status === 'in_progress' ? 'Iniciado em ' : ''}
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
