DROP POLICY IF EXISTS "equipes_select_own" ON equipes;
DROP POLICY IF EXISTS "equipes_select" ON equipes;
DROP POLICY IF EXISTS "equipes_insert_admin" ON equipes;
DROP POLICY IF EXISTS "equipes_insert" ON equipes;
DROP POLICY IF EXISTS "equipes_update_admin" ON equipes;
DROP POLICY IF EXISTS "equipes_update" ON equipes;

DROP POLICY IF EXISTS "corretores_select_own" ON corretores;
DROP POLICY IF EXISTS "corretores_select_equipe" ON corretores;
DROP POLICY IF EXISTS "corretores_select" ON corretores;
DROP POLICY IF EXISTS "corretores_insert_own" ON corretores;
DROP POLICY IF EXISTS "corretores_insert" ON corretores;
DROP POLICY IF EXISTS "corretores_update_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_equipe" ON corretores;
DROP POLICY IF EXISTS "corretores_update" ON corretores;
DROP POLICY IF EXISTS "corretores_delete_admin" ON corretores;
DROP POLICY IF EXISTS "corretores_delete" ON corretores;

DROP POLICY IF EXISTS "imoveis_select_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_select_public" ON imoveis;
DROP POLICY IF EXISTS "imoveis_insert_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_insert" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update_equipe" ON imoveis;
DROP POLICY IF EXISTS "imoveis_update" ON imoveis;
DROP POLICY IF EXISTS "imoveis_delete_own" ON imoveis;
DROP POLICY IF EXISTS "imoveis_delete" ON imoveis;

DROP POLICY IF EXISTS "leads_select_own" ON leads;
DROP POLICY IF EXISTS "leads_select_equipe" ON leads;
DROP POLICY IF EXISTS "leads_select_public" ON leads;
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_insert_public" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "leads_update_own" ON leads;
DROP POLICY IF EXISTS "leads_update_equipe" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_delete_own" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;

CREATE POLICY "equipes_select" ON equipes
  FOR SELECT USING (admin_user_id = auth.uid());

CREATE POLICY "equipes_insert" ON equipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "equipes_update" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());

CREATE POLICY "corretores_select" ON corretores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "corretores_insert" ON corretores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "corretores_update" ON corretores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "corretores_delete" ON corretores
  FOR DELETE USING (user_id = auth.uid() AND is_admin = false);

CREATE POLICY "imoveis_select_public" ON imoveis
  FOR SELECT USING (true);

CREATE POLICY "imoveis_insert" ON imoveis
  FOR INSERT WITH CHECK (true);

CREATE POLICY "imoveis_update" ON imoveis
  FOR UPDATE USING (true);

CREATE POLICY "imoveis_delete" ON imoveis
  FOR DELETE USING (true);

CREATE POLICY "leads_select_public" ON leads
  FOR SELECT USING (true);

CREATE POLICY "leads_insert" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_update" ON leads
  FOR UPDATE USING (true);

CREATE POLICY "leads_delete" ON leads
  FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_corretores_user_id ON corretores(user_id);
CREATE INDEX IF NOT EXISTS idx_corretores_equipe_id ON corretores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_corretor_id ON imoveis(corretor_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_equipe_id ON imoveis(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_corretor_id ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_equipe_id ON leads(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_imovel_id ON leads(imovel_id);
CREATE INDEX IF NOT EXISTS idx_leads_estagio ON leads(estagio);
