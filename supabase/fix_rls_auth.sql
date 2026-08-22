-- Correção da RLS para permitir cadastro de administradores
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Remover políticas antigas
DROP POLICY IF EXISTS "equipes_insert_admin" ON equipes;

-- Nova política que permite qualquer usuário autenticado criar equipe
-- (a verificação de dados válidos continua no aplicativo)
CREATE POLICY "equipes_insert_admin" ON equipes
  FOR INSERT WITH CHECK (true);

-- Atualizar política de corretores para permitir inserção direta
DROP POLICY IF EXISTS "corretores_insert_own" ON corretores;
CREATE POLICY "corretores_insert_own" ON corretores
  FOR INSERT WITH CHECK (true);

-- Atualizar política de equipes para permitir leitura
DROP POLICY IF EXISTS "equipes_select_own" ON equipes;
CREATE POLICY "equipes_select_own" ON equipes
  FOR SELECT USING (
    id IN (SELECT equipe_id FROM corretores WHERE user_id = auth.uid())
    OR admin_user_id = auth.uid()
  );
