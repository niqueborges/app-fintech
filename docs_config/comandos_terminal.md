# Guia Definitivo de Comandos, Dependencias e Configuracoes -- Fintech API (Nivel 4)

Documento consolidado e executavel com todos os comandos de terminal, dependencias atualizadas, arquivos de configuracao completos (NestJS, TypeScript ESM, ESLint v10 Flat Config, Prettier, Husky v9, Commitlint, Jest), banco de dados PostgreSQL 16 com Prisma 7, Redis 7 (Lock de Idempotencia), Filas BullMQ, Motor PIX (Livro-Razao / Double-Entry Ledger), MFA TOTP, Docker Multi-stage, Frontend React + Vite e guias de terminal detalhados para cada feature do [passo_a_passo.md](file:///f:/Dev_Borges/app-fintech/docs_config/passo_a_passo.md).

Todos os arquivos estao formatados com blocos `cat << 'EOF'` prontos para execucao em lote no **Git Bash**. Cada passo contem os fluxos completos de criacao, commit, push remoto, merge local e remoto na branch `develop`, alem da exclusao da branch da feature local e remotamente.

---

## 1. Inicializacao do Repositorio e Estrutura de Branches

Execute os comandos abaixo para inicializar o repositorio, criar as branches padrao e conectar ao repositorio remoto:

```bash
# 1. Criar pasta do projeto e inicializar o Git
mkdir -p app-fintech
cd app-fintech
git init
git branch -M main

# 2. Criar arquivo inicial .gitkeep e fazer o commit de setup
touch .gitkeep
git add .gitkeep
git commit -m "chore: initial repository setup"

# 3. Vincular ao repositorio remoto e publicar a branch main
git remote add origin https://github.com/niqueborges/app-fintech.git
git push -u origin main

# 4. Criar a branch develop a partir da main e publica-la no remoto
git checkout -b develop
git push -u origin develop
```

---

## 2. Instalacao de Dependencias (Backend NestJS Enterprise)

Certifique-se de estar na raiz do projeto (`app-fintech`) e na branch `develop`.

### 2.1 Dependencias de Producao

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/swagger @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/terminus @prisma/client @prisma/adapter-pg pg ioredis @nestjs/bullmq bullmq zod class-validator class-transformer bcrypt otplib qrcode helmet express-rate-limit nestjs-pino pino pino-http
```

### 2.2 Dependencias de Desenvolvimento

```bash
npm install -D @nestjs/cli @nestjs/schematics typescript@^5.8.2 @types/node @types/express @types/bcrypt @types/passport-jwt @types/qrcode @types/multer prisma tsx rimraf pino-pretty eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier prettier husky lint-staged @commitlint/cli @commitlint/config-conventional jest ts-jest @types/jest jest-mock-extended
```

---

## 3. Inicializacao e Configuracao de Ferramental

### 3.1 Atualizar `package.json` com Scripts e ESM

```bash
cat << 'EOF' > package.json
{
  "name": "app-fintech",
  "version": "1.0.0",
  "description": "Fintech da Maria - Enterprise Monolith, PIX Engine & Double-Entry Ledger",
  "type": "module",
  "main": "dist/main.js",
  "scripts": {
    "dev": "nest start --watch",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "prisma generate && tsc",
    "build:frontend": "cd frontend && npm run build",
    "build:all": "npm run build && npm run build:frontend",
    "start": "node dist/main.js",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --passWithNoTests",
    "test:ci": "jest --ci --coverage --maxWorkers=2 --passWithNoTests",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "prepare": "husky",
    "postinstall": "prisma generate",
    "precommit": "lint-staged",
    "prepush": "npm run test"
  },
  "dependencies": {
    "@nestjs/bullmq": "^11.0.5",
    "@nestjs/common": "^11.2.1",
    "@nestjs/config": "^4.0.4",
    "@nestjs/core": "^11.2.1",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.2.1",
    "@nestjs/swagger": "^11.4.7",
    "@nestjs/terminus": "^11.0.0",
    "@prisma/adapter-pg": "^7.9.1",
    "@prisma/client": "^7.9.1",
    "bcrypt": "^6.0.0",
    "bullmq": "^6.1.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.15.1",
    "express-rate-limit": "^8.6.2",
    "helmet": "^8.3.0",
    "ioredis": "^6.0.0",
    "nestjs-pino": "^4.6.1",
    "otplib": "^13.4.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.23.0",
    "pino": "^10.3.1",
    "pino-http": "^11.0.0",
    "qrcode": "^1.5.4",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@commitlint/cli": "^21.2.2",
    "@commitlint/config-conventional": "^21.2.2",
    "@nestjs/cli": "^11.0.24",
    "@nestjs/schematics": "^11.1.0",
    "@types/bcrypt": "^6.0.0",
    "@types/express": "^5.0.6",
    "@types/jest": "^30.0.0",
    "@types/multer": "^2.2.0",
    "@types/node": "^26.2.0",
    "@types/passport-jwt": "^4.0.1",
    "@types/qrcode": "^1.5.6",
    "@typescript-eslint/eslint-plugin": "^8.67.0",
    "@typescript-eslint/parser": "^8.67.0",
    "eslint": "^10.8.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.6",
    "husky": "^9.1.7",
    "jest": "^30.4.2",
    "jest-mock-extended": "^4.0.1",
    "lint-staged": "^17.3.0",
    "pino-pretty": "^13.1.3",
    "prettier": "^3.9.6",
    "prisma": "^7.9.1",
    "rimraf": "^6.1.3",
    "ts-jest": "^29.4.12",
    "tsx": "^4.23.12",
    "typescript": "^5.8.2"
  }
}
EOF
```

### 3.2 Inicializacao de Ferramental

```bash
# 1. Inicializar configuracao do TypeScript
npx tsc --init

# 2. Inicializar esquema e configuracao do Prisma
npx prisma init

# 3. Criar pasta raiz src (necessaria para o Jest)
mkdir -p src

# 4. Inicializar ganchos do Git com Husky v9
npx husky

# 5. Criar ganchos automatizados do Husky
cat << 'EOF' > .husky/pre-commit
npx lint-staged
EOF

cat << 'EOF' > .husky/pre-push
npm test
EOF

cat << 'EOF' > .husky/commit-msg
npx --no -- commitlint --edit "$1"
EOF
```

---

## 4. Arquivos de Configuracao Prontos (Execucao via Git Bash)

### 4.1 `tsconfig.json` (TypeScript ESM Nativo)

```bash
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "jest"],
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"]
}
EOF
```

### 4.2 `tsconfig.build.json`

```bash
cat << 'EOF' > tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
EOF
```

### 4.3 `nest-cli.json`

```bash
cat << 'EOF' > nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
EOF
```

### 4.4 `eslint.config.mjs` (ESLint v10 Flat Config)

```bash
cat << 'EOF' > eslint.config.mjs
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'src/generated/**', 'frontend/**'],
  },
];
EOF
```

### 4.5 `.prettierrc.json` e `.prettierignore`

```bash
cat << 'EOF' > .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "auto"
}
EOF

