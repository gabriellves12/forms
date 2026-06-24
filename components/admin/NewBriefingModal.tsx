'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import QuestionCard, { type QuestionCardData } from './QuestionCard';
import { createBriefingDraft } from '@/app/(admin)/drafts/actions';

interface Props {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  categorySlug: string;
  templateId: string;
  categoryId: string;
  templateQuestions: QuestionCardData[];
}

type Phase = 'editing' | 'created';

function newQuestionKey() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

export default function NewBriefingModal({
  open,
  onClose,
  categoryName,
  categorySlug,
  templateId,
  categoryId,
  templateQuestions,
}: Props) {
  const [phase, setPhase] = useState<Phase>('editing');
  const [clientLabel, setClientLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<QuestionCardData[]>(templateQuestions);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setPhase('editing');
    setClientLabel('');
    setNotes('');
    setQuestions(templateQuestions.map((q) => ({ ...q })));
    setShareUrl('');
    setCopied(false);
    setError(null);
  }, [open, templateQuestions]);

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

  const fullShareUrl = useMemo(() => {
    if (!shareUrl) return '';
    if (typeof window === 'undefined') return shareUrl;
    return `${window.location.origin}${shareUrl}`;
  }, [shareUrl]);

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

  const onCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createBriefingDraft({
        templateId,
        categoryId,
        categorySlug,
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
        clientLabel: clientLabel.trim() || null,
        notes: notes.trim() || null,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShareUrl(result.shareUrl);
      setPhase('created');
    });
  };

  const onCopy = async () => {
    if (!fullShareUrl) return;
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
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
            <h2 className="modal__title">
              {phase === 'editing'
                ? `Novo briefing — ${categoryName}`
                : 'Briefing pronto pra compartilhar'}
            </h2>
            <p className="modal__sub">
              {phase === 'editing'
                ? 'Ajuste as perguntas pra esse cliente. As alterações ficam só nesse briefing — o template segue intacto.'
                : 'Copie o link abaixo e envie pro cliente.'}
            </p>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <div className="modal__body">
          {phase === 'editing' && (
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

          {phase === 'created' && (
            <>
              <div className="modal__share">
                <div className="modal__share-url" title={fullShareUrl}>
                  {fullShareUrl}
                </div>
                <button
                  type="button"
                  className={`modal__share-copy ${copied ? 'copied' : ''}`}
                  onClick={onCopy}
                >
                  {copied ? 'Copiado!' : 'Copiar link'}
                </button>
              </div>
              <p style={{ fontSize: 14, color: 'var(--tb-text-secondary)', lineHeight: 1.55 }}>
                Esse link abre o formulário customizado que você acabou de definir. As respostas que
                o cliente enviar aparecem na aba <strong>{categoryName}</strong> do painel.
              </p>
              {clientLabel && (
                <p style={{ fontSize: 13, color: 'var(--tb-text-muted)', marginTop: 12 }}>
                  Cliente: <strong>{clientLabel}</strong>
                </p>
              )}
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
            {phase === 'editing'
              ? `${questions.length} pergunta${questions.length === 1 ? '' : 's'}`
              : 'Pronto'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {phase === 'editing' ? (
              <>
                <button type="button" className="admin-btn" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={onCreate}
                  disabled={pending || questions.length === 0}
                >
                  {pending ? 'Gerando link...' : 'Gerar link do briefing'}
                </button>
              </>
            ) : (
              <button type="button" className="admin-btn admin-btn--primary" onClick={onClose}>
                Fechar
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
