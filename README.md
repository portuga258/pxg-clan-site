# 🏰 Lá Eles - Clan PokéXGames (PXG)

Site completo para gerenciamento do clan **Lá Eles** do PokéXGames, com sistema de fichas de personagens, empréstimo de Pokémon e requisição de itens de hunt.

> **Slogan:** *"Se marcar bobeira na hunt... Lá Eles!"*

## 📋 Funcionalidades

### 🏠 Home / Dashboard
- Banner do clan com brasão, slogan e status de recrutamento
- Mural de avisos (eventos, regras, manutenções)
- Ranking de combate (Top Level) e Ranking de Profissões
- Membros online em tempo real
- Ações rápidas para navegação

### 👥 Fichas de Personagem (Dossiê)
- Perfil completo: nome, level, vocação, clan type, horário de pico
- **4 Profissões Oficiais do PXG** (dados da Wiki oficial):
  - ⚙️ **Engenheiro** - Minérios, Pokébolas, Crypto Diamond, Tech Data | Especializações: Hacker/Mechanic
  - 📚 **Professor** - Philosopher Stone, Estudantes, Dungeons Acadêmico
  - 🎨 **Estilista** - Style Points, Logs, Purpleheart Log, Nightmare Style Points | Especializações: Designer/Decorator
  - 🗺️ **Aventureiro** - Mapas, Dungeons Semanais, Cozinheiro, Dungeons Arqueólogo
- Sistema de Ranks unificado (E → D → C → B → A → S)
- Badges: Líder 👑, Officer 🛡️, Master Crafter 🧪

### 📦 Sistema de Empréstimo (Loaner Registry)
- Registry de Pokémon disponíveis para empréstimo
- Filtros: Tipo, Nível mínimo, Utilidade (Blocker, Hiker, Fly, Healer, High DPS, etc.)
- Status: Disponível / Emprestado / Pendente
- Solicitação de empréstimo com notificação ao dono
- Aprovação/devolução controlada

### 🛒 Requisição de Itens (Loot & Supply Pipeline)
- Catálogo de pedidos com matching por profissão/hunt
- Status: Aberto → Em Coleta → Pronto p/ Entrega → Concluído
- Transições de status controladas por permissão (solicitante, coletor, leader/officer)
- Modal de novo pedido com seleção de coletor, categoria, profissão necessária
- Progress bar de coleta (quantidade coletada / total)

### 🔐 Autenticação (Backend Ready)
- Discord OAuth2 configurado
- Roles: Leader, Officer, Member
- JWT tokens com refresh
- Vinculação de personagem in-game

## 🛠 Tech Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + Vite 7 + Tailwind CSS 3 |
| **Backend** | Node.js 18+ + Express 4 + SQLite (better-sqlite3) |
| **Auth** | Discord OAuth2 + JWT |
| **UI** | Design System customizado (Dark Glassmorphism) |
| **Icons** | SVGs inline (zero dependências externas) |
| **Charts** | Progress bars customizados |

## 🎨 Design System - Dark Glassmorphism PXG

### Paleta de Cores
```css
/* Base */
--bg-primary: #0a0a0c;      /* Preto profundo */
--bg-secondary: #0f172a;    /* Slate 950 */
--bg-tertiary: #1a1a2e;     /* Roxo muito escuro */
--bg-card: #11131a;         /* Card background */

/* Accents */
--neon-green: #00ff88;      /* Verde neon (Gengar aura) */
--neon-red: #ff0044;        /* Vermelho neon */
--cyan: #00d4ff;            /* Ciano */
--gold: #ffd700;            /* Dourado rankings */
--purple: #2a0845;          /* Roxo sombrio */

/* Texto */
--text-primary: #f8fafc;    /* Branco suave */
--text-secondary: #94a3b8;  /* Cinza médio */
--text-muted: #64748b;      /* Cinza escuro */
```

### Tipografia
- **Display:** Orbitron (títulos, números, badges)
- **Body:** Space Grotesk (textos, UI)
- **Mono:** JetBrains Mono (números, códigos)

