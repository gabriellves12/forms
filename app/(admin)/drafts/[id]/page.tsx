import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import DraftDetailActions from './DraftDetailActions';

export const dynamic = 'force-dynamic';

interface DraftQuestion {
  question_key: string;
  position: number;
  type: string;
  title: string;
  hint: string | null;
  placeholder: string | null;
  options: string[];
  required: boolean;
  config: Record<string, any>;
}

export default async function DraftDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: draft } = await supabase
    .from('briefing_drafts')
    .select(
      'id, category_id, template_id, questions, client_label, notes, share_slug, share_token, created_at, used_briefing_id'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!draft) notFound();

  const { data: category } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('id', draft.category_id)
    .maybeSingle();

  const questions = (Array.isArray(draft.questions) ? draft.questions : []) as DraftQuestion[];
  questions.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const sharePath = draft.share_slug ? `/${draft.share_slug}` : `/b/${draft.share_token}`;

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
            {draft.client_label || 'Briefing aguardando'}{' '}
            <span className="admin-badge admin-badge--waiting">Aguardando</span>
          </h1>
          <p className="admin-subtitle">
            Criado em {new Date(draft.created_at).toLocaleString('pt-BR')} · O cliente ainda não
            começou a responder.
          </p>
        </div>
        <DraftDetailActions
          draftId={draft.id}
          sharePath={sharePath}
          categorySlug={category?.slug ?? ''}
          clientLabel={draft.client_label}
        />
      </header>

      <div className="admin-card">
        <div className="detail-grid">
          {questions.length === 0 ? (
            <div className="detail-row">
              <div className="detail-row__value detail-row__value--muted">
                Nenhuma pergunta neste briefing.
              </div>
            </div>
          ) : (
            questions.map((q) => (
              <div className="detail-row" key={q.question_key}>
                <div className="detail-row__label">{q.title}</div>
                <div className="detail-row__value detail-row__value--muted">
                  Aguardando resposta
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
