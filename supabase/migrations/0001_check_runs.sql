create table if not exists public.check_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  intent_id text not null,
  target_repo text not null,
  git_head text,
  source text not null,
  model_hash text not null,
  intent_hash text not null,
  pass boolean not null,
  counts jsonb not null,
  files jsonb not null
);

alter table public.check_runs enable row level security;

drop policy if exists "anon_select_check_runs" on public.check_runs;
create policy "anon_select_check_runs"
  on public.check_runs
  for select
  to anon
  using (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.check_runs to anon, authenticated;
grant all on table public.check_runs to service_role;
