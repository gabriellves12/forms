-- =====================================================================
-- RLS — formulário público escreve, só admin autenticado lê.
-- =====================================================================

alter table categories         enable row level security;
alter table form_templates     enable row level security;
alter table template_questions enable row level security;
alter table briefings          enable row level security;
alter table briefing_answers   enable row level security;

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
drop policy if exists categories_read_public on categories;
create policy categories_read_public
  on categories for select
  using (true);

drop policy if exists categories_write_authenticated on categories;
create policy categories_write_authenticated
  on categories for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- FORM_TEMPLATES
-- ---------------------------------------------------------------------
-- Público lê só o template ativo (pra renderizar o formulário).
drop policy if exists form_templates_read_public_active on form_templates;
create policy form_templates_read_public_active
  on form_templates for select
  using (is_active = true);

drop policy if exists form_templates_write_authenticated on form_templates;
create policy form_templates_write_authenticated
  on form_templates for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- TEMPLATE_QUESTIONS
-- ---------------------------------------------------------------------
-- Público lê perguntas de templates ativos.
drop policy if exists template_questions_read_public on template_questions;
create policy template_questions_read_public
  on template_questions for select
  using (
    exists (
      select 1 from form_templates t
      where t.id = template_questions.template_id and t.is_active = true
    )
  );

drop policy if exists template_questions_write_authenticated on template_questions;
create policy template_questions_write_authenticated
  on template_questions for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- BRIEFINGS
-- ---------------------------------------------------------------------
-- Público pode inserir (formulário envia). Nada de SELECT público.
drop policy if exists briefings_insert_public on briefings;
create policy briefings_insert_public
  on briefings for insert
  with check (true);

drop policy if exists briefings_full_authenticated on briefings;
create policy briefings_full_authenticated
  on briefings for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- BRIEFING_ANSWERS
-- ---------------------------------------------------------------------
drop policy if exists briefing_answers_insert_public on briefing_answers;
create policy briefing_answers_insert_public
  on briefing_answers for insert
  with check (true);

drop policy if exists briefing_answers_full_authenticated on briefing_answers;
create policy briefing_answers_full_authenticated
  on briefing_answers for all
  to authenticated
  using (true) with check (true);
