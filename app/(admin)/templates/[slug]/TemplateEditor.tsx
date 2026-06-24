'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard, { type QuestionCardData } from '@/components/admin/QuestionCard';
import { saveTemplate, type QuestionPayload } from './actions';

interface Intro {
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  meta?: { value: string; label: string }[];
}

interface Props {
  categoryName: string;
  categorySlug: string;
  templateId: string;
  intro: Intro;
  initialQuestions: QuestionPayload[];
}

function newQuestionKey() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

export default function TemplateEditor({
  categoryName,
  categorySlug,
  templateId,
  intro: initialIntro,
  initialQuestions,
}: Props) {
  const router = useRouter();
  const [intro, setIntro] = useState<Intro>(initialIntro || {});
  const [questions, setQuestions] = useState<QuestionCardData[]>(
    initialQuestions.map((q) => ({
      question_key: q.question_key,
      position: q.position,
      type: q.type,
      title: q.title,
      hint: q.hint ?? '',
      placeholder: q.placeholder ?? '',
      options: Array.isArray(q.options) ? q.options : [],
      required: q.required,
      config: q.config ?? {},
    }))
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [introOpen, setIntroOpen] = useState(false);

  const updateAt = (i: number, patch: Partial<QuestionCardData>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  const moveAt = (i: number, dir: -1 | 1) =>
    setQuestions((qs) => {
      const next = qs.slice();
      const j = i + dir;
      if (j < 0 || j >= next.length) return qs;
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((q, k) => ({ ...q, position: k }));
    });

  const removeAt = (i: number) =>
    setQuestions((qs) =>
      qs.filter((_, idx) => idx !== i).map((q, k) => ({ ...q, position: k }))
    );

  const addNew = () =>
    setQuestions((qs) => [
      ...qs,
      {
        question_key: newQuestionKey(),
        position: qs.length,
        type: 'text',
        title: 'Nova pergunta',
        hint: '',
        placeholder: '',
        options: [],
        required: true,
        config: {},
      },
    ]);

  const onSave = () => {
    setFeedback(null);
    startTransition(async () => {
      const payload: QuestionPayload[] = questions.map((q, i) => ({
        question_key: q.question_key,
        position: i,
        type: q.type,
        title: q.title,
        hint: q.hint || null,
        placeholder: q.placeholder || null,
        options: q.options,
        required: q.required,
        config: q.config,
      }));
      const result = await saveTemplate({
        templateId,
        categorySlug,
        intro,
        questions: payload,
      });
      if (result.success) {
        setFeedback('Template salvo.');
        router.refresh();
      } else {
        setFeedback(`Erro: ${result.error}`);
      }
    });
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-title">{categoryName}</h1>
          <p className="admin-subtitle">
            Edite intro e perguntas. Alterações entram em produção ao salvar.
          </p>
        </div>
        <div className="admin-actions">
          {feedback && (
            <span style={{ fontSize: 13, color: 'var(--tb-text-secondary)' }}>{feedback}</span>
          )}
          <button className="admin-btn admin-btn--primary" onClick={onSave} disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar template'}
          </button>
        </div>
      </header>

      <div className="admin-card" style={{ marginBottom: 24, padding: 0 }}>
        <button
          type="button"
          onClick={() => setIntroOpen((v) => !v)}
          style={{
            width: '100%',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            borderRadius: 12,
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
            <strong style={{ fontSize: 14, fontWeight: 600 }}>Tela de boas-vindas</strong>
            <span style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>
              Eyebrow, título, descrição e label do botão inicial.
            </span>
          </span>
          <span style={{ color: 'var(--tb-text-muted)' }}>{introOpen ? '▾' : '▸'}</span>
        </button>
        {introOpen && (
          <div style={{ padding: '0 24px 24px', display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
              <div className="qc__field">
                <label className="qc__label">Eyebrow</label>
                <input
                  className="qc__input"
                  value={intro.eyebrow ?? ''}
                  onChange={(e) => setIntro({ ...intro, eyebrow: e.target.value })}
                />
              </div>
              <div className="qc__field">
                <label className="qc__label">Botão (label)</label>
                <input
                  className="qc__input"
                  value={intro.buttonLabel ?? 'Começar'}
                  onChange={(e) => setIntro({ ...intro, buttonLabel: e.target.value })}
                />
              </div>
            </div>
            <div className="qc__field">
              <label className="qc__label">Título (suporta &lt;em&gt;...&lt;/em&gt;)</label>
              <input
                className="qc__input"
                value={intro.title ?? ''}
                onChange={(e) => setIntro({ ...intro, title: e.target.value })}
              />
            </div>
            <div className="qc__field">
              <label className="qc__label">Descrição</label>
              <textarea
                className="qc__input"
                rows={3}
                value={intro.description ?? ''}
                onChange={(e) => setIntro({ ...intro, description: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        {questions.map((q, i) => (
          <QuestionCard
            key={q.question_key}
            q={q}
            index={i}
            total={questions.length}
            onChange={(p) => updateAt(i, p)}
            onMove={(d) => moveAt(i, d)}
            onRemove={() => removeAt(i)}
          />
        ))}
      </div>

      <button type="button" className="modal__add" onClick={addNew}>
        ＋ Adicionar pergunta
      </button>
    </>
  );
}
