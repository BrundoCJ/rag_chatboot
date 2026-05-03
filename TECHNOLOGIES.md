# 📚 Guia Completo de Tecnologias - RAG Chatbot

## 🎯 Visão Geral do Projeto

O **RAG Chatbot** é uma aplicação full-stack que combina:
- **Frontend**: Interface React moderna
- **Backend**: API tRPC com Node.js
- **Database**: SQLite com Drizzle ORM
- **IA**: Integração com Gemini 2.5 Flash + embeddings vetoriais
- **Autenticação**: OAuth 2.0 + JWT

**RAG** = Retrieval-Augmented Generation (busca de documentos + respostas com IA)

---

## 🛠️ Stack de Tecnologias

### 1. **Frontend**

#### React + Vite
- **O que é**: Framework JavaScript para UIs reativas
- **Por que**: Componentes reutilizáveis, estado gerenciado, performance
- **O que pesquisar**:
  - React Hooks (useState, useEffect, useContext)
  - Component Lifecycle
  - Props e State Management
  - Virtual DOM

#### TypeScript
- **O que é**: Superset do JavaScript com tipagem estática
- **Por que**: Evita erros em tempo de desenvolvimento
- **O que pesquisar**:
  - Interfaces e Types
  - Generics
  - Type Inference
  - Union Types e Type Guards

#### Tailwind CSS
- **O que é**: Framework CSS utility-first
- **Por que**: Estilo rápido sem escrever CSS customizado
- **O que pesquisar**:
  - Utility Classes
  - Responsive Design (sm:, md:, lg:)
  - Customização de tema
  - Dark Mode

#### Componentes UI (shadcn/ui)
- **O que é**: Biblioteca de componentes Radix UI + Tailwind
- **Por que**: Components acessíveis e reutilizáveis
- **O que pesquisar**:
  - Cada componente em `client/src/components/ui/`
  - Accessibility (a11y)
  - ARIA attributes

#### Hooks Customizados
- **useAuth**: Autenticação e dados do usuário
- **useComposition**: Gerenciamento de composição de mensagens
- **useMobile**: Responsividade para dispositivos móveis
- **usePersistFn**: Funções persistidas com memoização

---

### 2. **Backend**

#### Node.js + Express
- **O que é**: Runtime JavaScript no servidor
- **Por que**: Escalável, non-blocking I/O, JavaScript em ambos lados
- **O que pesquisar**:
  - Middleware do Express
  - Roteamento
  - Error handling
  - Async/Await

#### tRPC (TypeScript RPC)
- **O que é**: Framework para criar APIs type-safe
- **Por que**: Type checking do frontend ao backend automaticamente
- **O que pesquisar**:
  - Procedures (query, mutation)
  - Input/Output validation com Zod
  - Context (dados compartilhados entre procedures)
  - Error handling com TRPCError
  - Router composition

**Estrutura tRPC no projeto**:
```
server/routers/
├── system.ts    # Funções do sistema
├── auth.ts      # Autenticação e login
├── chat.ts      # Conversas e mensagens
└── admin.ts     # Funções administrativas
```

#### Zod
- **O que é**: Validação de schemas em TypeScript
- **Por que**: Valida dados em tempo de execução com type safety
- **O que pesquisar**:
  - z.object(), z.string(), z.number()
  - .parse(), .safeParse()
  - Mensagens de erro customizadas
  - Discriminated Unions

---

### 3. **Database**

#### SQLite
- **O que é**: Banco de dados relacional embutido
- **Por que**: Leve, sem servidor, perfeito para desenvolvimento
- **O que pesquisar**:
  - Schemas SQL
  - Relations e Foreign Keys
  - Queries básicas (SELECT, INSERT, UPDATE)
  - Índices para performance

#### Drizzle ORM
- **O que é**: ORM (Object-Relational Mapping) com type-safety
- **Por que**: Queries SQL com autocomplete, type checking
- **O que pesquisar**:
  - Table definitions
  - Relations (one-to-many, many-to-one)
  - Query builders (select, insert, update, delete)
  - Migrations com Drizzle
  - Schema design

**Tabelas principais**:
```
users              → Usuários autenticados
conversations      → Conversas de chat
messages           → Mensagens individuais
documents          → Documentos enviados
documentChunks     → Segmentos de documentos (chunks)
messageFeedback    → Feedback do usuário
ragEvents          → Eventos de RAG para analytics
```

---

### 4. **Autenticação & Segurança**

#### OAuth 2.0
- **O que é**: Protocolo de autenticação delegada
- **Suportado**: Google, GitHub, Apple, Microsoft, Email
- **O que pesquisar**:
  - Authorization Code Flow
  - Tokens de acesso e refresh
  - Redirects após login
  - Manus OAuth Portal (provedor customizado)

