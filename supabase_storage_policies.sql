-- ============================================
-- SUPABASE STORAGE: Bucket 'imoveis' + Políticas RLS
-- Projeto: msyuluqmxdnvtsakusiu
-- Execute no SQL Editor: https://supabase.com/dashboard/project/msyuluqmxdnvtsakusiu/sql/new
-- ============================================

-- 1. Criar bucket 'imoveis' (público, 50MB, apenas imagens)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imoveis',
  'imoveis',
  true,
  52428800,  -- 50MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- 2. Remover políticas existentes para evitar erro de duplicação
drop policy if exists "Authenticated users can upload property images" on storage.objects;
drop policy if exists "Public upload for property images" on storage.objects;
drop policy if exists "Public read access for property images" on storage.objects;
drop policy if exists "Users can update own property images" on storage.objects;
drop policy if exists "Users can delete own property images" on storage.objects;

-- 3. Política: INSERT - Upload para usuários autenticados ou públicos
create policy "Authenticated users can upload property images"
on storage.objects for insert
to public
with check (
  bucket_id = 'imoveis'
);

-- 4. Política: SELECT - Leitura pública das imagens
create policy "Public read access for property images"
on storage.objects for select
to public
using (bucket_id = 'imoveis');

-- 5. Política: UPDATE - Atualizar imagens do bucket
create policy "Users can update own property images"
on storage.objects for update
to public
using (bucket_id = 'imoveis');

-- 6. Política: DELETE - Excluir imagens do bucket
create policy "Users can delete own property images"
on storage.objects for delete
to public
using (bucket_id = 'imoveis');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Confirmar bucket criado
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'imoveis';

-- Confirmar políticas criadas
select policyname, cmd, permissive, roles, qual, with_check
from pg_policies
where tablename = 'objects'
  and schemaname = 'storage'
  and policyname like '%property images%';