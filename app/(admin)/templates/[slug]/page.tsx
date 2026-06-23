import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import TemplateEditor from './TemplateEditor';

export const dynamic = 'force-dynamic';

export default async function TemplateEditPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const { data: cat } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', params.slug)
    .maybeSingle();
  if (!cat) notFound();

  const { data: tmpl } = await supabase
    .from('form_templates')
    .select('id, intro')
    .eq('category_id', cat.id)
    .eq('is_active', true)
    .maybeSingle();
  if (!tmpl) {
    return (
      <div className="admin-empty">
        Esta categoria ainda não tem template. Rode o seed para criar.
      </div>
    );
  }

  const { data: questions } = await supabase
    .from('template_questions')
    .select('id, question_key, position, type, title, hint, placeholder, options, required, config')
    .eq('template_id', tmpl.id)
    .order('position');

  return (
    <TemplateEditor
      categoryName={cat.name}
      categorySlug={cat.slug}
      templateId={tmpl.id}
      intro={(tmpl.intro as any) ?? {}}
      initialQuestions={(questions ?? []) as any}
    />
  );
}
