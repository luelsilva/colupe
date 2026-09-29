# Colupe API

Backend modular construído com [Bun](https://bun.sh), [ElysiaJS](https://elysiajs.com) e [Drizzle ORM](https://orm.drizzle.team).

## 🚀 Como Executar

### 1. Pré-requisitos
- [Bun](https://bun.sh) instalado (v1.x+)

### 2. Instalação de Dependências
```bash
bun install
```

### 3. Configuração de Variáveis de Ambiente
Copie o arquivo de exemplo e configure suas variáveis (incluindo a Connection String do Supabase):
```bash
cp .env.example .env
```

### 4. Executando o Servidor

Modo de desenvolvimento (com auto-reload):
```bash
bun run dev
```

Modo de produção:
```bash
bun run start
```

## 📑 Endpoints Principais

- **Documentação Swagger:** `http://localhost:3333/docs`
- **Healthcheck:** `http://localhost:3333/health`
- **Informações da API:** `http://localhost:3333/info`

## 🧱 Estrutura do Projeto

```
src/
├── config/             # Configurações e validação estrita de ambiente (.env)
├── db/                 # Conexão Postgres (Supabase Pooler 6543) e schemas Drizzle
│   ├── index.ts
│   └── schema.ts
├── modules/            # Módulos de domínio desacoplados
│   ├── health/         # Módulo de monitoramento e status
│   └── info/           # Módulo de informações da aplicação
├── shared/             # Constantes, dicionários de erros e utilitários
│   ├── constants/
│   └── utils/
└── index.ts            # Ponto de entrada do servidor Elysia
```

## 🗄️ Regras de Banco de Dados (Supabase & Drizzle)

- **Drizzle ORM:** Utilizado estritamente para tipagem e query builder (`schema` e consultas). **Não executa migrations**.
- **Supabase Transaction Pooler (Porta 6543):**
  - `prepare: false` (Prepared Statements desativados para compatibilidade com o pooler).
  - `idle_timeout: 20` e `connect_timeout: 10` (evita conexões zumbis e erro 524 Cloudflare).
  - `max: 10` conexões ativas.
