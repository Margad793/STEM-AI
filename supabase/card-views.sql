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
using (user_id = (select auth.uid()));

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
  where public_code = p_public_code
    and is_published = true;

  if not found then
    return;
  end if;

  if v_viewer_id is not null and v_viewer_id = v_card.user_id then
    return;
  end if;

  select exists (
    select 1
    from public.cardly_access
    where user_id = v_card.user_id
      and account_type = 'business'
  ) into v_business;

  if not v_business then
    return;
  end if;

  if v_viewer_id is not null then
    if exists (
      select 1
      from public.card_views
      where card_id = v_card.id
        and viewer_user_id = v_viewer_id
    ) then
      return;
    end if;

    select
      c.name,
      c.company,
      case when coalesce(c.show_phone, true) then c.phone else null end
    into v_name, v_company, v_phone
    from public.cards c
    where c.user_id = v_viewer_id;

    insert into public.card_views (card_id, user_id, viewer_user_id, viewer_name, viewer_company, viewer_phone)
    values (v_card.id, v_card.user_id, v_viewer_id, v_name, v_company, v_phone)
    on conflict do nothing;

    return;
  end if;

  if p_visitor_id is null then
    return;
  end if;

  if exists (
    select 1
    from public.card_views
    where card_id = v_card.id
      and visitor_id = p_visitor_id
  ) then
    return;
  end if;

  insert into public.card_views (card_id, user_id, visitor_id)
  values (v_card.id, v_card.user_id, p_visitor_id)
  on conflict do nothing;
end;
$$;

revoke all on function public.log_card_view(text, uuid) from public, anon, authenticated;
grant execute on function public.log_card_view(text, uuid) to anon, authenticated;
