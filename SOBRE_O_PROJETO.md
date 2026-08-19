# ImobiFlow — Visão Geral do Projeto

Plataforma web (SPA) para **gestão imobiliária** com **qualificação automática de leads**, **CRM Kanban** e **landing pages públicas de imóveis** com atendimento via WhatsApp.

## Stack

- **Frontend:** React 19 + Vite 8, JavaScript (ESM).
- **UI:** CSS customizado, ícones `lucide-react`.
- **Backend / DB:** Supabase (PostgreSQL + Auth + RLS).
- **IA:** Integração opcional com Groq (`llama-3.3-70b-versatile`) para o chatbot.
- **Deploy:** Vercel (`vercel.json` com rewrite SPA para `index.html`).
- **Imagens:** `sharp` para otimização no build.

## Modelo de Negócio

Dois perfis de usuário:

- **Corretor independente (`solo`)** — trabalha sozinho; todos os leads qualificados vão direto para o WhatsApp dele.
- **Imobiliária / Equipe (`team`)** — gerencia uma equipe de corretores; leads são distribuídos por **roleta (round-robin)** entre os corretores ativos.

## Funcionalidades Principais

### 1. Autenticação e Perfis
- Login e cadastro via Supabase Auth (`signInWithPassword` / `signUp`).
- Fluxo de cadastro com escolha de modo (solo ou equipe), criação de equipe + corretor admin no mesmo passo.
- Hook `useAuth` centraliza estado de sessão e perfil do corretor.

### 2. Dashboard
- Métricas globais: total de leads, qualificados, desqualificados e imóveis ativos.
- Tabela de leads recentes.
- Visão da "roleta de plantão" (corretores disponíveis/ausentes/bloqueados e contagem de leads).

### 3. Cadastro e Gestão de Imóveis
- Formulário com título, preço, localização, link do Google Maps, especificações, imagens (com proporção 1:1 / 4:3 / 9:16) e **regra de renda mínima** para qualificação.
- Cada imóvel gera automaticamente uma URL pública limpa (sem `?id=`), no formato `/imoveis/<slug>`.
- Exclusão de imóveis (leads associados são preservados).

### 4. CRM Kanban de Leads
- Estágios: `Novo`, `Em Atendimento`, `Proposta`, `Fechado`, `Perdido`.
- Mover leads entre colunas atualizando o campo `estagio` no Supabase.
- Listagem detalhada com documento, escore, corretor atribuído e imóvel.

### 5. Gestão de Equipe (apenas modo `team`)
- Adicionar corretores (nome, CRECI, WhatsApp).
- Alternar **disponibilidade** (ativo ↔ ausente).
- **Bloquear / desbloquear** corretor (bloqueados não recebem leads).
- Remover corretor da equipe.

### 6. Landing Page Pública do Imóvel
- Acessível em `/imoveis/<slug>` sem necessidade de login.
- Mostra fotos, preço, specs, localização, link do Maps e dados do corretor.
- SEO por imóvel via componente `SEOHead` (Open Graph + Twitter Cards).
- Páginas legais acessíveis: Política de Privacidade e Termos de Uso.

### 7. Chat de Qualificação (WhatsApp-style)
- **Simulador interno** no painel do corretor, espelhando a experiência do lead.
- **Chat público** na landing page, com menu FAB (Falar com atendente / Agendar visita / Sair).
- Coleta nome → renda → aplica escore conforme faixa salarial:

  | Faixa de renda | Escore |
  |---|---|
  | Até R$ 3.000 | 25 |
  | R$ 3.000 a R$ 5.000 | 50 |
  | R$ 5.000 a R$ 7.000 | 75 |
  | R$ 7.000 a R$ 10.000 | 100 |
  | Acima de R$ 10.000 | 100 |

  - Escore mínimo exigido pela regra do imóvel (mínimo 50).
  - **Lead aprovado** → salvo com status `Regular` e atribuído ao corretor (solo → próprio; equipe → próximo da roleta).
  - **Lead reprovado** → salvo com status `Inválido p/ Imóvel`, estágio `Perdido`.
- Incrementa automaticamente `leads_count` do imóvel e do corretor sorteado.
- **Modo IA (Groq):** conversa natural que coleta nome, profissão e renda e retorna um bloco `---DADOS_LEAD---` para extração estruturada.

### 8. Integração WhatsApp
- Após qualificação, o lead aprovado recebe um botão **"Falar no WhatsApp"** que abre `https://wa.me/<número>` com mensagem pré-preenchida.

## Modelo de Dados (Supabase)

- **`equipes`** — imobiliárias (id, nome, admin_user_id).
- **`corretores`** — perfis de corretores (solo ou team), com `status`, `is_admin`, `leads_count`, vínculo à equipe.
- **`imoveis`** — catálogo de imóveis com `imagens` (JSONB), `regra` de renda, dados do corretor responsável e contador de leads.
- **`leads`** — leads captados, com documento, escore, estágio do funil e vínculo ao imóvel/corretor/equipe.

Todas as tabelas usam **Row Level Security (RLS)**, com leitura pública apenas para imóveis e políticas de inserção/leitura/atualização/exclusão por dono ou equipe.

## Estrutura do Código

```
src/
├── App.jsx              # App principal: auth, dashboard, kanban, simulador, landing pública
├── main.jsx             # Bootstrap React
├── index.css / App.css  # Estilos globais
├── components/
│   ├── SEOHead.jsx
│   ├── PrivacyPolicy.jsx
│   └── TermsOfUse.jsx
├── hooks/
│   ├── useAuth.js       # Sessão, login, signup solo/team, logout
│   └── useData.js       # CRUD de imóveis, leads, corretores + mappers
└── lib/
    ├── supabase.js      # Cliente Supabase
    └── seoUtils.js      # Geração e busca de slugs SEO das landing pages
```

## Scripts

- `npm run dev` — servidor Vite.
- `npm run build` — build de produção em `dist/`.
- `npm run preview` — preview do build.
- `npm run lint` — Oxlint.

## Resumo em uma frase

O **ImobiFlow** é um CRM imobiliário que captura leads em landing pages por imóvel, qualifica-os automaticamente por faixa de renda (com IA opcional), distribui entre corretores via roleta e entrega o lead quente direto no WhatsApp do responsável.