cat << 'EOF' > .prettierignore
dist/
coverage/
node_modules/
src/generated/
frontend/
EOF
```

### 4.6 `commitlint.config.mjs`

```bash
cat << 'EOF' > commitlint.config.mjs
export default {
  extends: ['@commitlint/config-conventional'],
};
EOF
```

### 4.7 `.lintstagedrc.json`

```bash
cat << 'EOF' > .lintstagedrc.json
{
  "src/**/*.ts": ["eslint --fix", "prettier --write"]
}
EOF
```

### 4.8 `jest.config.cjs`

```bash
cat << 'EOF' > jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^(\./.*)\.js$': '$1',
    '^(\.\./.*)\.js$': '$1',
  },
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          ignoreDeprecations: '6.0',
        },
      },
    ],
  },
};
EOF
```

### 4.9 `.env.example` e `.env`

```bash
cat << 'EOF' > .env.example
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:dev@localhost:5432/fintech
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-change-in-prod-super-secure-key-123456
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-prod-super-key-987654
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
BACEN_PIX_MOCK_URL=http://localhost:3000/api/pix/mock-dict
EOF

cp .env.example .env
```

### 4.10 `prisma.config.ts`

```bash
cat << 'EOF' > prisma.config.ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? '',
  },
});
EOF
```

### 4.11 `docker-compose.yml` (PostgreSQL 16 + Redis 7 + App)

```bash
cat << 'EOF' > docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:dev@db:5432/fintech
      REDIS_HOST: cache
      REDIS_PORT: 6379
      JWT_SECRET: dev-secret-change-in-prod-super-secure-key-123456
      JWT_REFRESH_SECRET: dev-refresh-secret-change-in-prod-super-key-987654
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    volumes:
      - ./src:/app/src

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: fintech
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF
```

### 4.12 `Dockerfile` (Multi-stage Seguro)

```bash
cat << 'EOF' > Dockerfile
# Estagio 1: Build do Frontend (React + Vite)
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
RUN npm run build

# Estagio 2: Build do Backend (NestJS + Prisma)
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY prisma.config.ts tsconfig.json ./
COPY prisma/ ./prisma/
RUN npm ci --ignore-scripts
RUN npx prisma generate
COPY src/ ./src/
RUN npm run build

# Estagio 3: Imagem Final de Producao
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/
RUN npm ci --omit=dev --ignore-scripts

COPY --from=backend-builder --chown=nodejs:nodejs /app/src/generated ./src/generated
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
EOF
```

### 4.13 `.github/workflows/ci.yml` (Pipeline de Integracao Continua)

```bash
mkdir -p .github/workflows
cat << 'EOF' > .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: dev
          POSTGRES_DB: fintech
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run Linter
        run: npm run lint

      - name: Check Formatting
        run: npm run format:check

      - name: Run Tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:dev@localhost:5432/fintech
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-secret-key-123456
          JWT_REFRESH_SECRET: test-refresh-secret-987654

      - name: Build Application
        run: npm run build
EOF
```

---

## 5. Guias de Terminal Passo a Passo por Feature

---

### PASSO 1: `feature/init` (Infraestrutura Base, Tooling e Health Check)

Execute os comandos abaixo a partir da branch `develop`:

```bash
# 1. Criar e acessar a branch feature/init
git checkout -b feature/init
git push -u origin feature/init

# 2. Criar a estrutura inicial de pastas
mkdir -p src/health src/shared/logger src/shared/filters

# 3. Criar o modulo de Logger Pino (src/shared/logger/logger.module.ts)
cat << 'EOF' > src/shared/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        autoLogging: true,
      },
    }),
  ],
})
export class CustomLoggerModule {}
EOF

