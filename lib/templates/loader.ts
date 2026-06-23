import { createServerSupabase } from '@/lib/supabase/server';
import type { QuestionDef, TemplateIntro, QuestionType, QuestionConfig } from './types';

export interface LoadedTemplate {
  templateId: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  intro: TemplateIntro;
  questions: QuestionDef[];
}

/**
 * Carrega o template ATIVO de uma categoria a partir do slug.
 * Retorna null se a categoria/template não existir.
 */
export async function loadActiveTemplate(slug: string): Promise<LoadedTemplate | null> {
  const supabase = createServerSupabase();

  const { data: cat } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle();
  if (!cat) return null;

  const { data: tmpl } = await supabase
    .from('form_templates')
    .select('id, intro')
    .eq('category_id', cat.id)
    .eq('is_active', true)
    .maybeSingle();
  if (!tmpl) return null;

  const { data: rows } = await supabase
    .from('template_questions')
    .select('question_key, type, title, hint, placeholder, options, required, config, position')
    .eq('template_id', tmpl.id)
    .order('position', { ascending: true });

  const questions: QuestionDef[] = (rows ?? []).map((r) => ({
    id: r.question_key,
    type: r.type as QuestionType,
    title: r.title,
    hint: r.hint ?? undefined,
    placeholder: r.placeholder ?? undefined,
    options: Array.isArray(r.options) ? (r.options as string[]) : [],
    required: r.required ?? true,
    config: (r.config ?? {}) as QuestionConfig,
  }));

  return {
    templateId: tmpl.id,
    categoryId: cat.id,
    categoryName: cat.name,
    categorySlug: cat.slug,
    intro: (tmpl.intro ?? {}) as TemplateIntro,
    questions,
  };
}
