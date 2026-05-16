alter table public.costumes
  add column if not exists participant_id uuid references public.participants(id) on delete set null;

create unique index if not exists one_costume_per_participant_per_pool
  on public.costumes(pool_id, participant_id)
  where participant_id is not null;
