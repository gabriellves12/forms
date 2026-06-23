'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveTemplate, type QuestionPayload } from './actions';

const TYPES = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'single', label: 'Escolha única' },
  { value: 'multi', label: 'Múltipla escolha' },
  { value: 'multi-other', label: 'Múltipla + "outro"' },
  { value: 'multi-from-prev', label: 'Subset de pergunta anterior' },
  { value: 'brands', label: 'Lista de marcas' },
];

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

export default function TemplateEditor({
  categoryName,
  categorySlug,
  templateId,
  intro: initialIntro,
  initialQuestions,
}: Props) {
  const router = useRouter();
  const [intro, setIntro] = useState<Intro>(initialIntro || {});
  const [questions, setQuestions] = useState<QuestionPayload[]>(
    initialQuestions.map((q) => ({
      ...q,
      hint: q.hint ?? '',
      placeholder: q.placeholder ?? '',
      options: Array.isArray(q.options) ? q.options : [],
      config: q.config ?? {},
    }))
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const updateQuestion = (idx: number, patch: Partial<QuestionPayload>) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => {
    const newKey = `q_${Date.now()}`;
    setQuestions((qs) => [
      ...qs,
      {
        question_key: newKey,
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
  };

  const removeQuestion = (idx: number) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx).map((q, i) => ({ ...q, position: i })));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const next = qs.slice();
      const j = idx + dir;
      if (j < 0 || j >= next.length) return qs;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((q, i) => ({ ...q, position: i }));
    });
  };

  const onSave = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveTemplate({
        templateId,
        categorySlug,
        intro,
        questions: questions.map((q, i) => ({ ...q, position: i })),
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

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Tela de boas-vindas
        </h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <Field label="Eyebrow">
            <input
              value={intro.eyebrow ?? ''}
              onChange={(e) => setIntro({ ...intro, eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Botão (label)">
            <input
              value={intro.buttonLabel ?? 'Começar'}
              onChange={(e) => setIntro({ ...intro, buttonLabel: e.target.value })}
            />
          </Field>
          <Field label="Título (suporta tag <em>...</em>)" full>
            <input
              value={intro.title ?? ''}
              onChange={(e) => setIntro({ ...intro, title: e.target.value })}
            />
          </Field>
          <Field label="Descrição" full>
            <textarea
              rows={3}
              value={intro.description ?? ''}
              onChange={(e) => setIntro({ ...intro, description: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        {questions.map((q, idx) => (
          <div className="tmpl-question" key={q.question_key}>
            <div className="tmpl-question__head">
              <span className="tmpl-question__num">Pergunta {idx + 1}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  className="admin-btn"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  type="button"
                >
                  ↑
                </button>
                <button
                  className="admin-btn"
                  onClick={() => move(idx, 1)}
                  disabled={idx === questions.length - 1}
                  type="button"
                >
                  ↓
                </button>
                <button
                  className="admin-btn admin-btn--danger"
                  onClick={() => removeQuestion(idx)}
                  type="button"
                >
                  Remover
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Chave (slug interno)">
                <input
                  value={q.question_key}
                  onChange={(e) => updateQuestion(idx, { question_key: e.target.value })}
                />
              </Field>
              <Field label="Tipo">
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(idx, { type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid var(--tb-border-subtle)',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'var(--tb-neutral-50)',
                  }}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Título" full>
                <textarea
                  rows={2}
                  value={q.title}
                  onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                />
              </Field>
              <Field label="Hint (opcional)" full>
                <input
                  value={q.hint ?? ''}
                  onChange={(e) => updateQuestion(idx, { hint: e.target.value })}
                />
              </Field>
              {(q.type === 'text' || q.type === 'textarea') && (
                <Field label="Placeholder" full>
                  <input
                    value={q.placeholder ?? ''}
                    onChange={(e) => updateQuestion(idx, { placeholder: e.target.value })}
                  />
                </Field>
              )}
              {(q.type === 'single' || q.type === 'multi' || q.type === 'multi-other') && (
                <Field label="Opções (uma por linha)" full>
                  <textarea
                    rows={Math.max(3, q.options.length)}
                    value={q.options.join('\n')}
                    onChange={(e) =>
                      updateQuestion(idx, {
                        options: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </Field>
              )}
              {q.type === 'multi-from-prev' && (
                <>
                  <Field label="ID da pergunta-fonte (sourceId)">
                    <input
                      value={(q.config as any)?.sourceId ?? ''}
                      onChange={(e) =>
                        updateQuestion(idx, {
                          config: { ...q.config, sourceId: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field label="Máximo selecionável">
                    <input
                      type="number"
                      value={(q.config as any)?.max ?? 3}
                      onChange={(e) =>
                        updateQuestion(idx, {
                          config: { ...q.config, max: Number(e.target.value) },
                        })
                      }
                    />
                  </Field>
                </>
              )}
              <Field label="Obrigatória?">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                  />
                  <span style={{ fontSize: 14 }}>{q.required ? 'Sim' : 'Não'}</span>
                </label>
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button className="admin-btn" onClick={addQuestion} type="button">
        + Adicionar pergunta
      </button>
    </>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label
      className="tmpl-question__field"
      style={{ gridColumn: full ? '1 / -1' : 'auto', marginBottom: 0 }}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}
