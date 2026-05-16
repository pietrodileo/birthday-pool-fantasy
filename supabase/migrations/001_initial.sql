create extension if not exists pgcrypto;

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  login_code_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.costumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null unique references public.participants(id) on delete cascade,
  costume_id uuid not null references public.costumes(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.participants enable row level security;
alter table public.costumes enable row level security;
alter table public.votes enable row level security;
alter table public.admins enable row level security;

insert into public.participants (display_name, login_code_hash) values
  ('Alice', 'scrypt$8f4a159ac50f060e8c7632ea43b2f1b3$34a61e8c28cf4cb291ba289d0952bec035e3e9cbab98f697d2b9ef3414ac11191112afe98ac66445ffd75f526ee7d06dfbcd0053b9c72c2079d44b3809dee75a'),
  ('Marco', 'scrypt$e2b996076e2f0eed527a83f7d3c5db72$0f21f361632f9741524cbd6d2f6894f88a71ca43dbf7185e0aabc95513569d809f01d9db4ac347b5121c306349fcff01ee40eb1b2231b30824b26ac953994248'),
  ('Giulia', 'scrypt$04d242c628d5047bc05fe50ea8592b44$0d92e2f88e46a18fec9f70f4b4e56f8420d20aca9bf103e3305d8d6872eaf332679f8c1adc7ee35664fb090fdd7c900410050c2a9e4a33ad6b30e8d1502b8400'),
  ('Lorenzo', 'scrypt$f44e47cc3b0e1f4cd22952da2925245a$710cec5f5d40ab8d0061ac49d606c2980dd25e524a854194a175ec2cbc9c5a3a348b112bcb45f9ce691ead6817f79a5e350d07cae64ecab1ecb9e7901390d38f'),
  ('Sofia', 'scrypt$ad6263fe16e178e03c43131d9d5ba666$b6a098a7cf35892b7aa9d92d0c58ee047b04e51f6e472f297ebcad69cf14574bf9b10fa59c43c6e55dbe69c844a8a1c1ed004a3fec15e2a59d83925b224505f9'),
  ('Matteo', 'scrypt$8a240c21ac401e0ed90edd34e5e23540$6f22b9db06526c5d1d2e3b12f1e2c8214283a2b52bf6625334c8dabae830db632ec00263f67f82a913631e707280c2644028414a071f6b8f3b97812983bac6a1'),
  ('Chiara', 'scrypt$1b44f55c68a2efaf1741a06fd301ebf8$97bf8222d98dd92425046a5fccb1370d1ee1646098059dea89b6be149ea5eae5f26f69060cc981d96c61ae944158f638ed43541c371df9b3e7185953b3e394aa'),
  ('Davide', 'scrypt$244e7ff54d29b5f1586bb164aa5b0518$b2133d1132653c3f141d7d425912d405b5f5fab43c4344ee20ffb6e8e86086bce62b94ec1386f86cf4f090f58e6795f4dd27e4a4c8b8067c01ffecc90b7c346f');

insert into public.costumes (name, description) values
  ('The Silver Knight', 'Armor, cloak, noble stare.'),
  ('Forest Witch', 'Potion energy and woodland mystery.'),
  ('Dragon Tamer', 'Scales, leather, and dangerous confidence.'),
  ('Royal Bard', 'Music, drama, and too much charisma.');

insert into public.admins (username, password_hash) values
  ('admin', 'scrypt$51d9bd458b839cf779c6052cdeb35334$b707d15ac743feb8817fc4e3cac2d3122fd53d8ce1fd6aad669735b6dbdb5ac79df42ae9797c0462d84ff57de4cb2495d4ac8c00c57e9911a7c761ca8cfaa148');