# 4. Criar o filtro global de excecoes (src/shared/filters/all-exceptions.filter.ts)
cat << 'EOF' > src/shared/filters/all-exceptions.filter.ts
import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(
      `HTTP ${status} Error on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: typeof message === 'object' ? message : { message },
    });
  }
}
EOF

# 5. Criar o modulo de Health Check (src/health/health.controller.ts e src/health/health.module.ts)
cat << 'EOF' > src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica o status de saude da API da Fintech' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
EOF

cat << 'EOF' > src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
EOF

# 6. Criar o modulo raiz da aplicacao (src/app.module.ts)
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from './shared/logger/logger.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomLoggerModule,
    HealthModule,
  ],
})
export class AppModule {}
EOF

# 7. Criar o arquivo de entrada principal (src/main.ts)
cat << 'EOF' > src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 1000,
      message: { message: 'Muitas requisicoes. Tente novamente em um minuto.' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Fintech API - Maria (Nivel 4)')
    .setDescription('Documentacao interativa da API bancaria e motor de transacoes PIX com Livro-Razao e Idempotencia')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`Servidor Fintech rodando na porta ${port}`);
}
bootstrap();
EOF

# 8. Criar teste unitario de saude (src/health/health.controller.spec.ts)
cat << 'EOF' > src/health/health.controller.spec.ts
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return ok status', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('timestamp');
  });
});
EOF

# 9. Criar a Pipeline de Integracao Continua (.github/workflows/ci.yml)
mkdir -p .github/workflows
cat << 'EOF' > .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: dev
          POSTGRES_DB: fintech
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run Linter
        run: npm run lint

      - name: Check Formatting
        run: npm run format:check

      - name: Run Tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:dev@localhost:5432/fintech
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-secret-key-123456
          JWT_REFRESH_SECRET: test-refresh-secret-987654

      - name: Build Application
        run: npm run build
EOF

# 10. Validacao Obrigatoria da feature/init (Antes do Commit e Merge)
npm run lint:fix
npm run format:check
npx tsc --noEmit
npm test
npm run build
docker compose config

# 11. Commitar, mergear na develop e validar CI no GitHub
git add .
git commit -m "feat(init): setup nestjs enterprise architecture, tooling, ci and health check"
git push origin feature/init

# Acompanhe a execucao da pipeline de CI no GitHub Actions:
# https://github.com/niqueborges/app-fintech/actions

git checkout develop
git merge feature/init
git push origin develop
git branch -d feature/init
git push origin --delete feature/init
```

---

### PASSO 2: `feature/prisma` (Modelagem do Livro-Razao, Driver Adapter, Migrations e Seed)

```bash
# 1. Criar e acessar a branch feature/prisma
git checkout -b feature/prisma
git push -u origin feature/prisma

# 2. Criar a definicao do schema Prisma com Livro-Razao (prisma/schema.prisma)
cat << 'EOF' > prisma/schema.prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

enum Role {
  ADMIN
  COMPLIANCE_OFFICER
  CUSTOMER
}

enum AccountStatus {
  ACTIVE
  BLOCKED
  SUSPENDED
}

enum TransactionType {
  PIX_TRANSFER
  INTERNAL_TRANSFER
  BILL_PAYMENT
  DEPOSIT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}

enum PixKeyType {
  CPF
  EMAIL
  PHONE
  RANDOM
}

enum EntryType {
  DEBIT
  CREDIT
}

model User {
  id               String    @id @default(uuid())
  name             String
  email            String    @unique
  cpf              String    @unique
  phone            String?
  password         String
  role             Role      @default(CUSTOMER)
  mfaSecret        String?
  mfaEnabled       Boolean   @default(false)
  refreshTokenHash String?
  accounts         Account[]
  auditLogs        AuditLog[]
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")

  @@map("users")
}

model Account {
  id             String         @id @default(uuid())
  userId         String         @map("user_id")
  accountNumber  String         @unique @map("account_number")
  branch         String         @default("0001")
  balance        BigInt         @default(0)
  dailyPixLimit  BigInt         @default(500000) @map("daily_pix_limit")
  status         AccountStatus  @default(ACTIVE)
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  pixKeys        PixKey[]
  ledgerEntries  LedgerEntry[]
  sentTransactions     Transaction[] @relation("SourceAccount")
  receivedTransactions Transaction[] @relation("DestinationAccount")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  deletedAt      DateTime?      @map("deleted_at")

  @@map("accounts")
}

model PixKey {
  id        String     @id @default(uuid())
  accountId String     @map("account_id")
  keyType   PixKeyType @map("key_type")
  keyValue  String     @unique @map("key_value")
  account   Account    @relation(fields: [accountId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now()) @map("created_at")

  @@map("pix_keys")
}

model Transaction {
  id                   String            @id @default(uuid())
  idempotencyKey       String            @unique @map("idempotency_key")
  sourceAccountId      String?           @map("source_account_id")
  destinationAccountId String?           @map("destination_account_id")
  amount               BigInt
  type                 TransactionType
  status               TransactionStatus @default(PENDING)
  description          String?
  pixKeyUsed           String?           @map("pix_key_used")
  sourceAccount        Account?          @relation("SourceAccount", fields: [sourceAccountId], references: [id])
  destinationAccount   Account?          @relation("DestinationAccount", fields: [destinationAccountId], references: [id])
  ledgerEntries        LedgerEntry[]
  createdAt            DateTime          @default(now()) @map("created_at")
  updatedAt            DateTime          @updatedAt @map("updated_at")

  @@map("transactions")
}

model LedgerEntry {
  id            String      @id @default(uuid())
  transactionId String      @map("transaction_id")
  accountId     String      @map("account_id")
  entryType     EntryType   @map("entry_type")
  amount        BigInt
  balanceAfter  BigInt      @map("balance_after")
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  account       Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now()) @map("created_at")

  @@map("ledger_entries")
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?  @map("user_id")
  userEmail  String?  @map("user_email")
  action     String
  resource   String
  resourceId String?  @map("resource_id")
  ipAddress  String   @map("ip_address")
  userAgent  String?  @map("user_agent")
  payload    String?
  timestamp  DateTime @default(now())
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
EOF

# 3. Subir container PostgreSQL e Redis
docker compose up -d db cache

# 4. Executar migracao inicial do Prisma
npx prisma migrate dev --name init

# 5. Criar o servico PrismaService (src/infrastructure/database/prisma.service.ts e modulo)
mkdir -p src/infrastructure/database
cat << 'EOF' > src/infrastructure/database/prisma.service.ts
import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
EOF

cat << 'EOF' > src/infrastructure/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
EOF

# 6. Criar o script de Seed com contas bancarias iniciais (prisma/seed.ts)
cat << 'EOF' > prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Role } from '../src/generated/prisma/enums.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('SenhaForte123!', 10);

  // 1. Maria (Admin)
  await prisma.user.upsert({
    where: { email: 'maria@fintech.com' },
    update: {},
    create: {
      name: 'Maria Fintech',
      email: 'maria@fintech.com',
      cpf: '00011122233',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  // 2. Lucas (Compliance)
  await prisma.user.upsert({
    where: { email: 'lucas@fintech.com' },
    update: {},
    create: {
      name: 'Lucas Compliance',
      email: 'lucas@fintech.com',
      cpf: '44455566677',
      password: passwordHash,
      role: Role.COMPLIANCE_OFFICER,
    },
  });

  // 3. Joao Silva (Cliente com R$ 5.000,00)
  await prisma.user.upsert({
    where: { email: 'joao@email.com' },
    update: {},
    create: {
      name: 'Joao Silva',
      email: 'joao@email.com',
      cpf: '12345678901',
      password: passwordHash,
      role: Role.CUSTOMER,
      accounts: {
        create: {
          accountNumber: '10001-9',
          balance: BigInt(500000), // R$ 5.000,00
          dailyPixLimit: BigInt(1000000), // R$ 10.000,00
          pixKeys: {
            create: {
              keyType: 'CPF',
              keyValue: '12345678901',
            },
          },
        },
      },
    },
  });

  // 4. Carla Souza (Cliente com R$ 2.500,00)
  await prisma.user.upsert({
    where: { email: 'carla@email.com' },
    update: {},
    create: {
      name: 'Carla Souza',
      email: 'carla@email.com',
      cpf: '98765432100',
      password: passwordHash,
      role: Role.CUSTOMER,
      accounts: {
        create: {
          accountNumber: '20002-8',
          balance: BigInt(250000), // R$ 2.500,00
          dailyPixLimit: BigInt(500000), // R$ 5.000,00
          pixKeys: {
            create: {
              keyType: 'EMAIL',
              keyValue: 'carla@email.com',
            },
          },
        },
      },
    },
  });

  console.log('Seed bancario executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# 7. Executar o seed
npx tsx prisma/seed.ts

# 8. Importar o DatabaseModule no AppModule (src/app.module.ts)
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from './shared/logger/logger.module.js';
import { HealthModule } from './health/health.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomLoggerModule,
    HealthModule,
    DatabaseModule,
  ],
})
export class AppModule {}
EOF

# 9. Validacao Obrigatoria da feature/prisma (Antes do Commit e Merge)
npx prisma validate
npx prisma generate
npm run lint:fix
npm run format:check
npx tsc --noEmit
npm test
npm run build

# 10. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(prisma): add double-entry ledger schema, driver adapter, migrations and seed"
git push origin feature/prisma
git checkout develop
git merge feature/prisma
git push origin develop
git branch -d feature/prisma
git push origin --delete feature/prisma
```

---

### PASSO 3: `feature/auth-mfa` (Autenticacao JWT, MFA TOTP e RBAC)

```bash
# 1. Criar e acessar a branch feature/auth-mfa
git checkout -b feature/auth-mfa
git push -u origin feature/auth-mfa

# 2. Criar a estrutura do modulo de autenticacao
mkdir -p src/modules/auth/dto src/modules/auth/decorators src/modules/auth/guards src/modules/auth/strategies

# 3. DTOs de Autenticacao (src/modules/auth/dto/auth.dto.ts)
cat << 'EOF' > src/modules/auth/dto/auth.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Renato Russo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'renato@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '11122233344' })
  @IsString()
  @MinLength(11)
  cpf!: string;

  @ApiProperty({ example: 'SenhaForte123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: '11999998888', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaForte123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class VerifyMfaDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  token!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
EOF

# 4. Decorators de Roles e CurrentUser
cat << 'EOF' > src/modules/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
EOF

cat << 'EOF' > src/modules/auth/decorators/current-user.decorator.ts
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
  accounts?: Array<{ id: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
EOF

# 5. Guards de Autenticacao e Roles
cat << 'EOF' > src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
EOF

cat << 'EOF' > src/modules/auth/guards/roles.guard.ts
import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado para o papel do usuario');
    }
    return true;
  }
}
EOF

# 6. Estrategia JWT Passport (src/modules/auth/strategies/jwt.strategy.ts)
cat << 'EOF' > src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-prod-super-secure-key-123456',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { accounts: true },
    });
    if (!user) {
      throw new UnauthorizedException('Token invalido ou usuario nao encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accounts: user.accounts,
    };
  }
}
EOF

# 7. Servico de Autenticacao (src/modules/auth/auth.service.ts)
cat << 'EOF' > src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { RegisterDto, LoginDto, VerifyMfaDto } from './dto/auth.dto.js';
import bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import QRCode from 'qrcode';

interface OtplibAuthenticator {
  generateSecret(): string;
  keyuri(user: string, service: string, secret: string): string;
  verify(options: { token: string; secret: string }): boolean;
}

const authenticator = (otplib as unknown as { authenticator: OtplibAuthenticator }).authenticator;

interface UserTokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  accounts?: unknown;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { cpf: dto.cpf }] },
    });
    if (existing) {
      throw new ConflictException('Email ou CPF ja cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        cpf: dto.cpf,
        phone: dto.phone,
        password: passwordHash,
        accounts: {
          create: {
            accountNumber: `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(Math.random() * 9)}`,
            balance: BigInt(0),
            dailyPixLimit: BigInt(500000), // R$ 5.000,00
          },
        },
      },
      include: { accounts: true },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { accounts: true },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    if (user.mfaEnabled && user.mfaSecret) {
      return {
        mfaRequired: true,
        email: user.email,
        message: 'Informe o codigo MFA de 6 digitos para concluir o login',
      };
    }

    return this.generateTokens(user);
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario nao encontrado');

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'FintechMaria', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, qrCodeDataUrl };
  }

  async verifyMfa(dto: VerifyMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { accounts: true },
    });
    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('Configuracao MFA inexistente');
    }

    const isValid = authenticator.verify({
      token: dto.token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Codigo MFA invalido');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true },
    });

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-super-key-987654',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { accounts: true },
      });
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token invalido');
      }

      const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token invalido');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token expirado ou invalido');
    }
  }

  private async generateTokens(user: UserTokenPayload) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod-super-secure-key-123456',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-super-key-987654',
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accounts: user.accounts,
      },
    };
  }
}
EOF

# 8. Controlador de Autenticacao (src/modules/auth/auth.controller.ts)
cat << 'EOF' > src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, VerifyMfaDto, RefreshTokenDto } from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from './decorators/current-user.decorator.js';

@ApiTags('Auth & MFA')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Auto-cadastro de novo cliente com abertura de conta digital' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login com email e senha' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/setup')
  @ApiOperation({ summary: 'Gera chave TOTP e QR Code para ativacao de 2FA' })
  setupMfa(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.setupMfa(user.id);
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Valida codigo TOTP de 6 digitos e conclui autenticacao' })
  verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.authService.verifyMfa(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovacao de access token via refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Retorna perfil e contas do usuario logado' })
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }
}
EOF

# 9. Modulo de Autenticacao (src/modules/auth/auth.module.ts)
cat << 'EOF' > src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, RolesGuard],
})
export class AuthModule {}
EOF

# 10. Atualizar AppModule (src/app.module.ts)
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from './shared/logger/logger.module.js';
import { HealthModule } from './health/health.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CustomLoggerModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
EOF

# 11. Teste Unitario do AuthService (src/modules/auth/auth.service.spec.ts)
cat << 'EOF' > src/modules/auth/auth.service.spec.ts
jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn().mockReturnValue('mock-secret'),
    keyuri: jest.fn().mockReturnValue('otpauth://...'),
    verify: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
}));

import { AuthService } from './auth.service.js';
import { UnauthorizedException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    account: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let jwtMock: {
    sign: jest.Mock;
    verify: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      account: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    jwtMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };
    authService = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtMock as unknown as JwtService,
    );
  });

  it('should throw UnauthorizedException on invalid login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(authService.login({ email: 'fake@email.com', password: '123' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
EOF

# 12. Validacao Obrigatoria da feature/auth-mfa (Antes do Commit e Merge)
npm run lint:fix
npm run format:check
npx tsc --noEmit
npm test
npm run test:ci
npm run build
docker compose up -d db cache

# 13. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(auth): implement jwt, refresh tokens, mfa totp and rbac guards"
git push origin feature/auth-mfa
git checkout develop
git merge feature/auth-mfa
git push origin develop
git branch -d feature/auth-mfa
git push origin --delete feature/auth-mfa
```

