import { notFound } from 'next/navigation';
import BriefingForm from '@/components/form/BriefingForm';
import { loadDraftByToken } from '@/lib/templates/draft-loader';

export const dynamic = 'force-dynamic';

// Rota legada — links antigos no formato /b/<token> continuam funcionando.
// Briefings novos usam /<category-slug>-NN (ver app/(public)/[slug]/page.tsx).
export default async function DraftBriefingPage({ params }: { params: { token: string } }) {
  const loaded = await loadDraftByToken(params.token);
  if (!loaded) notFound();

  return (
    <BriefingForm
      template={loaded.template}
      draftId={loaded.draftId}
      whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5584998982543'}
      whatsappMessage={
        process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
        'Olá! Acabei de preencher o briefing da Think Brand e gostaria de dar continuidade ao meu projeto.'
      }
    />
  );
}

export async function generateMetadata({ params }: { params: { token: string } }) {
  const loaded = await loadDraftByToken(params.token);
  return {
    title: loaded ? `Briefing — ${loaded.template.categoryName}` : 'Briefing — Think Brand',
  };
}
