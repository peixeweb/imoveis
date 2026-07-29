-- Cria uma equipe para o admin e vincula ao perfil
-- Substitua 'c8f605cd-0ab1-4adc-8ea3-4b3466ef48a1' pelo seu userId

DO $$
DECLARE
  v_user_id UUID := 'c8f605cd-0ab1-4adc-8ea3-4b3466ef48a1';
  v_equipe_id UUID;
  v_corretor_id UUID;
BEGIN
  -- Busca o corretor do admin
  SELECT id INTO v_corretor_id FROM corretores WHERE user_id = v_user_id LIMIT 1;
  IF v_corretor_id IS NULL THEN
    RAISE EXCEPTION 'Corretor não encontrado para este user_id';
  END IF;

  -- Cria a equipe se não existir
  INSERT INTO equipes (nome, admin_user_id)
  SELECT 'Minha Imobiliária', v_user_id
  WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE admin_user_id = v_user_id)
  RETURNING id INTO v_equipe_id;

  IF v_equipe_id IS NULL THEN
    -- Já existe, pega o ID
    SELECT id INTO v_equipe_id FROM equipes WHERE admin_user_id = v_user_id;
  END IF;

  -- Atualiza o corretor com o equipe_id
  UPDATE corretores 
  SET equipe_id = v_equipe_id, modo = 'team', is_admin = true
  WHERE id = v_corretor_id;

  RAISE NOTICE 'Equipe criada: %', v_equipe_id;
  RAISE NOTICE 'Corretor atualizado: %', v_corretor_id;
END $$;