---

### PASSO 4: `feature/accounts-ledger` (Modulo de Contas e Livro-Razao)

```bash
# 1. Criar e acessar a branch feature/accounts-ledger
git checkout -b feature/accounts-ledger
git push -u origin feature/accounts-ledger

# 2. Criar a estrutura do modulo de contas
mkdir -p src/modules/accounts/dto

# 3. DTOs de Contas e Chaves PIX (src/modules/accounts/dto/accounts.dto.ts)
cat << 'EOF' > src/modules/accounts/dto/accounts.dto.ts
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PixKeyType } from '../../../generated/prisma/client.js';
import { Type } from 'class-transformer';

export class CreatePixKeyDto {
  @ApiProperty({ enum: PixKeyType, example: PixKeyType.CPF })
  @IsEnum(PixKeyType)
  keyType!: PixKeyType;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  keyValue!: string;
}

export class StatementQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
EOF

# 4. Servico de Contas e Livro-Razao (src/modules/accounts/accounts.service.ts)
cat << 'EOF' > src/modules/accounts/accounts.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { CreatePixKeyDto, StatementQueryDto } from './dto/accounts.dto.js';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
      include: { pixKeys: true },
    });
    if (!account) throw new NotFoundException('Conta bancaria nao encontrada');

    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      branch: account.branch,
      balanceCents: Number(account.balance),
      balanceBrl: (Number(account.balance) / 100).toFixed(2),
      dailyPixLimitCents: Number(account.dailyPixLimit),
      dailyPixLimitBrl: (Number(account.dailyPixLimit) / 100).toFixed(2),
      status: account.status,
      pixKeys: account.pixKeys,
    };
  }

  async getStatement(userId: string, query: StatementQueryDto) {
    const account = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Conta bancaria nao encontrada');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { accountId: account.id },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ledgerEntry.count({ where: { accountId: account.id } }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      entries: entries.map((e) => ({
        id: e.id,
        entryType: e.entryType,
        amountCents: Number(e.amount),
        amountBrl: (Number(e.amount) / 100).toFixed(2),
        balanceAfterCents: Number(e.balanceAfter),
        balanceAfterBrl: (Number(e.balanceAfter) / 100).toFixed(2),
        transaction: {
          id: e.transaction.id,
          type: e.transaction.type,
          status: e.transaction.status,
          description: e.transaction.description,
          createdAt: e.transaction.createdAt,
        },
        createdAt: e.createdAt,
      })),
    };
  }

  async createPixKey(userId: string, dto: CreatePixKeyDto) {
    const account = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Conta bancaria nao encontrada');

    const existingKey = await this.prisma.pixKey.findUnique({
      where: { keyValue: dto.keyValue },
    });
    if (existingKey) {
      throw new ConflictException('Chave PIX ja cadastrada no sistema nacional');
    }

    return this.prisma.pixKey.create({
      data: {
        accountId: account.id,
        keyType: dto.keyType,
        keyValue: dto.keyValue,
      },
    });
  }

  async deletePixKey(userId: string, keyId: string) {
    const key = await this.prisma.pixKey.findUnique({
      where: { id: keyId },
      include: { account: true },
    });
    if (!key || key.account.userId !== userId) {
      throw new NotFoundException('Chave PIX nao encontrada');
    }

    await this.prisma.pixKey.delete({ where: { id: keyId } });
    return { success: true, message: 'Chave PIX excluida com sucesso' };
  }
}
EOF

# 5. Controlador de Contas (src/modules/accounts/accounts.controller.ts)
cat << 'EOF' > src/modules/accounts/accounts.controller.ts
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service.js';
import { CreatePixKeyDto, StatementQueryDto } from './dto/accounts.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Accounts & Ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Consulta o saldo e limites da conta do usuario logado' })
  getBalance(@CurrentUser() user: CurrentUserPayload) {
    return this.accountsService.getBalance(user.id);
  }

  @Get('statement')
  @ApiOperation({ summary: 'Extrato detalhado de partidas dobradas (Ledger Entries)' })
  getStatement(@CurrentUser() user: CurrentUserPayload, @Query() query: StatementQueryDto) {
    return this.accountsService.getStatement(user.id, query);
  }

  @Post('pix-keys')
  @ApiOperation({ summary: 'Cadastra uma nova chave PIX para a conta' })
  createPixKey(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreatePixKeyDto) {
    return this.accountsService.createPixKey(user.id, dto);
  }

  @Delete('pix-keys/:id')
  @ApiOperation({ summary: 'Exclui uma chave PIX cadastrada' })
  deletePixKey(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.accountsService.deletePixKey(user.id, id);
  }
}
EOF

# 6. Modulo de Contas (src/modules/accounts/accounts.module.ts)
cat << 'EOF' > src/modules/accounts/accounts.module.ts
import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { AccountsController } from './accounts.controller.js';

@Module({
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
EOF

# 7. Atualizar AppModule (src/app.module.ts)
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from './shared/logger/logger.module.js';
import { HealthModule } from './health/health.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AccountsModule } from './modules/accounts/accounts.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CustomLoggerModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
    AccountsModule,
  ],
})
export class AppModule {}
EOF

# 8. Teste Unitario de Accounts (src/modules/accounts/accounts.service.spec.ts)
cat << 'EOF' > src/modules/accounts/accounts.service.spec.ts
jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

import { AccountsService } from './accounts.service.js';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaMock: {
    account: { findFirst: jest.Mock };
    pixKey: { findUnique: jest.Mock; create: jest.Mock };
    ledgerEntry: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(() => {
    prismaMock = {
      account: { findFirst: jest.fn() },
      pixKey: { findUnique: jest.fn(), create: jest.fn() },
      ledgerEntry: { findMany: jest.fn(), count: jest.fn() },
    };
    service = new AccountsService(prismaMock as unknown as PrismaService);
  });

  it('should throw NotFoundException if account not found', async () => {
    prismaMock.account.findFirst.mockResolvedValue(null);
    await expect(service.getBalance('fake-id')).rejects.toThrow(NotFoundException);
  });
});
EOF

# 9. Validacao Obrigatoria da feature/accounts-ledger (Antes do Commit e Merge)
npm run lint:fix
npm run format:check
npx tsc --noEmit
npm test
npm run test:ci
npm run build
docker compose up -d db cache

# 10. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(accounts): implement balance query, paginated statements and pix keys management"
git push origin feature/accounts-ledger
git checkout develop
git merge feature/accounts-ledger
git push origin develop
git branch -d feature/accounts-ledger
git push origin --delete feature/accounts-ledger
```

