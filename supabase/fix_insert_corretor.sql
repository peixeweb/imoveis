-- Fix: permite que admin da equipe insira novos corretores sem user_id
-- Execute no SQL Editor do Supabase

DROP POLICY IF EXISTS "corretores_insert_own" ON corretores;

CREATE POLICY "corretores_insert_own" ON corretores
  FOR INSERT WITH CHECK (
    -- Próprio cadastro (signup)
    user_id = auth.uid()
    OR
    -- Admin adicionando corretor à equipe
    (
      is_admin = false
      AND equipe_id = (SELECT equipe_id FROM public.get_current_corretor())
      AND (SELECT modo FROM public.get_current_corretor()) = 'team'
      AND (SELECT is_admin FROM public.get_current_corretor()) = true
    )
  );
