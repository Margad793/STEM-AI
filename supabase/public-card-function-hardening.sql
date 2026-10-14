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
  location,
  bio,
  email,
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

drop policy if exists "Anyone can view published cards" on public.cards;
create policy "Anyone can view published cards"
on public.cards for select
to anon, authenticated
using (is_published = true);

alter function public.get_public_card(text) security invoker;
revoke all on function public.get_public_card(text) from public;
grant execute on function public.get_public_card(text) to anon, authenticated;