---

### PASSO 5: `feature/pix-transactions` (Motor de Transacoes PIX e Idempotencia Estrita)

```bash
# 1. Criar e acessar a branch feature/pix-transactions
git checkout -b feature/pix-transactions
git push -u origin feature/pix-transactions

# 2. Criar pastas do modulo PIX
mkdir -p src/modules/pix/dto src/modules/pix/interceptors

# 3. DTOs de Transacao PIX (src/modules/pix/dto/pix.dto.ts)
cat << 'EOF' > src/modules/pix/dto/pix.dto.ts
import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PixTransferDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @ApiProperty({ example: 10000, description: 'Valor em centavos (R$ 100,00)' })
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty({ example: 'Pagamento servico', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ValidatePixKeyDto {
  @ApiProperty({ example: 'carla@email.com' })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;
}
EOF

# 4. Servico do Motor PIX (src/modules/pix/pix.service.ts)
cat << 'EOF' > src/modules/pix/pix.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { PixTransferDto, ValidatePixKeyDto } from './dto/pix.dto.js';
import { TransactionType, TransactionStatus, EntryType } from '../../generated/prisma/client.js';

@Injectable()
export class PixService {
  constructor(private prisma: PrismaService) {}

  async validateKey(dto: ValidatePixKeyDto) {
    const key = await this.prisma.pixKey.findUnique({
      where: { keyValue: dto.pixKey },
      include: { account: { include: { user: true } } },
    });

    if (!key) throw new NotFoundException('Chave PIX nao encontrada no DICT');

    return {
      pixKey: key.keyValue,
      keyType: key.keyType,
      recipientName: key.account.user.name,
      maskedCpf: key.account.user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**'),
      accountNumber: key.account.accountNumber,
      branch: key.account.branch,
    };
  }

  async transfer(userId: string, idempotencyKey: string, dto: PixTransferDto) {
    if (!idempotencyKey) {
      throw new BadRequestException('Cabecalho Idempotency-Key obrigatorio');
    }

    // 1. Checagem de Idempotencia estrita
    const existingTx = await this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
    if (existingTx) {
      return {
        idempotent: true,
        message: 'Transacao recuperada por chave de idempotencia',
        transaction: {
          id: existingTx.id,
          status: existingTx.status,
          amountCents: Number(existingTx.amount),
          amountBrl: (Number(existingTx.amount) / 100).toFixed(2),
          createdAt: existingTx.createdAt,
        },
      };
    }

    // 2. Localizar contas de origem e destino
    const sourceAccount = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!sourceAccount) throw new NotFoundException('Conta de origem nao encontrada');

    const destKey = await this.prisma.pixKey.findUnique({
      where: { keyValue: dto.pixKey },
      include: { account: true },
    });
    if (!destKey) throw new NotFoundException('Chave PIX de destino inexistente');

    if (sourceAccount.id === destKey.accountId) {
      throw new BadRequestException('Transferencia para a mesma conta nao permitida');
    }

    const amountBig = BigInt(dto.amountCents);

    if (sourceAccount.balance < amountBig) {
      throw new BadRequestException('Saldo insuficiente para a transferencia');
    }

    if (amountBig > sourceAccount.dailyPixLimit) {
      throw new BadRequestException('Valor excede o limite diario de PIX disponivel');
    }

    // 3. Execucao Atomica no Livro-Razao com Partidas Dobradas ($transaction)
    const result = await this.prisma.$transaction(async (tx) => {
      // Debita origem
      const updatedSource = await tx.account.update({
        where: { id: sourceAccount.id },
        data: { balance: { decrement: amountBig } },
      });

      // Credita destino
      const updatedDest = await tx.account.update({
        where: { id: destKey.accountId },
        data: { balance: { increment: amountBig } },
      });

      // Registra a Transacao
      const transaction = await tx.transaction.create({
        data: {
          idempotencyKey,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destKey.accountId,
          amount: amountBig,
          type: TransactionType.PIX_TRANSFER,
          status: TransactionStatus.COMPLETED,
          description: dto.description || 'Transferencia PIX instantanea',
          pixKeyUsed: dto.pixKey,
        },
      });

      // Livro-Razao: Partida 1 - Debito
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: sourceAccount.id,
          entryType: EntryType.DEBIT,
          amount: amountBig,
          balanceAfter: updatedSource.balance,
        },
      });

      // Livro-Razao: Partida 2 - Credito
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: destKey.accountId,
          entryType: EntryType.CREDIT,
          amount: amountBig,
          balanceAfter: updatedDest.balance,
        },
      });

      return transaction;
    });

    return {
      success: true,
      message: 'PIX realizado com sucesso',
      transaction: {
        id: result.id,
        status: result.status,
        amountCents: Number(result.amount),
        amountBrl: (Number(result.amount) / 100).toFixed(2),
        pixKeyUsed: result.pixKeyUsed,
        createdAt: result.createdAt,
      },
    };
  }
}
EOF

# 5. Controlador PIX (src/modules/pix/pix.controller.ts)
cat << 'EOF' > src/modules/pix/pix.controller.ts
import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PixService } from './pix.service.js';
import { PixTransferDto, ValidatePixKeyDto } from './dto/pix.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@ApiTags('PIX Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pix')
export class PixController {
  constructor(private pixService: PixService) {}

  @Post('validate-key')
  @ApiOperation({ summary: 'Valida destinatario de chave PIX no DICT' })
  validateKey(@Body() dto: ValidatePixKeyDto) {
    return this.pixService.validateKey(dto);
  }

  @Post('transfer')
  @ApiHeader({ name: 'Idempotency-Key', description: 'Chave UUID de idempotencia estrita', required: true })
  @ApiOperation({ summary: 'Executa transferencia PIX com garantia de idempotencia e livro-razao' })
  transfer(
    @CurrentUser() user: CurrentUserPayload,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: PixTransferDto,
  ) {
    return this.pixService.transfer(user.id, idempotencyKey, dto);
  }
}
EOF

# 6. Modulo PIX (src/modules/pix/pix.module.ts)
cat << 'EOF' > src/modules/pix/pix.module.ts
import { Module } from '@nestjs/common';
import { PixService } from './pix.service.js';
import { PixController } from './pix.controller.js';

@Module({
  providers: [PixService],
  controllers: [PixController],
  exports: [PixService],
})
export class PixModule {}
EOF

# 7. Atualizar AppModule (src/app.module.ts)
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from './shared/logger/logger.module.js';
import { HealthModule } from './health/health.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AccountsModule } from './modules/accounts/accounts.module.js';
import { PixModule } from './modules/pix/pix.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CustomLoggerModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
    AccountsModule,
    PixModule,
  ],
})
export class AppModule {}
EOF

# 8. Teste Unitario do PixService (src/modules/pix/pix.service.spec.ts)
cat << 'EOF' > src/modules/pix/pix.service.spec.ts
jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

import { PixService } from './pix.service.js';
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';

describe('PixService', () => {
  let service: PixService;
  let prismaMock: {
    transaction: { findUnique: jest.Mock };
    account: { findFirst: jest.Mock };
    pixKey: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      transaction: { findUnique: jest.fn() },
      account: { findFirst: jest.fn() },
      pixKey: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    service = new PixService(prismaMock as unknown as PrismaService);
  });

  it('should throw BadRequestException if idempotency key is missing', async () => {
    await expect(
      service.transfer('user-1', '', { pixKey: '123', amountCents: 5000 }),
    ).rejects.toThrow(BadRequestException);
  });
});
EOF

# 9. Validacao Obrigatoria da feature/pix-transactions (Antes do Commit e Merge)
npm run lint:fix
npm run format:check
npx tsc --noEmit
npm test
npm run test:ci
npm run build
docker compose up -d db cache

# 10. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(pix): implement atomic pix transfer with strict idempotency and double-entry ledger"
git push origin feature/pix-transactions
git checkout develop
git merge feature/pix-transactions
git push origin develop
git branch -d feature/pix-transactions
git push origin --delete feature/pix-transactions
```

