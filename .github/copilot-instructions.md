# Copilot Instructions — CRIS

## Source of Truth

- Always follow `docs/engineering-rules.md` as baseline for architecture, conventions, and documentation.
- For full architecture overview and patterns, see `AGENTS.md`.
- In case of conflict, prioritize the most restrictive architectural decision (maximize separation of concerns).

## Mandatory Rules

1. Apply Clean Architecture — dependencies point inward toward domain/internal layers.
2. No business logic in visual components (`components/`) or Strapi controllers.
3. Never consume API directly in pages/components — use data layer (hooks + adapters).
4. Maintain boundary validation with Zod on web client and validation/sanitization on CMS.
5. Avoid coupling between external contracts (API DTOs) and internal domain models.

## Current Context

- `clients/cms` is in early Strapi phase — content types being shaped by actual usage.
- `clients/web` still has mock fallbacks — migrate page-by-page to real CMS data.
- Evolution must enable mock → real transition **without changing UI unnecessarily.**

## Implementation Criteria

- Prefer small, incremental, low-risk changes.
- Preserve consistency with current stack (React 19, Vite 6, Tailwind 4, TanStack Query 5, Router 1, Strapi 5).
- Before proposing a new pattern, validate that an equivalent pattern doesn't already exist in the repo.
