create table if not exists public.cardly_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.cardly_access enable row level security;

revoke all on table public.cardly_access from public, anon, authenticated;
grant select on table public.cardly_access to authenticated;

drop policy if exists "Users can view their own Cardly access" on public.cardly_access;
create policy "Users can view their own Cardly access"
on public.cardly_access for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.redeem_cardly_promo(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Sign in before redeeming an invitation code'
      using errcode = '28000';
  end if;

  if p_code is distinct from 'CARDLY2026' then
    raise exception 'Invalid invitation code'
      using errcode = 'check_violation';
  end if;

  insert into public.cardly_access (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  return true;
end;
$$;

revoke all on function public.redeem_cardly_promo(text) from public, anon, authenticated;

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

  insert into public.cardly_access (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists require_cardly_signup_code on auth.users;
create trigger require_cardly_signup_code
after insert on auth.users
for each row
execute function public.require_cardly_signup_code();

revoke all on function public.require_cardly_signup_code() from public, anon, authenticated;

-- Grant access to existing email accounts that were created with the valid code.
insert into public.cardly_access (user_id)
select id
from auth.users
where raw_user_meta_data ->> 'promo_code' = 'CARDLY2026'
on conflict (user_id) do nothing;

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

drop policy if exists "Owners can delete their cards" on public.cards;
create policy "Owners can delete their cards"
on public.cards for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

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

drop policy if exists "Users can delete their own card photos" on storage.objects;
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
