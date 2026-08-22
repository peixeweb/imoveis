-- Função para criar perfil de administrador sem violar RLS
-- Execute esta função no SQL Editor do Supabase Dashboard

-- Função para criar equipe e perfil de admin em uma única transação
CREATE OR REPLACE FUNCTION public.create_admin_profile(
  p_email TEXT,
  p_password TEXT,
  p_nome TEXT,
  p_creci TEXT,
  p_whatsapp TEXT,
  p_equipe_nome TEXT
)
RETURNS TABLE(
  user_id UUID,
  equipe_id UUID,
  corretor_id UUID,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_equipe_id UUID;
  v_corretor_id UUID;
BEGIN
  -- Cria o usuário no Auth (sem verificar RLS)
  INSERT INTO auth.users (email, encrypted_password, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    jsonb_build_object('provider', 'email'),
    jsonb_build_object('name', p_nome),
    false,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  -- Cria a equipe
  INSERT INTO public.equipes (nome, admin_user_id)
  VALUES (p_equipe_nome, v_user_id)
  RETURNING id INTO v_equipe_id;
  
  -- Cria o perfil do corretor
  INSERT INTO public.corretores (
    user_id,
    nome,
    creci,
    whatsapp,
    modo,
    equipe_id,
    equipe_nome,
    status,
    is_admin
  ) VALUES (
    v_user_id,
    p_nome,
    p_creci,
    p_whatsapp,
    'team',
    v_equipe_id,
    p_equipe_nome,
    'ativo',
    true
  )
  RETURNING id INTO v_corretor_id;
  
  RETURN QUERY SELECT v_user_id, v_equipe_id, v_corretor_id, NULL::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::UUID, SQLERRM;
END;
$$;

-- Função para criar apenas o perfil de corretor (modo solo)
CREATE OR REPLACE FUNCTION public.create_solo_profile(
  p_user_id UUID,
  p_nome TEXT,
  p_creci TEXT,
  p_whatsapp TEXT
)
RETURNS TABLE(
  corretor_id UUID,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.corretores (
    user_id,
    nome,
    creci,
    whatsapp,
    modo,
    status,
    is_admin
  ) VALUES (
    p_user_id,
    p_nome,
    p_creci,
    p_whatsapp,
    'solo',
    'ativo',
    true
  )
  RETURNING id INTO corretor_id;
  
  RETURN QUERY SELECT corretor_id, NULL::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, SQLERRM;
END;
$$;
