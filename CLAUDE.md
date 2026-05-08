# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Monorepo with Yarn workspaces. Two clients:

- `clients/web` — React 19 + Vite 6 + TanStack (Query 5, Router 1) + Tailwind 4
- `clients/cms` — Strapi 5 with PostgreSQL

The source of truth for architecture rules is `docs/engineering-rules.md`. For full architectural overview and patterns, see `AGENTS.md`.
In case of conflict, the most restrictive architectural decision wins.

### Architectural Decision Points for Claude

- **No direct API calls in components.** All HTTP goes through hooks in `features/*/hooks/` and adapters in `lib/adapters/`.
- **DTOs never leak unmapped.** Parse with Zod, transform with adapter, return domain type to component.
- **Single types may be null.** When CMS field is unfilled, accept `null` in Zod and map to default in adapter.
- **Error/loading states preserve layout.** See `HeroSection` and `ProjectsSection` in `pages/home/index.tsx` as canonical patterns.
- **Path alias is `@/*` → `./src/*`.** Use it everywhere (e.g., `import { useHero } from '@/features/hero'`).

## Commands

### Dev environment

```bash
# Start PostgreSQL (dev only)
yarn dev:docker          # starts docker-compose.dev.yml (port 5432)

# Run all workspaces in parallel
yarn dev

# Run individually
yarn workspace client-web dev    # Vite on :4000
yarn workspace client-cms dev    # Strapi on :1337
```

### Build & lint

```bash
yarn workspace client-web build   # tsc + vite build
yarn workspace client-web lint    # ESLint

yarn workspace client-cms build   # Strapi build
```

### Code generation

```bash
# In CMS — export OpenAPI schema
yarn workspace client-cms generate:openapi

# In Web — generate TypeScript types from schema
yarn workspace client-web generate:types
```

### Seed & cleanup

```bash
yarn seed    # seed CMS from clients/cms/data/data.json
yarn clean   # clean all build artifacts
```

### Docker (production-like)

```bash
docker compose up -d              # full stack: db + cms (:1337) + web (:8080)
docker compose -f docker-compose.dev.yml up -d   # db only
```

## Environment variables

**Web** (`clients/web/.env`):

```
VITE_STRAPI_API_URL=http://localhost:1337
VITE_STRAPI_API_TOKEN=
VITE_DEV_MODE=true
```

**CMS** (`clients/cms/.env`):

```
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cris
DATABASE_USERNAME=cris
DATABASE_PASSWORD=cris
JWT_SECRET=
ADMIN_JWT_SECRET=
API_TOKEN_SALT=
TRANSFER_TOKEN_SALT=
ENCRYPTION_KEY=
APP_KEYS=key1,key2
```

## Key conventions

- **File naming:** React components → `PascalCase`; utilities, hooks, schemas, adapters → `kebab-case`
- **Mocks** belong only in the CMS seed (`data/data.json`), never embedded in UI components
- **Error/loading states** must preserve the section layout (see `HeroSection` and `ProjectsSection` patterns in `pages/home/index.tsx`)
- **Strapi populate** params are centralized in `lib/api/endpoints.ts`
- **TanStack Query** defaults: `staleTime: 10min`, `gcTime: 30min`
- TypeScript strict mode must remain enabled; avoid `any`

## Definition of done

A task is complete when: it respects layer boundaries, has consistent end-to-end typing, passes lint and build for the changed package, contains no mocks in final components, and updates `docs/engineering-rules.md` if a new architectural decision was introduced.
