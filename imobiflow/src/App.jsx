import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Home,
  Users,
  Plus,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Phone,
  FileText,
  UserCheck,
  Building,
  Layers,
  ArrowUpRight,
  Trash2,
  Menu,
  X,
  LogOut,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import useAuth from './hooks/useAuth';
import useData, { mapProperty, mapLead, mapBroker } from './hooks/useData';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import SEOHead from './components/SEOHead';
import { getPropertyPublicURL, findPropertyBySlug, getPropertySEOSlug } from './lib/seoUtils';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const INCOME_FAIXAS = [
  { value: 'Até R$ 3.000', escore: 25, label: 'Até R$ 3.000' },
  { value: 'R$ 3.000 a R$ 5.000', escore: 50, label: 'R$ 3.000 a R$ 5.000' },
  { value: 'R$ 5.000 a R$ 7.000', escore: 75, label: 'R$ 5.000 a R$ 7.000' },
  { value: 'R$ 7.000 a R$ 10.000', escore: 100, label: 'R$ 7.000 a R$ 10.000' },
  { value: 'Acima de R$ 10.000', escore: 100, label: 'Acima de R$ 10.000' },
];

function getMinEscore(rule) {
  const found = INCOME_FAIXAS.find(f => f.value === rule);
  const escore = found ? found.escore : 25;
  return escore < 50 ? 50 : escore;
}

