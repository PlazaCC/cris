# Copilot Instructions — CRIS

## Source of Truth

- Always follow `docs/engineering-rules.md` as baseline for architecture, conventions, and documentation.
- For full architecture overview and patterns, see `AGENTS.md`.
- In case of conflict, prioritize the most restrictive architectural decision (maximize separation of concerns).

## Mandatory Rules

1. Apply Clean Architecture — dependencies point inward toward domain/internal layers.
2. No business logic in visual components (`components/`, `pages/`).
3. Never access data directly in pages/components — use the data layer (hooks → server functions → adapters).
4. Validate at every boundary with Zod: server function inputs, `jsonb` read from the database.
5. Database rows never reach components; adapters map them to the domain types in `interfaces.ts`.
6. Every write server function uses `authMiddleware`.

## Current Context

- `clients/web` is the only package: public site + admin panel (`/admin`) + server functions.
- Content lives in Postgres (Neon, Drizzle), images in Vercel Blob, login via Better Auth. There is no external CMS.

## Implementation Criteria

- Prefer small, incremental, low-risk changes.
- Preserve consistency with current stack (React 19, TanStack Start, TanStack Query 5, Router 1, Tailwind 4, Drizzle, Better Auth).
- Before proposing a new pattern, validate that an equivalent pattern doesn't already exist in the repo.
