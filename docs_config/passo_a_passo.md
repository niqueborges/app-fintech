# Guia de Arquitetura e Implementacao Passo a Passo -- NestJS + Prisma 7 + PostgreSQL + Redis + BullMQ (Nivel 4 - Fintech)

Template e guia definitivo de arquitetura backend para o projeto **A Fintech da Maria (Nivel 4)** com NestJS, TypeScript estrito, Prisma ORM v7, PostgreSQL (Driver Adapter), Redis Cluster/Lock, BullMQ (Filas Transacionais), Motor PIX (BACEN Mock), Livro-Razao (Double-Entry Ledger), Idempotencia Estrita, MFA TOTP, Auditoria Imutavel (WORM), Docker e CI/CD.

---

## Objetivos Arquiteturais

- **Arquitetura Corporativa (Monolito Modular + Event-Driven / CQRS Leve)**: Modulos desacoplados (`AuthModule`, `AccountsModule`, `TransactionsModule`, `PixModule`, `LedgerModule`, `NotificationsModule`, `AuditModule`).
- **Consistencia Financeira e Livro-Razao (Double-Entry Bookkeeping)**: Toda transacao gera partidas dobradas (entradas de debito e credito) garantindo balanco contabil e saldo impossivel de corromper.
- **Idempotencia Estrita em Operacoes Financeiras**: Bloqueio de concorrencia e duplicidade via Redis Lock atomico (`Idempotency-Key` no cabecalho HTTP) para transacoes PIX e pagamentos.
- **Seguranca Bancaria e RBAC**: Papeis estritos (`ADMIN`, `COMPLIANCE_OFFICER`, `CUSTOMER`), autenticacao JWT (15min) + Refresh Token rotativo (7d) e Segundo Fator de Autenticacao (MFA TOTP com Google Authenticator).
- **Conformidade BACEN e Auditoria Imutavel (WORM)**: Chaves PIX (CPF, Email, Telefone, Aleatoria), limites diarios configuraveis e tabela de `audit_logs` para rastreabilidade regulatoria.
- **Processamento Assincrono Resiliente**: Filas BullMQ apoiadas no Redis para liquidacao de transacoes, conciliacao e disparo de comprovantes com retentativa automatica (backoff exponencial).
- **Observabilidade Estruturada**: Logger assincrono em JSON (Pino) com `x-request-id`, `x-correlation-id` e endpoint de metricas e saude (`/health` e `/metrics`).
- **Qualidade e Integracao Continua**: ESLint v10 (Flat Config), Prettier, Husky v9, Commitlint e pipeline de CI no GitHub Actions com PostgreSQL e Redis.

---

## Status de Execucao das Branches e Ciclo de Vida

| Branch | Responsabilidade | Status |
| :--- | :--- | :--- |
| `main` | Codigo em producao com release estavel. | Planejado |
| `develop` | Branch principal de integracao continua. | Planejado |
| `feature/init` | Setup NestJS Enterprise, TypeScript ESM, Linter, Husky, Commitlint, CI, Logger Pino e Health Check. | PROXIMO PASSO |
| `feature/prisma` | Schema Prisma v7 (Users, Accounts, PixKeys, Transactions, LedgerEntries, AuditLogs), Driver Adapter PG, Migrations e Seed bancario. | Pendente |
| `feature/auth-mfa` | Modulo de Autenticacao: JWT + Refresh Token, MFA TOTP (Google Authenticator), Roles enum, Guards e rotas de login. | Pendente |
| `feature/accounts-ledger` | Modulo de Contas e Livro-Razao: Saldos, extratos paginados, gestao de chaves PIX e limites diarios. | Pendente |
| `feature/pix-transactions` | Motor de Transacoes PIX: Idempotencia via Redis Lock, transacao atomica ($transaction), debito/credito no Ledger e simulacao BACEN. | Pendente |
| `feature/notifications-audit` | Trilha de Auditoria WORM imutavel e Fila BullMQ de comprovantes e webhooks assincronos. | Pendente |
| `feature/frontend` | Aplicacao web de Conta Digital (React + Vite + TypeScript) com extrato, PIX instantaneo e login MFA. | Pendente |
| `feature/deploy` | Dockerfile multi-stage com dumb-init, usuario nodejs non-root, docker-compose.yml de producao e SPA Fallback. | Pendente |

---

## PASSO 1 -- feature/init [PROXIMO PASSO]

**Objetivo:** Inicializar o projeto NestJS corporativo com TypeScript 5.8+, configuracoes de seguranca HTTP (Helmet, Rate Limiting), observabilidade estruturada, ferramentas de qualidade de codigo e pipeline de CI.

