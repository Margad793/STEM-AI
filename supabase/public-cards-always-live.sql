alter table public.cards
  alter column is_published set default true;

update public.cards
set is_published = true
where is_published is distinct from true;
