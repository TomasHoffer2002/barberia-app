-- Agregamos la columna price a los turnos para tener un registro histórico
-- Se le pone default 0 para no romper los turnos que ya tenías creados
alter table appointments
  add column price numeric(10,2) not null default 0;