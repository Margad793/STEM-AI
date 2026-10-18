alter table public.cards
  add column if not exists language text not null default 'en';

alter table public.cards
  drop constraint if exists cards_language_check;

alter table public.cards
  add constraint cards_language_check
  check (language in ('en', 'mn'));

grant select (language) on table public.cards to anon, authenticated;
grant update (language) on table public.cards to authenticated;
