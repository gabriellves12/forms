'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard, { type QuestionCardData } from './QuestionCard';
import { getBriefingDraft, updateBriefingDraft } from '@/app/(admin)/drafts/actions';

interface Props {
  open: boolean;
  onClose: () => void;
  draftId: string;
}

function newQuestionKey() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

export default function EditBriefingDraftModal({ open, onClose, draftId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientLabel, setClientLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<QuestionCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getBriefingDraft(draftId).then((res) => {
      if (!res.success) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setClientLabel(res.draft.client_label ?? '');
      setNotes(res.draft.notes ?? '');
      setQuestions(
        res.draft.questions.map((q, i) => ({
          question_key: q.question_key,
          position: i,
          type: q.type,
          title: q.title,
          hint: q.hint ?? '',
          placeholder: q.placeholder ?? '',
          options: Array.isArray(q.options) ? q.options : [],
          required: q.required ?? true,
          config: q.config ?? {},
        }))
      );
      setLoading(false);
    });
  }, [open, draftId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

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
    setQuestions((qs) => qs.filter((_, idx) => idx !== i).map((q, k) => ({ ...q, position: k })));
  const addNew = () =>
    setQuestions((qs) => [
      ...qs,
      {
        question_key: newQuestionKey(),
        position: qs.length,
        type: 'textarea',
        title: 'Nova pergunta',
        hint: '',
        placeholder: '',
        options: [],
        required: false,
        config: {},
      },
    ]);

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateBriefingDraft({
        id: draftId,
        clientLabel: clientLabel.trim() || null,
        notes: notes.trim() || null,
        questions: questions.map((q, i) => ({
          question_key: q.question_key,
          position: i,
          type: q.type,
          title: q.title,
          hint: q.hint || null,
          placeholder: q.placeholder || null,
          options: q.options,
          required: q.required,
          config: q.config,
        })),
      });
      if (!result.success) {
        setError(result.error ?? 'Erro ao salvar.');
        return;
      }
      router.refresh();
      onClose();
    });
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <header className="modal__head">
          <div>
            <h2 className="modal__title">Editar briefing</h2>
            <p className="modal__sub">
              Ajuste as perguntas, o cliente e as notas. O link compartilhado continua o mesmo.
            </p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <div className="modal__body">
          {loading ? (
            <p style={{ color: 'var(--tb-text-muted)', fontSize: 14 }}>Carregando…</p>
          ) : (
            <>
              <div className="modal__field-row">
                <div className="qc__field">
                  <label className="qc__label">Cliente (opcional)</label>
                  <input
                    className="qc__input"
                    value={clientLabel}
                    onChange={(e) => setClientLabel(e.target.value)}
                    placeholder="Ex: Acme Co"
                  />
                </div>
                <div className="qc__field">
                  <label className="qc__label">Notas internas (opcional)</label>
                  <input
                    className="qc__input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pra você lembrar do contexto"
                  />
                </div>
              </div>

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

              <button type="button" className="modal__add" onClick={addNew}>
                ＋ Adicionar pergunta
              </button>
            </>
          )}

          {error && (
            <p
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: '#FEF2F2',
                color: 'var(--tb-color-error)',
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </p>
          )}
        </div>

        <footer className="modal__foot">
          <span className="modal__foot-info">
            {loading
              ? ''
              : `${questions.length} pergunta${questions.length === 1 ? '' : 's'}`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="admin-btn" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={onSave}
              disabled={pending || loading || questions.length === 0}
            >
              {pending ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
