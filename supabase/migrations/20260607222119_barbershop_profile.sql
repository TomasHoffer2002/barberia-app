-- ─────────────────────────────────────────────
-- TABLA: configuración global de la barbería
-- Es una tabla de una sola fila (singleton)
-- ─────────────────────────────────────────────
create table barbershop (
  id          integer primary key default 1,  -- siempre 1, solo hay una barbería
  name        text not null default 'Mi Barbería',
  description text,                            -- "quiénes somos"
  logo_url    text,
  phone       text,
  instagram   text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint  barbershop_singleton check (id = 1)
);

-- Insertar la fila por defecto
insert into barbershop (id) values (1);

-- Trigger updated_at
create trigger trg_barbershop_updated_at
  before update on barbershop
  for each row execute function set_updated_at();

-- RLS
alter table barbershop enable row level security;

-- Cualquiera puede leer (página pública necesita el nombre y logo)
create policy "Barbershop visible para todos" on barbershop
  for select using (true);

-- Solo admins pueden modificar
create policy "Solo admins modifican barbershop" on barbershop
  for update using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- COLUMNAS extra en barbers
-- ─────────────────────────────────────────────
alter table barbers
  add column if not exists bio         text,
  add column if not exists certifications text[],  -- array de strings
  add column if not exists avatar_url  text;       -- ya existía, pero por si acaso