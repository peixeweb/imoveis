import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function mapProperty(p) {
  return {
    id: p.id,
    title: p.titulo,
    price: p.preco,
    location: p.localizacao || '',
    mapsLink: p.maps_link || '',
    specs: p.specs || '',
    rule: p.regra,
    images: Array.isArray(p.imagens) ? p.imagens : [],
    image: Array.isArray(p.imagens) && p.imagens.length > 0 ? p.imagens[0].url : '',
    leadsCount: p.leads_count || 0,
    corretorId: p.corretor_id || null,
    equipeId: p.equipe_id || null,
    brokerName: p.corretor_nome || '',
    brokerCreci: p.corretor_creci || '',
    brokerWhatsapp: p.corretor_whatsapp || '',
  };
}

export function mapLead(l) {
  return {
    id: l.id,
    name: l.nome,
    document: l.documento || '',
    docType: l.doc_tipo || '',
    docStatus: l.doc_status || '',
    propertyName: l.imovel_nome || '',
    brokerName: l.corretor_nome || '',
    brokerCreci: l.corretor_creci || '',
    stage: l.estagio || 'Novo',
    whatsapp: l.whatsapp || '',
    date: new Date(l.created_at).toLocaleDateString('pt-BR'),
  };
}

export function mapBroker(b) {
  return {
    id: b.id,
    userId: b.user_id,
    name: b.nome,
    whatsapp: b.whatsapp || '',
    creci: b.creci || '',
    dbStatus: b.status,
    status: b.status === 'bloqueado' ? 'Bloqueado' : b.status === 'ausente' ? 'Ausente' : 'Disponível',
    leadsCount: b.leads_count || 0,
    isAdmin: b.is_admin || false,
  };
}

export default function useData() {
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [roundRobinIndex, setRoundRobinIndex] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  const loadAllData = useCallback(async (profile) => {
    setLoadingData(true);
    try {
      let propQ = supabase.from('imoveis').select('*').order('created_at', { ascending: false });
      if (profile.modo === 'team' && profile.equipe_id) propQ = propQ.eq('equipe_id', profile.equipe_id);
      else propQ = propQ.eq('corretor_id', profile.id);
      const { data: propsData } = await propQ;
      setProperties((propsData || []).map(mapProperty));

      let leadQ = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (profile.modo === 'team' && profile.equipe_id) leadQ = leadQ.eq('equipe_id', profile.equipe_id);
      else leadQ = leadQ.eq('corretor_id', profile.id);
      const { data: leadsData } = await leadQ;
      setLeads((leadsData || []).map(mapLead));

      if (profile.modo === 'team' && profile.equipe_id) {
        const { data: brokersData } = await supabase.from('corretores').select('*').eq('equipe_id', profile.equipe_id).order('created_at');
        setBrokers((brokersData || []).map(mapBroker));
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  const refreshData = useCallback((profile) => profile && loadAllData(profile), [loadAllData]);

  const handleCreateProperty = useCallback(async (newProperty, corretorProfile, brokers) => {
    if (!newProperty.title || !newProperty.price) return null;

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

    if (error) { alert('Erro ao cadastrar imóvel: ' + error.message); return null; }

    const mapped = mapProperty(data);
    setProperties(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  const handleDeleteProperty = useCallback(async (id) => {
    if (!window.confirm('Excluir este imóvel? Os leads associados serão mantidos.')) return;
    await supabase.from('imoveis').delete().eq('id', id);
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDeleteLead = useCallback(async (id) => {
    if (!window.confirm('Excluir este lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const handleMoveLead = useCallback(async (leadId, newStage) => {
    await supabase.from('leads').update({ estagio: newStage }).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
  }, []);

  const saveLead = useCallback(async ({ name, document, docType, docStatus, propertyName, propertyId, brokerName, brokerCreci, corretorId, stage, whatsapp }, corretorProfile) => {
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
  }, []);

  const incrementPropertyLeads = useCallback(async (propertyId, properties) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) return;
    const newCount = prop.leadsCount + 1;
    await supabase.from('imoveis').update({ leads_count: newCount }).eq('id', propertyId);
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, leadsCount: newCount } : p));
  }, []);

  const handleAddBroker = useCallback(async (newBroker, equipeId) => {
    if (!newBroker.name || !newBroker.creci) return null;
    const { data, error } = await supabase.from('corretores').insert({
      nome: newBroker.name, whatsapp: newBroker.whatsapp, creci: newBroker.creci,
      modo: 'team', equipe_id: equipeId, status: 'ativo', leads_count: 0, is_admin: false,
    }).select().single();
    if (data) setBrokers(prev => [...prev, mapBroker(data)]);
    return data;
  }, []);

  const handleToggleAvailability = useCallback(async (id, currentDbStatus) => {
    if (currentDbStatus === 'bloqueado') return;
    const newStatus = currentDbStatus === 'ativo' ? 'ausente' : 'ativo';
    await supabase.from('corretores').update({ status: newStatus }).eq('id', id);
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, dbStatus: newStatus, status: newStatus === 'ativo' ? 'Disponível' : 'Ausente' } : b));
  }, []);

  const handleToggleBlock = useCallback(async (id, currentDbStatus) => {
    const newStatus = currentDbStatus === 'bloqueado' ? 'ativo' : 'bloqueado';
    const action = currentDbStatus === 'bloqueado' ? 'desbloquear' : 'bloquear';
    if (!window.confirm(`Deseja ${action} este corretor? Corretores bloqueados não recebem leads.`)) return;
    await supabase.from('corretores').update({ status: newStatus }).eq('id', id);
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, dbStatus: newStatus, status: newStatus === 'bloqueado' ? 'Bloqueado' : 'Disponível' } : b));
  }, []);

  const handleRemoveBroker = useCallback(async (id) => {
    if (!window.confirm('Remover este corretor da equipe? Esta ação não pode ser desfeita.')) return;
    await supabase.from('corretores').delete().eq('id', id);
    setBrokers(prev => prev.filter(b => b.id !== id));
  }, []);

  return {
    properties, setProperties,
    leads, setLeads,
    brokers, setBrokers,
    roundRobinIndex, setRoundRobinIndex,
    loadingData, setLoadingData,
    loadAllData,
    refreshData,
    handleCreateProperty,
    handleDeleteProperty,
    handleDeleteLead,
    handleMoveLead,
    saveLead,
    incrementPropertyLeads,
    handleAddBroker,
    handleToggleAvailability,
    handleToggleBlock,
    handleRemoveBroker,
  };
}