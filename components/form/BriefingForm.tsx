'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LoadedTemplate } from '@/lib/templates/loader';
import type { QuestionDef } from '@/lib/templates/types';
import { submitBriefing, saveBriefingProgress } from '@/app/(public)/[slug]/actions';
import { ArrowRight, Check, ChevronDown, ChevronUp, Retry, WhatsAppIcon } from './icons';
import '@/styles/form.css';

type Step = 'welcome' | 'question' | 'submitting' | 'final' | 'error';
type AnswerValue = string | string[] | undefined;
type Answers = Record<string, AnswerValue>;

interface Props {
  template: LoadedTemplate;
  whatsappNumber: string;
  whatsappMessage: string;
  draftId?: string;
}

const letterKey = (i: number) => String.fromCharCode(65 + i);

function getList(value: AnswerValue): string[] {
  return Array.isArray(value) ? value : [];
}

export default function BriefingForm({ template, whatsappNumber, whatsappMessage, draftId }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  // Autosave para briefings gerados via draft. O briefingId é persistido em
  // localStorage pra resumir caso o cliente recarregue a página.
  const lsKey = draftId ? `tb_progress_${draftId}` : null;
  const [inProgressId, setInProgressId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const lastSavedRef = useRef<string>('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = template.questions;
  const total = questions.length;
  const current = questions[Math.min(index, total - 1)];

  const progressPct = useMemo(() => {
    if (step === 'welcome') return 0;
    if (step === 'question') return ((index + 1) / Math.max(1, total)) * 100;
    return 100;
  }, [step, index, total]);

  const transition = useCallback((fn: () => void) => {
    setLeaving(true);
    setTimeout(() => {
      fn();
      setLeaving(false);
    }, 240);
  }, []);

  const startQuestionnaire = useCallback(() => {
    transition(() => {
      setStep('question');
      setIndex(0);
    });
  }, [transition]);

  const validate = (q: QuestionDef): string | null => {
    if (!q.required) return null;
    const v = answers[q.id];
    if (q.type === 'text' || q.type === 'textarea') {
      if (typeof v !== 'string' || !v.trim()) return 'Esse campo é obrigatório.';
    } else if (q.type === 'single') {
      if (!v) return 'Escolha uma opção pra continuar.';
    } else if (q.type === 'multi' || q.type === 'multi-other' || q.type === 'multi-from-prev') {
      const arr = getList(v).filter(
        (x) => x !== '__other__' || ((answers[q.id + '__other'] as string) || '').trim()
      );
      const min = q.config?.min ?? 1;
      if (arr.length < min) {
        return `Selecione pelo menos ${min} opç${min > 1 ? 'ões' : 'ão'}.`;
      }
    } else if (q.type === 'brands') {
      const arr = getList(v).filter((x) => (x || '').trim());
      if (arr.length === 0) return 'Cite pelo menos uma marca.';
    }
    return null;
  };

  const goNext = useCallback(() => {
    if (!current) return;
    const err = validate(current);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (index < total - 1) {
      transition(() => setIndex(index + 1));
    } else {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, index, total, answers, transition]);

  const goPrev = useCallback(() => {
    if (step !== 'question' || index === 0) return;
    setError(null);
    transition(() => setIndex(index - 1));
  }, [step, index, transition]);

  const extractClientName = (a: Answers) =>
    typeof a.cliente_nome === 'string' ? a.cliente_nome : null;
  const extractProductName = (a: Answers) =>
    (typeof a.produto_nome === 'string' && a.produto_nome) ||
    (typeof a.empresa_nome === 'string' && a.empresa_nome) ||
    (typeof a.marca_nome === 'string' && a.marca_nome) ||
    null;

  const handleSubmit = async () => {
    transition(() => setStep('submitting'));
    try {
      const result = await submitBriefing({
        templateId: template.templateId,
        categoryId: template.categoryId,
        draftId: draftId ?? null,
        inProgressBriefingId: inProgressId,
        clientName: extractClientName(answers),
        productName: extractProductName(answers),
        answers: buildPayload(questions, answers),
      });
      if (!result.success) throw new Error(result.error || 'Falha desconhecida');
      if (lsKey && typeof window !== 'undefined') {
        try { window.localStorage.removeItem(lsKey); } catch {}
      }
      transition(() => setStep('final'));
    } catch (e: any) {
      setSubmitError(e?.message || 'Erro desconhecido');
      transition(() => setStep('error'));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const inField = tag === 'input' || tag === 'textarea';
      if (e.key === 'Enter') {
        if (tag === 'textarea' && !e.metaKey && !e.ctrlKey) return;
        if (inField && (target as HTMLElement).dataset.skipEnter === 'true') return;
        e.preventDefault();
        if (step === 'welcome') startQuestionnaire();
        else if (step === 'question') goNext();
      } else if (e.key === 'Escape' && step === 'question') {
        goPrev();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, goNext, goPrev, startQuestionnaire]);

  useEffect(() => {
    document.body.classList.add('form-body');
    return () => document.body.classList.remove('form-body');
  }, []);

  // Hidrata progresso salvo (resume after reload)
  useEffect(() => {
    if (!lsKey) { setHydrated(true); return; }
    try {
      const raw = window.localStorage.getItem(lsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { id?: string; answers?: Answers; index?: number };
        if (parsed.id) setInProgressId(parsed.id);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (typeof parsed.index === 'number') setIndex(parsed.index);
        }
      }
    } catch {}
    setHydrated(true);
  }, [lsKey]);

  // Persiste progresso local (id + answers + index) sempre que algo muda
  useEffect(() => {
    if (!lsKey || !hydrated) return;
    if (!inProgressId && Object.keys(answers).length === 0) return;
    try {
      window.localStorage.setItem(
        lsKey,
        JSON.stringify({ id: inProgressId, answers, index })
      );
    } catch {}
  }, [lsKey, hydrated, inProgressId, answers, index]);

  // Autosave server (debounced)
  useEffect(() => {
    if (!draftId || !hydrated) return;
    if (step !== 'question') return;

    const payload = buildPayload(questions, answers);
    const hasAny = payload.some((p) => (p.value ?? '').trim() !== '');
    if (!hasAny) return;

    const signature = JSON.stringify({ id: inProgressId, payload });
    if (signature === lastSavedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      lastSavedRef.current = signature;
      const res = await saveBriefingProgress({
        templateId: template.templateId,
        categoryId: template.categoryId,
        draftId,
        briefingId: inProgressId,
        clientName: extractClientName(answers),
        productName: extractProductName(answers),
        answers: payload,
      });
      if (res.success && res.id !== inProgressId) setInProgressId(res.id);
    }, 900);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, draftId, hydrated, step, inProgressId]);

  const setText = (id: string, value: string) =>
    setAnswers((a) => ({ ...a, [id]: value }));
  const setSingle = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setTimeout(() => goNext(), 220);
  };
  const toggleMulti = (id: string, value: string) =>
    setAnswers((a) => {
      const arr = getList(a[id]);
      const exists = arr.includes(value);
      return { ...a, [id]: exists ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  const toggleMultiBounded = (id: string, value: string, max: number) =>
    setAnswers((a) => {
      const arr = getList(a[id]);
      const exists = arr.includes(value);
      if (exists) return { ...a, [id]: arr.filter((x) => x !== value) };
      if (arr.length >= max) return a;
      return { ...a, [id]: [...arr, value] };
    });
  const setBrand = (id: string, i: number, value: string) =>
    setAnswers((a) => {
      const cur = getList(a[id]).length ? [...getList(a[id])] : ['', '', ''];
      cur[i] = value;
      return { ...a, [id]: cur };
    });

  const stepClass = `step ${leaving ? 'leaving' : ''}`;

  return (
    <>
      <div className="progress" aria-hidden>
        <div className="progress__fill" style={{ width: `${progressPct}%` }} />
      </div>

      {step === 'question' && (
        <div className="topbar">
          <img src="/logo02.svg" alt="Think Brand" />
        </div>
      )}

      <main className="app">
        <div className="stage">
          <div ref={stepRef} className={stepClass}>
            {step === 'welcome' && (
              <Welcome intro={template.intro} onStart={startQuestionnaire} />
            )}
            {step === 'question' && current && (
              <Question
                q={current}
                index={index}
                total={total}
                answers={answers}
                error={error}
                setText={setText}
                setSingle={setSingle}
                toggleMulti={toggleMulti}
                toggleMultiBounded={toggleMultiBounded}
                setBrand={setBrand}
                onNext={goNext}
              />
            )}
            {step === 'submitting' && (
              <div className="loading">
                <div className="loading__spinner" />
                <p className="loading__text">Enviando suas respostas...</p>
              </div>
            )}
            {step === 'final' && (
              <Final
                answers={answers}
                whatsappNumber={whatsappNumber}
                whatsappMessage={whatsappMessage}
              />
            )}
            {step === 'error' && (
              <ErrorView message={submitError} onRetry={() => handleSubmit()} />
            )}
          </div>
        </div>
      </main>

      {step === 'question' && (
        <>
          <div className="nav__counter">
            <strong>{index + 1}</strong> de {total}
          </div>
          <div className="nav">
            <button
              className="nav__btn"
              disabled={index === 0}
              onClick={goPrev}
              aria-label="Anterior"
              type="button"
            >
              <ChevronUp />
            </button>
            <button
              className="nav__btn"
              onClick={goNext}
              aria-label="Próxima"
              type="button"
            >
              <ChevronDown />
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Welcome({ intro, onStart }: { intro: any; onStart: () => void }) {
  return (
    <div className="welcome">
      <div className="welcome__brand">
        <img src="/logo02.svg" alt="Think Brand" />
      </div>
      <div className="welcome__eyebrow">{intro?.eyebrow ?? 'Briefing · Think Brand'}</div>
      <h1
        className="welcome__title"
        dangerouslySetInnerHTML={{ __html: intro?.title ?? 'Vamos começar.' }}
      />
      <p className="welcome__desc">{intro?.description}</p>
      {Array.isArray(intro?.meta) && intro.meta.length > 0 && (
        <div className="welcome__meta">
          {intro.meta.map((m: any, i: number) => (
            <span key={i}>
              <strong>{m.value}</strong>
              {m.label ? ` · ${m.label}` : ''}
            </span>
          ))}
        </div>
      )}
      <div className="actions">
        <button className="btn btn--primary btn--large" onClick={onStart} autoFocus type="button">
          {intro?.buttonLabel ?? 'Começar'}
          <span className="btn__icon">
            <ArrowRight />
          </span>
        </button>
        <span className="btn__hint">
          ou aperte <kbd>Enter</kbd>
        </span>
      </div>
    </div>
  );
}

interface QuestionProps {
  q: QuestionDef;
  index: number;
  total: number;
  answers: Answers;
  error: string | null;
  setText: (id: string, v: string) => void;
  setSingle: (id: string, v: string) => void;
  toggleMulti: (id: string, v: string) => void;
  toggleMultiBounded: (id: string, v: string, max: number) => void;
  setBrand: (id: string, i: number, v: string) => void;
  onNext: () => void;
}

function Question(p: QuestionProps) {
  const { q, index, total, answers, error, onNext } = p;
  const isLast = index === total - 1;
  const nextLabel = isLast ? 'Enviar respostas' : 'Próxima';

  return (
    <>
      <div className="q__num">
        <ArrowRight /> Pergunta {index + 1}
      </div>

      <h2 className="q__title">
        {q.title}
        {q.required && <span style={{ color: 'var(--tb-color-error)' }}> *</span>}
      </h2>
      {q.hint && <p className="q__hint">{q.hint}</p>}

      <QuestionBody
        q={q}
        answers={answers}
        setText={p.setText}
        setSingle={p.setSingle}
        toggleMulti={p.toggleMulti}
        toggleMultiBounded={p.toggleMultiBounded}
        setBrand={p.setBrand}
      />

      <div className={`q__error ${error ? 'show' : ''}`}>{error}</div>

      <div className="actions">
        <button className="btn btn--primary" onClick={onNext} type="button">
          {nextLabel}
          <span className="btn__icon">{isLast ? <Check /> : <ArrowRight />}</span>
        </button>
        <span className="btn__hint">
          aperte <kbd>Enter</kbd>
        </span>
      </div>
    </>
  );
}

interface BodyProps {
  q: QuestionDef;
  answers: Answers;
  setText: (id: string, v: string) => void;
  setSingle: (id: string, v: string) => void;
  toggleMulti: (id: string, v: string) => void;
  toggleMultiBounded: (id: string, v: string, max: number) => void;
  setBrand: (id: string, i: number, v: string) => void;
}

function QuestionBody(p: BodyProps) {
  const { q, answers } = p;
  const value = answers[q.id];

  if (q.type === 'text') {
    return (
      <input
        type="text"
        className="input"
        placeholder={q.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => p.setText(q.id, e.target.value)}
        autoFocus
      />
    );
  }

  if (q.type === 'textarea') {
    return (
      <textarea
        className="input textarea"
        placeholder={q.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => p.setText(q.id, e.target.value)}
        autoFocus
      />
    );
  }

  if (q.type === 'single') {
    return (
      <div className="choices">
        {(q.options ?? []).map((opt, i) => {
          const sel = value === opt;
          return (
            <button
              key={opt}
              type="button"
              className={`choice ${sel ? 'selected' : ''}`}
              onClick={() => p.setSingle(q.id, opt)}
            >
              <span className="choice__key">{letterKey(i)}</span>
              <span className="choice__label">{opt}</span>
              <span className="choice__check"><Check /></span>
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === 'multi' || q.type === 'multi-other') {
    const selected = getList(value);
    const allowOther = q.type === 'multi-other' && q.config?.allowOther !== false;
    const otherText = (answers[q.id + '__other'] as string) ?? '';
    const otherSel = selected.includes('__other__');

    return (
      <div className="choices">
        {(q.options ?? []).map((opt, i) => {
          const sel = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`choice ${sel ? 'selected' : ''}`}
              onClick={() => p.toggleMulti(q.id, opt)}
            >
              <span className="choice__key">{letterKey(i)}</span>
              <span className="choice__label">{opt}</span>
              <span className="choice__check"><Check /></span>
            </button>
          );
        })}
        {allowOther && (
          <div
            className={`choice choice--other ${otherSel ? 'selected' : ''}`}
            onClick={(e) => {
              const tag = (e.target as HTMLElement).tagName.toLowerCase();
              if (tag === 'input') return;
              p.toggleMulti(q.id, '__other__');
            }}
          >
            <div className="choice__top">
              <span className="choice__key">{letterKey((q.options ?? []).length)}</span>
              <span className="choice__label">Outro</span>
              <span className="choice__check"><Check /></span>
            </div>
            <input
              type="text"
              placeholder="Escreva aqui..."
              value={otherText}
              onChange={(e) => p.setText(q.id + '__other', e.target.value)}
              onFocus={() => {
                if (!otherSel) p.toggleMulti(q.id, '__other__');
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (q.type === 'multi-from-prev') {
    const sourceId = q.config?.sourceId;
    if (!sourceId) return <p>Configuração inválida.</p>;

    const source = getList(answers[sourceId]);
    const otherTxt = (answers[sourceId + '__other'] as string) || '';
    const allOptions = source.filter((s) => s !== '__other__');
    if (source.includes('__other__') && otherTxt) allOptions.push(otherTxt);

    if (allOptions.length === 0) {
      return (
        <p className="q__hint" style={{ fontSize: 16, color: 'var(--tb-color-error)' }}>
          Volte para a pergunta anterior e escolha pelo menos uma opção.
        </p>
      );
    }

    const max = q.config?.max ?? 3;
    const selected = getList(value);

    return (
      <>
        <p
          className="q__hint"
          style={{ marginTop: -16, marginBottom: 24, fontWeight: 500 }}
        >
          <span>{selected.length}</span> / {max} selecionadas
        </p>
        <div className="choices">
          {allOptions.map((opt, i) => {
            const sel = selected.includes(opt);
            const disabled = !sel && selected.length >= max;
            return (
              <button
                key={opt}
                type="button"
                className={`choice ${sel ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => p.toggleMultiBounded(q.id, opt, max)}
              >
                <span className="choice__key">{letterKey(i)}</span>
                <span className="choice__label">{opt}</span>
                <span className="choice__check"><Check /></span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  if (q.type === 'brands') {
    const max = q.config?.brandsMax ?? 3;
    const values = getList(value);
    return (
      <div className="brands">
        {Array.from({ length: max }).map((_, i) => (
          <div className="brand-row" key={i}>
            <span className="brand-row__num">{i + 1}</span>
            <input
              type="text"
              placeholder={`Marca ${i + 1}${i === 0 ? '' : ' (opcional)'}`}
              value={values[i] ?? ''}
              onChange={(e) => p.setBrand(q.id, i, e.target.value)}
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function Final({
  answers,
  whatsappNumber,
  whatsappMessage,
}: {
  answers: Answers;
  whatsappNumber: string;
  whatsappMessage: string;
}) {
  const nome =
    (typeof answers.cliente_nome === 'string' ? answers.cliente_nome : '')
      .trim()
      .split(' ')[0] || 'amigo(a)';
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  return (
    <div className="final">
      <div className="final__check">
        <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="final__title">Valeu, {nome}!</h1>
      <p className="final__desc">
        Suas respostas chegaram aqui certinhas. Nossa equipe vai analisar tudo e em breve entra em contato com você pelo WhatsApp pra dar continuidade ao seu projeto.
      </p>
      <a href={waUrl} target="_blank" rel="noopener" className="btn btn--primary btn--large">
        Falar com a Think Brand
        <span className="btn__icon">
          <WhatsAppIcon />
        </span>
      </a>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="welcome">
      <div className="welcome__eyebrow" style={{ color: 'var(--tb-color-error)' }}>
        Algo deu errado
      </div>
      <h1 className="welcome__title">Não conseguimos enviar suas respostas.</h1>
      <p className="welcome__desc">
        Verifique sua conexão e tente novamente. Se persistir, entre em contato direto pelo WhatsApp.
      </p>
      {message && (
        <p className="submit-error show" style={{ maxWidth: 520 }}>
          Detalhe técnico: {message}
        </p>
      )}
      <div className="actions" style={{ marginTop: 32 }}>
        <button className="btn btn--primary" onClick={onRetry} type="button">
          Tentar de novo
          <span className="btn__icon">
            <Retry />
          </span>
        </button>
      </div>
    </div>
  );
}

function buildPayload(
  questions: QuestionDef[],
  answers: Answers
): { questionKey: string; questionTitle: string; value: string }[] {
  return questions.map((q) => {
    const v = answers[q.id];
    let value = '';
    if (q.type === 'multi-other') {
      const arr = getList(v)
        .map((x) =>
          x === '__other__' ? (answers[q.id + '__other'] as string) || '' : x
        )
        .filter(Boolean);
      value = arr.join('; ');
    } else if (q.type === 'multi' || q.type === 'multi-from-prev') {
      value = getList(v).join('; ');
    } else if (q.type === 'brands') {
      value = getList(v).filter((x) => (x || '').trim()).join('; ');
    } else {
      value = typeof v === 'string' ? v : '';
    }
    return { questionKey: q.id, questionTitle: q.title, value };
  });
}
