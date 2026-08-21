# A Fintech da Maria

Backend corporativo de conta digital com motor PIX, livro-razao de partidas dobradas, autenticacao MFA e auditoria imutavel. Projeto de nivel 4 da serie "Arquitetura Backend no Brasil (2026)".

---

## Visao Geral

Sistema financeiro construido como monolito modular com arquitetura orientada a eventos (event-driven lite). Implementa os padroes bancarios essenciais: idempotencia estrita em transacoes, double-entry bookkeeping, conformidade com regras do BACEN e trilha de auditoria WORM (Write Once Read Many) para conformidade com LGPD e regulacao financeira.

### O Problema

Maria criou um SaaS de controle financeiro para pequenas empresas. O sistema processa PIX em tempo real, mantem livro-razao contabil imutavel, aplica regras de compliance e oferece interface web para gerenciar conta digital com autenticacao de dois fatores.

---

## Stack

| Camada | Tecnologia | Versao |
| :--- | :--- | :--- |
| Framework | NestJS | 11.x |
| Linguagem | TypeScript (strict, ESM) | 5.9.x |
| ORM | Prisma Client | 7.9.x |
| Banco de Dados | PostgreSQL | 16 |
| Driver Adapter | @prisma/adapter-pg + pg | 7.9.x / 8.x |
| Cache e Lock | Redis (ioredis) | 7 |
| Fila Assincrona | BullMQ | 6.x |
| Autenticacao | JWT (15min) + Refresh Token (7d) | @nestjs/jwt 11.x |
| MFA | TOTP via otplib (Google Authenticator) | 13.x |
| Seguranca HTTP | Helmet + express-rate-limit | 8.x / 8.x |
| Validacao | class-validator + class-transformer + Zod | - |
| Observabilidade | Pino + nestjs-pino (JSON estruturado) | 10.x / 4.x |
| API Docs | Swagger (OpenAPI 3) | @nestjs/swagger 11.x |
| Frontend | React 18 + Vite + TypeScript | - |
| Container | Docker + docker-compose | - |
| CI | GitHub Actions | - |
| Qualidade | ESLint v10 (Flat Config) + Prettier + Husky v9 + Commitlint | - |
| Testes | Jest + ts-jest + jest-mock-extended | 30.x |

---

## Arquitetura

```
src/
  app.module.ts
  main.ts
  health/
    health.controller.ts          # GET /health
  infrastructure/
    database/
      prisma.service.ts           # PrismaClient com @prisma/adapter-pg
      database.module.ts
  modules/
    auth/
      auth.controller.ts          # /api/auth/*
      auth.service.ts             # JWT, Refresh Token, MFA TOTP
      strategies/jwt.strategy.ts
      guards/jwt-auth.guard.ts
      guards/roles.guard.ts
      decorators/current-user.decorator.ts
      decorators/roles.decorator.ts
    accounts/
      accounts.controller.ts      # /api/accounts/*
      accounts.service.ts         # Saldo, extrato, chaves PIX, limites
    pix/
      pix.controller.ts           # /api/pix/*
      pix.service.ts              # Motor transacional PIX
    notifications/
      notifications.module.ts     # BullMQ
      notification.producer.ts    # Enfileira jobs
      notification.consumer.ts    # Processa comprovantes
    audit/
      audit.service.ts            # Grava audit_logs (WORM)
  shared/
    filters/all-exceptions.filter.ts
    logger/logger.module.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
frontend/                         # React + Vite (SPA)
Dockerfile                        # Multi-stage: frontend-builder, backend-builder, runner
docker-compose.yml
.github/workflows/ci.yml
```

---

## Modelo de Dados

```
users (id, name, email, cpf, phone, password, role, mfaSecret, mfaEnabled, refreshTokenHash)
  |
  +-- accounts (id, accountNumber, branch, balance_cents, dailyPixLimit_cents, status)
        |
        +-- pix_keys (id, keyType, keyValue)
        +-- ledger_entries (id, transactionId, entryType, amount, balanceAfter)
        +-- sent_transactions     --> transactions
        +-- received_transactions --> transactions

transactions (id, idempotencyKey, sourceAccountId, destinationAccountId, amount, type, status)
  |
  +-- ledger_entries (partidas dobradas: DEBIT + CREDIT por transacao)

audit_logs (id, userId, userEmail, action, resource, resourceId, ipAddress, payload, timestamp)
```

