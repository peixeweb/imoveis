-- ============================================
-- LIMPEZA DE IMOVEIS ANTIGOS (ANTERIORES A HOJE)
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/msyuluqmxdnvtsakusiu/sql/new
-- ============================================

-- 1. Excluir imóveis cadastrados em datas anteriores a hoje
DELETE FROM public.imoveis
WHERE created_at < '2026-08-21 00:00:00+00';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT id, titulo, corretor_nome, created_at FROM public.imoveis ORDER BY created_at DESC;
