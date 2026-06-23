import { notFound } from 'next/navigation';
import BriefingForm from '@/components/form/BriefingForm';
import { loadActiveTemplate } from '@/lib/templates/loader';

export const dynamic = 'force-dynamic';

export default async function BriefingPage({ params }: { params: { slug: string } }) {
  const tmpl = await loadActiveTemplate(params.slug);
  if (!tmpl) notFound();

  return (
    <BriefingForm
      template={tmpl}
      whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5584998982543'}
      whatsappMessage={
        process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
        'Olá! Acabei de preencher o briefing da Think Brand e gostaria de dar continuidade ao meu projeto.'
      }
    />
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tmpl = await loadActiveTemplate(params.slug);
  return {
    title: tmpl ? `Briefing — ${tmpl.categoryName}` : 'Briefing — Think Brand',
  };
}
