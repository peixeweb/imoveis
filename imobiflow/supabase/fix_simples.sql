DROP POLICY IF EXISTS "corretores_select_own" ON corretores;
DROP POLICY IF EXISTS "corretores_update_own" ON corretores;
DROP POLICY IF EXISTS "corretores_delete_admin" ON corretores;

CREATE POLICY "corretores_select_all" ON corretores FOR SELECT USING (true);

CREATE POLICY "corretores_update_own" ON corretores FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "corretores_delete_admin" ON corretores FOR DELETE USING (is_admin = false);
