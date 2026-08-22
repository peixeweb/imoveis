-- ============================================
-- REMOVA POLÍTICAS ANTIGAS
-- ============================================
DROP POLICY IF EXISTS "equipes_select_own" ON equipes;
DROP POLICY IF EXISTS "equipes_insert_admin" ON equipes;
DROP POLICY IF EXISTS "equipes_update_admin" ON equipes;

DROP POLICY IF EXISTS "corretores_select_own" ON corretores;
DROP POLICY IF EXISTS "corretores_select_equipe" ON corretores;
DROP POLICY IF EXISTS "corretores_insert_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_equipe" ON corretores;
DROP POLICY IF EXISTS "corretores_delete_admin" ON corretores;

DROP POLICY IF EXISTS "imoveis_select_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_select_public" ON imoveis;
DROP POLICY IF EXISTS "imoveis_insert_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update_equipe" ON imoveis;
DROP POLICY IF EXISTS "imoveis_delete_own" ON imoveis;

DROP POLICY IF EXISTS "leads_select_own" ON leads;
DROP POLICY IF EXISTS "leads_select_equipe" ON leads;
DROP POLICY IF EXISTS "leads_insert_public" ON leads;
DROP POLICY IF EXISTS "leads_update_own" ON leads;
DROP POLICY IF EXISTS "leads_update_equipe" ON leads;
DROP POLICY IF EXISTS "leads_delete_own" ON leads;

-- ============================================
-- POLÍTICAS CORRIGIDAS
-- ============================================

CREATE POLICY "equipes_select_own" ON equipes
  FOR SELECT USING (
    id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
    OR admin_user_id = auth.uid()
  );

CREATE POLICY "equipes_insert_admin" ON equipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "equipes_update_admin" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());

CREATE POLICY "corretores_select_own" ON corretores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "corretores_select_equipe" ON corretores
  FOR SELECT USING (
    equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "corretores_insert_own" ON corretores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "corretores_update_own" ON corretores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "corretores_update_equipe" ON corretores
  FOR UPDATE USING (
    equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "corretores_delete_admin" ON corretores
  FOR DELETE USING (
    user_id = auth.uid()
    AND is_admin = false
  );

CREATE POLICY "imoveis_select_own" ON imoveis
  FOR SELECT USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_select_public" ON imoveis
  FOR SELECT USING (true);

CREATE POLICY "imoveis_insert_own" ON imoveis
  FOR INSERT WITH CHECK (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_update_own" ON imoveis
  FOR UPDATE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_update_equipe" ON imoveis
  FOR UPDATE USING (
    equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_delete_own" ON imoveis
  FOR DELETE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_select_own" ON leads
  FOR SELECT USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_update_own" ON leads
  FOR UPDATE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_update_equipe" ON leads
  FOR UPDATE USING (
    equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_delete_own" ON leads
  FOR DELETE USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
  );

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_corretores_user_id ON corretores(user_id);
CREATE INDEX IF NOT EXISTS idx_corretores_equipe_id ON corretores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_corretor_id ON imoveis(corretor_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_equipe_id ON imoveis(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_corretor_id ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_equipe_id ON leads(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_imovel_id ON leads(imovel_id);
CREATE INDEX IF NOT EXISTS idx_leads_estagio ON leads(estagio);
