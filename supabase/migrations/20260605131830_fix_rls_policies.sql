-- Eliminar las políticas inseguras
drop policy "Clientes ven su propio turno con token" on appointments;
drop policy "Clientes cancelan con token" on appointments;

-- Reemplazar con políticas correctas
create policy "Clientes ven su turno con token" on appointments
  for select
  using (
    auth.role() = 'anon' and
    cancel_token::text = current_setting('request.headers', true)::json->>'x-cancel-token'
  );

create policy "Clientes cancelan su turno con token" on appointments
  for update
  using (
    auth.role() = 'anon' and
    status in ('pending', 'confirmed')
  )
  with check (
    cancel_token::text = current_setting('request.headers', true)::json->>'x-cancel-token'
    and status = 'cancelled'
);

drop policy "Barberos gestionan servicios" on services;
drop policy "Barberos gestionan horarios" on working_hours;
drop policy "Barberos gestionan bloqueos" on blocked_slots;

-- Cada barbero solo puede modificar lo suyo
create policy "Barberos gestionan sus servicios" on services
  for all using (auth.uid() = barber_id);

create policy "Barberos gestionan sus horarios" on working_hours
  for all using (auth.uid() = barber_id);

create policy "Barberos gestionan sus bloqueos" on blocked_slots
  for all using (auth.uid() = barber_id);