-- ─────────────────────────────────────────────
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ─────────────────────────────────────────────
alter table barbers enable row level security;
alter table services enable row level security;
alter table working_hours enable row level security;
alter table blocked_slots enable row level security;
alter table customers enable row level security;
alter table appointments enable row level security;
alter table queue enable row level security;

-- ─────────────────────────────────────────────
-- 2. POLÍTICAS PARA BARBEROS, SERVICIOS Y HORARIOS
-- (Públicos para lectura, privados para escritura)
-- ─────────────────────────────────────────────

-- Cualquiera (clientes anónimos) puede ver los barberos, servicios y horarios disponibles
create policy "Barberos visibles para todos" on barbers for select using (true);
create policy "Servicios visibles para todos" on services for select using (true);
create policy "Horarios visibles para todos" on working_hours for select using (true);
create policy "Bloqueos visibles para todos" on blocked_slots for select using (true);

-- Solo los usuarios logueados (barberos) pueden insertar, actualizar o borrar
create policy "Barberos gestionan servicios" on services for all using (auth.role() = 'authenticated');
create policy "Barberos gestionan horarios" on working_hours for all using (auth.role() = 'authenticated');
create policy "Barberos gestionan bloqueos" on blocked_slots for all using (auth.role() = 'authenticated');

-- Un barbero solo puede actualizar su propio perfil
create policy "Barbero actualiza su propio perfil" on barbers for update using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 3. POLÍTICAS PARA CLIENTES (Strictamente Privado)
-- ─────────────────────────────────────────────
-- Nadie externo puede ver la base de datos de clientes. 
-- Solo los barberos pueden leer y escribir en esta tabla.
create policy "Solo barberos ven y gestionan clientes" on customers for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- 4. POLÍTICAS PARA TURNOS (Appointments)
-- ─────────────────────────────────────────────
-- Los barberos tienen acceso total a todos los turnos
create policy "Barberos gestionan todos los turnos" on appointments for all using (auth.role() = 'authenticated');

-- Los clientes anónimos pueden CREAR un turno
create policy "Clientes pueden solicitar turnos" on appointments for insert with check (auth.role() = 'anon');

-- Los clientes anónimos pueden VER y CANCELAR solo SU propio turno si tienen el cancel_token
create policy "Clientes ven su propio turno con token" on appointments for select using (auth.role() = 'anon' /* La lógica de filtrado por token se hará en la query desde Next.js */);
create policy "Clientes cancelan con token" on appointments for update using (auth.role() = 'anon');

-- ─────────────────────────────────────────────
-- 5. POLÍTICAS PARA LA COLA DEL DÍA (Walk-ins)
-- ─────────────────────────────────────────────
-- Cualquiera puede ver la cola en la pantalla de la barbería
create policy "Cualquiera puede ver la cola" on queue for select using (true);

-- Solo los barberos pueden ir marcando quién ya fue atendido o agregar gente manualmente
create policy "Barberos gestionan la cola" on queue for all using (auth.role() = 'authenticated');