-- =====================================================================
-- Briefing drafts — admin cria briefing customizado pra mandar pro cliente.
-- O draft guarda snapshot das perguntas + token compartilhável.
-- Quando o cliente envia, criamos um briefing real linkado pelo draft.
-- =====================================================================

create table if not exists briefing_drafts (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references categories(id) on delete cascade,
  template_id      uuid not null references form_templates(id) on delete cascade,
  -- snapshot completo das perguntas no momento da criação
  -- formato: QuestionPayload[] do TemplateEditor
  questions        jsonb not null default '[]'::jsonb,
  intro            jsonb,
  share_token      text not null unique,
  client_label     text,
  notes            text,
  used_briefing_id uuid references briefings(id) on delete set null,
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id) on delete set null
);

create index if not exists idx_briefing_drafts_token
  on briefing_drafts(share_token);
create index if not exists idx_briefing_drafts_category
  on briefing_drafts(category_id, created_at desc);

-- Adicionar referência opcional ao draft no briefing (pra rastrear de qual veio)
alter table briefings
  add column if not exists draft_id uuid references briefing_drafts(id) on delete set null;

create index if not exists idx_briefings_draft on briefings(draft_id);

-- RLS — drafts são acessados publicamente APENAS via service role na rota /b/[token]
alter table briefing_drafts enable row level security;

drop policy if exists briefing_drafts_full_authenticated on briefing_drafts;
create policy briefing_drafts_full_authenticated
  on briefing_drafts for all
  to authenticated
  using (true) with check (true);
