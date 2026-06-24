-- =====================================================================
-- Share slug amigável pros briefings.
-- Em vez de /b/<token-aleatório>, agora geramos /<category-slug>-NN
-- (ex.: /identidade-visual-01, /identidade-visual-02, ...).
-- =====================================================================

alter table briefing_drafts
  add column if not exists share_slug text;

create unique index if not exists ux_briefing_drafts_share_slug
  on briefing_drafts(share_slug)
  where share_slug is not null;

create index if not exists idx_briefing_drafts_category_slug
  on briefing_drafts(category_id, share_slug);
