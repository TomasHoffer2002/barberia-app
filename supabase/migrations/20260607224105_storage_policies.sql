-- Políticas para bucket avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos', 'logos', true, 2097152,
  array['image/jpeg','image/png','image/webp','image/svg+xml']
) on conflict (id) do nothing;

-- Cualquiera puede ver las imágenes (buckets públicos)
create policy "Avatars públicos" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Logos públicos" on storage.objects
  for select using (bucket_id = 'logos');

-- Solo admins pueden subir/actualizar/borrar
create policy "Admins suben avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Admins actualizan avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Admins borran avatars" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Admins suben logos" on storage.objects
  for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');

create policy "Admins actualizan logos" on storage.objects
  for update using (bucket_id = 'logos' and auth.role() = 'authenticated');

create policy "Admins borran logos" on storage.objects
  for delete using (bucket_id = 'logos' and auth.role() = 'authenticated');