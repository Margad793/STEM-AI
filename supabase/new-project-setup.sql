-- STEM2Connect setup for a brand-new, empty Supabase project.
-- Run this file once in Supabase SQL Editor. Do not run the individual
-- migration files in this folder as well; this script consolidates them.

begin;

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  public_code text not null unique,
  is_published boolean not null default true,
  name text not null default '',
  title text not null default '',
  company text not null default '',
  company_logo_url text not null default '',
  location text not null default '',
  bio text not null default '',
  research_highlight text,
  email text not null default '',
  business_email text not null default '',
  personal_email text not null default '',
  show_phone boolean not null default true,
  show_business_email boolean not null default true,
  show_personal_email boolean not null default false,
  show_room_number boolean not null default true,
  show_website boolean not null default true,
  show_instagram boolean not null default true,
  show_facebook boolean not null default true,
  show_viber boolean not null default true,
  phone text not null default '',
  room_number text not null default '',
  website text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  viber text not null default '',
  whatsapp text not null default '',
  photo_url text not null default '',
  template text not null default 'classic',
  texture text not null default 'arcs'
    check (texture in ('holographic', 'arcs', 'matte', 'metal', 'carbon-wave')),
  language text not null default 'en'
    check (language in ('en', 'mn')),
  color_id text,
  pattern_id text,
  organization_code text,
  constraint cards_email_visibility_exclusive
    check (not (show_business_email and show_personal_email))
);

create or replace function public.generate_short_card_code()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  alphabet constant text := '0123456789abcdefghjkmnpqrstvwxyz';
  random_bytes bytea;
  candidate text;
  attempt integer;
  byte_index integer;
begin
  for attempt in 1..10 loop
    random_bytes := pg_catalog.uuid_send(pg_catalog.gen_random_uuid());
    candidate := '';

    for byte_index in 0..9 loop
      candidate := candidate || pg_catalog.substr(
        alphabet,
        (pg_catalog.get_byte(random_bytes, byte_index) & 31) + 1,
        1
      );
    end loop;

    if not exists (
      select 1 from public.cards where public_code = candidate
    ) then
      return candidate;
    end if;
  end loop;

  raise exception 'Unable to generate a unique public card code after 10 attempts';
end;
$$;

revoke all on function public.generate_short_card_code() from public, anon;
grant execute on function public.generate_short_card_code() to authenticated;
alter table public.cards
  alter column public_code set default public.generate_short_card_code();

create table if not exists public.cardly_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  account_type text not null default 'personal'
    check (account_type in ('personal', 'business'))
);

alter table public.cardly_access enable row level security;
revoke all on table public.cardly_access from public, anon, authenticated;
grant select on table public.cardly_access to authenticated;

drop policy if exists "Users can view their own Cardly access"
  on public.cardly_access;
