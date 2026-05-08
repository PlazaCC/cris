# AGENTS.md — CRIS

Monorepo: Strapi CMS (`clients/cms`) + React web client (`clients/web`).

## Setup

1. `nvm use` (Node 22 required)
2. `yarn install` (Yarn 4.9.2, `node-modules` linker — not PnP)
3. Copy env files (PowerShell):
   ```
   Copy-Item clients/cms/.env.example clients/cms/.env
   Copy-Item clients/web/.env.example clients/web/.env
   ```
4. `yarn dev:docker` — starts Postgres 16 on port 5432
5. `yarn seed` — seeds CMS with initial data (must run before web works with real data)
6. `yarn dev` — runs both CMS (port 1337) and web (port 4000)

Workspace names are `client-cms` and `client-web` (not `cris-*`).

After cloning, run `powershell ./scripts/setup-agents.ps1` to create agent skill symlinks.

## Agent Skills

Skills live in `.agents/skills/` (canonical directory). Windows junctions mirror it for each agent:

- `.claude/skills/` → `.agents/skills/`
- `.opencode/skills/` → `.agents/skills/`
- `.github/skills/` → `.agents/skills/`

| Skill              | Source                     | Purpose                                                     |
| ------------------ | -------------------------- | ----------------------------------------------------------- |
| `context7-mcp`     | Local                      | Fetch live docs for any library/framework via Context7 MCP  |
| `find-skills`      | `vercel-labs/skills`       | Discover and install skills from skills.sh ecosystem        |
| `simplify`         | `brianlovin/claude-config` | Auto-refine recently written code for clarity               |
| `token-efficiency` | `delphine-l/claude_global` | Optimize token usage — prefer bash over read, filter output |

**Add a skill** (junctions propagate to all agents automatically):

```
npx skills add <owner/repo> --skill <name> -a claude-code -y
```

**Update all tracked skills:**

```
npx skills update -y
```

**Restore after cloning** (after running `setup-agents.ps1`):

```
npx skills experimental_install -y
```

## MCP Servers

Configured in `opencode.json` — loaded automatically by OpenCode:

- `context7` — live library docs (remote MCP)
- `figma` — Figma design extraction (needs `FIGMA_ACCESS_TOKEN` env)
- `playwright` — browser automation for testing
- `supabase` — database/project management (remote MCP)

MCP keys are stored in user-level env, never committed to repo.

## Key Commands

| Command                                      | What it does                                                |
| -------------------------------------------- | ----------------------------------------------------------- |
| `yarn dev`                                   | Run both CMS and web concurrently                           |
| `yarn workspace client-cms dev`              | Run Strapi alone                                            |
| `yarn workspace client-web dev`              | Run Vite alone                                              |
| `yarn seed`                                  | Seed CMS data from `clients/cms/data/data.json`             |
| `yarn dev:docker:down`                       | Stop dev Postgres                                           |
| `yarn clean`                                 | Remove all node_modules, dist, and build artifacts          |
| `yarn workspace client-cms generate:openapi` | Generate OpenAPI spec → `clients/web/types/openapi.json`    |
| `yarn workspace client-web generate:types`   | Generate TS types from OpenAPI → `clients/web/types/api.ts` |

**Codegen order**: `generate:openapi` (cms) → `generate:types` (web).

## Architecture

Clean Architecture — dependencies always point inward.

### Web (`clients/web/src`)

```
pages/        — route composition only, no API calls
components/   — visual blocks, no business logic
features/     — use cases by domain (about, badges, footer, global, hero, projects)
  hooks/      — TanStack Query hooks live here
  schemas.ts  — Zod schemas per feature
entities/     — domain models and contracts
lib/api/      — HTTP client (Axios), centralized endpoints
lib/adapters/ — Strapi DTO → Domain mappers (one per resource)
```

**Rules:**

