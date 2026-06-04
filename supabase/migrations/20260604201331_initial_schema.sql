-- ─────────────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- BARBEROS
-- Cada barbero tiene una cuenta de auth en Supabase.
-- Esta tabla extiende esa cuenta con datos del negocio.
-- ─────────────────────────────────────────────
create table barbers (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  phone       text,
  instagram   text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SERVICIOS
-- Cada barbero define sus propios servicios y duraciones.
-- ─────────────────────────────────────────────
create table services (
  id           uuid primary key default uuid_generate_v4(),
  barber_id    uuid not null references barbers(id) on delete cascade,
  name         text not null,           -- 'Corte', 'Barba', 'Combo'
  duration_min integer not null default 30,
  price        numeric(10,2),           -- opcional, para mostrar al cliente
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- HORARIOS LABORALES
-- Días y horas de trabajo por barbero.
-- day_of_week: 0=domingo, 1=lunes, ..., 6=sábado
-- ─────────────────────────────────────────────
create table working_hours (
  id           uuid primary key default uuid_generate_v4(),
  barber_id    uuid not null references barbers(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  is_active    boolean not null default true,
  constraint working_hours_barber_day unique (barber_id, day_of_week)
);

-- ─────────────────────────────────────────────
-- FRANJAS BLOQUEADAS
-- Horarios no disponibles: almuerzo, feriados, ausencias.
-- Si is_recurring=true, se repite cada semana en day_of_week.
-- Si is_recurring=false, aplica solo a blocked_date.
-- ─────────────────────────────────────────────
create table blocked_slots (
  id            uuid primary key default uuid_generate_v4(),
  barber_id     uuid not null references barbers(id) on delete cascade,
  label         text not null default 'No disponible',  -- 'Almuerzo', 'Feriado', etc.
  is_recurring  boolean not null default false,
  day_of_week   smallint check (day_of_week between 0 and 6),  -- solo si is_recurring=true
  blocked_date  date,                                           -- solo si is_recurring=false
  start_time    time not null,
  end_time      time not null,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- CLIENTES FRECUENTES
-- Se crean automáticamente cuando se confirma un turno.
-- El cliente NO tiene cuenta. Se identifica por teléfono.
-- ─────────────────────────────────────────────
create table customers (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  phone        text not null unique,
  instagram    text,
  notes        text,                    -- notas internas del barbero
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- TURNOS
-- Estado: pending → confirmed → attended
--                 → rejected
--                 → cancelled
-- cancel_token: token único para que el cliente cancele sin login
-- ─────────────────────────────────────────────
create type appointment_status as enum (
  'pending',
  'confirmed',
  'attended',
  'rejected',
  'cancelled'
);

create table appointments (
  id              uuid primary key default uuid_generate_v4(),
  barber_id       uuid not null references barbers(id) on delete restrict,
  service_id      uuid not null references services(id) on delete restrict,
  customer_id     uuid references customers(id) on delete set null,

  -- datos del cliente en el momento del turno (por si el customer se modifica después)
  customer_name   text not null,
  customer_phone  text not null,
  customer_instagram text,

  scheduled_date  date not null,
  scheduled_time  time not null,
  duration_min    integer not null,     -- copiado del servicio al momento de crear

  status          appointment_status not null default 'pending',
  reject_reason   text,                 -- motivo si status='rejected'
  created_by      text not null default 'client', -- 'client' | 'admin'
  cancel_token    uuid not null default uuid_generate_v4() unique,
  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices útiles para consultas frecuentes
create index on appointments (barber_id, scheduled_date);
create index on appointments (scheduled_date, status);
create index on appointments (cancel_token);
create index on appointments (customer_phone);

-- ─────────────────────────────────────────────
-- COLA DEL DÍA
-- Walk-ins: clientes sin turno que esperan en la barbería.
-- Se resetea cada día (manualmente o por cron).
-- ─────────────────────────────────────────────
create table queue (
  id           uuid primary key default uuid_generate_v4(),
  barber_id    uuid references barbers(id) on delete set null,
  name         text not null,
  service_name text not null,           -- texto libre, no FK (es rápido)
  queue_date   date not null default current_date,
  position     integer not null,
  is_attended  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index on queue (queue_date, is_attended);

-- ─────────────────────────────────────────────
-- FUNCIÓN: updated_at automático
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();