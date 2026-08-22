-- ImobiFlow — Schema do Banco de Dados Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- ============================================
-- PASSO 1: CRIAR TODAS AS TABELAS
-- ============================================

-- 1. Tabela de equipes (imobiliárias)
CREATE TABLE IF NOT EXISTS equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de corretores
CREATE TABLE IF NOT EXISTS corretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  creci TEXT,
  modo TEXT NOT NULL DEFAULT 'solo',
  equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
  equipe_nome TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  is_admin BOOLEAN DEFAULT false,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de imóveis
CREATE TABLE IF NOT EXISTS imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  preco TEXT NOT NULL,
  localizacao TEXT,
  maps_link TEXT,
  specs TEXT,
  regra TEXT NOT NULL DEFAULT 'R$ 3.001 a R$ 5.000',
  imagens JSONB DEFAULT '[]',
  corretor_id UUID REFERENCES corretores(id) ON DELETE SET NULL,
  corretor_nome TEXT,
  corretor_creci TEXT,
  corretor_whatsapp TEXT,
  equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  documento TEXT,
  doc_tipo TEXT,
  doc_status TEXT,
  imovel_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
  imovel_nome TEXT,
  corretor_id UUID REFERENCES corretores(id) ON DELETE SET NULL,
  corretor_nome TEXT,
  corretor_creci TEXT,
  estagio TEXT DEFAULT 'Novo',
  whatsapp TEXT,
  equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASSO 2: ATIVAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 3: CRIAR POLÍTICAS DE SEGURANÇA
-- ============================================

-- Políticas para equipes
CREATE POLICY "equipes_select_own" ON equipes
  FOR SELECT USING (
    id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
    OR admin_user_id = auth.uid()
  );

CREATE POLICY "equipes_insert_admin" ON equipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "equipes_update_admin" ON equipes
  FOR UPDATE USING (admin_user_id = auth.uid());

-- Políticas para corretores
CREATE POLICY "corretores_select_own" ON corretores
  FOR SELECT USING (
    user_id = auth.uid()
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "corretores_insert_own" ON corretores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "corretores_update_own" ON corretores
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (is_admin = false AND equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid() AND is_admin = true))
  );

CREATE POLICY "corretores_delete_admin" ON corretores
  FOR DELETE USING (
    equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid() AND is_admin = true)
    AND is_admin = false
  );

-- Políticas para imoveis
CREATE POLICY "imoveis_select_own" ON imoveis
  FOR SELECT USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "imoveis_select_public" ON imoveis
  FOR SELECT USING (true);

CREATE POLICY "imoveis_insert_own" ON imoveis
  FOR INSERT WITH CHECK (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

CREATE POLICY "imoveis_update_own" ON imoveis
  FOR UPDATE USING (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

CREATE POLICY "imoveis_delete_own" ON imoveis
  FOR DELETE USING (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

-- Políticas para leads
CREATE POLICY "leads_select_own" ON leads
  FOR SELECT USING (
    corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid())
    OR equipe_id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_update_own" ON leads
  FOR UPDATE USING (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

CREATE POLICY "leads_delete_own" ON leads
  FOR DELETE USING (corretor_id IN (SELECT id FROM corretores WHERE user_id = auth.uid()));

-- ============================================
-- PASSO 4: ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_corretores_user_id ON corretores(user_id);
CREATE INDEX IF NOT EXISTS idx_corretores_equipe_id ON corretores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_corretor_id ON imoveis(corretor_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_equipe_id ON imoveis(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_corretor_id ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_equipe_id ON leads(equipe_id);
CREATE INDEX IF NOT EXISTS idx_leads_imovel_id ON leads(imovel_id);
CREATE INDEX IF NOT EXISTS idx_leads_estagio ON leads(estagio);