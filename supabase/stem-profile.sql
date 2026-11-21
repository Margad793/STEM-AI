-- STEM2Connect profile fields
-- Run once in each Supabase project after duplicating the app/database.

alter table public.cards
  add column if not exists research_highlight text;

grant select (research_highlight) on table public.cards to anon, authenticated;
grant insert (research_highlight) on table public.cards to authenticated;
grant update (research_highlight) on table public.cards to authenticated;