#### JWT (JSON Web Tokens)
- **O que é**: Tokens para manter sessão autenticada
- **Por que**: Stateless, funciona com múltiplos servidores
- **O que pesquisar**:
  - Estrutura JWT (header.payload.signature)
  - Claims customizados
  - Expiração de tokens
  - Refresh tokens

#### Role-Based Access Control (RBAC)
- **Roles**: user, admin
- **O que pesquisar**:
  - Middleware de autorização
  - Proteção de rotas
  - Verificação de permissões

---

### 5. **IA & RAG (Retrieval-Augmented Generation)**

#### Gemini 2.5 Flash
- **O que é**: Modelo LLM (Large Language Model) do Google
- **Por que**: Rápido, multimodal, bom custo-benefício
- **O que pesquisar**:
  - API do Google Gemini
  - Prompts e prompt engineering
  - Function calling (tool use)
  - JSON schema para respostas estruturadas
  - Rate limiting e quotas

#### Embeddings (text-embedding-3-small)
- **O que é**: Vetores numéricos que representam texto
- **Por que**: Permite buscar por similaridade semântica
- **O que pesquisar**:
  - O que é um embedding
  - Cosine similarity
  - Vector search
  - Dimensionalidade (256D neste projeto)

#### Pipeline RAG
```
1. Upload de documento
   ↓
2. Parse PDF com pdf-parse
   ↓
3. Chunking (segmentação de texto)
   ↓
4. Geração de embeddings
   ↓
5. Armazenamento em database
   ↓
6. Query do usuário
   ↓
7. Busca de chunks similares
   ↓
8. Context + Prompt → Gemini
   ↓
9. Resposta gerada
```

**O que pesquisar**:
- Estratégias de chunking (overlap, tamanho)
- Reranking de resultados
- Prompt engineering com contexto
- Tratamento de hallucinations

---

### 6. **Cloud Storage**

#### Forge API (S3-compatible)
- **O que é**: API de armazenamento em nuvem
- **URL**: https://forge.butterfly-effect.dev
- **Por que**: Armazenar PDFs e documentos
- **O que pesquisar**:
  - Upload de arquivos
  - Presigning URLs
  - Segurança de acesso
  - Políticas de retenção

---

### 7. **Build & Development**

#### Vite
- **O que é**: Bundler moderno e dev server rápido
- **Por que**: Hot Module Replacement (HMR), ESM nativo
- **O que pesquisar**:
  - vite.config.ts
  - Plugins do Vite
  - Build otimizado
  - Dev server configuration

#### TypeScript Compiler
- **O que é**: Converte TypeScript para JavaScript
- **tsconfig.json**: Configuração de compilação
- **O que pesquisar**:
  - Strictness settings
  - Target ES version
  - Module resolution
  - Path aliases

---

### 8. **Utilitários Importantes**

| Biblioteca | Uso |
|-----------|-----|
| **nanoid** | Gerar IDs únicos (sessões, mensagens) |
| **axios** | HTTP client (requisições) |
| **cookie** | Parse/manejo de cookies HTTP |
| **pdf-parse** | Extrair texto de PDFs |
| **superjson** | Serializar tipos complexos |
| **jose** | Criar/verificar JWTs |

---

## 📁 Estrutura do Projeto

```
rag-chatbot/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React + UI
│   │   ├── pages/         # Páginas (Chat, Home, Admin)
│   │   ├── hooks/         # Custom Hooks
│   │   ├── contexts/      # Context API (Theme)
│   │   ├── lib/           # Utilitários (tRPC client)
│   │   └── main.tsx       # Entry point
│   └── vite.config.ts
│
├── server/                 # Backend Node.js
│   ├── routers/           # tRPC routers
│   │   ├── chat.ts        # Chat API
│   │   ├── admin.ts       # Admin API
│   │   ├── auth.ts        # Auth API
│   │   └── system.ts      # System API
│   ├── _core/             # Core functionality
│   │   ├── llm.ts         # Gemini integration
│   │   ├── rag.ts         # RAG pipeline
│   │   ├── context.ts     # tRPC context
│   │   ├── db.ts          # Database setup
│   │   ├── oauth.ts       # OAuth config
│   │   └── ...
│   ├── db.ts              # Database exports
│   └── storage.ts         # Cloud storage
│
├── shared/                 # Código compartilhado
│   ├── types.ts           # Tipos TypeScript
│   ├── const.ts           # Constantes
│   └── _core/
│       └── errors.ts      # Definições de erros
│
├── drizzle/               # Database migrations
│   ├── schema.ts          # Definições de tabelas
│   ├── relations.ts       # Relacionamentos
│   └── migrations/
│
├── .env                   # Variáveis de ambiente
├── tsconfig.json          # Config TypeScript
├── package.json           # Dependências
└── README.md
```