---

### PASSO 6: `feature/notifications-audit` (Filas BullMQ e Auditoria Imutavel WORM)

```bash
# 1. Criar e acessar a branch feature/notifications-audit
git checkout -b feature/notifications-audit
git push -u origin feature/notifications-audit

# 2. Criar pastas de auditoria e notificacoes
mkdir -p src/modules/audit src/modules/notifications

# 3. Servico de Auditoria WORM (src/modules/audit/audit.service.ts)
cat << 'EOF' > src/modules/audit/audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
    userAgent?: string;
    payload?: unknown;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          payload: data.payload ? JSON.stringify(data.payload) : undefined,
        },
      });
    } catch (err: unknown) {
      this.logger.error('Falha ao registrar log de auditoria WORM', err instanceof Error ? err.stack : String(err));
    }
  }

  async listLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
EOF

cat << 'EOF' > src/modules/audit/audit.module.ts
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service.js';

@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
EOF

# 4. Modulo de Notificacoes com BullMQ (src/modules/notifications/notification.consumer.ts)
cat << 'EOF' > src/modules/notifications/notification.consumer.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

interface NotificationJobData {
  email: string;
  transactionId: string;
  amountCents?: number;
}

@Processor('fintech-notifications')
export class NotificationConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumer.name);

  async process(job: Job<NotificationJobData, { processed: boolean; timestamp: string }, string>): Promise<{ processed: boolean; timestamp: string }> {
    this.logger.log(`Processando job de notificacao assincrona: ${job.name} (ID: ${job.id})`);
    
    if (job.name === 'send-receipt') {
      this.logger.log(`Comprovante gerado e enviado para ${job.data.email}: Transacao ${job.data.transactionId}`);
    }

    return { processed: true, timestamp: new Date().toISOString() };
  }
}
EOF

cat << 'EOF' > src/modules/notifications/notification.producer.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationProducer {
  constructor(@InjectQueue('fintech-notifications') private queue: Queue) {}

  async queueReceipt(data: { email: string; transactionId: string; amountCents: number }) {
    await this.queue.add('send-receipt', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
EOF

cat << 'EOF' > src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProducer } from './notification.producer.js';
import { NotificationConsumer } from './notification.consumer.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'fintech-notifications',
    }),
  ],
  providers: [NotificationProducer, NotificationConsumer],
  exports: [NotificationProducer],
})
export class NotificationsModule {}
EOF

# 5. Atualizar AppModule (src/app.module.ts)
cat << 'EOF' > src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerModule } from './shared/logger/logger.module.js';
import { HealthModule } from './health/health.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AccountsModule } from './modules/accounts/accounts.module.js';
import { PixModule } from './modules/pix/pix.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CustomLoggerModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
    AccountsModule,
    PixModule,
    AuditModule,
    NotificationsModule,
  ],
})
export class AppModule {}
EOF

# 6. Teste Unitario de Audit (src/modules/audit/audit.service.spec.ts)
cat << 'EOF' > src/modules/audit/audit.service.spec.ts
jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

import { AuditService } from './audit.service.js';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';

describe('AuditService', () => {
  let service: AuditService;
  let prismaMock: {
    auditLog: { create: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(() => {
    prismaMock = {
      auditLog: { create: jest.fn(), findMany: jest.fn() },
    };
    service = new AuditService(prismaMock as unknown as PrismaService);
  });

  it('should call prisma.auditLog.create', async () => {
    await service.log({
      action: 'PIX_TRANSFER',
      resource: 'TRANSACTION',
      ipAddress: '127.0.0.1',
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });
});
EOF

# 7. Validacao Obrigatoria da feature/notifications-audit (Antes do Commit e Merge)
npm run lint:fix
npm run format:check
npx tsc --noEmit
npm test
npm run test:ci
npm run build
docker compose up -d db cache

# 8. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(notifications): add bullmq queue for receipts and immutable worm audit logs"
git push origin feature/notifications-audit
git checkout develop
git merge feature/notifications-audit
git push origin develop
git branch -d feature/notifications-audit
git push origin --delete feature/notifications-audit
```

