alter function public.generate_short_card_code() security invoker;
revoke all on function public.generate_short_card_code() from public, anon;
grant execute on function public.generate_short_card_code() to authenticated;

revoke all on function public.redeem_cardly_promo(text) from public, anon, authenticated;
revoke all on function public.require_cardly_signup_code() from public, anon, authenticated;

-- Public card RPC is intentionally callable by anonymous visitors.
-- Remove implicit PUBLIC access and grant only the app roles that need it.
revoke all on function public.get_public_card(text) from public;
grant execute on function public.get_public_card(text) to anon, authenticated;
