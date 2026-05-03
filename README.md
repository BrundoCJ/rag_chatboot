# RAG Chatbot

Full-stack RAG (Retrieval-Augmented Generation) Chatbot com React, tRPC, SQLite e IA.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 📋 Requisitos

- Node.js 18+
- npm ou yarn

## 🛠️ Configuração

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL=file:./rag_chatbot.db
JWT_SECRET=sua_chave_segura
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=seu_owner_id
BUILT_IN_FORGE_API_URL=https://forge.butterfly-effect.dev
BUILT_IN_FORGE_API_KEY=sua_chave_forge
```

## 📁 Estrutura do Projeto

```
rag-chatbot/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilidades
│   │   └── main.tsx     # Entry point
│   └── index.html
├── server/              # Backend Node.js
│   ├── _core/           # Configuração core
│   ├── routers/         # tRPC routers
│   ├── db.ts            # Database operations
│   ├── rag.ts           # RAG logic
│   └── storage.ts       # Storage handling
├── shared/              # Código compartilhado
│   ├── const.ts         # Constants
│   └── _core/           # Utilities
├── drizzle/             # Drizzle ORM schema
└── dist/                # Build output
```

## 📚 Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express, tRPC, Node.js
- **Database**: SQLite, Drizzle ORM
- **IA**: Gemini 2.5 Flash, Embeddings
- **Auth**: OAuth 2.0, JWT
- **Storage**: AWS S3 (via Forge API)

## 🔗 APIs Principais

### tRPC Routers

- `/api/trpc/chat.*` - Chat and conversation operations
- `/api/trpc/admin.*` - Admin dashboard and document upload
- `/api/trpc/auth.*` - Authentication
- `/api/trpc/system.*` - System health checks

### REST Endpoints

- `/api/oauth/callback` - OAuth callback
- `/manus-storage/*` - Storage proxy

## 📖 Documentação

Veja [TECHNOLOGIES.md](./TECHNOLOGIES.md) para documentação técnica detalhada.

## 🤝 Contribuindo

Faça fork, crie uma branch feature, e abra um PR.

## 📝 Licença

MIT
