alter table public.cards
add column if not exists company_logo_url text;

alter table public.cards
  add column if not exists business_email text,
  add column if not exists personal_email text,
  add column if not exists show_phone boolean not null default true,
  add column if not exists show_business_email boolean not null default true,
  add column if not exists show_personal_email boolean not null default false,
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

alter table public.cards enable row level security;

revoke select on table public.cards from public, anon, authenticated;
grant select (
  id,
  user_id,
  is_published,
  public_code,
  name,
  title,
  company,
  company_logo_url,
  room_number,
  location,
  bio,
  email,
  business_email,
  personal_email,
  show_phone,
  show_business_email,
  show_personal_email,
  show_room_number,
  show_website,
  show_instagram,
  show_facebook,
  show_viber,
  phone,
  website,
  instagram,
  facebook,
  viber,
  whatsapp,
  photo_url,
  template,
  texture
) on table public.cards to anon, authenticated;

grant update (
  is_published,
  name,
  title,
  company,
  company_logo_url,
  location,
  bio,
  email,
  business_email,
  personal_email,
  show_phone,
  show_business_email,
  show_personal_email,
  show_room_number,
  show_website,
  show_instagram,
  show_facebook,
  show_viber,
  phone,
  room_number,
  website,
  instagram,
  facebook,
  viber,
  whatsapp,
  photo_url,
  template,
  texture
) on table public.cards to authenticated;

drop policy if exists "Anyone can view published cards" on public.cards;
create policy "Anyone can view published cards"
on public.cards for select
to anon, authenticated
using (is_published = true);

alter function public.get_public_card(text) security invoker;
revoke all on function public.get_public_card(text) from public;
grant execute on function public.get_public_card(text) to anon, authenticated;