async function groqChat(systemPrompt, messages) {
  if (!GROQ_API_KEY) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7, max_tokens: 500
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

// ===== MAIN APP =====
export default function App() {
  const {
    appState, setAppState,
    authScreen, setAuthScreen,
    authError, setAuthError,
    authLoading, setAuthLoading,
    currentUser, setCurrentUser,
    corretorProfile, setCorretorProfile,
  } = useAuth();

  const {
    properties, setProperties,
    leads, setLeads,
    brokers, setBrokers,
    roundRobinIndex, setRoundRobinIndex,
    loadingData, setLoadingData,
    loadAllData,
    refreshData,
  } = useData();

  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupNome, setSignupNome] = useState('');
  const [signupCreci, setSignupCreci] = useState('');
  const [signupWhatsapp, setSignupWhatsapp] = useState('');
  const [signupEquipeNome, setSignupEquipeNome] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- UI ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [lastCreatedProperty, setLastCreatedProperty] = useState(null);

  // --- Public view & Legal Pages ---
  const urlParams = new URLSearchParams(window.location.search);
  const urlImovelParam = urlParams.get('imovel');
  const urlPageParam = urlParams.get('page');
  const urlSlugParam = urlParams.get('slug');

  // URL Limpa por Path Slug: ex. /casa-em-parque-piaui-teresina-quadra-63-piaui
  const pathname = window.location.pathname;
  let pathSlug = '';
  // Remove leading slash and ignore index.html
  const cleanPath = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (cleanPath && cleanPath !== 'index.html' && !cleanPath.startsWith('api/') && !cleanPath.startsWith('assets/') && !cleanPath.includes('.')) {
    pathSlug = decodeURIComponent(cleanPath);
  }

  const activeSlug = pathSlug || urlSlugParam;
  const isPublicView = !!(urlImovelParam || activeSlug);
  const [publicProperty, setPublicProperty] = useState(null);
  const [publicLoading, setPublicLoading] = useState(isPublicView);
  const [legalViewPage, setLegalViewPage] = useState(
    urlPageParam === 'politica-de-privacidade' ? 'privacy' :
    urlPageParam === 'termos-de-uso' ? 'terms' : null
  );

  // --- Simulator ---
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [simStep, setSimStep] = useState(0);
  const [simInputName, setSimInputName] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);
  const [groqHistory, setGroqHistory] = useState([]);
  const [publicLeadName, setPublicLeadName] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(true);

  // --- New Property form ---
  const [newProperty, setNewProperty] = useState({
    title: '', price: '', location: '', mapsLink: '', specs: '',
    rule: 'R$ 3.001 a R$ 5.000', images: [], brokerName: '', brokerCreci: '', brokerWhatsapp: ''
  });
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImageRatio, setTempImageRatio] = useState('1:1');
  const [tempImagePreview, setTempImagePreview] = useState('');

  // ===== EFFECTS =====
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatMessages, isTyping]);

  useEffect(() => { setSignupEmail(''); setSignupPassword(''); setSignupNome(''); setSignupCreci(''); setSignupWhatsapp(''); setSignupEquipeNome(''); setLoginEmail(''); setLoginPassword(''); }, [authScreen]);

  useEffect(() => { if (activeTab === 'novo_imovel') setNewProperty({ title: '', price: '', location: '', mapsLink: '', specs: '', rule: 'R$ 3.001 a R$ 5.000', images: [], brokerName: '', brokerCreci: '', brokerWhatsapp: '' }); }, [activeTab]);

  useEffect(() => {
    // Public landing page - load property without auth
    if (isPublicView) {
      if (urlImovelParam) {
        supabase.from('imoveis').select('*').eq('id', urlImovelParam).single().then(({ data }) => {
          if (data) setPublicProperty(mapProperty(data));
          setPublicLoading(false);
        });
      } else if (activeSlug) {
        supabase.from('imoveis').select('*').then(({ data }) => {
          if (data && data.length > 0) {
            const mappedList = data.map(mapProperty);
            const found = findPropertyBySlug(mappedList, activeSlug);
            if (found) setPublicProperty(found);
          }
          setPublicLoading(false);
        });
      } else {
        setPublicLoading(false);
      }
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        const found = await loadCorretorProfile(session.user.id);
        if (!found) {
          setSignupEmail(session.user.email || '');
          setAuthScreen('signup-select');
        }
      } else {
        setAppState('auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAppState('auth');
        setCurrentUser(null);
        setCorretorProfile(null);
        setProperties([]);
        setLeads([]);
        setBrokers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties]);

  // ===== DATA LOADERS =====
  const loadCorretorProfile = async (userId) => {
    const { data, error } = await supabase.from('corretores').select('*').eq('user_id', userId);
    if (error) { alert('Erro ao buscar perfil: ' + error.message); setAppState('auth'); setAuthScreen('signup-select'); return false; }
    if (data && data.length >= 1) {
      setCorretorProfile(data[0]);
      setActiveTab(data[0].modo === 'team' ? 'equipe' : 'dashboard');
      await loadAllData(data[0]);
      setAppState('app');
      return true;
    } else {
      setAppState('auth');
      setAuthScreen('signup-select');
      return false;
    }
  };

  const handleRefreshData = () => corretorProfile && refreshData(corretorProfile);

  // ===== AUTH HANDLERS =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) { setAuthError('E-mail ou senha incorretos. Verifique e tente novamente.'); setAuthLoading(false); return; }
      if (!data?.user) { setAuthError('Usuário não encontrado.'); setAuthLoading(false); return; }
      setCurrentUser(data.user);
      const found = await loadCorretorProfile(data.user.id);
      if (!found) {
        // Pré-preenche o email do cadastro com o email do login
        setSignupEmail(loginEmail);
        setSignupPassword(loginPassword);
        setAuthError('Perfil não encontrado. Escolha como deseja se cadastrar.');
        setAuthScreen('signup-select');
      }
    } catch (err) {
      setAuthError('Erro inesperado: ' + err.message);
    }
    setAuthLoading(false);
  };

  const signupOrCreateProfile = async (modo, equipeData) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email: signupEmail, password: signupPassword });
      if (authErr && !(authErr.code === 'user_already_exists' || authErr.status === 422 || /already registered/i.test(authErr.message || ''))) { setAuthError(authErr.message); setAuthLoading(false); return false; }
      let userId;
      let loginData = null;
      if (authData?.user) {
        userId = authData.user.id;
      } else {
        // Email já existe - tenta login para pegar o user_id
        const { data: ld, error: loginErr } = await supabase.auth.signInWithPassword({ email: signupEmail, password: signupPassword });
        if (loginErr || !ld?.user) { setAuthError('Este e-mail já está cadastrado com outra senha. Faça login.'); setAuthLoading(false); return false; }
        loginData = ld;
        userId = ld.user.id;
      }
      // Verifica se já tem perfil
      const { data: existing } = await supabase.from('corretores').select('id').eq('user_id', userId);
      if (existing && existing.length > 0) {
        // Já tem perfil - faz login direto
        setCurrentUser(authData?.user || loginData.user);
        await loadCorretorProfile(userId);
        setAuthLoading(false);
        return true;
      }
      // Cria o perfil
      let equipeId = null;
      if (modo === 'team') {
        if (!equipeData) { setAuthError('Dados da equipe não informados.'); setAuthLoading(false); return false; }
        const { data: eqData, error: eqErr } = await supabase.from('equipes').insert({ nome: equipeData.nome, admin_user_id: userId }).select().single();
        if (eqErr) { setAuthError('Erro ao criar equipe: ' + eqErr.message); setAuthLoading(false); return false; }
        equipeId = eqData.id;
      }
      const { data: corrData, error: corrErr } = await supabase.from('corretores').insert({
        user_id: userId,
        nome: signupNome, whatsapp: signupWhatsapp, creci: signupCreci,
        modo, equipe_id: equipeId, equipe_nome: equipeData?.nome || null,
        status: 'ativo', is_admin: true,
      }).select().single();
      if (corrErr) { setAuthError('Erro ao criar perfil: ' + corrErr.message); setAuthLoading(false); return false; }
      setCurrentUser(authData?.user || loginData.user);
      setCorretorProfile(corrData);
      await loadAllData(corrData);
      setAppState('app');
      setActiveTab(modo === 'team' ? 'equipe' : 'dashboard');
      setAuthLoading(false);
      return true;
    } catch (err) {
      setAuthError('Erro inesperado: ' + err.message);
      setAuthLoading(false);
      return false;
    }
  };

  const handleSignupSolo = async (e) => {
    e.preventDefault();
    if (!signupNome || !signupCreci || !signupEmail || !signupPassword) { setAuthError('Preencha todos os campos obrigatórios.'); return; }
    signupOrCreateProfile('solo', null);
  };

  const handleSignupTeam = async (e) => {
    e.preventDefault();
    if (!signupEquipeNome || !signupNome || !signupCreci || !signupEmail || !signupPassword) { setAuthError('Preencha todos os campos obrigatórios.'); return; }
    signupOrCreateProfile('team', { nome: signupEquipeNome });
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja sair da plataforma?')) await supabase.auth.signOut();
  };

  // ===== PROPERTY HANDLERS =====
  const handleTempImageUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) { setTempImageFile(file); setTempImagePreview(URL.createObjectURL(file)); }
  };

  const handleAddTempImage = () => {
    if (!tempImagePreview) return;
    setNewProperty(prev => ({ ...prev, images: [...prev.images, { url: tempImagePreview, ratio: tempImageRatio }] }));
    setTempImageFile(null); setTempImagePreview('');
    const fi = document.getElementById('property-image-file-input');
    if (fi) fi.value = '';
  };

  const handleRemoveImage = (idx) => {
    setNewProperty(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!newProperty.title || !newProperty.price) return;

    let cNome = corretorProfile.nome;
    let cCreci = corretorProfile.creci;
    let cWhatsapp = corretorProfile.whatsapp;

    if (corretorProfile.modo === 'team' && newProperty.brokerName) {
      const found = brokers.find(b => b.name === newProperty.brokerName);
      if (found) { cNome = found.name; cCreci = found.creci; cWhatsapp = found.whatsapp; }
    }

    const { data, error } = await supabase.from('imoveis').insert({
      titulo: newProperty.title, preco: newProperty.price,
      localizacao: newProperty.location, maps_link: newProperty.mapsLink,
      specs: newProperty.specs, regra: newProperty.rule,
      imagens: newProperty.images,
      corretor_id: corretorProfile.id, corretor_nome: cNome, corretor_creci: cCreci, corretor_whatsapp: cWhatsapp,
      equipe_id: corretorProfile.equipe_id || null,
      leads_count: 0,
    }).select().single();

    if (error) { alert('Erro ao cadastrar imóvel: ' + error.message); return; }

    const mapped = mapProperty(data);
    setProperties(prev => [mapped, ...prev]);
    setLastCreatedProperty(mapped);
    setNewProperty({ title: '', price: '', location: '', mapsLink: '', specs: '', rule: 'R$ 3.001 a R$ 5.000', images: [], brokerName: '', brokerCreci: '', brokerWhatsapp: '' });
    setActiveTab('landing_sucesso');
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Excluir este imóvel? Os leads associados serão mantidos.')) return;
    await supabase.from('imoveis').delete().eq('id', id);
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  // ===== LEAD HANDLERS =====
  const handleDeleteLead = async (id) => {
    if (!window.confirm('Excluir este lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleMoveLead = async (leadId, newStage) => {
    await supabase.from('leads').update({ estagio: newStage }).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
  };

  // Saves a lead to Supabase and updates local state
  const saveLead = async ({ name, document, docType, docStatus, propertyName, propertyId, brokerName, brokerCreci, corretorId, stage, whatsapp }) => {
    const payload = {
      nome: name, documento: document, doc_tipo: docType, doc_status: docStatus,
      imovel_id: propertyId || null, imovel_nome: propertyName,
      corretor_id: corretorId || (corretorProfile?.id ?? null),
      corretor_nome: brokerName, corretor_creci: brokerCreci,
      estagio: stage, whatsapp: whatsapp || '',
      equipe_id: corretorProfile?.equipe_id || null,
    };
    const { data } = await supabase.from('leads').insert(payload).select().single();
    if (data) setLeads(prev => [mapLead(data), ...prev]);
    return data;
  };

  const incrementPropertyLeads = async (propertyId) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) return;
    const newCount = prop.leadsCount + 1;
    await supabase.from('imoveis').update({ leads_count: newCount }).eq('id', propertyId);
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, leadsCount: newCount } : p));
  };

  // ===== SIMULATOR =====
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bot', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, delay);
  };

  const handleStartSimChat = async () => {
    setSimStep(1);
    const prop = selectedProperty;
    if (!prop) return;
    if (GROQ_API_KEY) {
      const minEscore = getMinEscore(prop.rule);
      const faixasStr = INCOME_FAIXAS.map(f => `- ${f.value} → Escore ${f.escore}`).join('\n');
      const systemPrompt = `Você é a "IA" da ImobiFlow, assistente virtual de uma imobiliária.\n\nIMÓVEL: ${prop.title}\nVALOR: ${prop.price}\nREGRAS: ${prop.rule}\n\nINSTRUÇÕES:\n- Fale português brasileiro, seja educado e breve.\n- Apresente-se e pergunte apenas o NOME do lead. NÃO peça renda ainda.`;
      const greeting = await groqChat(systemPrompt, [{ role: 'user', content: 'Inicie o atendimento.' }]);
      if (greeting) {
        setChatMessages([{ sender: 'bot', text: greeting, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setGroqHistory([{ role: 'assistant', content: greeting }]);
        setSimStep(2);
        return;
      }
    }
    setChatMessages([{ sender: 'bot', text: `Olá! Seja bem-vindo ao portal de atendimento do imóvel *${prop.title}*.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTimeout(() => { addBotMessage('Para começarmos, por favor me diga seu **nome completo**.', 500); setSimStep(2); }, 1200);
  };

  const handleSendLeadMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    const userMsg = typedMessage.trim();
    setChatMessages(prev => [...prev, { sender: 'lead', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTypedMessage('');

    if (simStep === 2) {
      setSimInputName(userMsg);
      setSimStep(3);
      const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
      addBotMessage(`Ótimo, **${userMsg}**! Agora me diga qual a sua **faixa de renda mensal**:\n\n${faixasTexto}\n\nDigite apenas o número correspondente.`, 1000);
    } else if (simStep === 3) {
      const index = parseInt(userMsg) - 1;
      const faixa = INCOME_FAIXAS[index];
      if (!faixa) {
        const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
        addBotMessage(`Opção inválida. Por favor, digite o número:\n\n${faixasTexto}`, 800);
        return;
      }
      const leadName = simInputName || 'Lead Simulado';
      const minEscore = getMinEscore(selectedProperty?.rule);
      const isQualified = faixa.escore >= minEscore;
      setSimStep(5);

      if (!isQualified) {
        addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${leadName}\n**Renda:** ${faixa.label}\n**Escore:** ${faixa.escore} pts\n**Mínimo exigido:** ${minEscore} pts\n\nInfelizmente seu perfil não atende aos critérios de renda para este imóvel. Agradecemos pelo interesse! 🙏`, 1000);
        setTimeout(async () => {
          await saveLead({ name: leadName, document: faixa.value, docType: `Escore ${faixa.escore}`, docStatus: 'Inválido p/ Imóvel', propertyName: selectedProperty?.title || '', propertyId: selectedProperty?.id, brokerName: 'Sistema (Desqualificado)', brokerCreci: '', stage: 'Perdido', whatsapp: '' });
          setSimStep(6);
        }, 2000);
      } else {
        const availableBrokers = brokers.filter(b => b.dbStatus === 'ativo');
        let assignedBroker;
        if (corretorProfile?.modo === 'solo') {
          assignedBroker = { id: corretorProfile.id, name: corretorProfile.nome, creci: corretorProfile.creci };
          addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${leadName}\n**Renda:** ${faixa.label}\n**Escore:** ${faixa.escore} pts\n\n✅ **Perfil Aprovado!** Roteando atendimento...`, 1000);
          setTimeout(async () => {
            addBotMessage(`🎉 **Lead Direcionado!**\nO lead foi registrado para o corretor **${corretorProfile.nome}** (${corretorProfile.creci}).`, 1000);
            await saveLead({ name: leadName, document: faixa.value, docType: `Escore ${faixa.escore}`, docStatus: 'Regular', propertyName: selectedProperty?.title || '', propertyId: selectedProperty?.id, brokerName: corretorProfile.nome, brokerCreci: corretorProfile.creci, corretorId: corretorProfile.id, stage: 'Novo', whatsapp: '' });
            await incrementPropertyLeads(selectedProperty?.id);
            setSimStep(6);
          }, 2000);
        } else {
          const nextIdx = roundRobinIndex % (availableBrokers.length || 1);
          assignedBroker = availableBrokers[nextIdx] || { id: null, name: 'Equipe', creci: '' };
          setRoundRobinIndex(prev => prev + 1);
          addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${leadName}\n**Renda:** ${faixa.label}\n**Escore:** ${faixa.escore} pts\n\n✅ **Perfil Aprovado!** Roteando atendimento...`, 1000);
          setTimeout(async () => {
            addBotMessage(`🎉 **Atendimento Direcionado!**\nO corretor sorteado é **${assignedBroker.name}** (${assignedBroker.creci}).`, 1000);
            await saveLead({ name: leadName, document: faixa.value, docType: `Escore ${faixa.escore}`, docStatus: 'Regular', propertyName: selectedProperty?.title || '', propertyId: selectedProperty?.id, brokerName: assignedBroker.name, brokerCreci: assignedBroker.creci || '', corretorId: assignedBroker.id, stage: 'Novo', whatsapp: '' });
            await incrementPropertyLeads(selectedProperty?.id);
            if (assignedBroker.id) {
              await supabase.from('corretores').update({ leads_count: (assignedBroker.leadsCount || 0) + 1 }).eq('id', assignedBroker.id);
              setBrokers(prev => prev.map(b => b.id === assignedBroker.id ? { ...b, leadsCount: b.leadsCount + 1 } : b));
            }
            setSimStep(6);
          }, 2000);
        }
      }
    }
  };

  const handleResetSim = () => { setSimStep(0); setChatMessages([]); setTypedMessage(''); setPublicLeadName(''); setGroqHistory([]); };

  const getLeadsByStage = (stage) => leads.filter(l => l.stage === stage);

  // ===== PUBLIC CHAT (Groq) =====
  const handlePublicSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || isTyping) return;
    const userMsg = typedMessage.trim();
    setChatMessages(prev => [...prev, { sender: 'lead', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setTypedMessage('');
    setIsTyping(true);
    const prop = publicProperty;

    if (!GROQ_API_KEY) {
      // Local fallback
      if (!publicLeadName) {
        setPublicLeadName(userMsg);
        const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
        addBotMessage(`Ótimo, **${userMsg}**! Agora me diga qual a sua **faixa de renda mensal**:\n\n${faixasTexto}\n\nDigite apenas o número correspondente.`);
        setIsTyping(false); return;
      }
      const index = parseInt(userMsg) - 1;
      const faixa = INCOME_FAIXAS[index];
      if (!faixa) { addBotMessage(`Opção inválida. Digite o número da faixa de renda.`); setIsTyping(false); return; }
      const minEscore = getMinEscore(prop?.rule);
      const isQualified = faixa.escore >= minEscore;
      if (!isQualified) {
        addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${publicLeadName}\n**Renda:** ${faixa.label}\n**Escore:** ${faixa.escore} pts\n\nInfelizmente seu perfil não atende aos critérios de renda para este imóvel. Agradecemos pelo interesse! 🙏`);
        setTimeout(async () => {
          await supabase.from('leads').insert({ nome: publicLeadName, documento: faixa.value, doc_tipo: `Escore ${faixa.escore}`, doc_status: 'Inválido p/ Imóvel', imovel_id: prop?.id || null, imovel_nome: prop?.title || '', corretor_id: prop?.corretorId || null, equipe_id: prop?.equipeId || null, corretor_nome: 'Sistema (Desqualificado)', corretor_creci: '', estagio: 'Perdido', whatsapp: '' });
          setSimStep(6);
        }, 2000);
        setIsTyping(false); return;
      }
      const brokerWa = prop?.brokerWhatsapp || '';
      addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${publicLeadName}\n**Renda:** ${faixa.label}\n**Escore:** ${faixa.escore} pts\n\n✅ **Perfil Aprovado!**`);
      setTimeout(async () => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: `Parabéns **${publicLeadName}**! Seu perfil foi aprovado! Agora é só clicar no botão abaixo e falar diretamente com **${prop?.brokerName}** no WhatsApp. 🎉`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        await supabase.from('leads').insert({ nome: publicLeadName, documento: faixa.value, doc_tipo: `Escore ${faixa.escore}`, doc_status: 'Regular', imovel_id: prop?.id || null, imovel_nome: prop?.title || '', corretor_id: prop?.corretorId || null, equipe_id: prop?.equipeId || null, corretor_nome: prop?.brokerName || '', corretor_creci: prop?.brokerCreci || '', estagio: 'Novo', whatsapp: '' });
        await supabase.from('imoveis').update({ leads_count: (prop?.leadsCount || 0) + 1 }).eq('id', prop?.id);
        setSimStep(6);
      }, 1500);
      setIsTyping(false); return;
    }

    // Groq flow
    const updatedHistory = [...groqHistory, { role: 'user', content: userMsg }];
    setGroqHistory(updatedHistory);
    const minEscore = getMinEscore(prop?.rule);
    const faixasStr = INCOME_FAIXAS.map(f => `- ${f.label}: "${f.value}" → Escore ${f.escore}`).join('\n');
    const systemPrompt = `Você é a "IA" da ImobiFlow. Seu papel é QUALIFICAR leads.\n\nIMÓVEL: ${prop?.title}\nVALOR: ${prop?.price}\nREGRAS: ${prop?.rule} (escore mínimo: ${minEscore})\n\nFAIXAS DE RENDA:\n${faixasStr}\n\nREGRAS:\n1. Fale português brasileiro, seja educado e breve.\n2. Pergunte NOME, PROFISSÃO e RENDA, um de cada vez.\n3. Quando tiver NOME + PROFISSÃO + RENDA, termine com:\n---DADOS_LEAD---\nNOME: nome\nPROFISSAO: profissão\nRENDA: valor\nESCORE: número\n---FIM_DADOS---`;
    const response = await groqChat(systemPrompt, updatedHistory);
    if (!response) { setIsTyping(false); return; }
    setIsTyping(false);
    const dataMatch = response.match(/---DADOS_LEAD---\n([\s\S]*?)---FIM_DADOS---/);
    if (!dataMatch) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setGroqHistory(prev => [...prev, { role: 'assistant', content: response }]);
      return;
    }
    const cleanResponse = response.replace(/---DADOS_LEAD---[\s\S]*?---FIM_DADOS---/, '').trim();
    if (cleanResponse) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: cleanResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setGroqHistory(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
    }
    const block = dataMatch[1];
    const nome = block.match(/NOME:\s*(.+)/)?.[1]?.trim();
    const profissao = block.match(/PROFISSAO:\s*(.+)/)?.[1]?.trim() || '';
    const renda = block.match(/RENDA:\s*(.+)/)?.[1]?.trim();
    const escoreStr = block.match(/ESCORE:\s*(\d+)/)?.[1];
    if (!nome || !renda || !escoreStr) return;
    const leadEscore = parseInt(escoreStr);
    const isQualified = leadEscore >= minEscore;
    if (!isQualified) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: `Infelizmente seu perfil não atende aos critérios de renda para este imóvel. Agradecemos pelo interesse!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      await supabase.from('leads').insert({ nome, documento: renda, doc_tipo: `Escore ${leadEscore}`, doc_status: 'Inválido p/ Imóvel', imovel_id: prop?.id || null, imovel_nome: prop?.title || '', corretor_id: prop?.corretorId || null, equipe_id: prop?.equipeId || null, corretor_nome: 'Sistema (Desqualificado)', corretor_creci: '', estagio: 'Perdido', whatsapp: '' });
      setSimStep(6); return;
    }
    setChatMessages(prev => [...prev, { sender: 'bot', text: `Parabéns **${nome}**! Seu perfil foi aprovado! Clique no botão abaixo para falar com **${prop?.brokerName}** no WhatsApp. 🎉`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    await supabase.from('leads').insert({ nome, documento: renda, doc_tipo: `Escore ${leadEscore}`, doc_status: 'Regular', imovel_id: prop?.id || null, imovel_nome: prop?.title || '', corretor_id: prop?.corretorId || null, equipe_id: prop?.equipeId || null, corretor_nome: prop?.brokerName || '', corretor_creci: prop?.brokerCreci || '', estagio: 'Novo', whatsapp: '' });
    await supabase.from('imoveis').update({ leads_count: (prop?.leadsCount || 0) + 1 }).eq('id', prop?.id);
    setSimStep(6);
  };

  // ===== LEGAL PAGES =====
  if (legalViewPage === 'privacy') {
    return <PrivacyPolicy onBack={() => setLegalViewPage(null)} />;
  }
  if (legalViewPage === 'terms') {
    return <TermsOfUse onBack={() => setLegalViewPage(null)} />;
  }

  // ===== PUBLIC LANDING PAGE =====
  if (isPublicView) {
    if (publicLoading) return (
      <div style={{ minHeight: '100vh', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'system-ui, sans-serif', fontSize: '18px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        Carregando imóvel...
      </div>
    );
    if (!publicProperty) return (
      <div style={{ minHeight: '100vh', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'system-ui, sans-serif', fontSize: '18px' }}>
        Imóvel não encontrado
      </div>
    );
    const property = publicProperty;
    const isQualified = chatMessages.some(m => m.sender === 'bot' && m.text.toLowerCase().includes('aprovado'));
    const brokerWa = property.brokerWhatsapp || '559999999999';
    return (
      <div style={{ height: '100vh', backgroundImage: 'url(/sao_paulo.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <SEOHead property={property} title={property.title} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(248, 250, 252, 0.85)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'auto' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', color: 'white', padding: '32px 16px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{property.title}</h1>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>{property.location}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 16px', background: 'transparent' }}>
            {(property.images?.length > 0 ? property.images : [{ url: property.image, ratio: '1:1' }]).map((img, idx) => (
              <div key={idx} style={{ width: '100%', maxWidth: '400px', aspectRatio: img.ratio === '9:16' ? '9 / 16' : '4 / 3', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', background: 'white', position: 'relative' }}>
                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                {property.brokerName && (
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '32px 16px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{property.brokerName.charAt(0)}</div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{property.brokerName}</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>{property.brokerCreci}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '24px 16px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', margin: '0 16px', borderRadius: '12px', marginTop: '-8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {property.specs?.split('|').map((s, i) => <span key={i} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>{s.trim()}</span>)}
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '16px', lineHeight: 1.6 }}>{property.location}</p>
            {property.mapsLink && <a href={property.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>📍 Ver no Google Maps ↗</a>}
          </div>
          <div style={{ padding: '24px 16px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', margin: '16px 16px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '12px' }}><strong style={{ color: '#1e3a8a' }}>Oportunidade única!</strong> {property.title} localizado em {property.location}. Com {property.specs?.toLowerCase()}, este imóvel oferece o conforto e a praticidade que você sempre sonhou.</p>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>Valor: <span style={{ color: '#2563eb', fontSize: '18px' }}>{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</span></p>
            </div>
          </div>
          <div style={{ padding: '24px 16px', textAlign: 'center', marginTop: 'auto' }}>
            {property.brokerName && <div style={{ marginBottom: '8px' }}><div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Seu corretor responsável</div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{property.brokerName}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{property.brokerCreci}</div></div>}
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>💬 Toque no botão de chat no canto inferior direito</p>
          </div>
          <footer style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12px', color: '#64748b', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '11px', color: '#94a3b8', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span>🛡️ CRECI Credenciado</span>
              <span style={{ color: '#475569' }}>•</span>
              <span>🔒 Conexão Segura SSL & LGPD Compliant</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setLegalViewPage('privacy')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
                Política de Privacidade
              </button>
              <span style={{ color: '#475569' }}>•</span>
              <button type="button" onClick={() => setLegalViewPage('terms')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
                Termos de Uso
              </button>
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#94a3b8', fontSize: '11px' }}>
              © 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '10px' }}>
              ImobiFlow — Plataforma de Leads Imobiliários
            </p>
          </footer>
        </div>

        {/* FAB */}
        {!chatOpen && <button className="chat-fab" onClick={() => { setChatOpen(true); setShowChatMenu(true); }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>}
        {chatOpen && <div className="chat-overlay" onClick={() => setChatOpen(false)} />}
        {chatOpen && (
          <div className="chat-expanded-container">
            {showChatMenu ? (
              <>
                <div className="chat-menu-header">
                  <div className="chat-menu-header-info"><div className="chat-avatar bot" style={{ width: '32px', height: '32px', fontSize: '11px' }}>IA</div><div><strong style={{ fontSize: '13px' }}>Atendente Virtual</strong><span style={{ fontSize: '11px', color: '#00a884', display: 'block' }}>Online</span></div></div>
                  <button className="chat-menu-close" onClick={() => setChatOpen(false)} aria-label="Fechar">✕</button>
                </div>
                <div className="chat-menu-body">
                  <p style={{ fontSize: '12px', color: '#8696a0', padding: '0 4px 8px', margin: 0, lineHeight: 1.4 }}>Olá! Como podemos ajudar você com o imóvel <strong style={{ color: '#e0e0e0' }}>{property.title}</strong>?</p>
                  <button className="chat-option-btn" onClick={() => { if (simStep === 0) handleStartSimChat(); setShowChatMenu(false); }}><span className="chat-option-icon">💬</span><span className="chat-option-label">Falar com Atendente</span><span className="chat-option-arrow">›</span></button>
                  <button className="chat-option-btn" onClick={() => { const wa = `https://wa.me/${brokerWa}?text=${encodeURIComponent(`Olá! Gostaria de agendar uma visita para o imóvel: ${property.title} - ${property.price}`)}`; window.open(wa, '_blank') || (location.href = wa); }}><span className="chat-option-icon">📅</span><span className="chat-option-label">Agendar Visita</span><span className="chat-option-arrow">›</span></button>
                  <button className="chat-option-btn chat-option-btn--sair" onClick={() => setChatOpen(false)}><span className="chat-option-icon">🚪</span><span className="chat-option-label">Sair</span></button>
                </div>
              </>
            ) : (
              <div className="whatsapp-chat-container" style={{ height: '100%', borderRadius: '16px' }}>
                <div className="chat-header" style={{ flexDirection: 'column', gap: '6px', padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{property.title}</h4>
                      <p style={{ fontSize: '11px', color: '#00a884', fontWeight: 600, margin: 0 }}>{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</p>
                    </div>
                    <button onClick={() => setShowChatMenu(true)} style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1, flexShrink: 0 }} aria-label="Voltar">←</button>
                    <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1, flexShrink: 0 }} aria-label="Fechar">✕</button>
                  </div>
                </div>
                <div className="chat-body" ref={chatBodyRef}>
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === 'bot' ? 'received' : 'sent'}`}>
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                      <div className="message-time">{msg.time}</div>
                    </div>
                  ))}
                  {isTyping && <div className="message received" style={{ display: 'flex', gap: '4px', width: '60px', justifyContent: 'center', padding: '12px' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }} /><span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }} /><span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }} /></div>}
                </div>
                <form className="chat-input-area" onSubmit={handlePublicSendMessage}>
                  {simStep === 6 ? (
                    <div style={{ width: '100%', textAlign: 'center', padding: '6px 0' }}>
                      {isQualified ? (
                        <>
                          <div style={{ color: '#25d366', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>✅ Qualificado!</div>
                          <button type="button" onClick={() => { const wa = `https://wa.me/${brokerWa}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${property.title} - ${property.price}`)}`; window.open(wa, '_blank') || (location.href = wa); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #25d366, #128C7E)', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>💬 Falar no WhatsApp</button>
                        </>
                      ) : <div style={{ color: '#8696a0', fontSize: '12px', fontWeight: 500 }}>❌ Perfil não se qualificou.</div>}
                    </div>
                  ) : (
                    <><input type="text" className="chat-input" placeholder="Digite sua resposta..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} disabled={isTyping} /><button type="submit" className="chat-send-btn" disabled={isTyping}><ArrowRight size={18} /></button></>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ===== LOADING SCREEN =====
  if (appState === 'loading') return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), #090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <img src="/imoveis/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
      <div style={{ width: '40px', height: '40px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>Verificando sessão...</p>
    </div>
  );

  // ===== AUTH SCREENS =====
  if (appState === 'auth') {
    // Signup — mode select
    if (authScreen === 'signup-select') return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), #090d16', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
<img src="/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
        </div>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '8px', textAlign: 'center' }}>Plataforma de qualificação e distribuição de leads imobiliários</p>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '8px', textAlign: 'center' }}>Como você quer usar a plataforma?</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '36px', textAlign: 'center' }}>Escolha o perfil que melhor descreve o seu caso</p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '760px', width: '100%' }}>
          <div className="mode-card" onClick={() => setAuthScreen('signup-solo')}>
            <div className="mode-card-icon"><img src="/corretor-independente.webp" alt="Corretor" style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover' }} /></div>
            <h3 className="mode-card-title">Corretor Independente</h3>
            <p className="mode-card-desc">Trabalha sozinho e quer que todos os leads chegem diretamente no seu WhatsApp.</p>
            <ul className="mode-card-list"><li>✅ Landing page vinculada ao seu WhatsApp</li><li>✅ Todos os leads vão direto para você</li><li>✅ Sem divisão com outros corretores</li></ul>
            <button className="btn btn-primary mode-card-btn">Entrar como Corretor ➜</button>
          </div>
          <div className="mode-card" onClick={() => setAuthScreen('signup-team')}>
            <div className="mode-card-icon"><img src="/imobiliaria.webp" alt="Imobiliária" style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover' }} /></div>
            <h3 className="mode-card-title">Imobiliária / Equipe</h3>
            <p className="mode-card-desc">Gerencia uma equipe de corretores com distribuição automática e justa (roleta).</p>
            <ul className="mode-card-list"><li>✅ Distribuição automática (Roleta)</li><li>✅ Gestão de equipe completa</li><li>✅ Bloquear/desbloquear corretores</li></ul>
            <button className="btn btn-primary mode-card-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Entrar como Imobiliária ➜</button>
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '32px' }}>Já tem conta? <button onClick={() => setAuthScreen('login')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Fazer login</button></p>
        <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
            <button type="button" onClick={() => setLegalViewPage('privacy')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Política de Privacidade
            </button>
            <span style={{ color: '#334155' }}>•</span>
            <button type="button" onClick={() => setLegalViewPage('terms')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Termos de Uso
            </button>
          </div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#94a3b8' }}>
            © 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.
          </p>
        </footer>
      </div>
    );

    // Signup Solo
    if (authScreen === 'signup-solo') return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), #090d16', padding: '40px 20px' }}>
        <img src="/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '24px' }} />
        <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧑‍💼</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Cadastro do Corretor</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Preencha seus dados para começar</p>
          </div>
          {authError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{authError}</div>}
          <form onSubmit={handleSignupSolo}>
            <div className="form-group"><label>Nome Completo *</label><input type="text" className="form-control" placeholder="Ex: Roberto Silva" value={signupNome} onChange={e => setSignupNome(e.target.value)} required /></div>
            <div className="form-group"><label>CRECI *</label><input type="text" className="form-control" placeholder="Ex: CRECI-DF 12345" value={signupCreci} onChange={e => setSignupCreci(e.target.value)} required /></div>
            <div className="form-group"><label>WhatsApp (com DDD)</label><input type="text" className="form-control" placeholder="Ex: 61999990000" value={signupWhatsapp} onChange={e => setSignupWhatsapp(e.target.value)} /></div>
            <div className="form-group"><label>E-mail *</label><input type="email" autoComplete="off" className="form-control" placeholder="seu@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Senha *</label><input type="password" autoComplete="new-password" className="form-control" placeholder="Mínimo 6 caracteres" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={authLoading}>{authLoading ? 'Criando conta...' : 'Criar Conta e Entrar'}</button>
          </form>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => { setAuthScreen('signup-select'); setAuthError(''); }}>Voltar</button>
        </div>
        <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
            <button type="button" onClick={() => setLegalViewPage('privacy')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Política de Privacidade
            </button>
            <span style={{ color: '#334155' }}>•</span>
            <button type="button" onClick={() => setLegalViewPage('terms')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Termos de Uso
            </button>
          </div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#94a3b8' }}>
            © 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.
          </p>
        </footer>
      </div>
    );

    // Signup Team
    if (authScreen === 'signup-team') return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), #090d16', padding: '40px 20px' }}>
        <img src="/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '24px' }} />
        <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 8px', overflow: 'hidden' }}><img src="/imobiliaria.webp" alt="Imobiliária" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /></div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Cadastro da Imobiliária</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Configure sua equipe e comece a distribuir leads</p>
          </div>
          {authError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{authError}</div>}
          <form onSubmit={handleSignupTeam}>
            <div className="form-group"><label>Nome da Imobiliária / Equipe *</label><input type="text" className="form-control" placeholder="Ex: Imobiliária Exemplo" value={signupEquipeNome} onChange={e => setSignupEquipeNome(e.target.value)} required /></div>
            <div className="form-group"><label>Seu Nome (Gestor) *</label><input type="text" className="form-control" placeholder="Ex: Ana Costa" value={signupNome} onChange={e => setSignupNome(e.target.value)} required /></div>
            <div className="form-group"><label>CRECI *</label><input type="text" className="form-control" placeholder="Ex: CRECI-SP 54321" value={signupCreci} onChange={e => setSignupCreci(e.target.value)} required /></div>
            <div className="form-group"><label>WhatsApp (com DDD)</label><input type="text" className="form-control" placeholder="Ex: 11999990000" value={signupWhatsapp} onChange={e => setSignupWhatsapp(e.target.value)} /></div>
            <div className="form-group"><label>E-mail *</label><input type="email" autoComplete="off" className="form-control" placeholder="gestor@imobiliaria.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Senha *</label><input type="password" autoComplete="new-password" className="form-control" placeholder="Mínimo 6 caracteres" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', background: 'linear-gradient(135deg, #10b981, #059669)' }} disabled={authLoading}>{authLoading ? 'Criando conta...' : 'Criar Equipe e Entrar'}</button>
          </form>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => { setAuthScreen('signup-select'); setAuthError(''); }}>Voltar</button>
        </div>
        <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
            <button type="button" onClick={() => setLegalViewPage('privacy')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Política de Privacidade
            </button>
            <span style={{ color: '#334155' }}>•</span>
            <button type="button" onClick={() => setLegalViewPage('terms')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Termos de Uso
            </button>
          </div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#94a3b8' }}>
            © 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.
          </p>
        </footer>
      </div>
    );

    // Login (default auth screen)
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), #090d16', padding: '40px 20px' }}>
        <img src="/imoveis/logopj.webp" alt="ImobiFlow" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '8px' }} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '4px', textAlign: 'center' }}>ImobiFlow</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '40px', textAlign: 'center' }}>Plataforma de leads imobiliários</p>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 24px', textAlign: 'center' }}>Entrar na plataforma</h2>
          {authError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{authError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group"><label>E-mail</label><input type="email" autoComplete="off" className="form-control" placeholder="seu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Senha</label><input type="password" autoComplete="new-password" className="form-control" placeholder="Sua senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={authLoading}>{authLoading ? 'Entrando...' : 'Entrar'}</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>Não tem conta ainda?</p>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setAuthScreen('signup-select'); setAuthError(''); }}>Criar Conta Gratuita</button>
          </div>
        </div>
        <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
            <button type="button" onClick={() => setLegalViewPage('privacy')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Política de Privacidade
            </button>
            <span style={{ color: '#334155' }}>•</span>
            <button type="button" onClick={() => setLegalViewPage('terms')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
              Termos de Uso
            </button>
          </div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#94a3b8' }}>
            © 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.
          </p>
        </footer>
      </div>
    );
  }

  // ===== MAIN APP =====
  const accountMode = corretorProfile?.modo || 'solo';

  return (
    <div className="app-container">
      <SEOHead title="ImobiFlow | Gestão Imobiliária & CRM" />
      {/* Hamburger */}
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container"><img src="/imoveis/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain' }} /></div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        {/* Mode badge */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: accountMode === 'solo' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)', color: accountMode === 'solo' ? '#3b82f6' : '#10b981', border: `1px solid ${accountMode === 'solo' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`, width: '100%', justifyContent: 'center' }}>
            {accountMode === 'solo' ? `🧑‍💼 ${corretorProfile?.nome || 'Corretor'}` : `🏢 ${corretorProfile?.equipe_nome || 'Imobiliária'}`}
          </span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            {[
              { tab: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
              { tab: 'imoveis', icon: <Home size={18} />, label: 'Imóveis Cadastrados' },
              { tab: 'leads', icon: <Users size={18} />, label: 'Fila de Leads' },
              { tab: 'kanban', icon: <Layers size={18} />, label: 'CRM Kanban (Nativo)' },
            ].map(({ tab, icon, label }) => (
              <li key={tab}><a className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}>{icon}{label}</a></li>
            ))}
            {accountMode === 'team' && <li><a className={`nav-item ${activeTab === 'equipe' ? 'active' : ''}`} onClick={() => { setActiveTab('equipe'); setSidebarOpen(false); }}><Award size={18} />Minha Equipe</a></li>}
            {accountMode === 'solo' && <li><a className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => { setActiveTab('perfil'); setSidebarOpen(false); }}><UserCheck size={18} />Meu Perfil</a></li>}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}><LogOut size={16} />Sair da conta</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* ===== DASHBOARD ===== */}
        {activeTab === 'dashboard' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="header-row">
              <div className="page-title">
                <h1>{accountMode === 'solo' ? `Painel do Corretor — ${corretorProfile?.nome}` : `Painel — ${corretorProfile?.equipe_nome}`}</h1>
                <p>{accountMode === 'solo' ? 'Seus imóveis e leads chegando diretamente no seu WhatsApp.' : 'Monitore suas campanhas de qualificação e distribuição em tempo real.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={handleRefreshData} disabled={loadingData}><RefreshCw size={16} />{loadingData ? 'Atualizando...' : 'Atualizar'}</button>
                <button className="btn btn-primary" onClick={() => setActiveTab('novo_imovel')}><Plus size={16} />Cadastrar Imóvel</button>
              </div>
            </div>
            <div className="metrics-grid">
              {[
                { icon: <Users size={24} />, value: leads.length, label: 'Total de Leads', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                { icon: <UserCheck size={24} />, value: leads.filter(l => l.stage !== 'Perdido').length, label: 'Leads Qualificados', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                { icon: <XCircle size={24} />, value: leads.filter(l => l.stage === 'Perdido').length, label: 'Leads Barrados/Frios', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                { icon: <Building size={24} />, value: properties.length, label: 'Imóveis Ativos', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
              ].map(({ icon, value, label, color, bg }) => (
                <div key={label} className="card metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: bg, color }}>{icon}</div>
                  <div className="metric-info"><h3>{value}</h3><p>{label}</p></div>
                </div>
              ))}
            </div>
            <div className="dashboard-grid">
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Leads Qualificados Recentemente</h3>
                  <a onClick={() => setActiveTab('leads')} style={{ fontSize: '13px', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Ver fila completa <ArrowUpRight size={14} /></a>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead><tr><th>Nome</th><th>Renda / Escore</th><th>Imóvel</th><th>Corretor</th><th>Data</th></tr></thead>
                    <tbody>
                      {leads.slice(0, 5).map(lead => (
                        <tr key={lead.id}>
                          <td style={{ fontWeight: 600 }}>{lead.name}</td>
                          <td><div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '11px', color: '#94a3b8' }}>{lead.docType}</span><span>{lead.document}</span></div></td>
                          <td style={{ color: '#94a3b8', fontSize: '13px' }}>{lead.propertyName}</td>
                          <td><span className="badge badge-info">{lead.brokerName}</span></td>
                          <td>{lead.date}</td>
                        </tr>
                      ))}
                      {leads.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>Nenhum lead ainda. Compartilhe seus links de imóveis!</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              {accountMode === 'team' ? (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Roleta de Vendedores (Plantão)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {brokers.map(broker => (
                      <div key={broker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#0d121f', borderRadius: '8px', border: '1px solid #1f2937' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: broker.dbStatus === 'ativo' ? '#10b981' : broker.dbStatus === 'bloqueado' ? '#ef4444' : '#f59e0b' }} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{broker.name}</p>
                            <p style={{ fontSize: '11px', color: '#94a3b8' }}>{broker.creci}</p>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{broker.leadsCount} leads atendidos</p>
                          </div>
                        </div>
                        <span className={`badge ${broker.dbStatus === 'ativo' ? 'badge-success' : broker.dbStatus === 'bloqueado' ? 'badge-danger' : 'badge-warning'}`}>{broker.status}</span>
                      </div>
                    ))}
                    {brokers.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Nenhum corretor cadastrado ainda.</p>}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden' }}><img src="/corretor-independente.webp" alt="Corretor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  <div><h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{corretorProfile?.nome}</h3><p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Corretor Independente · {corretorProfile?.creci}</p></div>
                  <div style={{ width: '100%', backgroundColor: '#0d121f', borderRadius: '8px', padding: '12px', border: '1px solid #1f2937' }}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>WhatsApp para receber leads</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>📱 {corretorProfile?.whatsapp || 'Não configurado'}</p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveTab('perfil')}>Editar Meu Perfil</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== IMÓVEIS ===== */}
        {activeTab === 'imoveis' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="header-row">
              <div className="page-title"><h1>Gerenciamento de Imóveis</h1><p>Cadastre e gerencie os imóveis ativos nas suas campanhas de qualificação.</p></div>
              <button className="btn btn-primary" onClick={() => setActiveTab('novo_imovel')}><Plus size={16} />Cadastrar Imóvel</button>
            </div>
            <div className="properties-list">
              {properties.map(property => (
                <div className="property-card" key={property.id}>
                  <div className="property-image-placeholder">
                    <img src={property.image} className="property-image" onError={e => { e.target.style.display = 'none'; }} />
                    <span className="badge badge-info property-badge">{property.rule}</span>
                    {property.brokerName && <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', borderRadius: '6px', padding: '6px 10px', fontSize: '11px' }}><div style={{ color: 'white', fontWeight: 600 }}>{property.brokerName}</div><div style={{ color: '#94a3b8', fontSize: '10px' }}>{property.brokerCreci}</div></div>}
                  </div>
                  <div className="property-details">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-price">{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</p>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>📍 {property.location}</p>
                    {property.mapsLink && <a href={property.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>📍 Ver no Google Maps ↗</a>}
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>🔑 {property.specs}</p>
                    <div className="property-rules"><span>Qualificação:</span><span className="badge badge-success" style={{ fontSize: '10px' }}>Escore mínimo: {getMinEscore(property.rule)}</span></div>
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{property.leadsCount} Leads captados</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => { const link = getPropertyPublicURL(property); navigator.clipboard.writeText(link); alert('Link de SEO da landing page copiado!\n\n' + link); }}>🔗 Copiar Link SEO</button>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.open(getPropertyPublicURL(property), '_blank')}>Ver Landing</button>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleDeleteProperty(property.id)}>Excluir</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {properties.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}><Building size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} /><p>Nenhum imóvel cadastrado ainda.</p><button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('novo_imovel')}><Plus size={16} />Cadastrar Primeiro Imóvel</button></div>}
            </div>
          </div>
        )}

        {/* ===== NOVO IMÓVEL ===== */}
        {activeTab === 'novo_imovel' && (
          <div className="animate-slide" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div className="card">
              <h2 style={{ color: 'white', border: 'none', padding: 0, marginTop: 0, marginBottom: '20px' }}>Cadastrar Novo Imóvel</h2>
              <form onSubmit={handleCreateProperty}>
                <div className="form-group"><label>Título do Imóvel</label><input type="text" className="form-control" placeholder="Ex: Sobrado Mobiliado Condomínio Fechado" value={newProperty.title} onChange={e => setNewProperty({ ...newProperty, title: e.target.value })} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Valor</label><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb' }}>R$</span><input type="text" className="form-control" placeholder="Ex: 890.000" value={newProperty.price} onChange={e => setNewProperty({ ...newProperty, price: e.target.value })} required style={{ flex: 1 }} /></div></div>
                  <div className="form-group"><label>Regra de Qualificação</label><select className="form-control" value={newProperty.rule} onChange={e => setNewProperty({ ...newProperty, rule: e.target.value })}><option value="R$ 3.001 a R$ 5.000">Renda a partir de R$ 3.001 (Escore 50)</option><option value="R$ 5.001 a R$ 10.000">Renda a partir de R$ 5.001 (Escore 75)</option><option value="Acima de R$ 10.000">Renda acima de R$ 10.000 (Escore 100)</option></select></div>
                </div>
                {accountMode === 'team' && (
                  <div className="form-group"><label>Corretor Responsável</label><select className="form-control" value={newProperty.brokerName ? `${newProperty.brokerName}|${newProperty.brokerCreci}` : ''} onChange={e => { const [name, creci] = e.target.value.split('|'); setNewProperty({ ...newProperty, brokerName: name || '', brokerCreci: creci || '' }); }}><option value="">Selecione um corretor</option>{brokers.filter(b => b.dbStatus === 'ativo').map(b => <option key={b.id} value={`${b.name}|${b.creci}`}>{b.name} - {b.creci}</option>)}</select></div>
                )}
                <div className="form-group"><label>Localização</label><input type="text" className="form-control" placeholder="Ex: Asa Sul, Brasília - DF" value={newProperty.location} onChange={e => setNewProperty({ ...newProperty, location: e.target.value })} required /></div>
                <div className="form-group"><label>Link do Google Maps</label><input type="url" className="form-control" placeholder="https://maps.app.goo.gl/..." value={newProperty.mapsLink} onChange={e => setNewProperty({ ...newProperty, mapsLink: e.target.value })} /></div>
                <div className="form-group"><label>Especificações</label><input type="text" className="form-control" placeholder="Ex: 3 Quartos | 2 Banheiros | 2 Vagas" value={newProperty.specs} onChange={e => setNewProperty({ ...newProperty, specs: e.target.value })} required /></div>
                <div className="form-group" style={{ border: '1px dashed #1f2937', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', display: 'block' }}>Fotos do Imóvel</label>
                  <div className="photo-upload-row">
                    <div className="photo-upload-file"><input type="file" id="property-image-file-input" className="form-control" accept="image/*" onChange={handleTempImageUploadChange} style={{ padding: '8px' }} /></div>
                    <div className="photo-upload-ratio"><select className="form-control" value={tempImageRatio} onChange={e => setTempImageRatio(e.target.value)}><option value="1:1">Proporção 1:1</option><option value="9:16">Proporção 9:16</option></select></div>
                    <button type="button" className="btn btn-primary" onClick={handleAddTempImage} disabled={!tempImagePreview} style={{ height: '42px', padding: '0 16px', whiteSpace: 'nowrap' }}>Adicionar</button>
                  </div>
                  {tempImagePreview && <div style={{ marginBottom: '16px' }}><p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Preview:</p><div style={{ width: '120px', height: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2563eb' }}><img src={tempImagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div></div>}
                  {newProperty.images.length > 0 && <div style={{ marginTop: '16px' }}><p style={{ fontSize: '12px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Fotos Adicionadas ({newProperty.images.length})</p><div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>{newProperty.images.map((img, idx) => <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1f2937' }}><img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(239,68,68,0.9)', border: 'none', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button></div>)}</div></div>}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Salvar Imóvel</button>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveTab('imoveis')}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== LANDING SUCESSO ===== */}
        {activeTab === 'landing_sucesso' && lastCreatedProperty && (
          <div className="animate-slide" style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>✅</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Imóvel Cadastrado com Sucesso!</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sua landing page de vendas foi gerada. Compartilhe o link abaixo.</p>
              </div>
              <div style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}><img src={lastCreatedProperty.images?.[0]?.url || lastCreatedProperty.image || '/creativo_casa.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /></div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{lastCreatedProperty.title}</h2>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: '#06b6d4', marginBottom: '6px' }}>{lastCreatedProperty.price.startsWith('R$') ? lastCreatedProperty.price : `R$ ${lastCreatedProperty.price}`}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>📍 {lastCreatedProperty.location}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>🔑 {lastCreatedProperty.specs}</p>
                </div>
              </div>
              <div style={{ padding: '20px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>🔗 Link de SEO da sua Landing Page</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#0d121f', borderRadius: '8px', padding: '8px 12px', border: '1px solid #1f2937' }}>
                  <code style={{ flex: 1, fontSize: '13px', color: '#06b6d4', fontFamily: 'monospace', wordBreak: 'break-all' }}>{getPropertyPublicURL(lastCreatedProperty)}</code>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => { navigator.clipboard.writeText(getPropertyPublicURL(lastCreatedProperty)); alert('Link de SEO copiado!'); }}>📋 Copiar Link SEO</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.open(getPropertyPublicURL(lastCreatedProperty), '_blank')}>👁️ Visualizar Landing Page</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setLastCreatedProperty(null); setActiveTab('imoveis'); }}>📋 Ver Meus Imóveis</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LEADS ===== */}
        {activeTab === 'leads' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="header-row">
              <div className="page-title"><h1>Fila Geral de Leads</h1><p>Todos os contatos qualificados e distribuídos pelo robô.</p></div>
              <button className="btn btn-secondary" onClick={handleRefreshData} disabled={loadingData}><RefreshCw size={16} />Atualizar</button>
            </div>
            <div className="card">
              <div className="table-container">
                <table className="custom-table">
                  <thead><tr><th>Data</th><th>Lead (Nome)</th><th>Documento</th><th>Situação</th><th>Imóvel</th><th>Corretor</th><th>Estágio</th><th></th></tr></thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id}>
                        <td>{lead.date}</td>
                        <td style={{ fontWeight: 600 }}>{lead.name}</td>
                        <td><span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>{lead.docType}</span>{lead.document}</td>
                        <td><span className={`badge ${lead.docStatus === 'Regular' ? 'badge-success' : 'badge-danger'}`}>{lead.docStatus}</span></td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.propertyName}</td>
                        <td><span className="badge badge-info">{lead.brokerName}</span></td>
                        <td>
                          <select value={lead.stage} onChange={e => handleMoveLead(lead.id, e.target.value)} style={{ backgroundColor: '#0d121f', color: 'white', border: '1px solid #1f2937', borderRadius: '4px', padding: '4px 8px', fontSize: '13px' }}>
                            {['Novo', 'Em Atendimento', 'Proposta', 'Fechado', 'Perdido'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td><button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Excluir</button></td>
                      </tr>
                    ))}
                    {leads.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>Nenhum lead captado ainda.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== KANBAN ===== */}
        {activeTab === 'kanban' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>
            <div className="header-row"><div className="page-title"><h1>Pipeline Kanban Integrado</h1><p>Gerencie o funil de vendas dos leads.</p></div></div>
            <div className="kanban-board">
              {[
                { stage: 'Novo', color: '#3b82f6', nextStage: 'Em Atendimento', nextLabel: 'Atender' },
                { stage: 'Em Atendimento', color: '#ea580c', nextStage: 'Proposta', nextLabel: 'Proposta', prevStage: 'Novo' },
                { stage: 'Proposta', color: '#f59e0b', nextStage: 'Fechado', nextLabel: 'Fechar Venda!', prevStage: 'Em Atendimento', lostStage: 'Perdido' },
                { stage: 'Fechado', color: '#10b981', prevStage: 'Proposta' },
                { stage: 'Perdido', color: '#ef4444', nextStage: 'Novo', nextLabel: 'Reativar' },
              ].map(({ stage, color, nextStage, nextLabel, prevStage, lostStage }) => (
                <div key={stage} className="kanban-column" style={{ backgroundColor: stage === 'Fechado' ? 'rgba(16,185,129,0.03)' : stage === 'Perdido' ? 'rgba(239,68,68,0.03)' : undefined }}>
                  <div className="kanban-column-header">
                    <div className="kanban-column-title"><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />{stage}</div>
                    <span className="kanban-column-count">{getLeadsByStage(stage).length}</span>
                  </div>
                  <div className="kanban-cards">
                    {getLeadsByStage(stage).map(lead => (
                      <div className="kanban-card" key={lead.id} style={{ borderColor: stage === 'Fechado' ? 'rgba(16,185,129,0.2)' : stage === 'Perdido' ? 'rgba(239,68,68,0.1)' : undefined }}>
                        <h4 className="kanban-card-title" style={{ color: stage === 'Fechado' ? '#10b981' : stage === 'Perdido' ? '#94a3b8' : undefined, textDecoration: stage === 'Perdido' ? 'line-through' : undefined }}>{lead.name}</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>🏠 {lead.propertyName}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>👤 {lead.brokerName}</p>
                        <div className="kanban-card-meta">
                          {prevStage && <a onClick={() => handleMoveLead(lead.id, prevStage)} style={{ color: '#94a3b8', cursor: 'pointer' }}>Voltar</a>}
                          {lostStage && <a onClick={() => handleMoveLead(lead.id, lostStage)} style={{ color: '#ef4444', cursor: 'pointer' }}>Perdido</a>}
                          {stage === 'Fechado' ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>🎉 Fechado!</span> : nextStage && <a onClick={() => handleMoveLead(lead.id, nextStage)} style={{ color: color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>{nextLabel} <ArrowRight size={12} /></a>}
                        </div>
                        <button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: '4px 0 0', textAlign: 'left' }}>Excluir</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SIMULADOR ===== */}
        {activeTab === 'simulador' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
              <div><h1 style={{ fontSize: '24px', fontWeight: 700 }}>Simulador de Experiência do Lead</h1><p style={{ fontSize: '13px', color: '#94a3b8' }}>Simule como um lead entra na página e é validado pelo robô.</p></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>Imóvel:</span>
                <select className="form-control" style={{ width: '280px', margin: 0 }} value={selectedPropertyId} onChange={e => { setSelectedPropertyId(e.target.value); handleResetSim(); }}>{properties.map(p => <option key={p.id} value={p.id}>{p.title} ({p.rule})</option>)}</select>
                <button className="btn btn-secondary" onClick={handleResetSim}>Reiniciar</button>
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => { const link = `${window.location.origin}${window.location.pathname}?imovel=${selectedPropertyId}`; navigator.clipboard.writeText(link); alert('Link copiado!'); }}>🔗 Copiar Link</button>
              </div>
            </div>
            <div className="simulator-layout">
              <div className="simulator-panel">
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>PASSO 1: LANDING PAGE (MOBILE VIEW)</div>
                <div className="landing-preview-container">
                  <div className="preview-browser-bar"><div className="browser-dot" /><div className="browser-dot" /><div className="browser-dot" /><div className="browser-address-input"><span>🔒 imobiflow.com/?imovel={selectedProperty?.id}</span></div></div>
                  <div className="preview-body">
                    <div className="landing-hero"><h1>Oportunidade Única</h1><p>Confira os detalhes e fale diretamente com o corretor.</p></div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc' }}>
                      {selectedProperty?.images?.length > 0 ? selectedProperty.images.map((img, idx) => (
                        <div key={idx} style={{ width: '100%', maxWidth: '280px', aspectRatio: img.ratio === '1:1' ? '1/1' : '9/16', borderRadius: '8px', overflow: 'hidden', margin: '0 auto', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                          <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          {selectedProperty.brokerName && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px 10px 8px', color: 'white', fontSize: '11px' }}><div style={{ fontWeight: 600 }}>{selectedProperty.brokerName}</div><div style={{ opacity: 0.7, fontSize: '10px' }}>{selectedProperty.brokerCreci}</div></div>}
                        </div>
                      )) : <div style={{ width: '280px', height: '200px', borderRadius: '8px', overflow: 'hidden', margin: '0 auto' }}><img src={selectedProperty?.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /></div>}
                    </div>
                    <div className="landing-info">
                      <h2 style={{ color: '#0f172a', border: 'none', padding: 0, margin: 0, fontSize: '18px' }}>{selectedProperty?.title}</h2>
                      <div className="landing-price-tag">{selectedProperty?.price?.startsWith('R$') ? selectedProperty.price : `R$ ${selectedProperty?.price}`}</div>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>📍 {selectedProperty?.location}</p>
                      <div className="landing-specs"><span>{selectedProperty?.specs}</span></div>
                      <p className="landing-description">Imóvel de excelente padrão com acabamento impecável. Perfeito para morar com qualidade e segurança.</p>
                    </div>
                    <div className="landing-cta-box">
                      {simStep === 0 ? <button className="landing-btn-whatsapp" onClick={handleStartSimChat}><Phone size={16} />Falar no WhatsApp</button> : <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#166534', textAlign: 'center', fontWeight: 600 }}>Simulação de Chat Iniciada 📲</div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="simulator-panel">
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>PASSO 2: SIMULAÇÃO DO WHATSAPP</div>
                {simStep === 0 ? (
                  <div style={{ flexGrow: 1, border: '1px dashed #1f2937', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366', marginBottom: '16px' }}><Phone size={32} /></div>
                    <h3>Aguardando clique do Lead</h3>
                    <p style={{ fontSize: '13px', maxWidth: '300px', marginTop: '8px' }}>Clique em <b>"Falar no WhatsApp"</b> no painel esquerdo para iniciar.</p>
                  </div>
                ) : (
                  <div className="whatsapp-chat-container">
                    <div className="chat-header"><div className="chat-avatar bot">IA</div><div className="chat-user-info"><h4>Atendente Virtual</h4><p>{isTyping ? 'digitando...' : 'Online'}</p></div></div>
                    <div className="chat-body" ref={chatBodyRef}>
                      {chatMessages.map((msg, index) => <div key={index} className={`message ${msg.sender === 'bot' ? 'received' : 'sent'}`}><div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div><div className="message-time">{msg.time}</div></div>)}
                      {isTyping && <div className="message received" style={{ display: 'flex', gap: '4px', width: '60px', justifyContent: 'center', padding: '12px' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }} /><span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }} /><span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }} /></div>}
                    </div>
                    <form className="chat-input-area" onSubmit={handleSendLeadMessage}>
                      {simStep === 6 ? <div style={{ width: '100%', textAlign: 'center', color: '#8696a0', fontSize: '13px', fontWeight: 600 }}>Simulação Concluída! Veja o Lead no <b>Dashboard</b> ou <b>CRM Kanban</b>. 🎉</div> : <><input type="text" className="chat-input" placeholder={simStep === 2 ? 'Digite seu nome completo...' : 'Digite o número da faixa de renda...'} value={typedMessage} onChange={e => setTypedMessage(e.target.value)} disabled={isTyping} /><button type="submit" className="chat-send-btn" disabled={isTyping}><ArrowRight size={20} /></button></>}
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== MINHA EQUIPE ===== */}
        {activeTab === 'equipe' && accountMode === 'team' && (
          <EquipeTab
            brokers={brokers}
            setBrokers={setBrokers}
            equipeId={corretorProfile?.equipe_id}
            userId={currentUser?.id}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ===== MEU PERFIL ===== */}
        {activeTab === 'perfil' && accountMode === 'solo' && (
          <div className="animate-slide" style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
            <div className="page-title" style={{ marginBottom: '24px' }}><h1>Meu Perfil</h1><p>Configure seus dados. Os leads chegam diretamente neste WhatsApp.</p></div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0 8px' }}>
                <div style={{ width: '108px', height: '108px', borderRadius: '50%', overflow: 'hidden' }}><img src="/corretor-independente.webp" alt="Corretor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <span className="badge badge-info">Corretor Independente</span>
              </div>
              <ProfileEditForm profile={corretorProfile} onSave={async (updated) => {
                const { error } = await supabase.from('corretores').update({ nome: updated.nome, whatsapp: updated.whatsapp, creci: updated.creci }).eq('id', corretorProfile.id);
                if (!error) { setCorretorProfile(prev => ({ ...prev, ...updated })); alert('Perfil salvo!'); }
              }} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ===== PROFILE EDIT FORM =====
function ProfileEditForm({ profile, onSave }) {
  const [nome, setNome] = useState(profile?.nome || '');
  const [creci, setCreci] = useState(profile?.creci || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');

  return (
    <>
      <div className="form-group"><label>Seu Nome Completo</label><input type="text" className="form-control" value={nome} onChange={e => setNome(e.target.value)} /></div>
      <div className="form-group"><label>CRECI</label><input type="text" className="form-control" value={creci} onChange={e => setCreci(e.target.value)} /></div>
      <div className="form-group"><label>WhatsApp (com DDD)</label><input type="text" className="form-control" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /></div>
      <div style={{ backgroundColor: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#94a3b8' }}>
        📲 Leads qualificados serão registrados e notificados no WhatsApp <strong style={{ color: 'white' }}>{whatsapp || '—'}</strong>.
      </div>
      <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => onSave({ nome, creci, whatsapp })}>Salvar Perfil</button>
    </>
  );
}

// ===== EQUIPE TAB =====
function EquipeTab({ brokers, setBrokers, equipeId, userId, onNavigate }) {
  const [newBroker, setNewBroker] = useState({ name: '', whatsapp: '', creci: '' });
  const [adding, setAdding] = useState(false);
  const [resolvedEquipeId, setResolvedEquipeId] = useState(equipeId);

  useEffect(() => {
    if (equipeId) { setResolvedEquipeId(equipeId); return; }
    if (!userId) return;
    supabase.from('equipes').select('id').eq('admin_user_id', userId).single().then(({ data, error }) => {
      if (data) setResolvedEquipeId(data.id);
      else alert('Diagnóstico: equipes não encontrada. Erro: ' + (error?.message || 'sem dados') + '. Seu userId: ' + userId);
    });
  }, [equipeId, userId]);

  const handleAddBroker = async (e) => {
    e.preventDefault();
    if (!newBroker.name || !newBroker.creci) return;
    if (!resolvedEquipeId) { alert('Erro: ID da equipe não encontrado. Faça logout e login novamente.'); return; }
    setAdding(true);
    const { data, error } = await supabase.from('corretores').insert({
      nome: newBroker.name, whatsapp: newBroker.whatsapp, creci: newBroker.creci,
      modo: 'team', equipe_id: resolvedEquipeId, status: 'ativo', leads_count: 0, is_admin: false,
    }).select().single();
    if (error) { alert('Erro ao adicionar corretor: ' + error.message); setAdding(false); return; }
    if (data) setBrokers(prev => [...prev, mapBroker(data)]);
    setNewBroker({ name: '', whatsapp: '', creci: '' });
    setAdding(false);
  };

  const handleToggleAvailability = async (id, currentDbStatus) => {
    if (currentDbStatus === 'bloqueado') return; // Can't toggle if blocked
    const newStatus = currentDbStatus === 'ativo' ? 'ausente' : 'ativo';
    await supabase.from('corretores').update({ status: newStatus }).eq('id', id);
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, dbStatus: newStatus, status: newStatus === 'ativo' ? 'Disponível' : 'Ausente' } : b));
  };

  const handleToggleBlock = async (id, currentDbStatus) => {
    const newStatus = currentDbStatus === 'bloqueado' ? 'ativo' : 'bloqueado';
    const action = currentDbStatus === 'bloqueado' ? 'desbloquear' : 'bloquear';
    if (!window.confirm(`Deseja ${action} este corretor? Corretores bloqueados não recebem leads.`)) return;
    await supabase.from('corretores').update({ status: newStatus }).eq('id', id);
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, dbStatus: newStatus, status: newStatus === 'ativo' ? 'Disponível' : 'Bloqueado' } : b));
  };

  const handleRemoveBroker = async (id) => {
    if (!window.confirm('Remover este corretor da equipe? Esta ação não pode ser desfeita.')) return;
    await supabase.from('corretores').delete().eq('id', id);
    setBrokers(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="header-row">
        <div className="page-title"><h1>Minha Equipe</h1><p>Cadastre corretores, controle disponibilidade e bloqueie quando necessário.</p></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-success" style={{ fontSize: '13px', padding: '8px 14px' }}>{brokers.filter(b => b.dbStatus === 'ativo').length} de {brokers.length} disponíveis</span>
          <button className="btn btn-primary" onClick={() => onNavigate('novo_imovel')}><Plus size={16} />Cadastrar Imóvel</button>
        </div>
      </div>

      {/* Add broker form */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'white' }}>➕ Adicionar Corretor à Equipe</h3>
        <form onSubmit={handleAddBroker}>
          <div className="form-row">
            <div className="form-group"><label>Nome Completo</label><input type="text" className="form-control" placeholder="Ex: Roberto Silva" value={newBroker.name} onChange={e => setNewBroker(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="form-group"><label>CRECI</label><input type="text" className="form-control" placeholder="Ex: CRECI-DF 12345" value={newBroker.creci} onChange={e => setNewBroker(p => ({ ...p, creci: e.target.value }))} required /></div>
            <div className="form-group"><label>WhatsApp (com DDD)</label><input type="text" className="form-control" placeholder="Ex: 61999990000" value={newBroker.whatsapp} onChange={e => setNewBroker(p => ({ ...p, whatsapp: e.target.value }))} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-primary" style={{ height: '42px', whiteSpace: 'nowrap' }} disabled={adding}>{adding ? 'Adicionando...' : 'Adicionar Corretor'}</button></div>
          </div>
        </form>
      </div>

      {/* Broker list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1f2937', fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corretores Cadastrados ({brokers.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {brokers.map(broker => (
            <div key={broker.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1f2937', gap: '12px', flexWrap: 'wrap', opacity: broker.dbStatus === 'bloqueado' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: broker.dbStatus === 'bloqueado' ? '#374151' : 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                  {broker.dbStatus === 'bloqueado' ? <ShieldBan size={18} /> : broker.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {broker.name}
                    {broker.isAdmin && <span className="badge badge-info" style={{ fontSize: '10px' }}>Admin</span>}
                    {broker.dbStatus === 'bloqueado' && <span className="badge badge-danger" style={{ fontSize: '10px' }}>🚫 Bloqueado</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{broker.creci}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>📱 {broker.whatsapp || 'WhatsApp não informado'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{broker.leadsCount} leads atendidos</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`badge ${broker.dbStatus === 'ativo' ? 'badge-success' : broker.dbStatus === 'bloqueado' ? 'badge-danger' : 'badge-warning'}`}>{broker.status}</span>
                {/* Toggle Disponível/Ausente (only when not blocked) */}
                {broker.dbStatus !== 'bloqueado' && (
                  <button
                    onClick={() => handleToggleAvailability(broker.id, broker.dbStatus)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {broker.dbStatus === 'ativo' ? '⏸ Ausente' : '▶ Disponível'}
                  </button>
                )}
                {/* Block / Unblock */}
                <button
                  onClick={() => handleToggleBlock(broker.id, broker.dbStatus)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', color: broker.dbStatus === 'bloqueado' ? '#10b981' : '#f59e0b', borderColor: broker.dbStatus === 'bloqueado' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {broker.dbStatus === 'bloqueado' ? <><ShieldCheck size={14} />Desbloquear</> : <><ShieldBan size={14} />Bloquear</>}
                </button>
                {/* Remove */}
                <button onClick={() => handleRemoveBroker(broker.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>Remover</button>
              </div>
            </div>
          ))}
          {brokers.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Nenhum corretor cadastrado. Adicione corretores acima para começar a distribuir leads.</div>}
        </div>
      </div>
      <footer style={{ marginTop: '40px', padding: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b', borderTop: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
          <button type="button" onClick={() => setLegalViewPage('privacy')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
            Política de Privacidade
          </button>
          <span style={{ color: '#334155' }}>•</span>
          <button type="button" onClick={() => setLegalViewPage('terms')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
            Termos de Uso
          </button>
        </div>
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#94a3b8' }}>
          © 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.
        </p>
      </footer>
    </div>
  );
}
