-- Fix: infinite recursion in RLS policies
-- Usa equipes.admin_user_id para evitar recursão em corretores
-- Execute no SQL Editor do Supabase

-- 1. Drop recursive policies on corretores
DROP POLICY IF EXISTS "corretores_select_own" ON corretores;
DROP POLICY IF EXISTS "corretores_insert_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_own" ON corretores;
DROP POLICY IF EXISTS "corretores_delete_admin" ON corretores;

-- 2. Recreate corretores policies without recursion
CREATE POLICY "corretores_select_own" ON corretores
  FOR SELECT USING (
    user_id = auth.uid()
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
  );

CREATE POLICY "corretores_insert_own" ON corretores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "corretores_update_own" ON corretores
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (
      is_admin = false
      AND equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    )
  );

CREATE POLICY "corretores_delete_admin" ON corretores
  FOR DELETE USING (
    equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    AND is_admin = false
  );

-- 3. Drop and recreate policies on imoveis that reference corretores
DROP POLICY IF EXISTS "imoveis_select_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_insert_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_delete_own" ON imoveis;

CREATE POLICY "imoveis_select_own" ON imoveis
  FOR SELECT USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_insert_own" ON imoveis
  FOR INSERT WITH CHECK (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_update_own" ON imoveis
  FOR UPDATE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_delete_own" ON imoveis
  FOR DELETE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

-- 4. Drop and recreate policies on leads that reference corretores
DROP POLICY IF EXISTS "leads_select_own" ON leads;
DROP POLICY IF EXISTS "leads_update_own" ON leads;
DROP POLICY IF EXISTS "leads_delete_own" ON leads;

CREATE POLICY "leads_select_own" ON leads
  FOR SELECT USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_update_own" ON leads
  FOR UPDATE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_delete_own" ON leads
  FOR DELETE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

-- 5. Fix equipes policies (NÃO consultar corretores para evitar recursão)
DROP POLICY IF EXISTS "equipes_select_own" ON equipes;
DROP POLICY IF EXISTS "equipes_insert_admin" ON equipes;
DROP POLICY IF EXISTS "equipes_update_admin" ON equipes;

CREATE POLICY "equipes_select_own" ON equipes
  FOR SELECT USING (
    admin_user_id = auth.uid()
  );

CREATE POLICY "equipes_insert_admin" ON equipes
  FOR INSERT WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY "equipes_update_admin" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());
