alter table public.cards
  add column if not exists business_email text,
  add column if not exists personal_email text,
  add column if not exists show_phone boolean not null default true,
  add column if not exists show_business_email boolean not null default true,
  add column if not exists show_personal_email boolean not null default true,
  add column if not exists show_room_number boolean not null default true,
  add column if not exists show_website boolean not null default true,
  add column if not exists show_instagram boolean not null default true,
  add column if not exists show_facebook boolean not null default true,
  add column if not exists show_viber boolean not null default true;

update public.cards
set business_email = email
where business_email is null;

update public.cards
set show_personal_email = false
where show_business_email = true
  and show_personal_email = true;

alter table public.cards
  drop constraint if exists cards_email_visibility_exclusive;

alter table public.cards
  add constraint cards_email_visibility_exclusive
  check (not (show_business_email and show_personal_email));

alter table public.cards
  alter column show_phone set default true,
  alter column show_phone set not null,
  alter column show_business_email set default true,
  alter column show_business_email set not null,
  alter column show_personal_email set default true,
  alter column show_personal_email set not null,
  alter column show_room_number set default true,
  alter column show_room_number set not null,
  alter column show_website set default true,
  alter column show_website set not null,
  alter column show_instagram set default true,
  alter column show_instagram set not null,
  alter column show_facebook set default true,
  alter column show_facebook set not null,
  alter column show_viber set default true,
  alter column show_viber set not null;

grant select (
  business_email,
  personal_email,
  show_phone,
  show_business_email,
  show_personal_email,
  show_room_number,
  show_website,
  show_instagram,
  show_facebook,
  show_viber
) on table public.cards to anon, authenticated;

grant update (
  business_email,
  personal_email,
  show_phone,
  show_business_email,
  show_personal_email,
  show_room_number,
  show_website,
  show_instagram,
  show_facebook,
  show_viber
) on table public.cards to authenticated;
