export type QuestionType =
  | 'text'
  | 'textarea'
  | 'single'
  | 'multi'
  | 'multi-other'
  | 'multi-from-prev'
  | 'brands';

export interface QuestionConfig {
  /** allow "outro" option in multi-other */
  allowOther?: boolean;
  /** id da pergunta-fonte em multi-from-prev */
  sourceId?: string;
  /** max selecionáveis em multi/multi-from-prev */
  max?: number;
  /** min selecionáveis */
  min?: number;
  /** max de campos em brands */
  brandsMax?: number;
}

export interface QuestionDef {
  id: string;
  type: QuestionType;
  title: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  config?: QuestionConfig;
}

export interface TemplateIntro {
  eyebrow: string;
  title: string;
  /** title pode usar <em>...</em> pra destaque */
  description: string;
  meta: { value: string; label: string }[];
  buttonLabel?: string;
}

export interface TemplateDef {
  categorySlug: string;
  categoryName: string;
  intro: TemplateIntro;
  questions: QuestionDef[];
}
