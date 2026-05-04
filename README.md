# DocMind AI — Converse com seus Documentos

**DocMind AI** é uma aplicação full-stack de chatbot com RAG (Retrieval-Augmented Generation) que permite fazer perguntas em linguagem natural sobre arquivos PDF. A IA busca os trechos mais relevantes do documento e gera respostas precisas e contextualizadas.

> Chega de perder horas procurando informações em documentos longos. Basta perguntar.

---

## O que o projeto faz

1. Você faz **upload de um PDF** pela interface
2. O sistema **processa e indexa** o conteúdo do documento automaticamente
3. Você **faz perguntas** em português (ou qualquer idioma)
4. A IA **busca os trechos relevantes** e responde com base no conteúdo real do documento
5. O histórico de conversas fica salvo e pode ser acessado a qualquer momento

---

## Funcionalidades

- Upload e indexação de PDFs
- Chat com IA baseado no conteúdo dos documentos (RAG)
- Histórico de conversas com navegação e exclusão
- Exclusão de documentos individualmente
- Modo dark / light
- Landing page, tela de login e interface de chat
- Servidor e frontend iniciados com um único comando

---

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Backend | Node.js, Express, tRPC v11 |
| Banco de dados | SQLite + Drizzle ORM |
| IA (chat) | [Groq](https://console.groq.com) — Llama 3.3 70B |
| IA (embeddings) | Bag-of-words local (sem API externa) |
| Extração de PDF | pdf-parse |
| Build | esbuild (servidor), Vite (frontend) |

---

## Pré-requisitos

- [Node.js](https://nodejs.org) versão **18 ou superior**
- Uma chave de API do **Groq** (gratuita, sem cartão de crédito)

---

## Como obter a chave do Groq (gratuita)

1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma conta (pode usar o Google)
3. Vá em **API Keys → Create API Key**
4. Copie a chave gerada (começa com `gsk_...`)

---

## Instalação e configuração

### 1. Clone o repositório

```bash
git clone https://github.com/BrundoCJ/rag_chatboot.git
cd rag_chatboot
```

### 2. Instale as dependências

```bash
npm install --legacy-peer-deps
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha:

```env
DATABASE_URL=file:./rag_chatbot.db
JWT_SECRET=uma_chave_secreta_qualquer_aqui

# Obtenha em https://console.groq.com (gratuito)
GROQ_API_KEY=sua_chave_groq_aqui
```

### 4. Crie o banco de dados

```bash
npx drizzle-kit push
```

### 5. Inicie o projeto

```bash
npm run dev:all
```

Aguarde alguns segundos e acesse: **http://localhost:5173**

---

## Estrutura do projeto

```
rag-chatbot/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx  # Página inicial
│   │   │   ├── Login.tsx    # Tela de login
│   │   │   └── Chat.tsx     # Interface de chat
│   │   ├── trpc.ts          # Configuração do cliente tRPC
│   │   └── main.tsx         # Entry point
│   └── index.html
├── server/                  # Backend Node.js
│   ├── _core/
│   │   ├── index.ts         # Entry point do servidor Express
│   │   ├── trpc.ts          # Configuração do tRPC
│   │   ├── context.ts       # Contexto das requisições
│   │   └── env.ts           # Variáveis de ambiente
│   ├── routers/
│   │   ├── chat.ts          # Rotas de chat e histórico
│   │   └── documents.ts     # Rotas de upload e documentos
│   ├── llm.ts               # Integração com Groq (chat)
│   ├── rag.ts               # Pipeline RAG + embeddings
│   └── db.ts                # Operações no banco de dados
├── drizzle/
│   └── schema.ts            # Schema do banco de dados
├── shared/
│   └── const.ts             # Constantes compartilhadas
├── .env.example             # Exemplo de configuração
└── package.json
```

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev:all` | Compila e inicia backend + frontend juntos |
| `npm run build:server` | Compila apenas o servidor |
| `npm run dev` | Inicia apenas o servidor (porta 3000) |
| `npm run dev:frontend` | Inicia apenas o frontend Vite (porta 5173) |
| `npx drizzle-kit push` | Cria/atualiza as tabelas no banco |
| `npx drizzle-kit studio` | Abre o painel visual do banco de dados |

---

## Como usar

1. **Acesse** http://localhost:5173
2. **Faça login** com seu nome e e-mail (armazenado localmente, sem senha)
3. **Faça upload** de um PDF pela barra lateral
4. Aguarde a mensagem de confirmação (ex: `✓ "documento" indexado (14 trechos)`)
5. **Faça perguntas** sobre o conteúdo do documento no campo de chat
6. Use **"Limpar histórico"** para apagar conversas antigas

---

## Limites do tier gratuito do Groq

| Modelo | Limite gratuito |
|---|---|
| Llama 3.3 70B | 30 req/min · 14.400 req/dia |

Para uso pessoal e projetos de estudo, os limites gratuitos são mais do que suficientes.

---

## Licença

MIT — sinta-se livre para usar, modificar e distribuir.
