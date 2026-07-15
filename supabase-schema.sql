create table if not exists public.aquamind_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.aquamind_states enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.aquamind_states to authenticated;

drop policy if exists "aquamind read own state" on public.aquamind_states;
drop policy if exists "aquamind insert own state" on public.aquamind_states;
drop policy if exists "aquamind update own state" on public.aquamind_states;

create policy "aquamind read own state"
on public.aquamind_states
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "aquamind insert own state"
on public.aquamind_states
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "aquamind update own state"
on public.aquamind_states
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
