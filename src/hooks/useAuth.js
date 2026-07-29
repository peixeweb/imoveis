import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [appState, setAppState] = useState('loading');
  const [authScreen, setAuthScreen] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [corretorProfile, setCorretorProfile] = useState(null);

  const loadCorretorProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('corretores').select('*').eq('user_id', userId).single();
    if (data) {
      setCorretorProfile(data);
      setAppState('app');
    } else {
      setAppState('auth');
      setAuthScreen('signup-select');
    }
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        loadCorretorProfile(session.user.id);
      } else {
        setAppState('auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAppState('auth');
        setCurrentUser(null);
        setCorretorProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadCorretorProfile]);

  const handleLogin = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError('E-mail ou senha incorretos. Verifique e tente novamente.');
      setAuthLoading(false);
      return false;
    }
    setCurrentUser(data.user);
    await loadCorretorProfile(data.user.id);
    setAuthLoading(false);
    return true;
  }, [loadCorretorProfile]);

  const handleSignupSolo = useCallback(async ({ nome, creci, whatsapp, email, password }) => {
    if (!nome || !creci || !email || !password) {
      setAuthError('Preencha todos os campos obrigatórios.');
      return false;
    }
    setAuthLoading(true);
    setAuthError('');
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr) { setAuthError(authErr.message); setAuthLoading(false); return false; }
    const { data: corrData, error: corrErr } = await supabase.from('corretores').insert({
      user_id: authData.user.id,
      nome, whatsapp, creci,
      modo: 'solo', status: 'ativo', is_admin: true,
    }).select().single();
    if (corrErr) { setAuthError('Erro ao criar perfil: ' + corrErr.message); setAuthLoading(false); return false; }
    setCurrentUser(authData.user);
    setCorretorProfile(corrData);
    setAppState('app');
    setAuthLoading(false);
    return true;
  }, []);

  const handleSignupTeam = useCallback(async ({ equipeNome, nome, creci, whatsapp, email, password }) => {
    if (!equipeNome || !nome || !creci || !email || !password) {
      setAuthError('Preencha todos os campos obrigatórios.');
      return false;
    }
    setAuthLoading(true);
    setAuthError('');
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr) { setAuthError(authErr.message); setAuthLoading(false); return false; }
    const { data: equipeData, error: equipeErr } = await supabase.from('equipes').insert({ nome: equipeNome, admin_user_id: authData.user.id }).select().single();
    if (equipeErr) { setAuthError('Erro ao criar equipe: ' + equipeErr.message); setAuthLoading(false); return false; }
    const { data: corrData, error: corrErr } = await supabase.from('corretores').insert({
      user_id: authData.user.id,
      nome, whatsapp, creci,
      modo: 'team', equipe_id: equipeData.id, equipe_nome: equipeNome,
      status: 'ativo', is_admin: true,
    }).select().single();
    if (corrErr) { setAuthError('Erro ao criar perfil: ' + corrErr.message); setAuthLoading(false); return false; }
    setCurrentUser(authData.user);
    setCorretorProfile(corrData);
    setAppState('app');
    setAuthLoading(false);
    return true;
  }, []);

  const handleLogout = useCallback(async () => {
    if (window.confirm('Deseja sair da plataforma?')) {
      await supabase.auth.signOut();
    }
  }, []);

  return {
    appState, setAppState,
    authScreen, setAuthScreen,
    authError, setAuthError,
    authLoading, setAuthLoading,
    currentUser, setCurrentUser,
    corretorProfile, setCorretorProfile,
    handleLogin,
    handleSignupSolo,
    handleSignupTeam,
    handleLogout,
    loadCorretorProfile,
  };
}