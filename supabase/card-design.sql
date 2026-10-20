alter table public.cards
  add column if not exists color_id text,
  add column if not exists pattern_id text,
  add column if not exists organization_code text;

grant select (color_id, pattern_id, organization_code) on table public.cards to anon, authenticated;
grant insert on table public.cards to authenticated;
grant update (color_id, pattern_id, organization_code) on table public.cards to authenticated;
