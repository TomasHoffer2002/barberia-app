create table push_subscriptions (
  id           uuid primary key default uuid_generate_v4(),
  barber_id    uuid not null references barbers(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index on push_subscriptions (barber_id);

alter table push_subscriptions enable row level security;

-- Solo el barbero dueño puede ver/insertar/borrar sus suscripciones
create policy "Barbero gestiona sus suscripciones" on push_subscriptions
  for all using (auth.uid() = barber_id);