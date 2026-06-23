-- =====================================================================
-- Think Brand Briefing — schema inicial
-- =====================================================================
-- Convenções:
--   * Briefing = uma submissão de cliente.
--   * Template = conjunto editável de perguntas por categoria.
--   * Respostas: JSONB indexado por question_id pra simplicidade
--     (perguntas mudam de versão sem quebrar histórico).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Categorias (fixas: identidade-visual, site-institucional, etc)
-- ---------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Form templates (1 ativo por categoria; versionado)
-- ---------------------------------------------------------------------
create table if not exists form_templates (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  version      int  not null default 1,
  is_active    boolean not null default true,
  intro        jsonb not null default '{}'::jsonb,
  -- intro = { eyebrow, title, description, meta: [{label,value}], button_label }
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (category_id, version)
);

create index if not exists idx_form_templates_active
  on form_templates(category_id) where is_active = true;

-- ---------------------------------------------------------------------
-- Perguntas do template (editáveis pelo admin)
-- ---------------------------------------------------------------------
-- type ∈ ('text','textarea','single','multi','multi-other','multi-from-prev','brands')
-- config: flags específicas do tipo (max, min, sourceId, allowOther, etc)
create table if not exists template_questions (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid not null references form_templates(id) on delete cascade,
  question_key  text not null,
  position      int  not null,
  type          text not null,
  title         text not null,
  hint          text,
  placeholder   text,
  options       jsonb not null default '[]'::jsonb,
  required      boolean not null default true,
  config        jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  unique (template_id, question_key)
);

create index if not exists idx_template_questions_template
  on template_questions(template_id, position);

-- ---------------------------------------------------------------------
-- Briefings (submissões de clientes)
-- ---------------------------------------------------------------------
-- status: 'new' | 'seen' | 'archived'
create table if not exists briefings (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete restrict,
  template_id   uuid references form_templates(id) on delete set null,
  client_name   text,
  product_name  text,
  status        text not null default 'new',
  source        text not null default 'web',
  -- snapshot do payload bruto enviado pelo formulário, pra resiliência
  raw_payload   jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz not null default now()
);

create index if not exists idx_briefings_category_date
  on briefings(category_id, submitted_at desc);

-- ---------------------------------------------------------------------
-- Respostas individuais (1 linha por pergunta respondida)
-- ---------------------------------------------------------------------
create table if not exists briefing_answers (
  id            uuid primary key default gen_random_uuid(),
  briefing_id   uuid not null references briefings(id) on delete cascade,
  question_key  text not null,
  question_title text,
  value         text,
  unique (briefing_id, question_key)
);

create index if not exists idx_briefing_answers_briefing
  on briefing_answers(briefing_id);

-- ---------------------------------------------------------------------
-- Trigger pra atualizar updated_at em form_templates
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_form_templates_updated on form_templates;
create trigger trg_form_templates_updated
  before update on form_templates
  for each row execute function set_updated_at();
