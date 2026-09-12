-- ==========================================================================
-- MIGRATION: BUCKET DE AVATARES (Supabase Storage)
-- Cria o bucket `avatars` (público) e libera leitura/upload/update/delete
-- pela chave anon -- o app usa autenticação própria (contas_usuario),
-- sem Supabase Auth, então os avatares são públicos e qualquer usuário
-- autenticado pelo app (chave anon) pode enviar e apagar arquivos.
-- Idempotente: pode rodar quantas vezes quiser sem erro.
-- Os arquivos contam na cota de STORAGE (1 GB no free), não no banco.
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars anon upload" on storage.objects;
create policy "avatars anon upload" on storage.objects
  for insert with check (bucket_id = 'avatars');

drop policy if exists "avatars anon update" on storage.objects;
create policy "avatars anon update" on storage.objects
  for update using (bucket_id = 'avatars');

drop policy if exists "avatars anon delete" on storage.objects;
create policy "avatars anon delete" on storage.objects
  for delete using (bucket_id = 'avatars');