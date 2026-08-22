-- ============================================
-- POLÍTICAS RLS PARA PRODUÇÃO
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. POLÍTICAS PARA equipes
-- ============================================
CREATE POLICY "equipes_select" ON equipes
  FOR SELECT USING (
    id IN (
      SELECT equipe_id FROM corretores 
      WHERE user_id = auth.uid()
    ) OR admin_user_id = auth.uid()
  );

CREATE POLICY "equipes_insert" ON equipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "equipes_update" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());

-- ============================================
-- 2. POLÍTICAS PARA corretores
-- ============================================
CREATE POLICY "corretores_select" ON corretores
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "corretores_insert" ON corretores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "corretores_update" ON corretores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "corretores_delete" ON corretores
  FOR DELETE USING (
    user_id = auth.uid() AND is_admin = false
  );

-- ============================================
-- 3. POLÍTICAS PARA imoveis
-- ============================================
CREATE POLICY "imoveis_select_public" ON imoveis
  FOR SELECT USING (true);

CREATE POLICY "imoveis_insert" ON imoveis
  FOR INSERT WITH CHECK (true);

CREATE POLICY "imoveis_update" ON imoveis
  FOR UPDATE USING (true);

CREATE POLICY "imoveis_delete" ON imoveis
  FOR DELETE USING (true);

-- ============================================
-- 4. POLÍTICAS PARA leads
-- ============================================
CREATE POLICY "leads_select_public" ON leads
  FOR SELECT USING (true);

CREATE POLICY "leads_insert" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_update" ON leads
  FOR UPDATE USING (true);

CREATE POLICY "leads_delete" ON leads
  FOR DELETE USING (true);

-- ============================================
-- 5. ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_corretores_user_id ON corretores(user_id);
CREATE INDEX IF NOT EXISTS idx_corretores_equipe_id ON corretores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_corretor_id ON imoveis(corretor_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_equipe_id ON imoveis(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_corretor_id ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_equipe_id ON leads(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_imovel_id ON leads(imovel_id);
CREATE INDEX IF NOT EXISTS idx_leads_estagio ON leads(estagio);
