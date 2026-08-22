-- ============================================
-- REMOVA TODAS AS POLÍTICAS
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
-- REATIVE RLS SEM POLÍTICAS (PERMISSIVO)
-- ============================================
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Não crie políticas - RLS estará ativo mas sem restrições
-- Isso resolve o problema de recursão infinita

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