### 1.1 Dependencias do Backend
- **Core NestJS**: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/swagger`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/terminus`.
- **Persistencia e Cache**: `@prisma/client`, `@prisma/adapter-pg`, `pg`, `ioredis`, `@nestjs/bullmq`, `bullmq`.
- **Validacao e Seguranca**: `zod`, `class-validator`, `class-transformer`, `bcrypt`, `otplib`, `qrcode`, `helmet`, `express-rate-limit`.
- **Observabilidade**: `nestjs-pino`, `pino`, `pino-http`, `pino-pretty`.
- **Desenvolvimento**: `typescript`, `@types/node`, `@types/express`, `@types/bcrypt`, `@types/passport-jwt`, `@types/qrcode`, `prisma`, `tsx`, `rimraf`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `eslint-plugin-prettier`, `prettier`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `jest`, `ts-jest`, `@types/jest`, `jest-mock-extended`.

### 1.2 Qualidade de Codigo e Git Hooks
- Husky v9 configurado com `prepare: "husky"`.
- Ganchos:
  - `.husky/pre-commit`: Executa `npx lint-staged`.
  - `.husky/pre-push`: Executa `npm test`.
  - `.husky/commit-msg`: Valida formato Conventional Commits.
- Pipeline de CI no GitHub Actions em `.github/workflows/ci.yml` com servicos PostgreSQL 16 e Redis 7.

---

## PASSO 2 -- feature/prisma

**Objetivo:** Modelagem relacional do banco de dados financeiro com suporte a livro-razao (double-entry bookkeeping), chaves PIX, transacoes, auditoria e migrations.

### 2.1 Modelagem Relacional (`prisma/schema.prisma`)
- **Enum `Role`**: `ADMIN`, `COMPLIANCE_OFFICER`, `CUSTOMER`.
- **Enum `AccountStatus`**: `ACTIVE`, `BLOCKED`, `SUSPENDED`.
- **Enum `TransactionType`**: `PIX_TRANSFER`, `INTERNAL_TRANSFER`, `BILL_PAYMENT`, `DEPOSIT`.
- **Enum `TransactionStatus`**: `PENDING`, `COMPLETED`, `FAILED`, `REVERSED`.
- **Enum `PixKeyType`**: `CPF`, `EMAIL`, `PHONE`, `RANDOM`.
- **Enum `EntryType`**: `DEBIT`, `CREDIT`.
- **Tabela `users`**: `id`, `name`, `email`, `cpf`, `phone`, `password`, `role`, `mfaSecret`, `mfaEnabled`, `refreshTokenHash`, `createdAt`, `updatedAt`, `deletedAt`.
- **Tabela `accounts`**: `id`, `userId`, `accountNumber`, `branch`, `balance` (em centavos `BigInt`), `dailyPixLimit` (em centavos `BigInt`), `status`, `createdAt`, `updatedAt`, `deletedAt`.
- **Tabela `pix_keys`**: `id`, `accountId`, `keyType`, `keyValue`, `createdAt`.
- **Tabela `transactions`**: `id`, `idempotencyKey`, `sourceAccountId`, `destinationAccountId`, `amount` (centavos), `type`, `status`, `description`, `pixKeyUsed`, `createdAt`, `updatedAt`.
- **Tabela `ledger_entries`**: `id`, `transactionId`, `accountId`, `entryType`, `amount`, `balanceAfter`, `createdAt`.
- **Tabela `audit_logs`**: `id`, `userId`, `userEmail`, `action`, `resource`, `resourceId`, `ipAddress`, `userAgent`, `payload`, `timestamp`.

### 2.2 Conexao com Driver Adapter e Migrations
- Configuracao do `@prisma/adapter-pg` com pool de conexoes.
- Execucao da migracao inicial (`init`).
- Seed com Maria (Admin), Lucas (Compliance Officer), Joao Silva e Carla Souza (Clientes com contas e saldos iniciais de R$ 5.000,00 e R$ 2.500,00).

---

## PASSO 3 -- feature/auth-mfa

**Objetivo:** Modulo de autenticacao de alta seguranca com JWT de curta duracao, Refresh Token rotativo e Segundo Fator de Autenticacao (MFA TOTP).

### 3.1 Endpoints do Modulo de Autenticacao
- `POST /api/auth/register`: Auto-cadastro publico de cliente com abertura automatica de conta digital e saldo inicial.
- `POST /api/auth/login`: Validacao de email e senha com retorno de token temporario para verificacao MFA ou emissao de tokens se MFA inativo.
- `POST /api/auth/mfa/setup`: Geracao de segredo TOTP e QR Code para escaneamento no Google Authenticator.
- `POST /api/auth/mfa/verify`: Validacao do codigo de 6 digitos para ativacao ou conclusao do login com emissao de `accessToken` (15m) e `refreshToken` (7d).
- `POST /api/auth/refresh`: Rotacao segura de Refresh Token contra o hash salvo no banco.
- `POST /api/auth/logout`: Revogacao do Refresh Token.
- `GET /api/auth/me`: Retorno dos dados do usuario logado, conta vinculada e nivel de permissao.

