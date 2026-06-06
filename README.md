# Claro

Personal finance and budget tracker for Pakistani bank users.

Upload your bank statement CSV — Claro parses it, categorises your transactions, tracks your budgets, and shows you where your money goes.

---

## Project Structure

```
claro/
├── apps/
│   ├── api/                        # NestJS backend
│   │   └── src/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── accounts/
│   │       ├── csv-import/
│   │       ├── transactions/
│   │       ├── budgets/
│   │       ├── notifications/
│   │       ├── dashboard/
│   │       ├── health/
│   │       ├── queues/
│   │       └── common/
│   │           ├── guards/
│   │           ├── decorators/
│   │           ├── filters/
│   │           ├── interceptors/
│   │           └── logger/
│   └── web/                        # React + TypeScript frontend
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── store/
│           ├── services/
│           └── hooks/
├── packages/
│   ├── ui/                         # Shared MUI component library with Storybook
│   ├── types/                      # Shared TypeScript types and API contracts
│   ├── tsconfig/                   # Shared TypeScript configurations
│   └── eslint-config/              # Shared ESLint configurations
├── docs/
│   ├── backend-implementation-plan.md
│   └── frontend-implementation-plan.md
├── docker-compose.yml
├── .env
├── .env.test
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Tech Stack

**Backend (`apps/api`)**
- NestJS · TypeScript
- TypeORM + PostgreSQL
- Redis (caching + Bull job queue)
- JWT authentication with refresh token rotation
- Swagger / OpenAPI at `/api/docs`

**Frontend (`apps/web`)**
- React 18 · TypeScript · Vite
- Material UI with Claro blue theme + dark/light mode
- Redux Toolkit · React Router v6
- Recharts for data visualisation

**Shared Packages**
- `@claro/ui` — shared Material UI component library with Storybook
- `@claro/types` — shared TypeScript types and API contracts between frontend and backend
- `@claro/tsconfig` — shared TypeScript configurations (base, react, nestjs)
- `@claro/eslint-config` — shared ESLint flat configs (base, react, nestjs)

**Monorepo & Tooling**
- Turborepo — build system and parallel task runner
- pnpm workspaces — package management
- Docker + Docker Compose — one command local stack
- Husky + lint-staged — pre-commit hooks (lint, format, type-check)
- Prettier — code formatting
- ESLint 9 — linting

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v20 LTS |
| pnpm | v8+ |
| Docker + Docker Compose | v24+ |

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

---

## Quick Start

```bash
# Clone and install all workspace dependencies
git clone <repo-url>
cd claro
pnpm install

# Copy environment file and fill in values
cp .env.example .env

# Start everything (Postgres, Redis, API, Web)
docker-compose up --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api/docs |
| Web app | http://localhost:5173 |
| Storybook | http://localhost:6006 |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

---

## Development (without Docker)

Run the API and web app locally against a Dockerised database:

```bash
# Start only the infrastructure services
docker-compose up postgres redis

# Terminal 1 — backend
pnpm dev:api

# Terminal 2 — frontend
pnpm dev:web
```

Or run everything at once (Turborepo runs them in parallel):
```bash
pnpm dev
```

Run Storybook for isolated UI component development:
```bash
pnpm storybook
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API and web in parallel via Turborepo |
| `pnpm dev:api` | Start backend only |
| `pnpm dev:web` | Start frontend only |
| `pnpm storybook` | Start Storybook for shared UI components |
| `pnpm build` | Build all apps and packages in dependency order |
| `pnpm test` | Run all tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm lint` | Lint all code |
| `pnpm format` | Format all code with Prettier |
| `pnpm format:check` | Check formatting without modifying files |
| `pnpm type-check` | TypeScript type check across all packages |
| `pnpm clean` | Clean all build artifacts and node_modules |
| `pnpm docker:up` | Build and start all Docker services |
| `pnpm --filter api migration:generate` | Generate a new TypeORM migration |
| `pnpm --filter api migration:run` | Run pending migrations |
| `pnpm --filter api migration:revert` | Revert the last migration |

---

## Packages

### `@claro/ui`
Shared Material UI component library. Components are built once and consumed by `apps/web`. Storybook runs in this package for isolated development and visual testing.

```typescript
import { Button, Card, StatCard } from '@claro/ui';
```

### `@claro/types`
Shared TypeScript interfaces and types for type-safe communication between the frontend and backend. API response shapes, DTO types, and enums live here.

```typescript
import type { ApiResponse, Transaction, Budget } from '@claro/types';
```

### `@claro/tsconfig`
Shared TypeScript configurations extended by each app and package:
- `base.json` — base config for all packages
- `react.json` — config for React apps
- `nestjs.json` — config for NestJS apps

### `@claro/eslint-config`
Shared ESLint 9 flat configs:
- `base.js` — base config with TypeScript support
- `react.js` — React-specific rules
- `nestjs.js` — NestJS-specific rules

---

## Pre-commit Hooks

Husky and lint-staged run automatically on staged files before every commit:
- ESLint — lint and auto-fix
- Prettier — format code
- TypeScript — type check

These are non-negotiable — the commit will be blocked if any check fails.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=claro
DB_PASSWORD=claro
DB_NAME=claro_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=          # generate a strong random string
REFRESH_TOKEN_SECRET=# generate a separate strong random string

# Email (needed for budget alert notifications)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=       # use a Gmail app password, not your account password
MAIL_FROM=noreply@claro.app
```

---

## Database Migrations

Migrations are used from day one — `synchronize` is always off. After any entity change:

```bash
# Generate migration from entity diff
pnpm --filter api migration:generate src/migrations/DescribeYourChange

# Review the generated file in apps/api/src/migrations/
# Then apply it
pnpm --filter api migration:run

# Revert the last migration if needed
pnpm --filter api migration:revert
```

Never edit a migration file after it has been committed. Generate a new one instead.

---

## API Overview

Base URL: `/api/v1` — all protected routes require `Authorization: Bearer <token>`

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 4 | Register, login, refresh token, logout |
| Users | 3 | Profile, update, delete account |
| Accounts | 3 | List, get, create bank account |
| CSV Import | 4 | Upload statement, import history |
| Transactions | 4 | List with filters, update category, export CSV |
| Budgets | 5 | CRUD + live spent amount computation |
| Notifications | 4 | List, mark read, delete |
| Dashboard | 3 | Summary, spending by category, monthly trend |
| Health | 1 | DB + Redis status, uptime |

Full documentation at `http://localhost:3000/api/docs` when the API is running.

---

## Implementation Plan

See [`docs/backend-implementation-plan.md`](docs/backend-implementation-plan.md) and [`docs/frontend-implementation-plan.md`](docs/frontend-implementation-plan.md) for the full phase-by-phase build plan with code snippets.
