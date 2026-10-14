alter table public.cards
  drop constraint if exists cards_public_code_check;

create unique index if not exists cards_public_code_unique
on public.cards (public_code);

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
      select 1
      from public.cards
      where public_code = candidate
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
