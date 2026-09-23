-- DisMe — compras de créditos via PIX (NexusPag)
-- Economia continua fora do alcance do cliente: só RPC security definer credita.

create type public.credit_purchase_status as enum ('pending', 'paid', 'expired', 'failed');

create table public.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'nexuspag' check (provider = 'nexuspag'),
  external_id text not null unique check (length(external_id) between 1 and 200),
  provider_payment_id text unique check (provider_payment_id is null or length(provider_payment_id) > 0),
  package_id text not null,
  amount_brl numeric(10, 2) not null check (amount_brl > 0),
  credits integer not null check (credits > 0),
  status public.credit_purchase_status not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  paid_at timestamptz,
  credited_at timestamptz,
  constraint credit_purchases_package_catalog check (
    (package_id = 'drop'   and amount_brl = 9.90   and credits = 1000) or
    (package_id = 'vibe'   and amount_brl = 24.90  and credits = 2600) or
    (package_id = 'aura'   and amount_brl = 49.90  and credits = 5500) or
    (package_id = 'hype'   and amount_brl = 99.90  and credits = 11500) or
    (package_id = 'elite'  and amount_brl = 249.90 and credits = 30000) or
    (package_id = 'icon'   and amount_brl = 499.90 and credits = 65000) or
    (package_id = 'insane' and amount_brl = 999.90 and credits = 140000)
  ),
  constraint credit_purchases_paid_state check (
    (credited_at is null and status <> 'paid') or
    (credited_at is not null and paid_at is not null and status = 'paid')
  )
);

create index credit_purchases_user_idx
  on public.credit_purchases (user_id, created_at desc);

create index credit_purchases_status_idx
  on public.credit_purchases (status)
  where status = 'pending';

alter table public.credit_purchases enable row level security;

create policy credit_purchases_read_own
  on public.credit_purchases
  for select
  using (auth.uid() = user_id);

grant select on public.credit_purchases to authenticated;
revoke insert, update, delete on public.credit_purchases from anon, authenticated;

-- Credita atomicamente. Idempotente: webhooks repetidos não somam de novo.
create or replace function public.fulfill_credit_purchase(
  p_external_id text,
  p_provider_payment_id text,
  p_expected_amount numeric,
  p_paid_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  purchase public.credit_purchases%rowtype;
  new_balance integer;
begin
  if p_external_id is null or length(trim(p_external_id)) = 0 then
    raise exception 'invalid purchase';
  end if;

  select * into purchase
    from public.credit_purchases
    where external_id = p_external_id
    for update;

  if not found then
    raise exception 'purchase not found';
  end if;

  if p_expected_amount is null or purchase.amount_brl <> p_expected_amount then
    raise exception 'amount mismatch';
  end if;

  if p_provider_payment_id is null or length(trim(p_provider_payment_id)) = 0 then
    raise exception 'invalid provider payment';
  end if;

  if purchase.provider_payment_id is not null
    and purchase.provider_payment_id <> p_provider_payment_id then
    raise exception 'provider payment mismatch';
  end if;

  if purchase.credits <= 0 then
    raise exception 'invalid credits';
  end if;

  if purchase.credited_at is not null then
    select credits into new_balance from public.profiles where id = purchase.user_id;
    return jsonb_build_object(
      'ok', true,
      'already_credited', true,
      'credits_added', purchase.credits,
      'balance', coalesce(new_balance, 0),
      'user_id', purchase.user_id,
      'purchase_id', purchase.id
    );
  end if;

  update public.profiles
    set credits = credits + purchase.credits
    where id = purchase.user_id
    returning credits into new_balance;

  if not found then
    raise exception 'profile not found';
  end if;

  update public.credit_purchases
    set
      status = 'paid',
      provider_payment_id = coalesce(provider_payment_id, p_provider_payment_id),
      paid_at = coalesce(p_paid_at, now()),
      credited_at = now()
    where id = purchase.id;

  return jsonb_build_object(
    'ok', true,
    'already_credited', false,
    'credits_added', purchase.credits,
    'balance', new_balance,
    'user_id', purchase.user_id,
    'purchase_id', purchase.id
  );
end
$$;

revoke all on function public.fulfill_credit_purchase(text, text, numeric, timestamptz)
  from public, anon, authenticated;
grant execute on function public.fulfill_credit_purchase(text, text, numeric, timestamptz)
  to service_role;