---

## 🚀 Como o App Funciona

### Fluxo de Autenticação
```
1. Usuário clica "Login"
   ↓
2. Redireciona para Manus OAuth Portal
   ↓
3. Usuário autoriza (Google, GitHub, etc)
   ↓
4. Callback retorna code
   ↓
5. Backend troca code por JWT
   ↓
6. JWT salvo em HttpOnly Cookie
   ↓
7. Usuário autenticado
```

### Fluxo de Chat com RAG
```
1. Usuário envia mensagem
   ↓
2. tRPC mutation: chat.sendMessage
   ↓
3. Backend busca chunks similares (embeddings)
   ↓
4. Monta prompt com contexto + documentos
   ↓
5. Chama Gemini API
   ↓
6. Gemini retorna resposta
   ↓
7. Salva no database
   ↓
8. Envia para frontend em tempo real (streaming/SSE)
   ↓
9. Interface atualiza
```

### Upload de Documento
```
1. Usuário seleciona PDF
   ↓
2. Upload para Forge API
   ↓
3. Backend faz parse do PDF
   ↓
4. Divide em chunks
   ↓
5. Gera embeddings
   ↓
6. Salva no database
   ↓
7. Disponível para RAG
```

---

## 📚 Checklist de Aprendizado Recomendado

### Conceitos Fundamentais (1-2 semanas)
- [ ] JavaScript/TypeScript básico
- [ ] React fundamentals (components, hooks, state)
- [ ] Tailwind CSS
- [ ] REST APIs vs tRPC

### Backend (2-3 semanas)
- [ ] Node.js e Express
- [ ] tRPC architecture
- [ ] SQLite e Drizzle ORM
- [ ] JWT e OAuth 2.0

### IA/ML (1-2 semanas)
- [ ] O que é RAG
- [ ] Embeddings vetoriais
- [ ] Prompt engineering
- [ ] API Gemini

### DevOps (1 semana)
- [ ] Variáveis de ambiente (.env)
- [ ] Build process (Vite)
- [ ] Deployment

---

## 🔍 Principais Arquivos para Estudar

### Frontend
- [client/src/pages/Chat.tsx](client/src/pages/Chat.tsx) - Interface de chat
- [client/src/components/AIChatBox.tsx](client/src/components/AIChatBox.tsx) - Componente de chat
- [client/src/lib/trpc.ts](client/src/lib/trpc.ts) - Cliente tRPC

### Backend
- [server/routers/chat.ts](server/routers/chat.ts) - API de chat
- [server/_core/rag.ts](server/_core/rag.ts) - Pipeline RAG
- [server/_core/llm.ts](server/_core/llm.ts) - Integração Gemini
- [server/db.ts](server/db.ts) - Setup database

### Database
- [drizzle/schema.ts](drizzle/schema.ts) - Definição de tabelas
- [drizzle/relations.ts](drizzle/relations.ts) - Relacionamentos

---

## 🎓 Recursos Externos Recomendados

### TypeScript
- https://www.typescriptlang.org/docs/ - Documentação oficial
- TypeScript Handbook

### React
- https://react.dev/ - Documentação oficial
- React Query (if used)

### tRPC
- https://trpc.io/docs - Documentação oficial
- tRPC tutorials

### Drizzle ORM
- https://orm.drizzle.team/ - Documentação oficial
- SQL basics

### OAuth & JWT
- OAuth 2.0 Authorization Framework (RFC 6749)
- JWT.io - JWT debugger

### Google Gemini
- https://ai.google.dev/docs - Documentação oficial
- Gemini API reference

### RAG
- "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
- Vector databases e embeddings

---

## 💡 Dicas Importantes

1. **Environment Variables**: Revise `.env` para entender dependências externas
2. **Drizzle Migrations**: Veja como atualizar schema sem perder dados
3. **tRPC Type Safety**: O principal diferencial - explore como funciona
4. **Error Handling**: Observe como erros são tratados em ambos os lados
5. **Testing**: Procure por arquivos `.test.ts` para padrões de teste

---

## 📞 Glossário Rápido

- **RAG**: Retrieval-Augmented Generation
- **LLM**: Large Language Model
- **Embedding**: Vetor numérico que representa significado de texto
- **Chunking**: Divisão de texto em segmentos menores
- **tRPC**: Type-safe RPC framework
- **ORM**: Object-Relational Mapping
- **OAuth**: Protocolo de autenticação delegada
- **JWT**: JSON Web Token
- **Vector Search**: Busca por similaridade usando vetores
- **Cosine Similarity**: Métrica de similaridade entre vetores
- **HMR**: Hot Module Replacement
- **SSE**: Server-Sent Events (streaming)

---

**Última atualização**: 19/04/2026
**Versão do projeto**: 1.0.0
