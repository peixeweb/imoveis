import React from 'react';
import { Scale, ShieldCheck, Building2, UserCheck, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export default function TermsOfUse({ onBack }) {
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
        {/* Navigation bar */}
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
            background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(245,158,11,0.2))',
            border: '1px solid rgba(37,99,235,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#60a5fa'
          }}>
            <Scale size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px' }}>
            Termos e Condições de Uso
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
            Regras de utilização da plataforma <strong>ImobiFlow</strong>, mediação imobiliária credenciada pelo CRECI e simulações de atendimento ao cliente.
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
              <Building2 size={20} /> 1. Aceitação dos Termos
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>
              Ao acessar, navegar ou enviar solicitações de contato através das landing pages da plataforma <strong>ImobiFlow</strong>, você concorda inteiramente com estes Termos de Uso. Caso não concorde com qualquer condição estabelecida, recomendamos que não utilize os serviços da plataforma.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={20} /> 2. Intermediação Imobiliária & Registro CRECI
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '12px' }}>
              A plataforma ImobiFlow opera como ecossistema tecnológico para corretores de imóveis autônomos e imobiliárias devidamente registrados no Conselho Regional de Corretores de Imóveis (CRECI):
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Todos os anúncios de imóveis possuem identificação clara do corretor ou imobiliária responsável com respectivo número de CRECI.</li>
              <li>A negociação final, vistoria, elaboração de contratos de compra e venda ou locação são conduzidas por profissionais de corretagem habilitados.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} /> 3. Simulação de Qualificação e Preços
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>
              As informações de valores de venda/aluguel, taxas de condomínio, IPTU e especificações dos imóveis exibidos são fornecidas pelos proprietários/corretores e sujeitas a alteração sem aviso prévio. A simulação automatizada de renda e crédito não constitui aprovação prévia de financiamento bancário ou garantia contratual.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} /> 4. Uso Adequado e Proteção à Privacidade
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0 }}>
              O usuário compromete-se a fornecer informações verdadeiras ao preencher os formulários de triagem e chat. O envio de informações falsas, tentativas de invasão ou uso indevido do sistema resultarão na exclusão do atendimento. A coleta de dados é protegida conforme a nossa <strong style={{ color: '#60a5fa' }}>Política de Privacidade (LGPD)</strong>.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} /> Dúvidas e Suporte
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
              Para esclarecer qualquer dúvida sobre estes Termos de Uso ou sobre as propriedades anunciadas, entre em contato com nossa central através do e-mail: 
              <a href="mailto:contato@peixeweb.com.br" style={{ color: '#fbbf24', marginLeft: '6px', fontWeight: 600 }}>contato@peixeweb.com.br</a>.
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
