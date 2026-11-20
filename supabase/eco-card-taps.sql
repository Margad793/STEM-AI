-- Add automatic NFC / QR public-card tap counts to an existing Cardliy project.
-- Public page loads of published cards count as taps; no visitor identity is stored.

begin;

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

commit;