### Componentes Principais
- `GlassCard` / `GlassPanel` - Cards com glassmorphism
- `Button` (primary, secondary, danger, ghost)
- `Badge` (leader, officer, master-crafter, status)
- `Avatar` (com clan type e status online)
- `Progress` / `SkillProgress` - Barras de progresso
- `Modal` / `ConfirmModal` - Modais acessíveis
- `Dropdown`, `Tooltip`, `Tabs`, `Table`

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm 9+

### Backend
```bash
cd backend
npm install
npm run db:init      # Cria tabelas SQLite
npm run db:seed      # Popula com dados de exemplo
npm run dev          # Roda em http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Roda em http://localhost:3000
```

### Variáveis de Ambiente (Backend)
```env
# backend/.env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-key-min-32-chars
DISCORD_CLIENT_ID=your_discord_app_id
DISCORD_CLIENT_SECRET=your_discord_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback
DATABASE_PATH=./data/pxg-clan.db
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 📁 Estrutura do Projeto

```
pxg-clan-site/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Design System (Button, Card, Badge, etc.)
│   │   │   └── layout/      # Navbar, Layout, PageLayout, Section, Grid
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── MemberDetail.jsx
│   │   │   ├── Loans.jsx
│   │   │   └── Items.jsx
│   │   ├── data/
│   │   │   └── mockData.js  # Dados mockados (wiki PXG)
│   │   ├── lib/
│   │   │   ├── icons.jsx    # SVGs inline
│   │   │   └── utils.js     # Helpers (cn, formatDate, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/          # REST API endpoints
│   │   │   ├── auth.js          # Discord OAuth2
│   │   │   ├── characters.js    # CRUD personagens
│   │   │   ├── professions.js   # Profissões e rankings
│   │   │   ├── pokemonLoans.js  # Empréstimos
│   │   │   ├── itemRequests.js  # Requisições de itens
│   │   │   ├── announcements.js # Mural de avisos
│   │   │   └── clan.js          # Info do clan, rankings
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT + Discord OAuth
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── initDb.js        # Schema SQLite
│   │   │   └── seedDb.js        # Seed com dados wiki
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 📚 Fontes de Dados (Wiki Oficial PXG)

Todas as informações de profissões, ranks, recursos e NPCs foram extraídas da **Wiki Oficial do PokéXGames**:

- [Profissões](https://wiki.pokexgames.com/index.php/Profissões) - Visão geral das 4 profissões
- [Engenheiro](https://wiki.pokexgames.com/Engenheiro) - Ranks, recursos, especializações Hacker/Mechanic
- [Professor](https://wiki.pokexgames.com/Professor) - Philosopher Stone, Estudantes, Dungeons Acadêmico
- [Estilista](https://wiki.pokexgames.com/Estilista) - Style Points, Logs, especializações Designer/Decorator
- [Aventureiro](https://wiki.pokexgames.com/Aventureiro) - Mapas, Dungeons Semanais, Cozinheiro
- [Craft de Profissões](https://wiki.pokexgames.com/Craft_de_Profissões) - Todos os crafts por profissão/rank

> **Nota:** O PXG possui **exatamente 4 profissões** (Engenheiro, Professor, Estilista, Aventureiro). Não existem Farmer, Alchemist, Breeder, Explorer no jogo oficial.

## 🎯 Sistema de Ranks (Oficial - Idêntico para todas as profissões)

| Rank | Skill | Level Mín | Label |
|------|-------|-----------|-------|
| E | 0-20 | 10 | Novato |
| D | 20-40 | 35 | Iniciante |
| C | 40-60 | 70 | Aprendiz |
| B | 60-80 | 140 | Veterano |
| A | 80-100 | 250 | Expert |
| S | 100-120 | 300 | Mestre |

**Rank S Requirements:** Skill 100 + Level 300 + Quest de Introdução no Nightmare World

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy pasta dist/
```

### Backend (Railway/Render/Fly.io)
```bash
# Configurar variáveis de ambiente
# Build: npm install
# Start: npm start
```

## 📝 Licença

Projeto não-oficial, feito por fãs para fãs do PokéXGames. Todos os direitos do jogo pertencem aos seus respectivos donos.

---

**Clan:** Lá Eles | **Tag:** LAELES | **Discord:** [discord.gg/pxg-clan](https://discord.gg/pxg-clan)

*Se marcar bobeira na hunt... Lá Eles!* 👻