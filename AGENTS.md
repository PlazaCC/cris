# AGENTS.md — CRIS

Monorepo with a single package: `clients/web` (TanStack Start), which serves the public site, the admin panel (`/admin`) and its own server functions. Content lives in Postgres (Neon) via Drizzle, images in Vercel Blob, login via Better Auth — there is no separate CMS.

## Setup

1. `nvm use` (Node 22 required)
2. `yarn install` (Yarn 4.9.2, `node-modules` linker — not PnP)
3. Copy the env file and fill it in (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`):
   ```
   Copy-Item clients/web/.env.example clients/web/.env
   ```
4. `yarn workspace client-web db:migrate` — creates the tables
5. `yarn seed` — loads `clients/web/seed/` into Neon + Blob (idempotent)
6. `yarn workspace client-web auth:create-admin <email> <password> [name]` — panel login
7. `yarn dev` — web on port 4000, panel at `/admin`

The workspace name is `client-web` (not `cris-*`).

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

| Command                                         | What it does                                              |
| ----------------------------------------------- | --------------------------------------------------------- |
| `yarn dev`                                      | Run the web app (SSR) on :4000                            |
| `yarn seed`                                     | Seed Neon + Blob from `clients/web/seed/`                 |
| `yarn clean`                                    | Remove node_modules, dist, and build artifacts            |
| `yarn workspace client-web db:generate`         | Generate a SQL migration from `src/server/db/schema.ts`   |
| `yarn workspace client-web db:migrate`          | Apply migrations in `clients/web/drizzle/`                |
| `yarn workspace client-web db:studio`           | Drizzle Studio                                            |
| `yarn workspace client-web auth:create-admin`   | Create an admin or reset its password                     |

## Architecture

Clean Architecture — dependencies always point inward.

### Web (`clients/web/src`)

```
routes/       — file-based routes (TanStack Start); wire loader, head, component
pages/        — route composition only (public site + pages/admin)
components/   — visual blocks, no business logic
features/<x>/ — use cases by domain (about, auth, badges, contact, footer, global, media, projects)
  api.ts      — server functions (createServerFn): reads, and writes behind authMiddleware
  schemas.ts  — Zod input schemas, shared by server validators and admin forms
  hooks/      — TanStack Query hooks (queryOptions + mutations)
server/       — server-only: db/ (Drizzle schema, client, jsonb schemas), auth, mailer, sanitize, secret-box
lib/adapters/ — database row → domain type mappers (one per resource)
interfaces.ts — domain types
```

**Rules:**

- UI never touches data directly: components → `features/*/hooks` → `features/*/api.ts` → Drizzle → adapter.
- Database rows never leak into components. Map through `lib/adapters/*-adapter.ts`; parse `jsonb` with `server/db/json-types.ts`.
- Every write server function uses `authMiddleware` and validates with the feature's Zod schema.
- A single type (`site_global`, `about`, `footer`) with no row yet maps to defaults, not to an error.
- TanStack Start (SSR) + TanStack Router with file-based routes in `src/routes/`. `src/router.tsx` exports `getRouter()`. Route loaders prefetch `features/*` `queryOptions`; see `docs/engineering-rules.md` → Routing and SSR.
- Path alias: `@/*` → `./src/*`.

## Schema Changes

Any content field change requires updates in **all** of:

1. `server/db/schema.ts` + `db:generate` (commit the migration); `server/db/json-types.ts` for `jsonb`
2. `interfaces.ts` and `lib/adapters/*-adapter.ts`
3. `features/*/schemas.ts` and `features/*/api.ts`
4. The admin form in `pages/admin/*` and the consuming public components

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

### Adapter Pattern (Row → Domain)

1. Type the input as the Drizzle row (`typeof table.$inferSelect`)
2. Parse `jsonb` fields with the schemas from `server/db/json-types.ts`
3. Return the domain type (e.g., `Project`, `AboutData`) — never the raw row; dates become ISO strings, secrets never leave the server

### Zustand State Usage

`stores/` directory reserved for **cross-cutting UI state** with no natural feature owner:

- Navigation lock → `navigation-store.ts` ✓
- Page transition handoff → `page-transition-store.ts` ✓
- Feature-specific state (hero highlight, project filters) → Feature hook + React state ✗

### Domain Type Contracts

Domain types live in `src/interfaces.ts`. Database rows are typed from `server/db/schema.ts`. Adapters bridge the two, ensuring components only see domain types.

## Tooling

- **Formatter**: Prettier — `singleQuote`, `no semi`, `tabWidth 2`, import/tailwind auto-sort
- **TypeScript**: strict mode enabled, `noUnusedLocals` and `noUnusedParameters` on
- **No tests exist yet** — do not assume a test framework

## Docker

- `docker-compose.yml` — the web app only (port 8080), reading `clients/web/.env`. Database and media are external (Neon, Vercel Blob).

## Docs and Instructions

- `docs/engineering-rules.md` — full architecture rules, stack versions, conventions
- `.github/copilot-instructions.md` — Copilot-specific rules (Portuguese)
- In case of conflict, follow the most restrictive architectural decision
