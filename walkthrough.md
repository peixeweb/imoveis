# Walkthrough - Implementação Inicial do ImobiFlow

A primeira versão funcional (frontend mockup interativo) da plataforma **ImobiFlow** foi desenvolvida com sucesso. O servidor de desenvolvimento local já está em execução.

---

## 🚀 Como Acessar a Aplicação

Acesse o seguinte endereço no seu navegador:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 🛠️ Funcionalidades Desenvolvidas

Criamos uma interface administrativa completa (Dashboard) combinada com um **Simulador de Jornada do Lead** para que você veja toda a lógica funcionando na prática sem precisar de banco de dados por enquanto.

### 1. Painel de Controle (Dashboard)
- **Métricas Globais**: Total de leads, leads qualificados, leads desqualificados (barrados) e imóveis ativos.
- **Tabela de Leads Recentes**: Exibe as últimas interações.
- **Roleta de Plantão**: Listagem dos corretores com status ("Disponível" / "Ausente") e contagem de leads direcionados a cada um.

### 2. Cadastro de Imóveis
- Listagem dos imóveis ativos nas campanhas.
- Regras de qualificação explícitas por imóvel (ex: exige CPF ou exige CNPJ).
- **Formulário de Cadastro**: Permite adicionar novos imóveis informando título, valor, especificações, localização e a regra de qualificação associada.

### 3. Fila Geral de Leads
- Histórico completo de leads captados.
- Exibe o tipo de documento informado (CPF/CNPJ), a situação cadastral retornada pela API simuladora e o corretor atribuído.
- Seletor rápido para alterar manualmente o status de negociação de cada lead.

### 4. CRM Kanban Nativo
- Pipeline de vendas com colunas: **Novo**, **Em Atendimento**, **Proposta**, **Fechado/Ganho** e **Perdido/Barrado**.
- Permite mover os leads de coluna clicando em "Atender", "Proposta", "Fechar Venda", etc.

### 5. Simulador de Lead (WhatsApp + Landing Page)
Este é o coração do MVP. Ele divide a tela em duas partes:
1. **Lado Esquerdo (Landing Page)**: Preview mobile do imóvel selecionado, com fotos, especificações, valor e o botão **"Falar no WhatsApp"**.
2. **Lado Direito (WhatsApp Simulator)**: Uma interface de chat idêntica ao WhatsApp. Quando o lead clica em "Falar no WhatsApp":
   - O bot inicia a saudação.
   - Pergunta se o lead é Pessoa Física (1) ou Jurídica (2).
   - Solicita os dados (CPF/CNPJ).
   - Faz uma simulação de chamada de API e exibe os dados da Receita Federal.
   - Valida se atende à regra do imóvel (se não atender, barra e marca como "Perdido").
   - Sorteia um corretor disponível na roleta (Round Robin).
   - Registra o lead no sistema em tempo real!

---

## 🧪 Teste Prático Recomendado

1. Abra a aplicação em **[http://localhost:5173/](http://localhost:5173/)**.
2. Clique no botão azul **"Simulador de Lead"** no rodapé do menu lateral esquerdo.
3. Escolha o imóvel **"Galpão Comercial Modular"** no topo da tela (este imóvel exige **CNPJ**).
4. No lado esquerdo, clique no botão **"Falar no WhatsApp"**.
5. No chat à direita:
   - Digite `1` (Pessoa Física).
   - Envie seu nome e CPF.
   - **Resultado**: O bot irá consultar e avisar que o imóvel comercial exige CNPJ, desqualificando o lead automaticamente.
6. Clique em **"Reiniciar Simulação"**.
7. Teste novamente escolhendo **Pessoa Jurídica (CNPJ)** ou simule o **"Sobrado de Alto Padrão - Taquari"** com **Pessoa Física (CPF)**:
   - Digite os dados solicitados.
   - **Resultado**: O bot validará os dados, fará o sorteio em roleta e anunciará o corretor sorteado.
8. Clique em **"Dashboard"** ou **"CRM Kanban"** no menu esquerdo e veja o novo lead cadastrado exatamente na coluna de "Novos" e associado ao corretor sorteado!