---

### PASSO 7: `feature/frontend` (Aplicacao Web React + Vite)

```bash
# 1. Criar e acessar a branch feature/frontend
git checkout -b feature/frontend
git push -u origin feature/frontend

# 2. Criar aplicacao React na pasta frontend
npm create vite@latest frontend -- --template react-ts

# 3. Instalar dependencias do frontend
cd frontend
npm install
npm install axios lucide-react qrcode.react
cd ..

# 4. Validacao Obrigatoria da feature/frontend (Antes do Commit e Merge)
cd frontend && npm run build && cd ..
npm run lint:fix
npm test

# 5. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(frontend): create digital account web app with mfa, balance, pix transfer and statement"
git push origin feature/frontend
git checkout develop
git merge feature/frontend
git push origin develop
git branch -d feature/frontend
git push origin --delete feature/frontend
```

---

### PASSO 8: `feature/deploy` (Conteinerizacao e SPA Fallback)

```bash
# 1. Criar e acessar a branch feature/deploy
git checkout -b feature/deploy
git push -u origin feature/deploy

# 2. Validacao Obrigatoria da feature/deploy (Antes do Commit e Merge)
npm run build:all
docker compose config
docker compose up -d --build
npm test:ci

# 4. Commitar, mergear na develop e limpar branch da feature
git add .
git commit -m "feat(deploy): configure multi-stage dockerfile, spa fallback and production compose"
git push origin feature/deploy
git checkout develop
git merge feature/deploy
git push origin develop
git branch -d feature/deploy
git push origin --delete feature/deploy
```

