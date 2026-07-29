-- CORREÇÃO DIRETA: Cria perfil team + equipe para peixeweb1968@gmail.com
-- O email já está registrado no auth, mas o perfil corretores não foi criado

DO $$
DECLARE
  v_user_id uuid;
  v_equipe_id uuid;
  r record;
BEGIN
  -- Descobre o user_id do auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'peixeweb1968@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'ERRO: Usuário auth não encontrado';
    RETURN;
  END IF;

  RAISE NOTICE 'User ID: %', v_user_id;

  -- Remove perfis SOLO incorretos (criados pelo auto-create)
  DELETE FROM public.corretores WHERE user_id = v_user_id AND modo = 'solo';
  RAISE NOTICE 'Perfis solo removidos';

  -- Verifica se já existe um perfil TEAM para este user_id
  IF EXISTS (SELECT 1 FROM public.corretores WHERE user_id = v_user_id AND modo = 'team') THEN
    RAISE NOTICE 'Perfil team já existe. Nada a fazer.';
    RETURN;
  END IF;

  -- Verifica se já existe uma equipe órfã (criada em tentativa anterior)
  SELECT id INTO v_equipe_id FROM public.equipes WHERE admin_user_id = v_user_id LIMIT 1;

  IF v_equipe_id IS NULL THEN
    INSERT INTO public.equipes (nome, admin_user_id)
    VALUES ('Peixeweb Imóveis', v_user_id)
    RETURNING id INTO v_equipe_id;
    RAISE NOTICE 'Equipe criada: %', v_equipe_id;
  ELSE
    RAISE NOTICE 'Equipe existente encontrada: %', v_equipe_id;
  END IF;

  -- Remove equipes órfãs duplicadas
  DELETE FROM public.equipes 
  WHERE admin_user_id = v_user_id AND id != v_equipe_id
  AND NOT EXISTS (SELECT 1 FROM public.corretores WHERE equipe_id = public.equipes.id);

  -- Cria o perfil do corretor como admin da equipe
  INSERT INTO public.corretores (user_id, nome, creci, whatsapp, modo, equipe_id, equipe_nome, status, is_admin)
  VALUES (v_user_id, 'Sabino Peixeweb', 'PENDENTE', '', 'team', v_equipe_id, (SELECT nome FROM public.equipes WHERE id = v_equipe_id), 'ativo', true);

  RAISE NOTICE 'Perfil team criado com sucesso!';

  -- Verificação final
  FOR r IN SELECT id, modo, equipe_nome, is_admin FROM public.corretores WHERE user_id = v_user_id LOOP
    RAISE NOTICE 'Corretor: ID=%, modo=%, equipe=%, admin=%', r.id, r.modo, r.equipe_nome, r.is_admin;
  END LOOP;
  FOR r IN SELECT id, nome FROM public.equipes WHERE admin_user_id = v_user_id LOOP
    RAISE NOTICE 'Equipe: ID=%, nome=%', r.id, r.nome;
  END LOOP;
END $$;

-- Mostra resultado final em tabela
SELECT 'CORRETORES' as tipo, id, user_id::text, nome, modo, equipe_nome, is_admin FROM public.corretores WHERE user_id = (SELECT id FROM auth.users WHERE email = 'peixeweb1968@gmail.com');
SELECT 'EQUIPES' as tipo, id, nome, admin_user_id::text FROM public.equipes WHERE admin_user_id = (SELECT id FROM auth.users WHERE email = 'peixeweb1968@gmail.com');
