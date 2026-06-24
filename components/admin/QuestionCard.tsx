'use client';

import { useState } from 'react';

export interface QuestionCardData {
  question_key: string;
  position: number;
  type: string;
  title: string;
  hint?: string | null;
  placeholder?: string | null;
  options: string[];
  required: boolean;
  config: Record<string, any>;
}

const TYPES = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'single', label: 'Escolha única' },
  { value: 'multi', label: 'Múltipla escolha' },
  { value: 'multi-other', label: 'Múltipla + "outro"' },
  { value: 'multi-from-prev', label: 'Subset de pergunta anterior' },
  { value: 'brands', label: 'Lista de marcas' },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TYPES.map((t) => [t.value, t.label])
);

interface Props {
  q: QuestionCardData;
  index: number;
  total: number;
  defaultExpanded?: boolean;
  onChange: (patch: Partial<QuestionCardData>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

export default function QuestionCard({
  q,
  index,
  total,
  defaultExpanded = false,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isFirst = index === 0;
  const isLast = index === total - 1;
  const showOptions =
    q.type === 'single' || q.type === 'multi' || q.type === 'multi-other';
  const showPlaceholder = q.type === 'text' || q.type === 'textarea';
  const showFromPrev = q.type === 'multi-from-prev';

  return (
    <div className={`qc ${expanded ? 'qc--open' : ''}`}>
      <div className="qc__head">
        <button
          type="button"
          className="qc__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="qc__index">{index + 1}</span>
          <span className="qc__preview">
            <span className="qc__title-preview">{q.title || 'Sem título'}</span>
            <span className="qc__meta">
              <span className="qc__chip">{TYPE_LABEL[q.type] ?? q.type}</span>
              {q.required && <span className="qc__chip qc__chip--required">obrigatória</span>}
              <span className="qc__chip qc__chip--muted">{q.question_key}</span>
            </span>
          </span>
          <span className="qc__chevron" aria-hidden>
            {expanded ? '▾' : '▸'}
          </span>
        </button>
        <div className="qc__actions">
          <button
            type="button"
            className="qc__icon-btn"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            aria-label="Mover para cima"
            title="Mover para cima"
          >
            ↑
          </button>
          <button
            type="button"
            className="qc__icon-btn"
            onClick={() => onMove(1)}
            disabled={isLast}
            aria-label="Mover para baixo"
            title="Mover para baixo"
          >
            ↓
          </button>
          <button
            type="button"
            className="qc__icon-btn qc__icon-btn--danger"
            onClick={onRemove}
            aria-label="Remover"
            title="Remover pergunta"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="qc__body">
          <div className="qc__field">
            <label className="qc__label">Título</label>
            <textarea
              className="qc__input"
              rows={2}
              value={q.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>

          <div className="qc__grid">
            <div className="qc__field">
              <label className="qc__label">Chave (slug interno)</label>
              <input
                className="qc__input"
                value={q.question_key}
                onChange={(e) => onChange({ question_key: e.target.value })}
              />
            </div>
            <div className="qc__field">
              <label className="qc__label">Tipo</label>
              <select
                className="qc__input qc__select"
                value={q.type}
                onChange={(e) => onChange({ type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="qc__field">
            <label className="qc__label">Hint (opcional)</label>
            <input
              className="qc__input"
              value={q.hint ?? ''}
              onChange={(e) => onChange({ hint: e.target.value })}
              placeholder="Texto auxiliar exibido abaixo do título"
            />
          </div>

          {showPlaceholder && (
            <div className="qc__field">
              <label className="qc__label">Placeholder</label>
              <input
                className="qc__input"
                value={q.placeholder ?? ''}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                placeholder="Texto exibido dentro do campo vazio"
              />
            </div>
          )}

          {showOptions && (
            <div className="qc__field">
              <label className="qc__label">Opções (uma por linha)</label>
              <textarea
                className="qc__input"
                rows={Math.max(3, q.options.length)}
                value={q.options.join('\n')}
                onChange={(e) =>
                  onChange({
                    options: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          )}

          {showFromPrev && (
            <div className="qc__grid">
              <div className="qc__field">
                <label className="qc__label">ID da pergunta-fonte</label>
                <input
                  className="qc__input"
                  value={(q.config as any)?.sourceId ?? ''}
                  onChange={(e) =>
                    onChange({ config: { ...q.config, sourceId: e.target.value } })
                  }
                />
              </div>
              <div className="qc__field">
                <label className="qc__label">Máximo selecionável</label>
                <input
                  className="qc__input"
                  type="number"
                  min={1}
                  value={(q.config as any)?.max ?? 3}
                  onChange={(e) =>
                    onChange({ config: { ...q.config, max: Number(e.target.value) } })
                  }
                />
              </div>
            </div>
          )}

          <div className="qc__footer">
            <label className="qc__switch">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => onChange({ required: e.target.checked })}
              />
              <span>Obrigatória</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
