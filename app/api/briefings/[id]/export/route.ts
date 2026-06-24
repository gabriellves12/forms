import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function slug(input: string | null | undefined) {
  return (input || 'briefing')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { data: briefing } = await supabase
    .from('briefings')
    .select(
      'id, client_name, product_name, status, submitted_at, source, category_id, template_id'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!briefing) return new NextResponse('Not found', { status: 404 });

  const [{ data: category }, { data: answers }, { data: questions }] =
    await Promise.all([
      supabase.from('categories').select('slug, name').eq('id', briefing.category_id).maybeSingle(),
      supabase
        .from('briefing_answers')
        .select('question_key, question_title, value')
        .eq('briefing_id', briefing.id),
      briefing.template_id
        ? supabase
            .from('template_questions')
            .select('question_key, position')
            .eq('template_id', briefing.template_id)
            .order('position')
        : Promise.resolve({ data: [] as any[] }),
    ]);

  const orderMap = new Map<string, number>();
  for (const q of questions ?? []) orderMap.set(q.question_key, q.position);

  const sortedAnswers = (answers ?? []).slice().sort((a, b) => {
    const pa = orderMap.get(a.question_key) ?? 999;
    const pb = orderMap.get(b.question_key) ?? 999;
    return pa - pb;
  });

  const url = new URL(request.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';

  const baseName = `briefing-${slug(briefing.client_name || briefing.product_name)}-${briefing.id.slice(0, 8)}`;

  if (format === 'csv') {
    const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const lines: string[] = [];
    lines.push(['Pergunta', 'Resposta'].map(escape).join(','));
    lines.push(
      [`Categoria`, category?.name ?? ''].map(escape).join(',')
    );
    lines.push([`Status`, briefing.status].map(escape).join(','));
    lines.push(
      [`Recebido em`, new Date(briefing.submitted_at).toLocaleString('pt-BR')]
        .map(escape)
        .join(',')
    );
    for (const a of sortedAnswers) {
      lines.push([a.question_title || a.question_key, a.value || ''].map(escape).join(','));
    }
    const csv = '\uFEFF' + lines.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseName}.csv"`,
      },
    });
  }

  const payload = {
    briefing: {
      id: briefing.id,
      category: category?.slug ?? null,
      categoryName: category?.name ?? null,
      clientName: briefing.client_name,
      productName: briefing.product_name,
      status: briefing.status,
      source: briefing.source,
      submittedAt: briefing.submitted_at,
    },
    answers: sortedAnswers.map((a) => ({
      key: a.question_key,
      question: a.question_title,
      value: a.value,
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${baseName}.json"`,
    },
  });
}
