import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.1) 0%, transparent 70%), #090d16',
      color: '#e2e8f0',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '40px 20px',
      lineHeight: 1.6
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Top bar navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button 
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            aria-label="Voltar para a página anterior"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Última atualização: 15 de Agosto de 2026
          </span>
        </div>

        {/* Hero Header */}
        <header style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          backdropFilter: 'blur(12px)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(16,185,129,0.2))',
            border: '1px solid rgba(37,99,235,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#3b82f6'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px' }}>
            Política de Privacidade & Proteção de Dados (LGPD)
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
            A <strong>ImobiFlow</strong> e a <strong>PEIXEWEB AGÊNCIA DIGITAL</strong> estão comprometidas com a transparência, segurança e privacidade dos seus dados em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </header>

        {/* Content Body */}
        <main style={{
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>

          {/* Section 1 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} /> 1. Introdução e Propósito
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>
              Esta Política de Privacidade descreve como a plataforma <strong>ImobiFlow</strong> coleta, armazena, utiliza e protege os dados pessoais de usuários, visitantes de landing pages imobiliárias e corretores credenciados. Ao utilizar nossos serviços ou enviar dados de contato para simulações e atendimentos de imóveis, você declara estar ciente e de acordo com os termos descritos.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={20} /> 2. Coleta e Finalidade dos Dados Pessoais
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px' }}>
              Coletamos estritamente os dados necessários para realizar a qualificação e direcionamento de potenciais compradores e locatários a corretores de imóveis credenciados pelo CRECI:
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><strong>Dados Identificadores:</strong> Nome completo, e-mail e número de telefone com WhatsApp para viabilizar a comunicação sobre o imóvel selecionado.</li>
              <li><strong>Dados Finaceiros e de Qualificação:</strong> Faixa de renda declarada e tipo de documento (Pessoa Física/Jurídica) para avaliar a compatibilidade com os critérios exigidos pelo imóvel.</li>
              <li><strong>Dados de Navegação e Dispositivo:</strong> Endereço IP, tipo de navegador e páginas visitadas para fins de segurança e prevenção a fraudes.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} /> 3. Segurança e Armazenamento dos Dados
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>
              Todos os dados trafegados na plataforma ImobiFlow são criptografados de ponta a ponta via protocolo SSL (HTTPS) e armazenados em infraestrutura de nuvem segura da Supabase com políticas rígidas de controle de acesso (Row Level Security). Não vendemos nem comercializamos dados de usuários a terceiros.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px' }}>
              4. Compartilhamento de Dados
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>
              Os dados de leads captados nas landing pages imobiliárias são compartilhados exclusivamente com o corretor responsável credenciado (identificado com CRECI ativo) ou com a imobiliária cadastrada responsável pelo imóvel pretendido, garantindo atendimento direto e ágil ao cliente.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} /> 5. Direitos do Titular de Dados (Art. 18 LGPD)
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '12px' }}>
              Como titular dos dados, você tem o direito de solicitar a qualquer momento:
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Confirmação da existência de tratamento dos seus dados;</li>
              <li>Acesso aos dados pessoais armazenados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Eliminação ou anonimização de dados pessoais desnecessários.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section style={{
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} /> Encarregado de Proteção de Dados (DPO) & Contato
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
              Para exercer seus direitos relativos à LGPD ou tirar dúvidas sobre esta Política de Privacidade, entre em contato com a equipe de proteção de dados pelo e-mail: 
              <a href="mailto:contato@peixeweb.com.br" style={{ color: '#60a5fa', marginLeft: '6px', fontWeight: 600 }}>contato@peixeweb.com.br</a>.
            </p>
          </section>
        </main>

        {/* Official Footer */}
        <footer style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <p style={{ margin: '0 0 6px' }}>© 2026 PEIXEWEB AGÊNCIA DIGITAL. TODOS OS DIREITOS RESERVADOS.</p>
          <p style={{ margin: 0 }}>ImobiFlow — Plataforma de Gestão Imobiliária & CRM de Qualificação</p>
        </footer>
      </div>
    </div>
  );
}