- UI never calls the API directly. All HTTP goes through `lib/api/client.ts` + `lib/api/endpoints.ts`.
- API DTOs never leak into components. Map through `lib/adapters/*-adapter.ts`.
- Zod schemas in `lib/api/schemas.ts` and `features/*/schemas.ts` validate at boundaries.
- Strapi single types may return `null` when not yet filled — Zod must accept `null` and adapters map to defaults.
- TanStack Router (`@tanstack/react-router`) for routing. Route tree in `src/router.tsx`.
- Path alias: `@/*` → `./src/*`.

### CMS (`clients/cms/src`)

```
api/          — one directory per content type (about, badge, footer, global, hero, project)
  routes/     — HTTP contracts
  controllers/— orchestrate request/response (no complex logic)
  services/   — business logic and data access
```

**Rules:**

- Controllers should not contain complex business logic.
- Validate and sanitize payloads before persisting.
- Seed script (`scripts/seed.js`) handles media resolution, upserts, publishing, and public permissions.

## Strapi ↔ Web Sync

Any schema/field change in Strapi requires updates in **all** of:

1. `lib/api/endpoints.ts` — endpoint URL
2. `lib/api/schemas.ts` — Zod schema for response
3. `features/*/schemas.ts` — feature-level Zod schema
4. `lib/adapters/*-adapter.ts` — DTO → Domain mapper
5. Consuming components/pages

## Data Flow & Patterns

### TanStack Query Hook Requirements

All `useQuery` and `useMutation` hooks must include:

```typescript
useQuery({
  queryKey: ['resource'] or ['resource', id],
  queryFn: async () => { /* fetch & map */ },
  staleTime: 1000 * 60 * 10,        // 10 minutes
  gcTime: 1000 * 60 * 30,           // 30 minutes
  refetchOnWindowFocus: false,      // prevent network churn
})
```

### Adapter Pattern (Strapi → Domain)

1. Call `getEntityFields()` from `lib/adapters/strapi-helpers.ts` — normalizes Strapi v4/v5 payload format
2. Parse normalized object with Zod schema from `features/*/schemas.ts`
3. Return typed domain model (e.g., `HeroData`, `Project`) — never raw DTO
4. For `shared.responsive-image` component, use `mapResponsiveImage()` from `lib/adapters/strapi-image.ts`
5. For single media fields, use `mapStrapiMediaToUrl()` — handles various Strapi media formats

### API Endpoint Configuration

Two strategies:

- **Static endpoints** (fixed queries): define as functions in `lib/api/endpoints.ts` (e.g., `global()`, `hero()`, `projects.list()`)
- **Dynamic endpoints** (filters, pagination, custom populate): use `buildEndpoint()` helper from `lib/api/endpoints.ts`
- **Never use** `?populate=deep` in production API calls — reserved for development/debug. Use explicit `populate` params in `endpoints.ts`

### Zustand State Usage

`stores/` directory reserved for **cross-cutting UI state** with no natural feature owner:

- Navigation menu open/close state → `navigation-store.ts` ✓
- Theme toggle (dark/light) → `theme-store.ts` ✓
- Feature-specific state (hero highlight, project filters) → Feature hook + React state ✗

### VITE_DEV_MODE Purpose

Enables axios request/response logging in dev environment. Controlled in `lib/api/client.ts` with optional interceptors. **Never** use to gate business logic or hide production UI issues.

### Domain Type Contracts

Domain types live in `src/interfaces.ts`. API DTOs remain in `types/api.ts` (auto-generated from OpenAPI). Adapters bridge the two, ensuring components only see domain types.

## Tooling

- **Formatter**: Prettier — `singleQuote`, `no semi`, `tabWidth 2`, import/tailwind auto-sort
- **TypeScript**: strict mode enabled, `noUnusedLocals` and `noUnusedParameters` on
- **No tests exist yet** — do not assume a test framework

## Docker

- `docker-compose.dev.yml` — Postgres only (for local dev)
- `docker-compose.yml` — full stack (db + cms + web on port 8080, for production)

## Docs and Instructions

- `docs/engineering-rules.md` — full architecture rules, stack versions, conventions
- `.github/copilot-instructions.md` — Copilot-specific rules (Portuguese)
- In case of conflict, follow the most restrictive architectural decision
