create table games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  city text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  level text,
  num_teams int not null,
  players_per_team int not null,
  price text not null,
  is_private boolean default false,
  password_plain text,
  organizer_name text not null,
  organizer_session_id text not null,
  created_at timestamptz default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  name text not null,
  session_id text not null,
  status text default 'active',
  opt_out_reason text,
  joined_at timestamptz default now()
);

alter table games enable row level security;
alter table players enable row level security;

create policy "Allow all games" on games for all using (true) with check (true);
create policy "Allow all players" on players for all using (true) with check (true);

-- Run this to add cross-device account uniqueness:
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_lower text not null,
  session_id text not null,
  password text not null,
  created_at timestamptz default now(),
  constraint users_name_lower_key unique (name_lower)
);

alter table users enable row level security;
create policy "Allow all users" on users for all using (true) with check (true);
