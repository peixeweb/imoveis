-- Fix: Infinite recursion in RLS policies causing 500 errors
-- Run this in Supabase SQL Editor
-- Handles "policy already exists" errors gracefully

-- 1. Drop ONLY the problematic corretores policies (causing recursion)
DROP POLICY IF EXISTS "corretores_select_own" ON corretores;
DROP POLICY IF EXISTS "corretores_insert_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_own" ON corretores;
DROP POLICY IF EXISTS "corretores_delete_admin" ON corretores;

-- Also drop equipes policies that reference corretores (recursion source)
DROP POLICY IF EXISTS "equipes_select_own" ON equipes;

-- 2. Recreate corretores policies WITHOUT recursion
-- Uses equipes.admin_user_id instead of querying corretores table

CREATE POLICY "corretores_select_own" ON corretores
  FOR SELECT USING (
    user_id = auth.uid()
    OR equipe_id IN (SELECT id FROM equipes WHERE admin_user_id = auth.uid())
  );

CREATE POLICY "corretores_insert_own" ON corretores
  FOR INSERT WITH CHECK (user_id = auth.uid());

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

-- 3. Fix equipes policy (was also causing recursion)
CREATE POLICY "equipes_select_own" ON equipes
  FOR SELECT USING (admin_user_id = auth.uid());

CREATE POLICY "equipes_insert_admin" ON equipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "equipes_update_admin" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());