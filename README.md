# Remix of Harmony Hub

PROMPT FINAL — LOVABLE
FRONTEND — DISTRIBUIDORA MUSICAL WHITE-LABEL

Quero que você desenvolva APENAS O FRONTEND de uma plataforma de Distribuição Musical White-Label, com design profissional, UX clara e arquitetura escalável, usando dados mockados (JSON/local state).

⚠️ IMPORTANTE

Nenhuma lógica real de backend
Nenhuma integração externa
Tudo deve estar preparado para futura conexão via API
Interface em portugues
Branding neutro (nome genérico tipo “Music Distribution Platform”)

1️⃣ ESTRUTURA GERAL
Layout Base

Sidebar fixa
Header superior
Área principal de conteúdo
Responsivo (desktop primeiro)

Menus principais

Visão Geral
Distribuição com submenu (gerenciar musicas, gerenciar videos)
Estatisticas Diarias com submenu (dados demograficos, estatisticas do tiktok, comparação de lojas, charts musicais, rastreadores)
Marketing com submenu (iniciar marketing, ferramentas profissionais, lista de emails de fãs)
Financeiro (analises mensais, contabilidade, gestão de shares)
Ajuda (central de suporte, meus tickets)
Configuração (meu perfil, segurança, idioma)

2️⃣ PÁGINAS OBRIGATÓRIAS

🔹 Visão Geral (HOME)

Componentes:

Cards:

Carteira (valores disponiveis e botão pra fazer saque)
Links rapidos: iniciar marketing, distribuir musica, distribuir video, acessar dados e performance)

Gráfico (mock):

Streams per DSP

Lista:

Recent Releases (com capa, nome da musica, artistas, tipo de lançamento(single,ep,album), data do lançamento, link do pre-save, status)

🔹 Gerenciar musicas

Lista de Releases

Tabela:

Capa, nome da musica, artistas, tipo de lançamento(single,ep,album), data do lançamento, link do pre-save, status)

botao: distribuir musica


🔹 DISTRIBUIR MUSICA

Stepper UI:

Release Info
Tracks
Splits
Review & Submit

Campos:

Release title
Artist
Release date
Cover upload (mock)
Tracks upload (mock)
Explicit toggle
Genre
Language

🔹 SPLITS (UI VISUAL)

Lista dinâmica de participantes
Campo percentual
Barra visual somando 100%
Validação visual

🔹 ROYALTIES

Tabela:

Track
DSP
Streams
Gross Revenue
Net Revenue
Period

Filtro:

DSP
Date

🔹 PAYOUTS

Tabela:

Artist
Amount
Method
Status
Date
Botão:

“Request Payout” (mock)

🔹 CONTRACTS

Lista de contratos
Status (Signed / Pending)
Botão “View Contract”
Botão “Sign Contract” (mock signature)

🔹 SETTINGS

Seções:

meu perfil, segurança, idioma, moeda, taxa de distribuição, dsp suportadas

🔹 SUPPORT

Ajuda (central de suporte, meus tickets)
lista de tickets, criar ticket, status

3️⃣ COMPONENTES REUTILIZÁVEIS

Data tables
Modals
Toast notifications
Stepper
Status badges
Upload components
Charts

4️⃣ UX / UI REQUIREMENTS

Clean, modern SaaS design
Neutral colors (dark + light support opcional)
Icons claros
Loading skeletons
Empty states
Error states (mock)

5️⃣ MOCK DATA

Criar arquivos JSON simulando:

Artists
Releases
Tracks
Royalties
Payouts
Simular mudanças de status via UI

6️⃣ NÃO FAZER

❌ Backend real
❌ Autenticação real
❌ Integrações externas
❌ Branding de terceiros

7️⃣ RESULTADO FINAL

Frontend navegável

UX fluida

Dados mockados realistas
Código organizado por páginas e componentes
Pronto para futura integração com backend/API

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3cac3da6-d819-459a-831e-3e94ffd90f92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
