import { createAdminSupabase } from '@/lib/supabase/server';
import type { LoadedTemplate } from '@/lib/templates/loader';
import type { QuestionDef, QuestionType, QuestionConfig, TemplateIntro } from '@/lib/templates/types';

export interface LoadedDraft {
  draftId: string;
  template: LoadedTemplate;
}

type Lookup = { kind: 'token'; value: string } | { kind: 'slug'; value: string };

async function loadDraftBy(lookup: Lookup): Promise<LoadedDraft | null> {
  const supabase = createAdminSupabase();

  const query = supabase
    .from('briefing_drafts')
    .select('id, category_id, template_id, questions, intro');
  const { data: draft } =
    lookup.kind === 'token'
      ? await query.eq('share_token', lookup.value).maybeSingle()
      : await query.eq('share_slug', lookup.value).maybeSingle();
  if (!draft) return null;

  const { data: cat } = await supabase
    .from('categories')
    .select('slug, name')
    .eq('id', draft.category_id)
    .maybeSingle();
  if (!cat) return null;

  const { data: tmpl } = await supabase
    .from('form_templates')
    .select('intro')
    .eq('id', draft.template_id)
    .maybeSingle();

  const introFromDraft = (draft.intro ?? null) as TemplateIntro | null;
  const introFallback = (tmpl?.intro ?? {}) as TemplateIntro;
  const intro = introFromDraft ?? introFallback;

  const rawQuestions = Array.isArray(draft.questions) ? draft.questions : [];
  const questions: QuestionDef[] = rawQuestions.map((r: any) => ({
    id: r.question_key,
    type: r.type as QuestionType,
    title: r.title,
    hint: r.hint ?? undefined,
    placeholder: r.placeholder ?? undefined,
    options: Array.isArray(r.options) ? r.options : [],
    required: r.required ?? true,
    config: (r.config ?? {}) as QuestionConfig,
  }));

  return {
    draftId: draft.id,
    template: {
      templateId: draft.template_id,
      categoryId: draft.category_id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      intro,
      questions,
    },
  };
}

export function loadDraftByToken(token: string) {
  return loadDraftBy({ kind: 'token', value: token });
}

export function loadDraftBySlug(slug: string) {
  return loadDraftBy({ kind: 'slug', value: slug });
}