### 3.2 Guards e Decorators
- `@Roles(...roles: Role[])`: Protege rotas por nivel de permissao (`RolesGuard`).
- `JwtAuthGuard`: Valida presenca e integridade do token Bearer.
- `@CurrentUser()`: Extrai os dados do usuario autenticado diretamente nos controllers.

---

## PASSO 4 -- feature/accounts-ledger

**Objetivo:** Modulo de gestao de contas bancarias, consulta de saldos, extratos com livro-razao e gerenciamento de chaves PIX.

### 4.1 Funcionalidades
- `GET /api/accounts/balance`: Consulta de saldo em tempo real e limite diario restante de PIX.
- `GET /api/accounts/statement`: Extrato detalhado com paginacao, filtro por periodo e tipo de operacao.
- `POST /api/pix-keys`: Cadastro de chave PIX (CPF, Email, Telefone ou Chave Aleatoria) com validacao de unicidade nacional.
- `GET /api/pix-keys`: Listagem das chaves PIX cadastradas da conta.
- `DELETE /api/pix-keys/:id`: Remocao de chave PIX.
- `PATCH /api/accounts/limits`: Solicitacao de ajuste de limite diario de PIX (com validacao de regras de seguranca).

---

## PASSO 5 -- feature/pix-transactions

**Objetivo:** Motor transacional financeiro com suporte a Idempotencia Estrita, bloqueio de concorrencia com Redis e liquidacao atomica via Double-Entry Ledger.

### 5.1 Regras de Negocio de Transacao
- **Idempotencia com Redis Lock**: Cada transacao exige o cabecalho `Idempotency-Key` (UUID). O sistema realiza um lock atomico no Redis (`SET key NX EX 60`). Se a mesma chave for reenviada, retorna o resultado original sem duplicar debito.
- **Transacao Atomica (`prisma.$transaction`)**:
  1. Validar se a conta de origem esta ativa e possui saldo suficiente.
  2. Validar se o valor nao excede o limite diario de PIX disponivel.
  3. Debitar o valor da conta de origem e criar `LedgerEntry` (`DEBIT`).
  4. Creditar o valor na conta de destino e criar `LedgerEntry` (`CREDIT`).
  5. Registrar a `Transaction` com status `COMPLETED`.
  6. Disparar evento para a fila de notificacao em segundo plano.

### 5.2 Endpoints REST
- `POST /api/pix/transfer`: Realizar transferencia PIX via chave ou dados bancarios com `Idempotency-Key`.
- `GET /api/pix/transactions/:id`: Consultar comprovante de transacao por ID.
- `POST /api/pix/validate-key`: Consulta previa de destinatario de chave PIX (Simulacao DICT/BACEN).

---

## PASSO 6 -- feature/notifications-audit

**Objetivo:** Fila assincrona BullMQ para emissao de comprovantes/notificacoes e Trilha de Auditoria Imutavel WORM para compliance BACEN e LGPD.

### 6.1 Arquitetura da Fila e Auditoria
- **Fila BullMQ (`fintech-notifications`)**: Ao concluir uma transacao, enfileira jobs para geracao assincrona de comprovante e notificacao do pagador e recebedor.
- **Trilha de Auditoria (`AuditLogInterceptor`)**: Interceptor global que grava em `audit_logs` qualquer movimentacao financeira, mudanca de limites ou acesso administrativo com IP, usuario, recurso, payload e timestamp.
- **Politica de Resiliencia**: 3 tentativas automaticas em caso de falha de webhook ou notificacao com backoff exponencial.

---

## PASSO 7 -- feature/frontend

**Objetivo:** Interface web reativa construida com Vite, React e TypeScript para a Conta Digital da Fintech.

### 7.1 Telas Principais
1. **Login & Autenticacao MFA**: Entrada com validacao de 6 digitos do Google Authenticator.
2. **Dashboard da Conta Digital**: Saldo atual, limite PIX diario disponivel e resumo de entradas/saidas.
3. **Transferencia PIX Instantanea**: Formulario com busca de chave, validacao do destinatario e geracao automatica de chave de idempotencia no cliente.
4. **Extrato e Comprovantes**: Historico completo de transacoes com filtro por data e visualizacao de comprovante bancario.

---

## PASSO 8 -- feature/deploy

**Objetivo:** Conteinerizacao de producao com Dockerfile multi-stage (Node 22, dumb-init, usuario nodejs non-root), docker-compose.yml de producao (App + PostgreSQL 16 + Redis 7), SPA Fallback e Healthchecks HTTP.
