-- Fix: infinite recursion in RLS policies for corretores table
-- Execute this in Supabase SQL Editor

-- 1. Helper function that bypasses RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_corretor()
RETURNS TABLE (id UUID, equipe_id UUID, modo TEXT)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT c.id, c.equipe_id, c.modo
  FROM corretores c
  WHERE c.user_id = auth.uid()
  LIMIT 1;
$$;

-- 2. Drop recursive policies on corretores
DROP POLICY IF EXISTS "corretores_select_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_own" ON corretores;
DROP POLICY IF EXISTS "corretores_delete_admin" ON corretores;

-- 3. Recreate corretores policies without recursion
CREATE POLICY "corretores_select_own" ON corretores
  FOR SELECT USING (
    user_id = auth.uid()
    OR equipe_id = (SELECT equipe_id FROM public.get_current_corretor())
  );

CREATE POLICY "corretores_update_own" ON corretores
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (
      is_admin = false
      AND equipe_id = (SELECT equipe_id FROM public.get_current_corretor())
      AND (SELECT modo FROM public.get_current_corretor()) = 'team'
    )
  );

CREATE POLICY "corretores_delete_admin" ON corretores
  FOR DELETE USING (
    equipe_id = (SELECT equipe_id FROM public.get_current_corretor())
    AND is_admin = false
  );

-- 4. Drop and recreate policies on imoveis that reference corretores
DROP POLICY IF EXISTS "imoveis_select_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_insert_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_delete_own" ON imoveis;

CREATE POLICY "imoveis_select_own" ON imoveis
  FOR SELECT USING (
    corretor_id = (SELECT id FROM public.get_current_corretor())
    OR equipe_id = (SELECT equipe_id FROM public.get_current_corretor())
  );

CREATE POLICY "imoveis_insert_own" ON imoveis
  FOR INSERT WITH CHECK (
    corretor_id = (SELECT id FROM public.get_current_corretor())
  );

CREATE POLICY "imoveis_update_own" ON imoveis
  FOR UPDATE USING (
    corretor_id = (SELECT id FROM public.get_current_corretor())
  );

CREATE POLICY "imoveis_delete_own" ON imoveis
  FOR DELETE USING (
    corretor_id = (SELECT id FROM public.get_current_corretor())
  );

-- 5. Drop and recreate policies on leads that reference corretores
DROP POLICY IF EXISTS "leads_select_own" ON leads;
DROP POLICY IF EXISTS "leads_update_own" ON leads;
DROP POLICY IF EXISTS "leads_delete_own" ON leads;

CREATE POLICY "leads_select_own" ON leads
  FOR SELECT USING (
    corretor_id = (SELECT id FROM public.get_current_corretor())
    OR equipe_id = (SELECT equipe_id FROM public.get_current_corretor())
  );

CREATE POLICY "leads_update_own" ON leads
  FOR UPDATE USING (
    corretor_id = (SELECT id FROM public.get_current_corretor())
  );

CREATE POLICY "leads_delete_own" ON leads
  FOR DELETE USING (
    corretor_id = (SELECT id FROM public.get_current_corretor())
  );

-- 6. Also fix equipes policies to use the function
DROP POLICY IF EXISTS "equipes_select_own" ON equipes;
DROP POLICY IF EXISTS "equipes_update_admin" ON equipes;

CREATE POLICY "equipes_select_own" ON equipes
  FOR SELECT USING (
    id = (SELECT equipe_id FROM public.get_current_corretor())
    OR admin_user_id = auth.uid()
  );

CREATE POLICY "equipes_update_admin" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());
