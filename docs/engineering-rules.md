# Engineering Rules

## Purpose

This document defines the technical baseline for:

- Clean Architecture with dependencies pointing inward
- Separation of concerns between UI, domain, and data layers
- Best practices for typing, validation, and security
- Adherence to official documentation for the stack versions in use

## Stack and Versions

### Root

- Node.js: `22.x` required
- Yarn: `4.9.2`
- Workspaces: `clients/*`, `shared/*`

### Web

- React `19.1.x`
- TypeScript `5.8.x`
- Vite `6.3.x`
- Tailwind CSS `4.1.x`
- TanStack Query `5.81.x`
- TanStack Router `1.124.x`
- Axios `1.10.x`
- Zustand `5.0.x`
- Zod `3.25.x`
- Radix UI (`@radix-ui/*`) for UI primitives

### CMS

- Strapi `5.36.1`
- Node supported: `>=20 <=24` compatible with root `22.x`
- PostgreSQL driver: `pg 8.8.0`

## Official Documentation

Always check official docs before searching for blog posts or third-party guides.

- Node.js: https://nodejs.org/docs/latest-v22.x/api/
- Yarn Berry (v4): https://yarnpkg.com/features/workspaces
- TypeScript: https://www.typescriptlang.org/docs/
- React 19: https://react.dev/
- Vite: https://vite.dev/guide/
- Tailwind CSS v4: https://tailwindcss.com/docs/installation/using-vite
- TanStack Query v5: https://tanstack.com/query/v5
- TanStack Router v1: https://tanstack.com/router/latest
- Zod: https://zod.dev/
- Zustand: https://zustand.docs.pmnd.rs/
- Axios: https://axios-http.com/docs/intro
- Radix UI: https://www.radix-ui.com/primitives/docs/overview/introduction
- Strapi v5: https://docs.strapi.io/
- Strapi CLI: https://docs.strapi.io/dev-docs/cli
- Strapi Content API: https://docs.strapi.io/cms/api/content-api

## Clean Architecture Baseline

### Web Structure

Layers and responsibilities:

- `pages/` and route components: presentation and composition only.
- `components/`: visual components and reusable blocks without business logic.
- `features/`: use cases grouped by functional context.
- `entities/`: domain models, contracts, and pure business rules.
- `lib/` and `shared/`: technical utilities and integrations.

Rules:

1. UI never accesses the API directly.
2. All HTTP calls go through centralized client and adapters.
3. API DTOs never leak into components without mapping to domain types.
4. Validate input and output at boundaries with Zod.
5. Data hooks using TanStack Query live in `features/*/hooks` not inside generic UI components.

### CMS Structure

Standard flow:

- `routes` define HTTP contracts
- `controllers` orchestrate request and response
- `services` contain business logic and data access

Rules:

1. Controllers should not contain complex business logic.
2. Sanitize and validate payloads before persisting or publishing.
3. Reuse services to avoid duplicated logic across endpoints.
4. Keep response structures generic unless specific use cases require customization.

## Project State and Direction

Current state:

- Strapi is up and running.
- Web client still has some mocked content.

Evolution guidelines:

1. Keep mocks at the adapter layer never embedded in UI components.
2. Use a single HTTP client for Strapi and type all responses.
3. Migrate page by page from mocks to real data using Query hooks.
4. Create `Strapi -> Domain` mappers for each resource.

### Modular Single Types

To maintain organization and modularity split single types by responsibility:

- `Global`: site name, description, favicon, default SEO.
- `Hero`: home hero content.
- `Footer`: footer content.

Rules:

1. UI should not contain mocked data as visual fallback. Mocks live in the CMS seed only.
2. Components consume data from Strapi via hooks and adapters.
3. Error and loading states should preserve the section layout.

### Field Naming for Editors

Field names in Strapi are displayed as labels in the Content Manager.
Keep names short, in English, and editor-friendly.
To change labels rename the field in the Content-type Builder and update the web client.

### Strapi Changes Require Web Updates

Any schema or field changes in Strapi must be reflected in the web client:

- Update Zod schemas in `features/*/schemas.ts`.
- Update adapters in `lib/adapters/*`.
- Update data hooks in `features/*/hooks`.
- Update endpoints in `lib/api/endpoints.ts`.
- Update consuming components and pages.

### Null Fields in Strapi

Single types may return `null` when not yet filled in the CMS.
Zod schemas in the web client should accept `null` for optional fields and map to default values in the adapter to avoid unnecessary error states.

## Conventions and Quality

- TypeScript strict mode must stay enabled in the web client.
- Avoid `any`. When unavoidable encapsulate and document the reason.
- React components use `PascalCase`. Utility files use `kebab-case`.
- Do not mix styling, domain state, and I/O responsibilities in the same module.
- Justify all new dependencies and add them to the stack section of this document.

### TanStack Query Requirements

All `useQuery` and `useMutation` hooks must include `refetchOnWindowFocus: false` to prevent unnecessary network churn:

```typescript
useQuery({
  queryKey: ['resource'],
  queryFn: async () => {
    /* ... */
  },
  staleTime: 1000 * 60 * 10,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
})
```

### Adapter Pattern

Adapters normalize Strapi payloads and map DTOs to domain types. Always:

1. Call `getEntityFields()` from `lib/adapters/strapi-helpers.ts` to normalize v4/v5 formats
2. Parse with Zod schema from `features/*/schemas.ts`
3. Return typed domain model — never raw DTO

### API Endpoints Strategy

- **Static endpoints**: define as functions in `lib/api/endpoints.ts` for fixed queries (e.g., `global()`, `hero()`)
- **Dynamic endpoints**: use `buildEndpoint()` helper for filters, pagination, custom populate
- **Never use `?populate=deep` in production** — reserved for development/debug only

### Zustand State Usage

`stores/` is reserved for **cross-cutting UI state** with no natural feature owner:

- Navigation menu state ✓
- Theme toggle ✓
- Feature-specific state (filters, highlights) → Use feature hooks instead ✗

### Domain Type Contracts

Domain types live in `src/interfaces.ts` (previously `interrfaces.ts` — typo fixed). API DTOs remain in `types/api.ts`. Adapters bridge the two, ensuring components only see domain types.

### VITE_DEV_MODE Purpose

Enables axios request/response logging in dev. Use in `lib/api/client.ts` for debug interceptors. **Never** use to gate business logic or hide production UI issues.

## Definition of Done

A task is complete when:

1. It respects layers with no dependency violations.
2. It has consistent typing end to end.
3. It does not keep mocks inside final components.
4. It passes lint and build for the changed package.
5. It updates docs when introducing new architectural decisions.
