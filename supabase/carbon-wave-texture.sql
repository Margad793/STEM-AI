alter table public.cards
  drop constraint if exists cards_texture_check;

alter table public.cards
  add constraint cards_texture_check
  check (texture in ('holographic', 'arcs', 'matte', 'metal', 'carbon-wave'));