create policy "Users can view their own Cardly access"
on public.cardly_access for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.require_cardly_signup_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_app_meta_data ->> 'provider' = 'google' then
    return new;
  end if;

  if new.raw_user_meta_data ->> 'promo_code' is distinct from 'CARDLY2026' then
    raise exception 'A valid invitation code is required to create an account'
      using errcode = 'check_violation';
  end if;

  insert into public.cardly_access (user_id, account_type)
  values (
    new.id,
    case
      when new.raw_user_meta_data ->> 'account_type' in ('personal', 'business')
        then new.raw_user_meta_data ->> 'account_type'
      else 'personal'
    end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.require_cardly_signup_code() from public, anon, authenticated;
drop trigger if exists require_cardly_signup_code on auth.users;
create trigger require_cardly_signup_code
after insert on auth.users
for each row
execute function public.require_cardly_signup_code();

insert into public.cardly_access (user_id, account_type)
select
  id,
  case
    when raw_user_meta_data ->> 'account_type' in ('personal', 'business')
      then raw_user_meta_data ->> 'account_type'
    else 'personal'
  end
from auth.users
where raw_user_meta_data ->> 'promo_code' = 'CARDLY2026'
on conflict (user_id) do nothing;

alter table public.cards enable row level security;
revoke all on table public.cards from public, anon, authenticated;
grant select (
  id, user_id, public_code, is_published, name, title, company,
  company_logo_url, location, bio, research_highlight, email,
  business_email, personal_email, show_phone, show_business_email,
  show_personal_email, show_room_number, show_website, show_instagram,
  show_facebook, show_viber, phone, room_number, website, instagram,
  facebook, viber, whatsapp, photo_url, template, texture, language,
  color_id, pattern_id, organization_code
) on table public.cards to authenticated;

grant insert (
  user_id, is_published, name, title, company, company_logo_url, location,
  bio, research_highlight, email, business_email, personal_email,
  show_phone, show_business_email, show_personal_email, show_room_number,
  show_website, show_instagram, show_facebook, show_viber, phone,
  room_number, website, instagram, facebook, viber, whatsapp, photo_url,
  template, texture, language, color_id, pattern_id, organization_code
) on table public.cards to authenticated;

grant update (
  is_published, name, title, company, company_logo_url, location, bio,
  research_highlight, email, business_email, personal_email, show_phone,
  show_business_email, show_personal_email, show_room_number, show_website,
  show_instagram, show_facebook, show_viber, phone, room_number, website,
  instagram, facebook, viber, whatsapp, photo_url, template, texture,
  language, color_id, pattern_id, organization_code
) on table public.cards to authenticated;

drop policy if exists "Anyone can view published cards" on public.cards;

drop policy if exists "Owners can read their cards" on public.cards;
create policy "Owners can read their cards"
on public.cards for select
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Owners can create their cards" on public.cards;
create policy "Owners can create their cards"
on public.cards for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Owners can update their cards" on public.cards;
create policy "Owners can update their cards"
on public.cards for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

create or replace function public.get_public_card(p_public_code text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'public_code', c.public_code,
    'name', c.name,
    'title', c.title,
    'company', c.company,
    'company_logo_url', c.company_logo_url,
    'location', c.location,
    'bio', c.bio,
    'research_highlight', c.research_highlight,
    'email', case when c.show_business_email then c.business_email else '' end,
    'business_email', case when c.show_business_email then c.business_email else null end,
    'personal_email', case when c.show_personal_email then c.personal_email else null end,
    'show_phone', c.show_phone,
    'show_business_email', c.show_business_email,
    'show_personal_email', c.show_personal_email,
    'show_room_number', c.show_room_number,
    'show_website', c.show_website,
    'show_instagram', c.show_instagram,
    'show_facebook', c.show_facebook,
    'show_viber', c.show_viber,
    'phone', case when c.show_phone then c.phone else '' end,
    'room_number', case when c.show_room_number then c.room_number else null end,
    'website', case when c.show_website then c.website else '' end,
    'instagram', case when c.show_instagram then c.instagram else '' end,
    'facebook', case when c.show_facebook then c.facebook else '' end,
    'viber', case when c.show_viber then c.viber else '' end,
    'photo_url', c.photo_url,
    'template', c.template,
    'texture', c.texture,
    'language', c.language,
    'organization_code', c.organization_code
  )
  from public.cards c
  where c.public_code = p_public_code
    and c.is_published = true
  limit 1;
$$;

revoke all on function public.get_public_card(text) from public, anon, authenticated;
grant execute on function public.get_public_card(text) to anon, authenticated;

create table if not exists public.card_tap_counts (
  card_id uuid primary key references public.cards(id) on delete cascade,
  tap_count bigint not null default 0 check (tap_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.card_tap_counts enable row level security;
revoke all on table public.card_tap_counts from public, anon, authenticated;

create or replace function public.record_card_tap(p_public_code text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tap_count bigint;
begin
  insert into public.card_tap_counts (card_id, tap_count)
  select c.id, 1
  from public.cards c
  where c.public_code = p_public_code
    and c.is_published = true
  on conflict (card_id) do update
    set tap_count = public.card_tap_counts.tap_count + 1,
        updated_at = now()
  returning tap_count into v_tap_count;

  return coalesce(v_tap_count, 0);
end;
$$;

create or replace function public.get_card_tap_count(p_public_code text)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_tap_count bigint;
begin
  select coalesce((
    select counts.tap_count
    from public.card_tap_counts counts
    where counts.card_id = c.id
  ), 0)
  into v_tap_count
  from public.cards c
  where c.public_code = p_public_code
    and (c.is_published = true or c.user_id = auth.uid())
  limit 1;

  return coalesce(v_tap_count, 0);
end;
$$;

revoke all on function public.record_card_tap(text) from public, anon, authenticated;
grant execute on function public.record_card_tap(text) to anon, authenticated;
revoke all on function public.get_card_tap_count(text) from public, anon, authenticated;
grant execute on function public.get_card_tap_count(text) to anon, authenticated;

create table if not exists public.card_views (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.cards(user_id) on delete cascade,
  viewer_user_id uuid references auth.users(id) on delete set null,
  visitor_id uuid,
  viewer_name text,
  viewer_company text,
  viewer_phone text,
  first_viewed_at timestamptz not null default now()
);

create unique index if not exists card_views_card_viewer_key
  on public.card_views (card_id, viewer_user_id)
  where viewer_user_id is not null;
create unique index if not exists card_views_card_visitor_key
  on public.card_views (card_id, visitor_id)
  where viewer_user_id is null and visitor_id is not null;
create index if not exists card_views_user_id_idx
  on public.card_views (user_id, first_viewed_at desc);

alter table public.card_views enable row level security;
revoke all on table public.card_views from public, anon, authenticated;
grant select on table public.card_views to authenticated;

drop policy if exists "Owners can read their card views" on public.card_views;
create policy "Owners can read their card views"
on public.card_views for select
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

create or replace function public.log_card_view(p_public_code text, p_visitor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card public.cards%rowtype;
  v_business boolean;
  v_viewer_id uuid := auth.uid();
  v_name text;
  v_company text;
  v_phone text;
begin
  select * into v_card
  from public.cards
  where public_code = p_public_code and is_published = true;

  if not found or (v_viewer_id is not null and v_viewer_id = v_card.user_id) then
    return;
  end if;

  select exists (
    select 1 from public.cardly_access
    where user_id = v_card.user_id and account_type = 'business'
  ) into v_business;

  if not v_business then
    return;
  end if;

  if v_viewer_id is not null then
    select c.name, c.company,
      case when c.show_phone then c.phone else null end
    into v_name, v_company, v_phone
    from public.cards c
    where c.user_id = v_viewer_id;

    insert into public.card_views (
      card_id, user_id, viewer_user_id, viewer_name, viewer_company, viewer_phone
    )
    values (
      v_card.id, v_card.user_id, v_viewer_id, v_name, v_company, v_phone
    )
    on conflict do nothing;
    return;
  end if;

  if p_visitor_id is not null then
    insert into public.card_views (card_id, user_id, visitor_id)
    values (v_card.id, v_card.user_id, p_visitor_id)
    on conflict do nothing;
  end if;
end;
$$;

revoke all on function public.log_card_view(text, uuid) from public, anon, authenticated;
grant execute on function public.log_card_view(text, uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-photos',
  'card-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own card photos" on storage.objects;
create policy "Users can upload their own card photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update their own card photos" on storage.objects;
create policy "Users can update their own card photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Users can view their own card photos" on storage.objects;
create policy "Users can view their own card photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their own card photos" on storage.objects;
create policy "Users can delete their own card photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

commit;
  