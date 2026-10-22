create table if not exists public.cardly_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  account_type text not null default 'personal'
);

alter table public.cardly_access
  add column if not exists account_type text not null default 'personal';

alter table public.cardly_access
  drop constraint if exists cardly_access_account_type_check;
alter table public.cardly_access
  add constraint cardly_access_account_type_check
  check (account_type in ('personal', 'business'));

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

  insert into public.cardly_access (user_id, account_type)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'account_type' in ('personal', 'business')
      then new.raw_user_meta_data ->> 'account_type'
      else 'personal'
    end
  )
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

insert into public.cardly_access (user_id)
select id
from auth.users
where raw_user_meta_data ->> 'promo_code' = 'CARDLY2026'
on conflict (user_id) do nothing;
