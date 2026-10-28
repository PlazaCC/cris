# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Monorepo with Yarn workspaces. One client:

- `clients/web` — React 19 + TanStack Start (SSR, Vite 8, Nitro) + TanStack Query 5 / Router 1 + Tailwind 4. Serves the public site and the admin panel (`/admin`).

Content lives in Postgres (Neon) via Drizzle, images in Vercel Blob, and the panel login uses Better Auth. There is no separate CMS.

The source of truth for architecture rules is `docs/engineering-rules.md`. For full architectural overview and patterns, see `AGENTS.md`.
In case of conflict, the most restrictive architectural decision wins.

### Architectural Decision Points for Claude

- **No data access in components.** Components use hooks in `features/*/hooks/`; hooks call server functions in `features/*/api.ts`; server functions query Drizzle and map with `lib/adapters/`.
- **Rows never leak unmapped.** Adapters parse `jsonb` with `server/db/json-types.ts` and return domain types from `interfaces.ts`.
- **Single types may have no row.** A never-saved `site_global`/`about`/`footer` maps to defaults in the adapter, not to an error state.
- **Every write is protected.** `POST` server functions use `authMiddleware` + `.validator()` with the schema from `features/*/schemas.ts`.
- **`server/` is server-only.** Import it only from `features/*/api.ts`, `routes/api/*` and `scripts/` (adapters may `import type` row types).
- **Error/loading states preserve layout.** See `ProjectsSection` in `pages/home/index.tsx` as the canonical pattern. The home hero is static designed content (no data states) — see "Home Hero" in `docs/engineering-rules.md`.
- **SSR-safe code.** Routes live in `src/routes/` (file-based); loaders prefetch `queryOptions` from `features/*/hooks`; no `window`/`document`/`localStorage` access during render.
- **Path alias is `@/*` → `./src/*`.** Use it everywhere (e.g., `import { useProjects } from '@/features/projects/hooks/use-projects'`).

## Commands

### Dev environment

```bash
yarn dev                          # web on :4000 (panel at /admin)
yarn workspace client-web dev     # same, single workspace
```

### Build & lint

```bash
yarn workspace client-web build   # vite build + tsc
yarn workspace client-web lint    # ESLint
```

### Database

```bash
yarn workspace client-web db:generate   # SQL migration from server/db/schema.ts
yarn workspace client-web db:migrate    # apply migrations
yarn workspace client-web db:studio
yarn seed                               # seed/data.json + seed/uploads → Blob + Neon (idempotent)
yarn workspace client-web auth:create-admin <email> <password> [name]
```

### Cleanup

```bash
yarn clean   # clean all build artifacts
```

### Docker (production-like)

```bash
docker compose up -d --build      # web only on :8080, reads clients/web/.env
```

## Environment variables

**Web** (`clients/web/.env`, all server-only — never `VITE_`):

```
DATABASE_URL=            # Neon connection string (dev branch locally)
BLOB_READ_WRITE_TOKEN=   # Vercel Blob store
BETTER_AUTH_SECRET=      # openssl rand -base64 32; also encrypts the SMTP password
BETTER_AUTH_URL=http://localhost:4000
```

SMTP for contact notifications is configured in the panel (`/admin/email`), not in env vars.

## Key conventions

- **File naming:** React components → `PascalCase`; utilities, hooks, schemas, adapters → `kebab-case`
- **Initial content** lives only in the seed (`clients/web/seed/data.json`), never embedded in UI components
- **Error/loading states** must preserve the section layout (see the `ProjectsSection` pattern in `pages/home/index.tsx`)
- **Schema changes** go through `db:generate` and a committed migration in `clients/web/drizzle/`; never edit an applied migration
- **TanStack Query:** always `refetchOnWindowFocus: false`; defaults `staleTime: 10min`, `gcTime: 30min`
- TypeScript strict mode must remain enabled; avoid `any`

## Definition of done

A task is complete when: it respects layer boundaries, has consistent end-to-end typing, passes lint and build for the changed package, contains no mocks in final components, and updates `docs/engineering-rules.md` if a new architectural decision was introduced.