**Enums:**
- `Role`: `ADMIN` | `COMPLIANCE_OFFICER` | `CUSTOMER`
- `AccountStatus`: `ACTIVE` | `BLOCKED` | `SUSPENDED`
- `TransactionType`: `PIX_TRANSFER` | `INTERNAL_TRANSFER` | `BILL_PAYMENT` | `DEPOSIT`
- `TransactionStatus`: `PENDING` | `COMPLETED` | `FAILED` | `REVERSED`
- `PixKeyType`: `CPF` | `EMAIL` | `PHONE` | `RANDOM`
- `EntryType`: `DEBIT` | `CREDIT`

> Todos os valores monetarios sao armazenados em centavos (`BigInt`) para evitar erros de ponto flutuante.

---

## Endpoints

### Autenticacao (`/api/auth`)

| Metodo | Rota | Descricao | Autenticacao |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Auto-cadastro com abertura de conta digital | Publica |
| POST | `/login` | Login com email e senha | Publica |
| POST | `/mfa/setup` | Gera segredo TOTP e QR Code | JWT |
| POST | `/mfa/verify` | Valida codigo MFA e emite tokens | JWT |
| POST | `/refresh` | Rotacao de Refresh Token | JWT |
| POST | `/logout` | Revoga Refresh Token | JWT |
| GET | `/me` | Dados do usuario e conta | JWT |

### Contas (`/api/accounts`)

| Metodo | Rota | Descricao | Autenticacao |
| :--- | :--- | :--- | :--- |
| GET | `/balance` | Saldo em tempo real e limite PIX disponivel | JWT (CUSTOMER) |
| GET | `/statement` | Extrato paginado com filtros | JWT (CUSTOMER) |
| POST | `/pix-keys` | Cadastrar chave PIX | JWT (CUSTOMER) |
| GET | `/pix-keys` | Listar chaves PIX | JWT (CUSTOMER) |
| DELETE | `/pix-keys/:id` | Remover chave PIX | JWT (CUSTOMER) |
| PATCH | `/limits` | Ajustar limite diario de PIX | JWT (CUSTOMER) |

### PIX (`/api/pix`)

| Metodo | Rota | Descricao | Autenticacao |
| :--- | :--- | :--- | :--- |
| POST | `/validate-key` | Consulta destinatario (mock DICT/BACEN) | JWT |
| POST | `/transfer` | Transferencia PIX com Idempotency-Key | JWT (CUSTOMER) |
| GET | `/transactions/:id` | Comprovante de transacao | JWT |

### Health

| Metodo | Rota | Descricao |
| :--- | :--- | :--- |
| GET | `/health` | Status da aplicacao |

---

## Regras de Negocio Criticas

### Idempotencia Estrita em Transacoes PIX

Toda requisicao de transferencia exige o cabecalho `Idempotency-Key` (UUID v4). O sistema verifica a existencia da chave no banco antes de processar. Se a chave ja existir, retorna o resultado original sem debitar novamente. Isso previne cobrancas duplicadas em caso de timeout ou reenvio da requisicao.

