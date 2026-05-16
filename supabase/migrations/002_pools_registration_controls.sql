create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_open boolean not null default false,
  registration_open boolean not null default true,
  voting_open boolean not null default false,
  results_visible boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.pools enable row level security;

insert into public.pools (name, is_open, registration_open, voting_open, results_visible)
select 'Birthday Costume Pool', true, true, false, false
where not exists (select 1 from public.pools);

alter table public.participants
  add column if not exists pool_id uuid references public.pools(id) on delete cascade,
  add column if not exists character_name text;

alter table public.costumes
  add column if not exists pool_id uuid references public.pools(id) on delete cascade,
  add column if not exists participant_id uuid references public.participants(id) on delete set null;

alter table public.votes
  add column if not exists pool_id uuid references public.pools(id) on delete cascade;

update public.participants
set pool_id = (select id from public.pools where is_open = true order by created_at desc limit 1)
where pool_id is null;

update public.costumes
set pool_id = (select id from public.pools where is_open = true order by created_at desc limit 1)
where pool_id is null;

update public.votes
set pool_id = (
  select participants.pool_id
  from public.participants
  where participants.id = votes.participant_id
)
where pool_id is null;

alter table public.participants
  alter column pool_id set not null,
  alter column character_name set default '';

alter table public.costumes
  alter column pool_id set not null;

alter table public.votes
  alter column pool_id set not null;

alter table public.votes
  drop constraint if exists votes_participant_id_key;

create unique index if not exists votes_one_per_participant_per_pool
  on public.votes(pool_id, participant_id);

create unique index if not exists one_open_pool
  on public.pools(is_open)
  where is_open = true;

create unique index if not exists one_costume_per_participant_per_pool
  on public.costumes(pool_id, participant_id)
  where participant_id is not null;