---

## 6. Release Oficial `v1.0.0` e Sincronizacao da `main`

```bash
# 1. Acessar a branch main e mergear a develop
git checkout main
git merge develop

# 2. Criar a tag oficial de release
git tag -a v1.0.0 -m "release: Fintech da Maria v1.0.0 - Enterprise Monolith, PIX Engine & Double-Entry Ledger"

# 3. Publicar main e tags no GitHub
git push origin main --tags
git push origin develop

# 4. Retornar para a branch develop
git checkout develop
```

---

## 7. Scripts Completos do `package.json`

```json
{
  "scripts": {
    "dev": "nest start --watch",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "prisma generate && tsc",
    "build:frontend": "cd frontend && npm run build",
    "build:all": "npm run build && npm run build:frontend",
    "start": "node dist/main.js",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --passWithNoTests",
    "test:ci": "jest --ci --coverage --maxWorkers=2 --passWithNoTests",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "prepare": "husky",
    "postinstall": "prisma generate",
    "precommit": "lint-staged",
    "prepush": "npm run test"
  }
}
```

---

## 8. Resumo Rapido de Comandos Git (Merge e Exclusao de Branches)

```bash
# Fluxo padrao de finalizacao de cada feature
git add .
git commit -m "feat(escopo): descricao concisa da alteracao"
git push origin feature/nome-da-feature
git checkout develop
git merge feature/nome-da-feature
git push origin develop
git branch -d feature/nome-da-feature
git push origin --delete feature/nome-da-feature
```
