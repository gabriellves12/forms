import { notFound } from 'next/navigation';
import BriefingForm from '@/components/form/BriefingForm';
import { loadActiveTemplate } from '@/lib/templates/loader';
import { loadDraftBySlug } from '@/lib/templates/draft-loader';

export const dynamic = 'force-dynamic';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5584998982543';
const WA_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
  'Olá! Acabei de preencher o briefing da Think Brand e gostaria de dar continuidade ao meu projeto.';

// `/<category-slug>-NN` aponta pra um draft customizado (briefing pré-montado pelo admin).
// `/<category-slug>` aponta pro template ativo da categoria.
// Resolvemos draft primeiro: o sufixo -NN nunca colide com slug puro de categoria.
export default async function BriefingPage({ params }: { params: { slug: string } }) {
  const draft = await loadDraftBySlug(params.slug);
  if (draft) {
    return (
      <BriefingForm
        template={draft.template}
        draftId={draft.draftId}
        whatsappNumber={WA_NUMBER}
        whatsappMessage={WA_MESSAGE}
      />
    );
  }

  const tmpl = await loadActiveTemplate(params.slug);
  if (!tmpl) notFound();

  return (
    <BriefingForm template={tmpl} whatsappNumber={WA_NUMBER} whatsappMessage={WA_MESSAGE} />
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const draft = await loadDraftBySlug(params.slug);
  if (draft) {
    return { title: `Briefing — ${draft.template.categoryName}` };
  }
  const tmpl = await loadActiveTemplate(params.slug);
  return {
    title: tmpl ? `Briefing — ${tmpl.categoryName}` : 'Briefing — Think Brand',
  };
}
