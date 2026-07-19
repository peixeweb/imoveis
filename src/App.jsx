import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Play, 
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
  ArrowUpRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accountMode, setAccountMode] = useState('onboarding');
  const [onboardingStep, setOnboardingStep] = useState('select');
  const [selectedMode, setSelectedMode] = useState(null);
  const [soloProfile, setSoloProfile] = useState({ name: '', whatsapp: '', creci: '' });
  const [teamName, setTeamName] = useState('');
  const [apiToken, setApiToken] = useState(localStorage.getItem('invertexto_token') || '27353|DqTwBirNYy8jGCmPNLcBMFaRz2egq5OR');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imovelId = params.get('imovel');
    if (imovelId && properties.find(p => p.id === imovelId)) {
      setActiveTab('simulador');
      setSelectedPropertyId(imovelId);
      setAccountMode('solo');
      setOnboardingStep('select');
      setSoloProfile({ name: 'Corretor', whatsapp: '', creci: '' });
    }
  }, []);
  
  // Lista de Corretores da equipe (Roleta)
  const [brokers, setBrokers] = useState([
    { id: 1, name: 'Roberto Silva', status: 'Disponível', leadsCount: 14, color: '#3b82f6', creci: 'CRECI-DF 12345' },
    { id: 2, name: 'Ana Paula Costa', status: 'Disponível', leadsCount: 18, color: '#10b981', creci: 'CRECI-DF 67890' },
    { id: 3, name: 'Marcos Oliveira', status: 'Disponível', leadsCount: 11, color: '#f59e0b', creci: 'CRECI-DF 54321' },
    { id: 4, name: 'Patricia Souza', status: 'Ausente', leadsCount: 9, color: '#ef4444', creci: 'CRECI-DF 09876' }
  ]);

  const [roundRobinIndex, setRoundRobinIndex] = useState(0);

  // Lista de Imóveis cadastrados
  const [properties, setProperties] = useState([
    { 
      id: '1', 
      title: 'Sobrado de Alto Padrão - Taquari', 
      price: 'R$ 1.350.000', 
      location: 'Lago Norte, Brasília - DF',
      mapsLink: 'https://maps.app.goo.gl/example1',
      specs: '4 Quartos | 5 Banheiros | 3 Vagas',
      image: '/gemini_casa.png',
      images: [
        { url: '/gemini_casa.png', ratio: '1:1' },
        { url: '/creativo_casa.png', ratio: '9:16' }
      ],
      rule: 'CPF Regular',
      leadsCount: 12,
      brokerName: 'Roberto Silva',
      brokerCreci: 'CRECI-DF 12345'
    },
    { 
      id: '2', 
      title: 'Galpão Comercial Modular', 
      price: 'R$ 3.800.000', 
      location: 'Setor de Indústrias, Brasília - DF',
      mapsLink: 'https://maps.app.goo.gl/example2',
      specs: '1200 m² | 4 Docas | Escritório',
      image: '/casa_certa.png',
      images: [
        { url: '/casa_certa.png', ratio: '1:1' },
        { url: '/casa_certa.png', ratio: '9:16' }
      ],
      rule: 'CNPJ Ativo',
      leadsCount: 5,
      brokerName: 'Ana Paula Costa',
      brokerCreci: 'CRECI-DF 67890'
    },
    { 
      id: '3', 
      title: 'Apartamento Vista Lago', 
      price: 'R$ 780.000', 
      location: 'Sudoeste, Brasília - DF',
      mapsLink: 'https://maps.app.goo.gl/example3',
      specs: '2 Quartos | 1 Suíte | 2 Vagas',
      image: '/casacerta_sem_marca.png',
      images: [
        { url: '/casacerta_sem_marca.png', ratio: '1:1' },
        { url: '/casacerta_sem_marca.png', ratio: '9:16' }
      ],
      rule: 'CPF Regular',
      leadsCount: 22,
      brokerName: 'Marcos Oliveira',
      brokerCreci: 'CRECI-DF 54321'
    }
  ]);

  // Lista de Leads cadastrados/recebidos
  const [leads, setLeads] = useState([
    {
      id: 'L01',
      name: 'Carlos Albuquerque',
      document: '423.859.102-34',
      docType: 'CPF',
      docStatus: 'Regular',
      propertyName: 'Sobrado de Alto Padrão - Taquari',
      brokerName: 'Roberto Silva',
      brokerCreci: 'CRECI-DF 12345',
      stage: 'Em Atendimento',
      date: '19/07/2026',
      whatsapp: '61992384758'
    },
    {
      id: 'L02',
      name: 'Nova Aliança Alimentos Ltda',
      document: '12.845.928/0001-20',
      docType: 'CNPJ',
      docStatus: 'Regular',
      propertyName: 'Galpão Comercial Modular',
      brokerName: 'Ana Paula Costa',
      brokerCreci: 'CRECI-DF 67890',
      stage: 'Novo',
      date: '19/07/2026',
      whatsapp: '61988472948'
    },
    {
      id: 'L03',
      name: 'Mariana Pires',
      document: '098.283.483-20',
      docType: 'CPF',
      docStatus: 'Regular',
      propertyName: 'Apartamento Vista Lago',
      brokerName: 'Marcos Oliveira',
      brokerCreci: 'CRECI-DF 54321',
      stage: 'Proposta',
      date: '18/07/2026',
      whatsapp: '61991823746'
    },
    {
      id: 'L04',
      name: 'ConstruMais Engenharia',
      document: '44.829.390/0001-99',
      docType: 'CNPJ',
      docStatus: 'Irregular / Inativo',
      propertyName: 'Galpão Comercial Modular',
      brokerName: 'Sistema (Barrado)',
      brokerCreci: '',
      stage: 'Perdido',
      date: '17/07/2026',
      whatsapp: '61985736452'
    }
  ]);

  // Novo imóvel form state
  const [newProperty, setNewProperty] = useState({
    title: '',
    price: '',
    location: '',
    mapsLink: '',
    specs: '',
    rule: 'CPF Regular',
    images: [],
    brokerName: '',
    brokerCreci: ''
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
  const [selectedPropertyId, setSelectedPropertyId] = useState('1');
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
    
    const created = {
      id: (properties.length + 1).toString(),
      ...newProperty,
      image: newProperty.images[0]?.url || '/creativo_casa.png',
      leadsCount: 0,
      brokerName: accountMode === 'solo' ? soloProfile.name : newProperty.brokerName || 'Equipe',
      brokerCreci: accountMode === 'solo' ? soloProfile.creci : newProperty.brokerCreci || ''
    };
    
    setProperties([...properties, created]);
    setNewProperty({
      title: '',
      price: '',
      location: '',
      mapsLink: '',
      specs: '',
      rule: 'CPF Regular',
      images: [],
      brokerName: '',
      brokerCreci: ''
    });
    alert('Imóvel cadastrado com sucesso!');
    setActiveTab('imoveis');
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
  const handleStartSimChat = () => {
    setSimStep(1);
    setChatMessages([
      { sender: 'bot', text: `Olá! Seja bem-vindo ao portal de atendimento do imóvel *${selectedProperty.title}*.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);
    
    setTimeout(() => {
      addBotMessage("Para podermos direcionar você ao corretor especialista ideal, preciso validar algumas informações. Você deseja atendimento como Pessoa Física ou Pessoa Jurídica?\n\nDigite *1* para **Pessoa Física (CPF)**\nDigite *2* para **Pessoa Jurídica (CNPJ)**", 500);
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
      if (userMsg === '1') {
        setSimLeadType('PF');
        setSimStep(3);
        addBotMessage("Ótimo! Para prosseguir com o cadastro de Pessoa Física, digite seu **Nome Completo**, seu **CPF** e sua **Data de Nascimento** (exemplo: *João da Silva, 123.456.789-00, 15/08/1990*).", 1000);
      } else if (userMsg === '2') {
        setSimLeadType('PJ');
        setSimStep(3);
        addBotMessage("Excelente! Para prosseguir com o cadastro empresarial, por favor digite o **CNPJ** da sua empresa (exemplo: *12.345.678/0001-90*).", 1000);
      } else {
        addBotMessage("Desculpe, não entendi. Digite *1* para Pessoa Física ou *2* para Pessoa Jurídica.", 800);
      }
    } 
    else if (simStep === 3) {
      setSimStep(4);
      addBotMessage("Perfeito! Recebi os dados. Estou realizando a consulta e validação automática na Receita Federal via API... 🔄 Aguarde um instante.", 1000);

      const consultarDocumento = async () => {
        let infoText = '';
        let leadName = '';
        let leadDoc = '';

        if (simLeadType === 'PF') {
          const parts = userMsg.split(',');
          leadName = parts[0]?.trim() || "Lead Simulado PF";
          leadDoc = parts[1]?.trim() || "000.000.000-00";

          if (apiToken) {
            try {
              const res = await fetch(`https://api.invertexto.com/v1/validator?token=${apiToken}&value=${leadDoc.replace(/\D/g, '')}&type=cpf`);
              const data = await res.json();
              if (data.valid) {
                infoText = `✅ **CPF Regularizado!**\n**Nome:** ${leadName}\n**Situação Cadastral:** REGULAR\n**Validação:** Aprovado para financiamento.`;
              } else {
                addBotMessage(`⚠️ **CPF Inválido!** O CPF informado não foi validado pela Receita Federal. Verifique os dados e tente novamente.`, 1000);
                setTimeout(() => setSimStep(6), 2000);
                return;
              }
            } catch {
              addBotMessage(`⚠️ Erro ao consultar a API. Usando validação simulada.`, 1000);
              infoText = `✅ **CPF Regularizado (simulado)!**\n**Nome:** ${leadName}\n**Situação Cadastral:** REGULAR`;
            }
          } else {
            infoText = `✅ **CPF Regularizado!**\n**Nome:** ${leadName}\n**Situação Cadastral:** REGULAR\n**Validação:** Aprovado para financiamento.`;
          }
        } else {
          leadName = "Empresa Comercial Simulação Ltda";
          leadDoc = userMsg;

          if (apiToken) {
            try {
              const cleanCnpj = leadDoc.replace(/\D/g, '');
              const res = await fetch(`https://api.invertexto.com/v1/cnpj/${cleanCnpj}?token=${apiToken}`);
              const data = await res.json();
              if (data && data.nome_fantasia) {
                leadName = data.nome_fantasia || data.razao_social || leadName;
                infoText = `✅ **CNPJ Ativo!**\n**Razão Social:** ${data.razao_social || leadName}\n**Nome Fantasia:** ${data.nome_fantasia || '-'}\n**Situação Cadastral:** ${data.situacao || 'ATIVA'}\n**Regime Tributário:** ${data.regime_tributario || 'Lucro Presumido'}`;
              } else if (data && data.error) {
                addBotMessage(`⚠️ **CNPJ não encontrado!** ${data.error}`, 1000);
                setTimeout(() => setSimStep(6), 2000);
                return;
              } else {
                infoText = `✅ **CNPJ Ativo!**\n**Razão Social:** ${leadName}\n**Situação Cadastral:** ATIVA`;
              }
            } catch {
              addBotMessage(`⚠️ Erro ao consultar a API. Usando validação simulada.`, 1000);
              infoText = `✅ **CNPJ Ativo (simulado)!**\n**Razão Social:** ${leadName}\n**Situação Cadastral:** ATIVA`;
            }
          } else {
            infoText = `✅ **CNPJ Ativo!**\n**Razão Social:** ${leadName}\n**Situação Cadastral:** ATIVA\n**Regime Tributário:** Lucro Presumido`;
          }
        }

        if (selectedProperty.rule === 'CNPJ Ativo' && simLeadType === 'PF') {
          addBotMessage(`⚠️ **Aviso de Restrição**:\nEste imóvel comercial exige exclusivamente cadastro corporativo (CNPJ). Seus dados de CPF foram validados, mas não atendem aos critérios deste imóvel.`, 1000);
          setTimeout(() => {
            addBotMessage("Estou encerrando nosso contato por aqui. Caso tenha interesse em outros imóveis residenciais, fique à vontade para acessar nosso portal. Obrigado! 🙏", 1000);
            setLeads(prev => [{
              id: 'L' + (prev.length + 1).toString().padStart(2, '0'),
              name: leadName, document: leadDoc, docType: simLeadType,
              docStatus: 'Inválido p/ Imóvel', propertyName: selectedProperty.title,
              brokerName: 'Sistema (Desqualificado)', brokerCreci: '',
              stage: 'Perdido', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999998888'
            }, ...prev]);
            setSimStep(6);
          }, 2200);
        } else {
          addBotMessage(infoText, 500);
          setTimeout(() => {
            setSimStep(5);
            addBotMessage("Seus dados atendem a todos os requisitos do imóvel! 🎰 **Roteando atendimento...** Sorteando corretor de plantão na roleta da equipe comercial...", 1000);
            setTimeout(() => {
              let assignedBroker;
              if (accountMode === 'solo') {
                assignedBroker = { name: soloProfile.name, id: 'solo', creci: soloProfile.creci };
                addBotMessage(`🎉 **Lead Direcionado!**\nO lead foi registrado diretamente para o corretor **${soloProfile.name}** (${soloProfile.creci}).\n\nVocê receberá a notificação no WhatsApp ${soloProfile.whatsapp}. Obrigado pelo contato!`, 1000);
              } else {
                const availableBrokers = brokers.filter(b => b.status === 'Disponível');
                const nextIndex = roundRobinIndex % availableBrokers.length;
                assignedBroker = availableBrokers[nextIndex];
                setRoundRobinIndex(prev => prev + 1);
                addBotMessage(`🎉 **Atendimento Direcionado!**\nO corretor sorteado para te atender é o **${assignedBroker.name}** (${assignedBroker.creci}).\n\nEle já recebeu toda a sua ficha cadastral e entrará em contato em instantes no seu WhatsApp pessoal. Obrigado pelo contato!`, 1000);
              }
              setLeads(prev => [{
                id: 'L' + (prev.length + 1).toString().padStart(2, '0'),
                name: leadName, document: leadDoc, docType: simLeadType,
                docStatus: 'Regular', propertyName: selectedProperty.title,
                brokerName: assignedBroker.name, brokerCreci: assignedBroker.creci || '',
                stage: 'Novo', date: new Date().toLocaleDateString('pt-BR'), whatsapp: '61999997777'
              }, ...prev]);
              if (accountMode === 'team') {
                setBrokers(prevBrokers => prevBrokers.map(b => b.id === assignedBroker.id ? { ...b, leadsCount: b.leadsCount + 1 } : b));
              }
              setProperties(prevProps => prevProps.map(p => p.id === selectedProperty.id ? { ...p, leadsCount: p.leadsCount + 1 } : p));
              setSimStep(6);
            }, 2500);
          }, 2000);
        }
      };
      consultarDocumento();
    }
  };

  // Reiniciar Simulador
  const handleResetSim = () => {
    setSimStep(0);
    setChatMessages([]);
    setTypedMessage('');
  };

  // Contagem de leads por estágio
  const getLeadsByStage = (stage) => leads.filter(l => l.stage === stage);

  return (
    <div className="app-container">

      {/* ===== ONBOARDING SCREEN ===== */}
      {accountMode === 'onboarding' && onboardingStep === 'select' && (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), var(--background)', padding: '40px 20px' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div className="logo-icon" style={{ width: '44px', height: '44px', fontSize: '18px' }}>IF</div>
            <span className="logo-text" style={{ fontSize: '28px' }}>ImobiFlow</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '48px', textAlign: 'center' }}>Plataforma de qualificação e distribuição de leads imobiliários</p>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '8px', textAlign: 'center' }}>Como você quer usar a plataforma?</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '36px', textAlign: 'center' }}>Escolha o perfil que melhor descreve o seu caso</p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '760px', width: '100%' }}>
            
            {/* Cartão: Corretor Independente */}
            <div 
              className="mode-card"
              onClick={() => { setSelectedMode('solo'); setOnboardingStep('register'); }}
            >
              <div className="mode-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>🧑‍💼</div>
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
              <div className="mode-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>🏢</div>
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
            <div className="logo-icon" style={{ width: '44px', height: '44px', fontSize: '18px' }}>IF</div>
            <span className="logo-text" style={{ fontSize: '28px' }}>ImobiFlow</span>
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
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏢</div>
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
      {accountMode !== 'onboarding' && (<>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">IF</div>
          <span className="logo-text">ImobiFlow</span>
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
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'imoveis' ? 'active' : ''}`}
                onClick={() => setActiveTab('imoveis')}
              >
                <Home size={18} />
                Imóveis Cadastrados
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setActiveTab('leads')}
              >
                <Users size={18} />
                Fila de Leads
              </a>
            </li>
            <li>
              <a 
                className={`nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
                onClick={() => setActiveTab('kanban')}
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
                  onClick={() => setActiveTab('equipe')}
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
                  onClick={() => setActiveTab('perfil')}
                >
                  <UserCheck size={18} />
                  Meu Perfil
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div 
            style={{ fontSize: '10px', color: apiToken ? 'var(--success)' : 'var(--muted)', textAlign: 'center', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
            onClick={() => document.getElementById('api-token-input')?.focus()}
          >
            {apiToken ? '🔌 API Invertexto conectada' : '⚡ Modo simulação'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              id="api-token-input"
              type="text"
              className="form-control"
              placeholder="Token Invertexto"
              value={apiToken}
              onChange={(e) => { setApiToken(e.target.value); localStorage.setItem('invertexto_token', e.target.value); }}
              style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'center' }}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              handleResetSim();
              setActiveTab('simulador');
            }}
          >
            <Play size={16} />
            Simulador de Lead
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
                        <th>CPF / CNPJ</th>
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
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🧑‍💼</div>
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
                        API de {property.rule.split(' ')[0]} ativa
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
                            setSelectedPropertyId(property.id);
                            handleResetSim();
                            setActiveTab('simulador');
                          }}
                        >
                          Ver Landing
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
                      <option value="CPF Regular">Exigir CPF Regular (B2C)</option>
                      <option value="CNPJ Ativo">Exigir CNPJ Ativo (B2B)</option>
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
                      <div className="chat-avatar bot">Robô</div>
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
                                ? "Digite 1 para PF ou 2 para PJ..." 
                                : simStep === 3 && simLeadType === 'PF'
                                ? "Digite: Seu Nome, CPF, Data Nascimento..."
                                : "Digite o CNPJ da empresa..."
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
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🧑‍💼</div>
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