```
Header: Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

### Double-Entry Bookkeeping (Livro-Razao de Partidas Dobradas)

Toda transacao financeira gera obrigatoriamente duas entradas no ledger:
1. `DEBIT` na conta de origem com `balanceAfter` atualizado
2. `CREDIT` na conta de destino com `balanceAfter` atualizado

Isso garante que o saldo total do sistema seja sempre conservado e auditavel contabilmente.

### Transacao Atomica

O debito, credito e registro de ledger ocorrem dentro de um unico `prisma.$transaction`, garantindo atomicidade ACID. Se qualquer etapa falhar, toda a operacao e revertida.

### Trilha de Auditoria WORM

O `AuditLogInterceptor` registra automaticamente em `audit_logs` qualquer movimentacao financeira, alteracao de limites ou acesso administrativo, com IP, usuario, recurso, payload e timestamp imutavel.

---

## Como Executar

### Pre-requisitos

- Node.js 22+
- Docker e Docker Compose

### Variaveis de Ambiente

Copie o arquivo de exemplo e preencha as variaveis:

```bash
cp .env.example .env
```

Variaveis obrigatorias:

```env
DATABASE_URL=postgresql://postgres:dev@localhost:5432/fintech
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=seu-secret-de-producao-minimo-32-chars
JWT_REFRESH_SECRET=seu-refresh-secret-de-producao-minimo-32-chars
NODE_ENV=development
```

### Ambiente de Desenvolvimento

```bash
# Instalar dependencias
npm install

# Subir PostgreSQL e Redis
docker compose up db cache -d

# Executar migrations e seed
npx prisma migrate dev
npm run prisma:seed

# Iniciar o backend com watch
npm run dev

# Iniciar o frontend (em outro terminal)
npm run dev:frontend
```

### Ambiente com Docker (Producao Local)

```bash
# Construir e subir todos os servicos
docker compose up --build

# Verificar saude da aplicacao
curl http://localhost:3000/health
```

### Comandos Uteis

```bash
npm run build           # Gera cliente Prisma e compila TypeScript
npm run lint:fix        # ESLint com correcao automatica
npm run format:check    # Verifica formatacao com Prettier
npm test                # Testes unitarios
npm run test:ci         # Testes com coverage (modo CI)
npx prisma studio       # Interface visual do banco de dados
```

---

## Seed de Dados

O seed cria os seguintes usuarios para desenvolvimento:

| Nome | Email | Senha | Role | Saldo |
| :--- | :--- | :--- | :--- | :--- |
| Maria Admin | maria@fintech.com | `Admin@123` | ADMIN | - |
| Lucas Compliance | lucas@fintech.com | `Compliance@123` | COMPLIANCE_OFFICER | - |
| Joao Silva | joao@fintech.com | `Customer@123` | CUSTOMER | R$ 5.000,00 |
| Carla Souza | carla@fintech.com | `Customer@123` | CUSTOMER | R$ 2.500,00 |

---

## Qualidade de Codigo

- **ESLint v10 (Flat Config)**: `eslint.config.mjs` com `@typescript-eslint`.
- **Prettier**: formatacao automatica em pre-commit via `lint-staged`.
- **Husky v9**:
  - `pre-commit`: executa `lint-staged`.
  - `pre-push`: executa `npm test`.
  - `commit-msg`: valida formato Conventional Commits.
- **Commitlint**: mensagens no padrao `type(scope): descricao`.

---

## Pipeline de CI

O arquivo `.github/workflows/ci.yml` executa em cada push e pull request:

1. Instala dependencias com `npm ci`.
2. Executa `npm run lint`.
3. Executa `npm run build`.
4. Sobe PostgreSQL 16 e Redis 7 como servicos.
5. Executa `npm run test:ci` com coverage.

---

## Estrutura de Branches

| Branch | Responsabilidade |
| :--- | :--- |
| `main` | Codigo de producao com release estavel |
| `develop` | Branch de integracao continua |
| `feature/init` | Setup inicial, NestJS, Pino, Health Check, CI |
| `feature/prisma` | Schema, migrations, seed, Driver Adapter |
| `feature/auth-mfa` | JWT, Refresh Token, MFA TOTP, Guards |
| `feature/accounts-ledger` | Contas, extrato, chaves PIX, limites |
| `feature/pix-transactions` | Motor PIX, idempotencia, double-entry |
| `feature/notifications-audit` | BullMQ, trilha de auditoria WORM |
| `feature/frontend` | React + Vite, conta digital, MFA login |
| `feature/deploy` | Dockerfile multi-stage, docker-compose |

---

## Licenca

MIT
