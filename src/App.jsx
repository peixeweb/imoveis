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
  X
} from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key') || '';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accountMode, setAccountMode] = useState('onboarding');
  const [onboardingStep, setOnboardingStep] = useState('select');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [soloProfile, setSoloProfile] = useState({ name: '', whatsapp: '', creci: '' });
  const [teamName, setTeamName] = useState('');
  const [apiToken, setApiToken] = useState(localStorage.getItem('invertexto_token') || '27353|DqTwBirNYy8jGCmPNLcBMFaRz2egq5OR');
  const urlImovelParam = new URLSearchParams(window.location.search).get('imovel');
  const [isPublicView, setIsPublicView] = useState(!!urlImovelParam);
  const [lastCreatedProperty, setLastCreatedProperty] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imovelId = params.get('imovel');
    if (imovelId && properties.find(p => p.id === imovelId)) {
      setSelectedPropertyId(imovelId);
    } else if (imovelId) {
      setIsPublicView(false);
    }
  }, []);

  useEffect(() => {
    if (isPublicView) {
      const timer = setTimeout(() => {
        if (typeof simStep !== 'undefined' && simStep === 0) {
          handleStartSimChat();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPublicView]);
  
  // Lista de Corretores da equipe (Roleta)
  const [brokers, setBrokers] = useState([]);

  const [roundRobinIndex, setRoundRobinIndex] = useState(0);

  // Lista de Imóveis cadastrados (persistidos em localStorage)
  const [properties, setProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('imobiflow_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('imobiflow_properties', JSON.stringify(properties));
  }, [properties]);

  // Lista de Leads cadastrados/recebidos
  const [leads, setLeads] = useState([]);

  // Novo imóvel form state
  const [newProperty, setNewProperty] = useState({
    title: '',
    price: '',
    location: '',
    mapsLink: '',
    specs: '',
    rule: 'R$ 3.001 a R$ 5.000',
    images: [],
    brokerName: '',
    brokerCreci: '',
    brokerWhatsapp: ''
  });

  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImageRatio, setTempImageRatio] = useState('1:1');
  const [tempImagePreview, setTempImagePreview] = useState('');

  const handleTempImageUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImageFile(file);
      setTempImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTempImage = () => {
    if (!tempImagePreview) return;
    setNewProperty(prev => ({
      ...prev,
      images: [...prev.images, { url: tempImagePreview, ratio: tempImageRatio }]
    }));
    // Reset temporary states
    setTempImageFile(null);
    setTempImagePreview('');
    // Clear the input file in DOM
    const fileInput = document.getElementById('property-image-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewProperty(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Simulator State
  const [selectedPropertyId, setSelectedPropertyId] = useState(urlImovelParam || '1');
  const [simStep, setSimStep] = useState(0); // 0: Landing, 1: Welcome Bot, 2: Choose PF/PJ, 3: Ask Doc, 4: Validating, 5: Sorteando, 6: Concluido
  const [simLeadType, setSimLeadType] = useState(''); // 'PF' | 'PJ'
  const [simRatio, setSimRatio] = useState('1:1');
  const [simInputName, setSimInputName] = useState('');
  const [simInputDoc, setSimInputDoc] = useState('');
  const [simInputBirth, setSimInputBirth] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  // Adicionar novo imóvel
  const handleCreateProperty = (e) => {
    e.preventDefault();
    if (!newProperty.title || !newProperty.price) return;
    
    let brokerWhatsapp = '';
    if (accountMode === 'solo') {
      brokerWhatsapp = soloProfile.whatsapp;
    } else if (newProperty.brokerName) {
      const found = brokers.find(b => b.name === newProperty.brokerName);
      if (found) brokerWhatsapp = found.whatsapp || '';
    }
    
    const created = {
      id: (properties.length + 1).toString(),
      ...newProperty,
      brokerWhatsapp,
      image: newProperty.images[0]?.url || '/creativo_casa.png',
      leadsCount: 0,
      brokerName: accountMode === 'solo' ? soloProfile.name : newProperty.brokerName || 'Equipe',
      brokerCreci: accountMode === 'solo' ? soloProfile.creci : newProperty.brokerCreci || ''
    };
    
    setProperties([...properties, created]);
    setLastCreatedProperty(created);
    setNewProperty({
      title: '',
      price: '',
      location: '',
      mapsLink: '',
      specs: '',
      rule: 'R$ 3.001 a R$ 5.000',
      images: [],
      brokerName: '',
      brokerCreci: '',
      brokerWhatsapp: ''
    });
    setActiveTab('landing_sucesso');
  };

  // Deletar imóvel
  const handleDeleteProperty = (id) => {
    if (window.confirm('Excluir este imóvel?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  // Deletar lead
  const handleDeleteLead = (id) => {
    if (window.confirm('Excluir este lead?')) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  // Alterar estágio do lead no Kanban
  const handleMoveLead = (leadId, newStage) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
  };

  // Simular resposta do bot com delay
  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bot', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, delay);
  };

  // Iniciar Simulação do WhatsApp
  const handleStartSimChat = async () => {
    setSimStep(1);
    const prop = selectedProperty;
    if (!prop) return;

    // Public view: usa Groq para saudação inicial
    if (isPublicView) {
      const minEscore = getMinEscore(prop.rule);
      const faixasStr = INCOME_FAIXAS.map(f => `- ${f.value} → Escore ${f.escore}`).join('\n');

      const systemPrompt = `Você é a "IA" da ImobiFlow, assistente virtual de uma imobiliária.

IMÓVEL: ${prop.title}
VALOR: ${prop.price}
REGRAS: ${prop.rule}

REGRAS:
- Apenas rendas a partir de R$ 3.000 são aprovadas. Renda abaixo de R$ 3.000 é REPROVADA.
INSTRUÇÕES:
- Fale português brasileiro, seja educado e breve.
- Apresente-se e pergunte apenas o NOME do lead. NÃO peça profissão ou renda ainda.`;

      const greeting = await groqChat(systemPrompt, [
        { role: 'user', content: 'Inicie o atendimento para qualificar um lead para este imóvel.' }
      ]);

      if (greeting) {
        setChatMessages([
          { sender: 'bot', text: greeting, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        ]);
        setGroqHistory([{ role: 'assistant', content: greeting }]);
        setSimStep(2);
        return;
      }
    }

    // Fallback padrão (admin simulator ou se Groq falhar)
    setChatMessages([
      { sender: 'bot', text: `Olá! Seja bem-vindo ao portal de atendimento do imóvel *${prop.title}*.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);
    setTimeout(() => {
      addBotMessage("Para começarmos, por favor me diga seu **nome completo**.", 500);
      setSimStep(2);
    }, 1200);
  };

  // Enviar mensagem do Lead
  const handleSendLeadMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userMsg = typedMessage.trim();
    setChatMessages(prev => [...prev, { sender: 'lead', text: userMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setTypedMessage('');

    // Lógica do Fluxo de Conversação
    if (simStep === 2) {
      setSimInputName(userMsg);
      setSimStep(3);
      const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
      addBotMessage(`Ótimo, **${userMsg}**! Agora me diga qual a sua **faixa de renda mensal**:\n\n${faixasTexto}\n\nDigite apenas o número correspondente.`, 1000);
    }
    else if (simStep === 3) {
      const index = parseInt(userMsg) - 1;
      const faixaEscolhida = INCOME_FAIXAS[index];
      if (!faixaEscolhida) {
        const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
        addBotMessage(`Opção inválida. Por favor, digite o número correspondente à sua faixa de renda:\n\n${faixasTexto}`, 800);
        return;
      }

      const leadName = simInputName || "Lead Simulado";
      const minEscore = getMinEscore(selectedProperty?.rule);
      const isQualified = faixaEscolhida.escore >= minEscore;

      setSimStep(5);

      if (!isQualified) {
        addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${leadName}\n**Renda:** ${faixaEscolhida.label}\n**Escore:** ${faixaEscolhida.escore} pts\n**Mínimo exigido:** ${minEscore} pts\n\nInfelizmente seu perfil não atende aos critérios de renda para este imóvel. Agradecemos pelo interesse! 🙏`, 1000);
        setTimeout(() => {
          setLeads(prev => [{
            id: 'L' + (prev.length + 1).toString().padStart(2, '0'),
            name: leadName, document: faixaEscolhida.value, docType: `Escore ${faixaEscolhida.escore}`,
            docStatus: 'Inválido p/ Imóvel', propertyName: selectedProperty?.title || '',
            brokerName: 'Sistema (Desqualificado)', brokerCreci: '',
            stage: 'Perdido', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999998888'
          }, ...prev]);
          setSimStep(6);
        }, 2000);
      } else {
        addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${leadName}\n**Renda:** ${faixaEscolhida.label}\n**Escore:** ${faixaEscolhida.escore} pts\n**Mínimo exigido:** ${minEscore} pts\n\n✅ **Perfil Aprovado!** Roteando atendimento...`, 1000);
        setTimeout(() => {
          let assignedBroker;
          if (accountMode === 'solo') {
            assignedBroker = { name: soloProfile.name, id: 'solo', creci: soloProfile.creci };
            addBotMessage(`🎉 **Lead Direcionado!**\nO lead foi registrado diretamente para o corretor **${soloProfile.name}** (${soloProfile.creci}).\n\nVocê receberá a notificação no WhatsApp ${soloProfile.whatsapp}. Obrigado pelo contato!`, 1000);
          } else {
            const availableBrokers = brokers.filter(b => b.status === 'Disponível');
            const nextIndex = roundRobinIndex % availableBrokers.length;
            assignedBroker = availableBrokers[nextIndex] || { name: 'Equipe', id: 'team', creci: '' };
            setRoundRobinIndex(prev => prev + 1);
            addBotMessage(`🎉 **Atendimento Direcionado!**\nO corretor sorteado para te atender é o **${assignedBroker.name}** (${assignedBroker.creci}).\n\nEle já recebeu toda a sua ficha cadastral e entrará em contato em instantes no seu WhatsApp pessoal. Obrigado pelo contato!`, 1000);
          }
          setLeads(prev => [{
            id: 'L' + (prev.length + 1).toString().padStart(2, '0'),
            name: leadName, document: faixaEscolhida.value, docType: `Escore ${faixaEscolhida.escore}`,
            docStatus: 'Regular', propertyName: selectedProperty?.title || '',
            brokerName: assignedBroker.name, brokerCreci: assignedBroker.creci || '',
            stage: 'Novo', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999997777'
          }, ...prev]);
          if (accountMode === 'team') {
            setBrokers(prevBrokers => prevBrokers.map(b => b.id === assignedBroker.id ? { ...b, leadsCount: b.leadsCount + 1 } : b));
          }
          setProperties(prevProps => prevProps.map(p => p.id === selectedProperty.id ? { ...p, leadsCount: p.leadsCount + 1 } : p));
          setSimStep(6);
        }, 2000);
      }
    }
  };

  // Reiniciar Simulador
  const handleResetSim = () => {
    setSimStep(0);
    setChatMessages([]);
    setTypedMessage('');
    setPublicLeadName('');
  };

  // Contagem de leads por estágio
  const getLeadsByStage = (stage) => leads.filter(l => l.stage === stage);

  // ===== GROQ PARA CHAT PÚBLICO =====
  const [groqHistory, setGroqHistory] = useState([]);
  const [publicLeadName, setPublicLeadName] = useState('');

  const handlePublicSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || isTyping) return;

    const userMsg = typedMessage.trim();
    setChatMessages(prev => [...prev, { sender: 'lead', text: userMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setTypedMessage('');
    setIsTyping(true);

    const prop = selectedProperty;
    const fail = () => { setIsTyping(false); };

    // Se não tem API key, usa fluxo local
    if (!GROQ_API_KEY) {
      if (!publicLeadName) {
        setPublicLeadName(userMsg);
        const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
        addBotMessage(`Ótimo, **${userMsg}**! Agora me diga qual a sua **faixa de renda mensal**:\n\n${faixasTexto}\n\nDigite apenas o número correspondente.`);
        setIsTyping(false);
        return;
      }
      const index = parseInt(userMsg) - 1;
      const faixaEscolhida = INCOME_FAIXAS[index];
      if (!faixaEscolhida) {
        const faixasTexto = INCOME_FAIXAS.map((f, i) => `*${i + 1}* — ${f.label}`).join('\n');
        addBotMessage(`Opção inválida. Digite o número da sua faixa de renda:\n\n${faixasTexto}`);
        setIsTyping(false);
        return;
      }
      const minEscore = getMinEscore(prop?.rule);
      const isQualified = faixaEscolhida.escore >= minEscore;
      if (!isQualified) {
        addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${publicLeadName}\n**Renda:** ${faixaEscolhida.label}\n**Escore:** ${faixaEscolhida.escore} pts\n**Mínimo exigido:** ${minEscore} pts\n\nInfelizmente seu perfil não atende aos critérios de renda para este imóvel. Agradecemos pelo interesse! 🙏`);
        setTimeout(() => {
          setLeads(prev => [{ id: 'L' + (prev.length + 1).toString().padStart(2, '0'), name: publicLeadName, document: faixaEscolhida.value, docType: `Escore ${faixaEscolhida.escore}`, docStatus: 'Inválido p/ Imóvel', propertyName: prop?.title || '', brokerName: 'Sistema (Desqualificado)', brokerCreci: '', stage: 'Perdido', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999998888' }, ...prev]);
          setSimStep(6);
        }, 2000);
        setIsTyping(false);
        return;
      }
      let assignedBroker;
      if (accountMode === 'solo') {
        assignedBroker = { name: soloProfile.name, id: 'solo', creci: soloProfile.creci };
      } else {
        const available = brokers.filter(b => b.status === 'Disponível');
        assignedBroker = available.length > 0 ? available[0] : { name: 'Equipe', id: 'team', creci: '' };
      }
      addBotMessage(`📊 **Análise de Perfil**\n\n**Nome:** ${publicLeadName}\n**Renda:** ${faixaEscolhida.label}\n**Escore:** ${faixaEscolhida.escore} pts\n\n✅ **Perfil Aprovado!**`);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: `Parabéns **${publicLeadName}**! Seu perfil foi aprovado! Agora é só clicar no botão abaixo e falar diretamente com **${assignedBroker.name}** no WhatsApp. 🎉`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        setLeads(prev => [{ id: 'L' + (prev.length + 1).toString().padStart(2, '0'), name: publicLeadName, document: faixaEscolhida.value, docType: `Escore ${faixaEscolhida.escore}`, docStatus: 'Regular', propertyName: prop?.title || '', brokerName: assignedBroker.name, brokerCreci: assignedBroker.creci || '', stage: 'Novo', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999997777' }, ...prev]);
        if (accountMode === 'team' && assignedBroker.id !== 'team') { setBrokers(prev => prev.map(b => b.id === assignedBroker.id ? { ...b, leadsCount: b.leadsCount + 1 } : b)); }
        if (prop) { setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, leadsCount: p.leadsCount + 1 } : p)); }
        setSimStep(6);
      }, 1500);
      setIsTyping(false);
      return;
    }

    // Fluxo com Groq
    const updatedHistory = [...groqHistory, { role: 'user', content: userMsg }];
    setGroqHistory(updatedHistory);

    const minEscore = getMinEscore(prop?.rule);
    const faixasStr = INCOME_FAIXAS.map(f => `- ${f.label}: "${f.value}" → Escore ${f.escore}`).join('\n');

    const systemPrompt = `Você é a "IA" da ImobiFlow, assistente virtual de uma imobiliária. Seu papel é QUALIFICAR leads.

IMÓVEL: ${prop?.title || 'Imóvel'}
VALOR: ${prop?.price || 'Consultar'}
REGRAS: ${prop?.rule || 'Até R$ 3.000'} (escore mínimo: ${minEscore})

FAIXAS DE RENDA (use exatamente estes valores):
${faixasStr}

REGRAS OBRIGATÓRIAS:
1. Converse em português brasileiro, seja educado e breve.
2. Pergunte o NOME, a PROFISSÃO e a RENDA MENSAL do lead, UM DE CADA VEZ.
3. Quando for perguntar a RENDA, MOSTRE TODAS as faixas abaixo numeradas para o lead escolher (incluindo "Até R$ 3.000" que desqualifica).
4. Determine a faixa de renda e o escore correspondente.
5. ***REGRAS DE APROVAÇÃO***: Apenas rendas a partir de R$ 3.000 (faixas R$ 3.000 a R$ 5.000, R$ 5.000 a R$ 7.000, R$ 7.000 a R$ 10.000 e Acima de R$ 10.000) são aprovadas. Renda abaixo de R$ 3.000 (Escore 25) é REPROVADA automaticamente.
6. ***IMPORTANTE***: Quando o lead fornecer NOME + PROFISSÃO + RENDA, sua resposta deve terminar EXATAMENTE com:
---DADOS_LEAD---
NOME: nome completo
PROFISSAO: profissão
RENDA: ${INCOME_FAIXAS.map(f => `"${f.value}"`).join(' ou ')}
ESCORE: ${INCOME_FAIXAS.map(f => f.escore).join(', ')}
---FIM_DADOS---
NÃO escreva mais nada depois disso.`;

    const response = await groqChat(systemPrompt, updatedHistory);
    if (!response) { setIsTyping(false); return; }

    setIsTyping(false);

    const dataMatch = response.match(/---DADOS_LEAD---\n([\s\S]*?)---FIM_DADOS---/);
    if (dataMatch) {
      const cleanResponse = response.replace(/---DADOS_LEAD---[\s\S]*?---FIM_DADOS---/, '').trim();
      if (cleanResponse) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: cleanResponse, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        setGroqHistory(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      }
    } else {
      setChatMessages(prev => [...prev, { sender: 'bot', text: response, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
      setGroqHistory(prev => [...prev, { role: 'assistant', content: response }]);
      return;
    }

    const block = dataMatch[1];
    const nome = block.match(/NOME:\s*(.+)/)?.[1]?.trim();
    const profissao = block.match(/PROFISSAO:\s*(.+)/)?.[1]?.trim() || '';
    const renda = block.match(/RENDA:\s*(.+)/)?.[1]?.trim();
    const escoreStr = block.match(/ESCORE:\s*(\d+)/)?.[1];

    if (!nome || !renda || !escoreStr) {
      const text = response.replace(/---DADOS_LEAD---[\s\S]*?---FIM_DADOS---/, '').trim() || response.replace(/---DADOS_LEAD---[\s\S]*?---FIM_DADOS---/g, '').trim();
      if (text) {
        setChatMessages(prev => [...prev, { sender: 'bot', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        setGroqHistory(prev => [...prev, { role: 'assistant', content: text }]);
      }
      return;
    }

    const leadEscore = parseInt(escoreStr);
    const faixa = INCOME_FAIXAS.find(f => f.value === renda);
    if (!faixa) return;

    const isQualified = leadEscore >= minEscore;

    if (!isQualified) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: `Infelizmente seu perfil não atende aos critérios de renda para este imóvel. Agradecemos pelo interesse!`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
      setIsTyping(false);
      setLeads(prev => [{ id: 'L' + (prev.length + 1).toString().padStart(2, '0'), name: nome, document: renda, docType: `Escore ${leadEscore}`, docStatus: 'Inválido p/ Imóvel', propertyName: prop?.title || '', brokerName: 'Sistema (Desqualificado)', brokerCreci: '', stage: 'Perdido', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999998888' }, ...prev]);
      setSimStep(6);
      return;
    }

    let assignedBroker;
    if (accountMode === 'solo') {
      assignedBroker = { name: soloProfile.name, id: 'solo', creci: soloProfile.creci };
    } else {
      const available = brokers.filter(b => b.status === 'Disponível');
      assignedBroker = available.length > 0 ? available[0] : { name: 'Equipe', id: 'team', creci: '' };
    }

    setChatMessages(prev => [...prev, { sender: 'bot', text: `Parabéns **${nome}**! Seu perfil foi aprovado! Agora é só clicar no botão abaixo e falar diretamente com **${assignedBroker.name}** no WhatsApp. 🎉`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setIsTyping(false);
    setLeads(prev => [{ id: 'L' + (prev.length + 1).toString().padStart(2, '0'), name: nome, document: renda, docType: `Escore ${leadEscore}`, docStatus: 'Regular', propertyName: prop?.title || '', brokerName: assignedBroker.name, brokerCreci: assignedBroker.creci || '', stage: 'Novo', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999997777' }, ...prev]);
    if (accountMode === 'team' && assignedBroker.id !== 'team') { setBrokers(prev => prev.map(b => b.id === assignedBroker.id ? { ...b, leadsCount: b.leadsCount + 1 } : b)); }
    if (prop) { setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, leadsCount: p.leadsCount + 1 } : p)); }
    setSimStep(6);
  };

  // ===== PUBLIC LANDING PAGE =====
  if (isPublicView) {
    const property = selectedProperty;
    if (!property) {
      return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'system-ui, sans-serif', fontSize: '18px' }}>Imóvel não encontrado</div>;
    }
    const isQualified = chatMessages.some(m => m.sender === 'bot' && m.text.toLowerCase().includes('aprovado'));
    const brokerWa = property.brokerWhatsapp || soloProfile.whatsapp || (brokers.find(b => b.name === property.brokerName)?.whatsapp) || '559999999999';
    return (
      <div style={{ height: '100vh', backgroundImage: 'url(/imoveis/sao_paulo.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(248, 250, 252, 0.85)', zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'auto' }}>
        {/* Hero com fotos */}
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', color: 'white', padding: '32px 16px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{property.title}</h1>
          <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>{property.location}</p>
        </div>

        {/* Galeria */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 16px', background: 'transparent' }}>
          {(property.images?.length > 0 ? property.images : [{ url: property.image, ratio: '1:1' }]).map((img, idx) => (
            <div key={idx} style={{
              width: '100%', maxWidth: '400px',
              aspectRatio: img.ratio === '9:16' ? '9 / 16' : '4 / 3',
              borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              background: 'white', position: 'relative'
            }}>
              <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              {property.brokerName && (
                <div style={{
                  position: 'absolute', bottom: '0', left: '0', right: '0',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  padding: '32px 16px 12px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0
                  }}>{property.brokerName.charAt(0)}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{property.brokerName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>{property.brokerCreci}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Informações do imóvel */}
        <div style={{ padding: '24px 16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', margin: '0 16px', borderRadius: '12px', marginTop: '-8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
            {property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {property.specs?.split('|').map((s, i) => (
              <span key={i} style={{
                background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px',
                fontSize: '12px', color: '#475569', fontWeight: 500
              }}>{s.trim()}</span>
            ))}
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '16px', lineHeight: 1.6 }}>
            {property.location}
          </p>
          {property.mapsLink && (
            <a href={property.mapsLink} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              📍 Ver no Google Maps ↗
            </a>
          )}
        </div>

        {/* Copy de vendas dinâmica */}
        <div style={{ padding: '24px 16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', margin: '16px 16px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#1e3a8a' }}>Oportunidade única!</strong> {property.title} localizado em {property.location}. 
              Com {property.specs?.toLowerCase()}, este imóvel oferece o conforto e a praticidade que você sempre sonhou. 
              Acabamento impecável, áreas sociais integradas, segurança reforçada e excelente iluminação natural.
            </p>
            <p style={{ marginBottom: '12px' }}>
              {getMinEscore(property.rule) >= 75
                ? 'Imóvel de alto padrão. Verifique se sua renda atende aos critérios de qualificação.'
                : 'Perfeito para sua família viver com qualidade, segurança e conforto. Agende sua visita e encante-se!'}
            </p>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>
              Valor: <span style={{ color: '#2563eb', fontSize: '18px' }}>{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</span>
            </p>
          </div>
        </div>

        {/* Corretor info */}
        <div style={{ padding: '24px 16px', textAlign: 'center', marginTop: 'auto' }}>
          {property.brokerName && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Seu corretor responsável</div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{property.brokerName}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{property.brokerCreci}</div>
            </div>
          )}
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>
            {simStep === 0 ? 'Preparando atendimento...' : '💬 Chat aberto no canto inferior direito'}
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(8px)' }}>
          ImobiFlow — Plataforma de Leads Imobiliários
        </div>
      </div>

      {/* RIGHT SIDE: WHATSAPP CHAT FLOATING WIDGET */}
      <div className="public-chat-widget">
        {simStep === 0 ? (
          <div style={{ flex: 1, background: '#0b141a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8696a0', fontSize: '14px', gap: '12px', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#202c33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #8696a0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'pulse 1s linear infinite' }}></div>
            </div>
            <span>Preparando atendimento virtual...</span>
          </div>
        ) : (
          <div className="whatsapp-chat-container" style={{ height: '100%', borderRadius: '16px' }}>
            <div className="chat-header" style={{ flexDirection: 'column', gap: '8px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                {(property.images?.length > 0 ? property.images : [{ url: property.image, ratio: '1:1' }]).slice(0, 1).map((img, idx) => (
                  <img key={idx} src={img.url} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                ))}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</h4>
                  <p style={{ fontSize: '12px', color: '#00a884', fontWeight: 600 }}>{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="chat-avatar bot" style={{ width: '28px', height: '28px', fontSize: '10px', marginLeft: 'auto' }}>IA</div>
                  <p style={{ fontSize: '10px', color: '#8696a0', marginTop: '2px' }}>{isTyping ? 'digitando...' : 'Online'}</p>
                </div>
              </div>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === 'bot' ? 'received' : 'sent'}`}>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
              {isTyping && (
                <div className="message received" style={{ display: 'flex', gap: '4px', width: '60px', justifyContent: 'center', padding: '12px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }}></span>
                </div>
              )}
            </div>
            <form className="chat-input-area" onSubmit={handlePublicSendMessage}>
              {simStep === 6 ? (
                <div style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
                  {isQualified ? (
                    <>
                      <div style={{ color: '#25d366', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                        ✅ Você foi qualificado!
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const waLink = `https://wa.me/${brokerWa}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel: ${property.title} - ${property.price}`)}`;
                          const win = window.open(waLink, '_blank');
                          if (!win) location.href = waLink;
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #25d366, #128C7E)', color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
                      >
                        💬 Falar com o Corretor no WhatsApp
                      </button>
                    </>
                  ) : (
                    <div style={{ color: '#8696a0', fontSize: '14px', fontWeight: 500 }}>
                      ❌ Não foi possível prosseguir com este perfil.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Digite sua resposta..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    disabled={isTyping}
                  />
                  <button type="submit" className="chat-send-btn" disabled={isTyping}>
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </div>
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* ===== ONBOARDING SCREEN ===== */}
      {accountMode === 'onboarding' && onboardingStep === 'select' && (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), var(--background)', padding: '40px 20px' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <img src="/imoveis/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
          </div>

          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '8px', textAlign: 'center' }}>Plataforma de qualificação e distribuição de leads imobiliários</p>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '8px', textAlign: 'center' }}>Como você quer usar a plataforma?</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '36px', textAlign: 'center' }}>Escolha o perfil que melhor descreve o seu caso</p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '760px', width: '100%' }}>
            
            {/* Cartão: Corretor Independente */}
            <div 
              className="mode-card"
              onClick={() => { setSelectedMode('solo'); setOnboardingStep('register'); }}
            >
              <div className="mode-card-icon"><img src="/imoveis/corretor-independente.webp" alt="Corretor Independente" style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover' }} /></div>
              <h3 className="mode-card-title">Corretor Independente</h3>
              <p className="mode-card-desc">Trabalha sozinho e quer que todos os leads dos seus imóveis cheguem diretamente no seu WhatsApp. Nenhum lead é compartilhado.</p>
              <ul className="mode-card-list">
                <li>✅ Landing page vinculada ao seu WhatsApp</li>
                <li>✅ Todos os leads vão direto para você</li>
                <li>✅ Sem divisão com outros corretores</li>
                <li>✅ Painel simples e focado</li>
              </ul>
              <button className="btn btn-primary mode-card-btn">Entrar como Corretor ➜</button>
            </div>

            {/* Cartão: Imobiliária / Equipe */}
            <div 
              className="mode-card"
              onClick={() => { setSelectedMode('team'); setOnboardingStep('register'); }}
            >
              <div className="mode-card-icon"><img src="/imoveis/imobiliaria.webp" alt="Imobiliária" style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover' }} /></div>
              <h3 className="mode-card-title">Imobiliária / Equipe</h3>
              <p className="mode-card-desc">Gerencia uma equipe de corretores. Os leads qualificados são distribuídos automaticamente e de forma justa entre todos os corretores de plantão.</p>
              <ul className="mode-card-list">
                <li>✅ Distribuição automática (Roleta)</li>
                <li>✅ Gestão de equipe completa</li>
                <li>✅ Dashboard com visão geral da equipe</li>
                <li>✅ Relatórios por corretor</li>
              </ul>
              <button className="btn btn-primary mode-card-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Entrar como Imobiliária ➜</button>
            </div>

          </div>
        </div>
      )}

      {/* ===== ONBOARDING FORM ===== */}
      {accountMode === 'onboarding' && onboardingStep === 'register' && (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), var(--background)', padding: '40px 20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <img src="/imoveis/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
          </div>

          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px' }}>
            {selectedMode === 'solo' ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧑‍💼</div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Cadastro do Corretor</h2>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Preencha seus dados para começar a usar a plataforma</p>
                </div>
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input type="text" className="form-control" placeholder="Ex: Roberto Silva"
                    value={soloProfile.name}
                    onChange={(e) => setSoloProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>CRECI</label>
                  <input type="text" className="form-control" placeholder="Ex: CRECI-DF 12345"
                    value={soloProfile.creci}
                    onChange={(e) => setSoloProfile(p => ({ ...p, creci: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>WhatsApp (com DDD)</label>
                  <input type="text" className="form-control" placeholder="Ex: 61999990000"
                    value={soloProfile.whatsapp}
                    onChange={(e) => setSoloProfile(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                  onClick={() => { if (!soloProfile.name || !soloProfile.creci) return alert('Preencha nome e CRECI'); setAccountMode('solo'); setActiveTab('dashboard'); }}>
                  Entrar na Plataforma
                </button>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '96px', height: '96px', margin: '0 auto 8px', overflow: 'hidden' }}><img src="/imoveis/imobiliaria.webp" alt="Imobiliária" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /></div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Cadastro da Imobiliária</h2>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Dê um nome para sua equipe e configure os corretores</p>
                </div>
                <div className="form-group">
                  <label>Nome da Imobiliária / Equipe</label>
                  <input type="text" className="form-control" placeholder="Ex: Imobiliária Exemplo"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                  onClick={() => { if (!teamName) return alert('Informe o nome da imobiliária'); setAccountMode('team'); setActiveTab('equipe'); }}>
                  Entrar na Plataforma
                </button>
              </>
            )}
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={() => { setOnboardingStep('select'); setSelectedMode(null); }}>
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN APP (AFTER ONBOARDING) ===== */}
      {accountMode !== 'onboarding' && !isPublicView && (<>
      {/* Sidebar */}
      {/* Hamburger button — mobile only */}
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/imoveis/logopj.webp" alt="ImobiFlow" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Badge de Modo Ativo */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
            backgroundColor: accountMode === 'solo' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)',
            color: accountMode === 'solo' ? '#3b82f6' : '#10b981',
            border: `1px solid ${accountMode === 'solo' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`,
            cursor: 'pointer', width: '100%', justifyContent: 'center'
          }} onClick={() => { setAccountMode('onboarding'); setOnboardingStep('select'); setSelectedMode(null); }}>
            {accountMode === 'solo' ? '🧑‍💼 Corretor Independente' : `🏢 Imobiliária / Equipe`}
          </span>
        </div>
        
        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li>
              <a 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'imoveis' ? 'active' : ''}`}
                onClick={() => { setActiveTab('imoveis'); setSidebarOpen(false); }}
              >
                <Home size={18} />
                Imóveis Cadastrados
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
              >
                <Users size={18} />
                Fila de Leads
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
                onClick={() => { setActiveTab('kanban'); setSidebarOpen(false); }}
              >
                <Layers size={18} />
                CRM Kanban (Nativo)
              </a>
            </li>
            {/* Aba Minha Equipe — apenas no modo Imobiliária */}
            {accountMode === 'team' && (
              <li>
                <a 
                  className={`nav-item ${activeTab === 'equipe' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('equipe'); setSidebarOpen(false); }}
                >
                  <Award size={18} />
                  Minha Equipe
                </a>
              </li>
            )}
            {/* Aba Perfil — apenas no modo Corretor Independente */}
            {accountMode === 'solo' && (
              <li>
                <a 
                  className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('perfil'); setSidebarOpen(false); }}
                >
                  <UserCheck size={18} />
                  Meu Perfil
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
            onClick={() => {
              if (window.confirm('Tem certeza? Isso vai apagar TODOS os imóveis, leads e corretores cadastrados.')) {
                setProperties([]);
                setLeads([]);
                setBrokers([]);
                localStorage.removeItem('imobiflow_properties');
                setActiveTab('dashboard');
              }
            }}
          >
            <Trash2 size={16} />
            Limpar Todos os Dados
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="header-row">
              <div className="page-title">
                <h1>{accountMode === 'solo' ? `Painel do Corretor — ${soloProfile.name}` : 'Painel da Imobiliária'}</h1>
                <p>{accountMode === 'solo' ? 'Seus imóveis e leads chegando diretamente no seu WhatsApp.' : 'Monitore suas campanhas de qualificação e distribuição de leads em tempo real.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                  <RefreshCw size={16} />
                  Atualizar Painel
                </button>
                <button className="btn btn-primary" onClick={() => setActiveTab('novo_imovel')}>
                  <Plus size={16} />
                  Cadastrar Imóvel
                </button>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="metrics-grid">
              <div className="card metric-card">
                <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Users size={24} />
                </div>
                <div className="metric-info">
                  <h3>{leads.length}</h3>
                  <p>Total de Leads</p>
                </div>
              </div>
              <div className="card metric-card">
                <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <UserCheck size={24} />
                </div>
                <div className="metric-info">
                  <h3>{leads.filter(l => l.stage !== 'Perdido').length}</h3>
                  <p>Leads Qualificados</p>
                </div>
              </div>
              <div className="card metric-card">
                <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <XCircle size={24} />
                </div>
                <div className="metric-info">
                  <h3>{leads.filter(l => l.stage === 'Perdido').length}</h3>
                  <p>Leads Barrados/Frios</p>
                </div>
              </div>
              <div className="card metric-card">
                <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                  <Building size={24} />
                </div>
                <div className="metric-info">
                  <h3>{properties.length}</h3>
                  <p>Imóveis Ativos</p>
                </div>
              </div>
            </div>

            {/* Dashboard Split Sections */}
            {/* Dashboard Split — modo Equipe mostra Roleta; modo Solo mostra dados do próprio corretor */}
            <div className="dashboard-grid">
              
              {/* Últimos Leads Recebidos */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Leads Qualificados Recentemente</h3>
                  <a onClick={() => setActiveTab('leads')} style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Ver fila completa <ArrowUpRight size={14} />
                  </a>
                </div>
                
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Renda / Escore</th>
                        <th>Imóvel</th>
                        <th>Corretor Sorteado</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 3).map(lead => (
                        <tr key={lead.id}>
                          <td style={{ fontWeight: 600 }}>{lead.name}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{lead.docType}</span>
                              <span>{lead.document}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{lead.propertyName}</td>
                          <td>
                            <span className="badge badge-info">{lead.brokerName}</span>
                            {lead.brokerCreci && <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>{lead.brokerCreci}</span>}
                          </td>
                          <td>{lead.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Equipe / Status Roleta */}
              {/* Painel lateral direito — Roleta (Equipe) ou Card do Perfil Solo */}
              {accountMode === 'team' ? (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Roleta de Vendedores (Plantão)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {brokers.map(broker => (
                    <div key={broker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#0d121f', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: broker.status === 'Disponível' ? '#10b981' : '#ef4444' }}></div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{broker.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{broker.creci}</p>
                          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{broker.leadsCount} leads atendidos</p>
                        </div>
                      </div>
                      <span className={`badge ${broker.status === 'Disponível' ? 'badge-success' : 'badge-danger'}`}>
                        {broker.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden' }}><img src="/imoveis/corretor-independente.webp" alt="Corretor Independente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{soloProfile.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Corretor Independente · {soloProfile.creci}</p>
                </div>
                <div style={{ width: '100%', backgroundColor: '#0d121f', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>WhatsApp para receber leads</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>📱 {soloProfile.whatsapp || 'Não configurado'}</p>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveTab('perfil')}>
                  Editar Meu Perfil
                </button>
              </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: IMOVEIS */}
        {activeTab === 'imoveis' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="header-row">
              <div className="page-title">
                <h1>Gerenciamento de Imóveis</h1>
                <p>Cadastre e visualize os imóveis ativos nas suas campanhas de qualificação automatizada.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('novo_imovel')}>
                <Plus size={16} />
                Cadastrar Imóvel
              </button>
            </div>

            <div className="properties-list">
              {properties.map(property => (
                <div className="property-card" key={property.id}>
                  <div className="property-image-placeholder">
                    <img src={property.image} className="property-image" onError={(e) => { e.target.style.display = 'none'; }} />
                    <span className="badge badge-info property-badge">{property.rule}</span>
                    {property.brokerName && (
                      <div style={{
                        position: 'absolute', bottom: '8px', left: '8px', right: '8px',
                        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                        borderRadius: '6px', padding: '6px 10px', fontSize: '11px'
                      }}>
                        <div style={{ color: 'white', fontWeight: 600 }}>{property.brokerName}</div>
                        <div style={{ color: '#94a3b8', fontSize: '10px' }}>{property.brokerCreci}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="property-details">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-price">{property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}</p>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>📍 {property.location}</p>
                    {property.mapsLink && (
                      <a href={property.mapsLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        📍 Ver no Google Maps ↗
                      </a>
                    )}
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>🔑 {property.specs}</p>
                    
                    <div className="property-rules">
                      <span>Qualificação:</span>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>
                        Escore mínimo: {getMinEscore(property.rule)}
                      </span>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                        {property.leadsCount} Leads captados
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                          onClick={() => {
                            const link = `${window.location.origin}${window.location.pathname}?imovel=${property.id}`;
                            navigator.clipboard.writeText(link);
                            alert('Link da landing page copiado!');
                          }}
                        >
                          🔗 Copiar Link
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            const link = `${window.location.origin}${window.location.pathname}?imovel=${property.id}`;
                            window.open(link, '_blank');
                          }}
                        >
                          Ver Landing
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2.5: NOVO IMOVEL */}
        {activeTab === 'novo_imovel' && (
          <div className="animate-slide" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div className="card">
              <h2 style={{ color: 'white', border: 'none', padding: 0, marginTop: 0, marginBottom: '20px' }}>Cadastrar Novo Imóvel</h2>
              
              <form onSubmit={handleCreateProperty}>
                <div className="form-group">
                  <label>Título do Imóvel</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Sobrado Mobiliado Condomínio fechado" 
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valor de Venda/Locação</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>R$</span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: 890.000" 
                        value={newProperty.price}
                        onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                        required
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Regra de Qualificação</label>
                    <select 
                      className="form-control"
                      value={newProperty.rule}
                      onChange={(e) => setNewProperty({...newProperty, rule: e.target.value})}
                    >
                      <option value="R$ 3.001 a R$ 5.000">Renda a partir de R$ 3.001 (Escore 50)</option>
                      <option value="R$ 5.001 a R$ 10.000">Renda a partir de R$ 5.001 (Escore 75)</option>
                      <option value="Acima de R$ 10.000">Renda acima de R$ 10.000 (Escore 100)</option>
                    </select>
                  </div>
                </div>

                {accountMode === 'team' && (
                <div className="form-group">
                  <label>Corretor Responsável</label>
                  <select
                    className="form-control"
                    value={newProperty.brokerName ? `${newProperty.brokerName}|${newProperty.brokerCreci}` : ''}
                    onChange={(e) => {
                      const [name, creci] = e.target.value.split('|');
                      setNewProperty({...newProperty, brokerName: name, brokerCreci: creci});
                    }}
                    required
                  >
                    <option value="">Selecione um corretor</option>
                    {brokers.filter(b => b.status === 'Disponível').map(b => (
                      <option key={b.id} value={`${b.name}|${b.creci}`}>{b.name} - {b.creci}</option>
                    ))}
                  </select>
                </div>
                )}

                <div className="form-group">
                  <label>Localização (Cidade/Bairro)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Asa Sul, Brasília - DF" 
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Link do Google Maps</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="Cole o link do Maps: https://maps.app.goo.gl/..." 
                    value={newProperty.mapsLink}
                    onChange={(e) => setNewProperty({...newProperty, mapsLink: e.target.value})}
                  />
                  {newProperty.mapsLink && (
                    <a href={newProperty.mapsLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      📍 Abrir link no Google Maps
                    </a>
                  )}
                </div>

                <div className="form-group">
                  <label>Especificações do Imóvel</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: 3 Quartos | 2 Banheiros | 2 Vagas" 
                    value={newProperty.specs}
                    onChange={(e) => setNewProperty({...newProperty, specs: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group" style={{ border: '1px dashed var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px', display: 'block' }}>Fotos do Imóvel (Vários Tamanhos)</label>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 2 }}>
                      <input 
                        type="file" 
                        id="property-image-file-input"
                        className="form-control" 
                        accept="image/*"
                        onChange={handleTempImageUploadChange}
                        style={{ padding: '8px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <select 
                        className="form-control"
                        value={tempImageRatio}
                        onChange={(e) => setTempImageRatio(e.target.value)}
                      >
                        <option value="1:1">Proporção 1:1 (Feed)</option>
                        <option value="9:16">Proporção 9:16 (Stories)</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleAddTempImage}
                      disabled={!tempImagePreview}
                      style={{ height: '42px', padding: '0 16px' }}
                    >
                      Adicionar
                    </button>
                  </div>

                  {tempImagePreview && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Preview da foto selecionada ({tempImageRatio}):</p>
                      <div style={{ 
                        width: tempImageRatio === '1:1' ? '120px' : '90px', 
                        height: '120px', 
                        borderRadius: '6px', 
                        overflow: 'hidden', 
                        border: '1px solid var(--primary)' 
                      }}>
                        <img src={tempImagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  )}

                  {/* Lista de fotos adicionadas */}
                  {newProperty.images && newProperty.images.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Fotos Adicionadas ({newProperty.images.length})</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {newProperty.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span className="badge badge-info" style={{ position: 'absolute', bottom: '2px', left: '2px', fontSize: '9px', padding: '1px 4px' }}>
                              {img.ratio}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              style={{ 
                                position: 'absolute', 
                                top: '2px', 
                                right: '2px', 
                                backgroundColor: 'rgba(239, 68, 68, 0.9)', 
                                border: 'none', 
                                color: 'white', 
                                borderRadius: '50%', 
                                width: '18px', 
                                height: '18px', 
                                fontSize: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer' 
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {accountMode === 'team' && newProperty.brokerName && (
                <div style={{
                  marginTop: '16px', padding: '12px', borderRadius: '8px',
                  backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0
                  }}>
                    {newProperty.brokerName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{newProperty.brokerName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{newProperty.brokerCreci}</div>
                  </div>
                </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Salvar Cadastro do Imóvel
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveTab('imoveis')}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2.6: LANDING SUCESSO PÓS-CADASTRO */}
        {activeTab === 'landing_sucesso' && lastCreatedProperty && (
          <div className="animate-slide" style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
            <div className="card" style={{ padding: '32px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: '32px'
                }}>✅</div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Imóvel Cadastrado com Sucesso!</h1>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  Sua landing page de vendas foi gerada automaticamente. Compartilhe o link abaixo.
                </p>
              </div>

              {/* Card do Imóvel */}
              <div style={{
                display: 'flex', gap: '20px', padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                border: '1px solid var(--border)', marginBottom: '24px', flexWrap: 'wrap'
              }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={lastCreatedProperty.images?.[0]?.url || lastCreatedProperty.image || '/creativo_casa.png'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{lastCreatedProperty.title}</h2>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>
                    {lastCreatedProperty.price.startsWith('R$') ? lastCreatedProperty.price : `R$ ${lastCreatedProperty.price}`}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>📍 {lastCreatedProperty.location}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>🔑 {lastCreatedProperty.specs}</p>
                  <span className="badge badge-info" style={{ marginTop: '8px', fontSize: '11px' }}>{lastCreatedProperty.rule}</span>
                </div>
              </div>

              {/* Corretor info */}
              {lastCreatedProperty.brokerName && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', borderRadius: '10px',
                  backgroundColor: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0
                  }}>
                    {lastCreatedProperty.brokerName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '15px' }}>{lastCreatedProperty.brokerName}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{lastCreatedProperty.brokerCreci}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px' }}>
                      📱 WhatsApp: {lastCreatedProperty.brokerWhatsapp || soloProfile.whatsapp || 'Não configurado'}
                    </div>
                  </div>
                </div>
              )}

              {/* Link da Landing Page */}
              <div style={{
                padding: '20px', borderRadius: '10px',
                backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔗 Link da Sua Landing Page de Vendas
                </div>
                <div style={{
                  display: 'flex', gap: '8px', alignItems: 'center',
                  backgroundColor: '#0d121f', borderRadius: '8px', padding: '8px 12px',
                  border: '1px solid var(--border)'
                }}>
                  <code style={{ flex: 1, fontSize: '13px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                    {`${window.location.origin}${window.location.pathname}?imovel=${lastCreatedProperty.id}`}
                  </code>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?imovel=${lastCreatedProperty.id}`);
                      alert('Link copiado! Compartilhe com seus clientes.');
                    }}>
                    📋 Copiar Link
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Compartilhe este link nas suas redes sociais, grupos de WhatsApp e anúncios. Todo lead que acessar passará pela qualificação automática antes de falar com você.
                </p>
              </div>

              {/* Preview da Copy de Vendas */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📝 Copy de Vendas Gerada Automaticamente
                </h3>
                <div style={{
                  padding: '20px', borderRadius: '10px',
                  backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px', lineHeight: 1.7
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', marginBottom: '12px' }}>
                    🏡 {lastCreatedProperty.title}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb', marginBottom: '12px' }}>
                    {lastCreatedProperty.price.startsWith('R$') ? lastCreatedProperty.price : `R$ ${lastCreatedProperty.price}`}
                  </div>
                  <div style={{ color: '#475569', marginBottom: '12px' }}>
                    📍 {lastCreatedProperty.location}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {lastCreatedProperty.specs?.split('|').map((s, i) => (
                      <span key={i} style={{
                        background: '#e2e8f0', padding: '4px 12px', borderRadius: '16px',
                        fontSize: '12px', color: '#334155', fontWeight: 600
                      }}>{s.trim()}</span>
                    ))}
                  </div>
                  <div style={{ color: '#334155', marginBottom: '16px' }}>
                    Oportunidade imperdível! {lastCreatedProperty.title} localizado em {lastCreatedProperty.location}. 
                    Com {lastCreatedProperty.specs?.toLowerCase()}, este imóvel oferece o conforto e a praticidade que você sempre sonhou. 
                    Agende já sua visita e garanta esta oportunidade única de investimento.
                    {getMinEscore(lastCreatedProperty.rule) >= 75
                      ? ' Imóvel de alto padrão com critérios de renda específicos.'
                      : ' Perfeito para sua família viver com qualidade e segurança.'}
                  </div>
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
                    padding: '12px', fontSize: '13px'
                  }}>
                    <strong style={{ color: '#166534' }}>💬 Fale com o corretor {lastCreatedProperty.brokerName}</strong> ({lastCreatedProperty.brokerCreci}) pelo WhatsApp e garanta já o seu! 🚀
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    const link = `${window.location.origin}${window.location.pathname}?imovel=${lastCreatedProperty.id}`;
                    window.open(link, '_blank');
                  }}>
                  👁️ Visualizar Landing Page
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?imovel=${lastCreatedProperty.id}`);
                    alert('Link copiado! Compartilhe com seus clientes.');
                  }}>
                  📱 Compartilhar Link
                </button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setLastCreatedProperty(null); setActiveTab('imoveis'); }}>
                  📋 Ver Meus Imóveis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEADS (TABLE VIEW) */}
        {activeTab === 'leads' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="header-row">
              <div className="page-title">
                <h1>Fila Geral de Leads</h1>
                <p>Todos os contatos qualificados e distribuídos pelo robô nas últimas horas.</p>
              </div>
            </div>

            <div className="card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data de Cadastro</th>
                      <th>Lead (Nome)</th>
                      <th>Documento Recebido</th>
                      <th>Situação RF</th>
                      <th>Imóvel Solicitado</th>
                      <th>Corretor Atribuído</th>
                      <th>Estágio Atual</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>{lead.id}</td>
                        <td>{lead.date}</td>
                        <td style={{ fontWeight: 600 }}>{lead.name}</td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{lead.docType}</span>
                          {lead.document}
                        </td>
                        <td>
                          <span className={`badge ${lead.docStatus === 'Regular' ? 'badge-success' : 'badge-danger'}`}>
                            {lead.docStatus}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.propertyName}</td>
                        <td>
                          <span className="badge badge-info">{lead.brokerName}</span>
                          {lead.brokerCreci && <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>{lead.brokerCreci}</span>}
                        </td>
                        <td>
                          <select 
                            value={lead.stage}
                            onChange={(e) => handleMoveLead(lead.id, e.target.value)}
                            style={{ 
                              backgroundColor: '#0d121f', 
                              color: 'white', 
                              border: '1px solid var(--border)', 
                              borderRadius: '4px', 
                              padding: '4px 8px',
                              fontSize: '13px'
                            }}
                          >
                            <option value="Novo">Novo</option>
                            <option value="Em Atendimento">Em Atendimento</option>
                            <option value="Proposta">Proposta</option>
                            <option value="Fechado">Fechado</option>
                            <option value="Perdido">Perdido</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            style={{
                              background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
                              borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer'
                            }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KANBAN CRM BOARD */}
        {activeTab === 'kanban' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>
            <div className="header-row">
              <div className="page-title">
                <h1>Pipeline Kanban Integrado</h1>
                <p>Gerencie o funil de vendas dos leads. Arraste e altere o status de atendimento.</p>
              </div>
            </div>

            <div className="kanban-board">
              
              {/* COLUMN 1: NOVO */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                    Novo
                  </div>
                  <span className="kanban-column-count">{getLeadsByStage('Novo').length}</span>
                </div>
                <div className="kanban-cards">
                  {getLeadsByStage('Novo').map(lead => (
                    <div className="kanban-card" key={lead.id}>
                      <h4 className="kanban-card-title">{lead.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>🏠 {lead.propertyName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>👤 Corretor: {lead.brokerName} {lead.brokerCreci && `(${lead.brokerCreci})`}</p>
                      <div className="kanban-card-meta">
                        <span>{lead.docType}: {lead.docStatus}</span>
                        <a onClick={() => handleMoveLead(lead.id, 'Em Atendimento')} style={{ color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Atender <ArrowRight size={12} />
                        </a>
                      </div>
                      <button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: '4px 0 0', textAlign: 'left' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 2: EM ATENDIMENTO */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ea580c' }}></div>
                    Em Atendimento
                  </div>
                  <span className="kanban-column-count">{getLeadsByStage('Em Atendimento').length}</span>
                </div>
                <div className="kanban-cards">
                  {getLeadsByStage('Em Atendimento').map(lead => (
                    <div className="kanban-card" key={lead.id}>
                      <h4 className="kanban-card-title">{lead.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>🏠 {lead.propertyName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>👤 Corretor: {lead.brokerName} {lead.brokerCreci && `(${lead.brokerCreci})`}</p>
                      <div className="kanban-card-meta">
                        <a onClick={() => handleMoveLead(lead.id, 'Novo')} style={{ color: 'var(--muted)', cursor: 'pointer' }}>Voltar</a>
                        <a onClick={() => handleMoveLead(lead.id, 'Proposta')} style={{ color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Proposta <ArrowRight size={12} />
                        </a>
                      </div>
                      <button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: '4px 0 0', textAlign: 'left' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 3: PROPOSTA */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                    Proposta
                  </div>
                  <span className="kanban-column-count">{getLeadsByStage('Proposta').length}</span>
                </div>
                <div className="kanban-cards">
                  {getLeadsByStage('Proposta').map(lead => (
                    <div className="kanban-card" key={lead.id}>
                      <h4 className="kanban-card-title">{lead.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>🏠 {lead.propertyName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>👤 Corretor: {lead.brokerName} {lead.brokerCreci && `(${lead.brokerCreci})`}</p>
                      <div className="kanban-card-meta">
                        <a onClick={() => handleMoveLead(lead.id, 'Perdido')} style={{ color: 'var(--danger)', cursor: 'pointer' }}>Perdido</a>
                        <a onClick={() => handleMoveLead(lead.id, 'Fechado')} style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Fechar Venda! <ArrowRight size={12} />
                        </a>
                      </div>
                      <button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: '4px 0 0', textAlign: 'left' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 4: FECHADO */}
              <div className="kanban-column" style={{ backgroundColor: 'rgba(16, 185, 129, 0.03)' }}>
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                    Fechado / Ganho
                  </div>
                  <span className="kanban-column-count">{getLeadsByStage('Fechado').length}</span>
                </div>
                <div className="kanban-cards">
                  {getLeadsByStage('Fechado').map(lead => (
                    <div className="kanban-card" key={lead.id} style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <h4 className="kanban-card-title" style={{ color: '#10b981' }}>{lead.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>🏠 {lead.propertyName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>👤 Corretor: {lead.brokerName} {lead.brokerCreci && `(${lead.brokerCreci})`}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>🎉 Venda Fechada!</span>
                        <a onClick={() => handleMoveLead(lead.id, 'Proposta')} style={{ color: 'var(--muted)', cursor: 'pointer' }}>Reabrir</a>
                      </div>
                      <button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: '4px 0 0', textAlign: 'left' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 5: PERDIDO */}
              <div className="kanban-column" style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                    Perdido / Barrado
                  </div>
                  <span className="kanban-column-count">{getLeadsByStage('Perdido').length}</span>
                </div>
                <div className="kanban-cards">
                  {getLeadsByStage('Perdido').map(lead => (
                    <div className="kanban-card" key={lead.id} style={{ borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                      <h4 className="kanban-card-title" style={{ textDecoration: 'line-through', color: 'var(--muted)' }}>{lead.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>🏠 {lead.propertyName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>👤 Corretor: {lead.brokerName} {lead.brokerCreci && `(${lead.brokerCreci})`}</p>
                      <div className="kanban-card-meta">
                        <span className="badge badge-danger" style={{ fontSize: '10px' }}>Inativo/Desqualificado</span>
                        <a onClick={() => handleMoveLead(lead.id, 'Novo')} style={{ color: 'var(--muted)', cursor: 'pointer' }}>Reativar</a>
                      </div>
                      <button onClick={() => handleDeleteLead(lead.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', padding: '4px 0 0', textAlign: 'left' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SIMULADOR DE FLUXO */}
        {activeTab === 'simulador' && (
          <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* Header com seleção de qual imóvel simular */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Simulador de Experiência do Lead</h1>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Escolha um imóvel e simule como um lead entra na página, abre o WhatsApp e é validado pelo robô.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>Imóvel da Campanha:</span>
                <select 
                  className="form-control" 
                  style={{ width: '280px', margin: 0 }}
                  value={selectedPropertyId}
                  onChange={(e) => {
                    setSelectedPropertyId(e.target.value);
                    handleResetSim();
                  }}
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.rule})</option>
                  ))}
                </select>
                <button className="btn btn-secondary" onClick={handleResetSim}>
                  Reiniciar Simulação
                </button>
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname}?imovel=${selectedPropertyId}`;
                  navigator.clipboard.writeText(link);
                  alert('Link da landing page copiado! Compartilhe com seus clientes.');
                }}>
                  🔗 Copiar Link da Landing
                </button>
              </div>
            </div>

            {/* Split Layout: Landing Page vs WhatsApp Bot */}
            <div className="simulator-layout">
              
              {/* Lado Esquerdo: Preview da Landing Page pública */}
              <div className="simulator-panel">
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                  PASSO 1: LANDING PAGE GERADA PELO CORRETOR (MOBILE VIEW)
                </div>
                <div className="landing-preview-container">
                  <div className="preview-browser-bar">
                    <div className="browser-dot"></div>
                    <div className="browser-dot"></div>
                    <div className="browser-dot"></div>
                    <div className="browser-address-input">
                      <span>🔒 imobiflow.com/imoveis/{selectedProperty.id}</span>
                    </div>
                  </div>
                  <div className="preview-body">
                    {/* Landing Page Content */}
                    <div className="landing-hero">
                      <h1>Oportunidade Única</h1>
                      <p>Confira os detalhes e fale diretamente com o corretor responsável.</p>
                    </div>
                    
                    <div className="landing-gallery" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc' }}>
                      {selectedProperty.images && selectedProperty.images.length > 0 ? (
                        selectedProperty.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              width: '100%', 
                              maxWidth: img.ratio === '1:1' ? '280px' : '220px',
                              aspectRatio: img.ratio === '1:1' ? '1 / 1' : '9 / 16', 
                              borderRadius: '8px', 
                              overflow: 'hidden', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              border: '1px solid #e2e8f0',
                              position: 'relative',
                              margin: '0 auto'
                            }}
                          >
                            <img 
                              src={img.url} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              alt={`Foto ${idx + 1}`}
                            />
                            {selectedProperty.brokerName && (
                              <div style={{
                                position: 'absolute', bottom: '0', left: '0', right: '0',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                padding: '20px 10px 8px', color: 'white', fontSize: '11px'
                              }}>
                                <div style={{ fontWeight: 600 }}>{selectedProperty.brokerName}</div>
                                <div style={{ opacity: 0.7, fontSize: '10px' }}>{selectedProperty.brokerCreci}</div>
                              </div>
                            )}
                            <span style={{ 
                              position: 'absolute', 
                              top: '8px', 
                              left: '8px', 
                              backgroundColor: 'rgba(15, 23, 42, 0.75)', 
                              color: 'white', 
                              fontSize: '9px', 
                              fontWeight: '600', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              backdropFilter: 'blur(4px)'
                            }}>
                              Proporção {img.ratio}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ width: '100%', maxWidth: '280px', aspectRatio: '1 / 1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', margin: '0 auto', position: 'relative' }}>
                          <img src={selectedProperty.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {selectedProperty.brokerName && (
                            <div style={{
                              position: 'absolute', bottom: '0', left: '0', right: '0',
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                              padding: '20px 10px 8px', color: 'white', fontSize: '11px'
                            }}>
                              <div style={{ fontWeight: 600 }}>{selectedProperty.brokerName}</div>
                              <div style={{ opacity: 0.7, fontSize: '10px' }}>{selectedProperty.brokerCreci}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="landing-info">
                      <h2 style={{ color: '#0f172a', border: 'none', padding: 0, margin: 0, fontSize: '18px' }}>
                        {selectedProperty.title}
                      </h2>
                      <div className="landing-price-tag">{selectedProperty.price.startsWith('R$') ? selectedProperty.price : `R$ ${selectedProperty.price}`}</div>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>📍 {selectedProperty.location}</p>
                      {selectedProperty.mapsLink && (
                        <a href={selectedProperty.mapsLink}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          📍 Ver no Google Maps ↗
                        </a>
                      )}
                      
                      <div className="landing-specs">
                        <span>{selectedProperty.specs}</span>
                      </div>

                      {selectedProperty.brokerName && (
                      <div style={{
                        backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px',
                        padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                          {selectedProperty.brokerName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedProperty.brokerName}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{selectedProperty.brokerCreci}</div>
                        </div>
                      </div>
                      )}

                      <p className="landing-description">
                        Lindo imóvel localizado em região nobre, com acabamento impecável de altíssimo padrão, áreas sociais integradas, segurança reforçada e excelente iluminação natural. Perfeito para morar ou instalar seu escritório comercial de sucesso.
                      </p>
                    </div>

                    <div className="landing-cta-box">
                      {simStep === 0 ? (
                        <>
                        {selectedProperty.brokerName && (
                          <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginBottom: '8px' }}>
                            Fale diretamente com <strong>{selectedProperty.brokerName}</strong> ({selectedProperty.brokerCreci})
                          </div>
                        )}
                        <button className="landing-btn-whatsapp" onClick={handleStartSimChat}>
                          <Phone size={16} />
                          Falar no WhatsApp
                        </button>
                        </>
                      ) : (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#166534', textAlign: 'center', fontWeight: 600 }}>
                          Simulação de Chat Iniciada no Painel Direito 📲
                        </div>
                      )}
                      <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                        Qualificação automática exigida: **{selectedProperty.rule}**
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Simulador de Conversa no WhatsApp */}
              <div className="simulator-panel">
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                  PASSO 2: SIMULAÇÃO DO WHATSAPP DO LEAD (ROBÔ TRIAGEM)
                </div>
                {simStep === 0 ? (
                  <div style={{ flexGrow: 1, border: '1px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366', marginBottom: '16px' }}>
                      <Phone size={32} />
                    </div>
                    <h3>Aguardando clique do Lead</h3>
                    <p style={{ fontSize: '13px', maxWidth: '300px', marginTop: '8px' }}>
                      Clique no botão <b>"Falar no WhatsApp"</b> no painel da Landing Page (à esquerda) para simular o início da conversa.
                    </p>
                  </div>
                ) : (
                  <div className="whatsapp-chat-container">
                    
                    {/* Header do Chat */}
                    <div className="chat-header">
                      <div className="chat-avatar bot">IA</div>
                      <div className="chat-user-info">
                        <h4>Atendente Virtual</h4>
                        <p>{isTyping ? 'digitando...' : 'Online'}</p>
                      </div>
                    </div>

                    {/* Corpo do Chat */}
                    <div className="chat-body" ref={chatBodyRef}>
                      {chatMessages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender === 'bot' ? 'received' : 'sent'}`}>
                          {/* Renderiza quebras de linha no chat */}
                          <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                          <div className="message-time">{msg.time}</div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="message received" style={{ display: 'flex', gap: '4px', width: '60px', justifyContent: 'center', padding: '12px' }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
                          <span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }}></span>
                          <span style={{ width: '6px', height: '6px', backgroundColor: '#8696a0', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }}></span>
                        </div>
                      )}
                    </div>

                    {/* Caixa de Entrada de Texto do Lead */}
                    <form className="chat-input-area" onSubmit={handleSendLeadMessage}>
                      {simStep === 6 ? (
                        <div style={{ width: '100%', textAlign: 'center', color: '#8696a0', fontSize: '13px', fontWeight: 600 }}>
                          Simulação Concluída. Volte ao <b>Dashboard</b> ou ao <b>CRM Kanban</b> para ver o Lead! 🎉
                        </div>
                      ) : (
                        <>
                          <input 
                            type="text" 
                            className="chat-input"
                            placeholder={
                              simStep === 2 
                                ? "Digite seu nome completo..."
                                : simStep === 3
                                ? "Digite o número da sua faixa de renda..."
                                : "Digite sua resposta..."
                            }
                            value={typedMessage}
                            onChange={(e) => setTypedMessage(e.target.value)}
                            disabled={isTyping}
                          />
                          <button type="submit" className="chat-send-btn" disabled={isTyping}>
                            <ArrowRight size={20} />
                          </button>
                        </>
                      )}
                    </form>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}


        {/* TAB: MINHA EQUIPE (modo team) */}
        {activeTab === 'equipe' && accountMode === 'team' && (
          <EquipeTab brokers={brokers} setBrokers={setBrokers} onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {/* TAB: MEU PERFIL (modo solo) */}
        {activeTab === 'perfil' && accountMode === 'solo' && (
          <div className="animate-slide" style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
            <div className="page-title" style={{ marginBottom: '24px' }}>
              <h1>Meu Perfil</h1>
              <p>Configure seus dados. Os leads dos seus imóveis chegam diretamente neste WhatsApp.</p>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0 8px' }}>
                <div style={{ width: '108px', height: '108px', borderRadius: '50%', overflow: 'hidden' }}><img src="/imoveis/corretor-independente.webp" alt="Corretor Independente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <span className="badge badge-info">Corretor Independente</span>
              </div>
              <div className="form-group">
                <label>Seu Nome Completo</label>
                <input
                  type="text"
                  className="form-control"
                  value={soloProfile.name}
                  onChange={(e) => setSoloProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Roberto Silva"
                />
              </div>
              <div className="form-group">
                <label>CRECI</label>
                <input
                  type="text"
                  className="form-control"
                  value={soloProfile.creci}
                  onChange={(e) => setSoloProfile(p => ({ ...p, creci: e.target.value }))}
                  placeholder="Ex: CRECI-DF 12345"
                />
              </div>
              <div className="form-group">
                <label>WhatsApp (com DDD) — para receber leads</label>
                <input
                  type="text"
                  className="form-control"
                  value={soloProfile.whatsapp}
                  onChange={(e) => setSoloProfile(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="Ex: 61999990000"
                />
              </div>
              <div className="form-group">
                <label>Token da API Invertexto (para consultar CPF/CNPJ real)</label>
                <input
                  type="text"
                  className="form-control"
                  value={apiToken}
                  onChange={(e) => { setApiToken(e.target.value); localStorage.setItem('invertexto_token', e.target.value); }}
                  placeholder="Cole seu token de API"
                />
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  {apiToken ? '✅ Token configurado — consultas reais via api.invertexto.com' : 'ℹ️ Sem token — usará dados simulados'}
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                📲 Quando um lead for qualificado pelo robô, ele será registrado automaticamente no seu painel e você receberá uma notificação no WhatsApp <strong style={{ color: 'white' }}>{soloProfile.whatsapp || '—'}</strong>.
              </div>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => { alert(`Perfil salvo! Leads chegando para: ${soloProfile.whatsapp}`); setActiveTab('dashboard'); }}
              >
                Salvar Perfil
              </button>
            </div>
          </div>
        )}

      </main>
      </>)}
    </div>
  );
}

// ===== COMPONENTE: ABA MINHA EQUIPE =====
function EquipeTab({ brokers, setBrokers, onNavigate }) {
  const [newBroker, setNewBroker] = useState({ name: '', whatsapp: '', creci: '' });

  const handleAddBroker = (e) => {
    e.preventDefault();
    if (!newBroker.name || !newBroker.whatsapp) return;
    setBrokers(prev => [
      ...prev,
      { id: Date.now(), name: newBroker.name, whatsapp: newBroker.whatsapp, creci: newBroker.creci, status: 'Disponível', leadsCount: 0, color: '#3b82f6' }
    ]);
    setNewBroker({ name: '', whatsapp: '', creci: '' });
  };

  const handleToggleStatus = (id) => {
    setBrokers(prev => prev.map(b =>
      b.id === id ? { ...b, status: b.status === 'Disponível' ? 'Ausente' : 'Disponível' } : b
    ));
  };

  const handleRemoveBroker = (id) => {
    if (window.confirm('Remover este corretor da equipe?')) {
      setBrokers(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="header-row">
        <div className="page-title">
          <h1>Minha Equipe</h1>
          <p>Cadastre os corretores e depois atribua imóveis a eles.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-success" style={{ fontSize: '13px', padding: '8px 14px' }}>
            {brokers.filter(b => b.status === 'Disponível').length} de {brokers.length} disponíveis
          </span>
          <button className="btn btn-primary" onClick={() => onNavigate('novo_imovel')}>
            <Plus size={16} />
            Cadastrar Imóvel
          </button>
        </div>
      </div>

      {/* Formulário de adição de corretor */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'white' }}>➕ Adicionar Corretor à Equipe</h3>
        <form onSubmit={handleAddBroker}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Roberto Silva"
                value={newBroker.name}
                onChange={(e) => setNewBroker(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>CRECI</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: CRECI-DF 12345"
                value={newBroker.creci}
                onChange={(e) => setNewBroker(p => ({ ...p, creci: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>WhatsApp (com DDD)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 61999990000"
                value={newBroker.whatsapp}
                onChange={(e) => setNewBroker(p => ({ ...p, whatsapp: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ height: '42px', whiteSpace: 'nowrap' }}>
                Adicionar Corretor
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de corretores */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: '14px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Corretores Cadastrados ({brokers.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {brokers.map(broker => (
            <div key={broker.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '14px' }}>
                  {broker.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{broker.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{broker.creci} · 📱 {broker.whatsapp || 'WhatsApp não informado'} · {broker.leadsCount} leads atendidos</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  className={`btn ${broker.status === 'Disponível' ? 'btn-secondary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '12px', color: broker.status === 'Disponível' ? '#10b981' : '#ef4444', borderColor: broker.status === 'Disponível' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}
                  onClick={() => handleToggleStatus(broker.id)}
                >
                  {broker.status === 'Disponível' ? '🟢 Disponível' : '🔴 Ausente'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                  onClick={() => handleRemoveBroker(broker.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
