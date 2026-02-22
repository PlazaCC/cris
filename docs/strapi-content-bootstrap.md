# Strapi Content Bootstrap — Mock Inventory and Best Practices

## 1. Mocked Content Identified in Web Client

### About

- [src/pages/about/components/hero.tsx](../clients/web/src/pages/about/components/hero.tsx)
  - ✅ **Structure mapped**: title, body, image (desktop/mobile)
- [src/pages/about/components/clients.tsx](../clients/web/src/pages/about/components/clients.tsx)
  - ✅ **Structure mapped**: clients array
- [src/pages/about/components/skills.tsx](../clients/web/src/pages/about/components/skills.tsx)
  - ✅ **Structure mapped**: skills array
- **Status**: Schema created with explicit structure (singleType `about`)

### Home

- [src/pages/home/index.tsx](../clients/web/src/pages/home/index.tsx)
  - Hero with hardcoded title/subtitle.
  - Header image hardcoded (`./images/header-1.png`).
  - ✅ **Structure mapped**: `projects` list with cover_images (desktop/mobile), badges, year, blur_color
  - Card with hardcoded title/tags → **migrated to Project.badges**
- **Status**: Content-type `project` created with portfolio-specific fields

### Work

- [src/pages/work/index.tsx](../clients/web/src/pages/work/index.tsx)
  - ✅ **Structure mapped**: Content blocks with portfolio components
  - Components: `scope-block`, `quote-title-block`, `paragraph-block`, `images-block`, `results-block`
- **Status**: Dynamic zone in Project with portfolio-specific components

### Globals (Layout)

- [src/components/footer.tsx](../clients/web/src/components/footer.tsx)
  - Links, email, branding, copyright hardcoded.
- [src/components/menu.tsx](../clients/web/src/components/menu.tsx)
  - Navigation items and CTA hardcoded.
- [src/pages/work/components/marquee.tsx](../clients/web/src/pages/work/components/marquee.tsx)
  - Email and microcopy hardcoded.
- **Status**: Kept as global (already exists), awaiting future migration

## 2. Strapi 5 — Best Practices for Content Provisioning

Based on current official Strapi 5 documentation:

1. Use **database migrations** for structural changes and one-off data transformations.
2. Use **seed scripts** for initial and editorial content for environments (dev, staging, demos).
3. Use **import/export/transfer** to move content between instances.

Official references:

- Database migrations: https://docs.strapi.io/cms/database-migrations
- Data management (import/export/transfer): https://docs.strapi.io/cms/features/data-management
- CLI: https://docs.strapi.io/cms/cli

### Important Notes from Docs (Strapi 5)

- Migrations run automatically on startup in alphabetical order.
- No official `down migration` support at the moment.
- For TypeScript projects, `useTypescriptMigrations` must be enabled to locate compiled migrations correctly.

## 3. What Has Been Implemented (Portfolio-Specific Schemas)

### Content Types

- ✅ **`api::project.project`** (collectionType)
  - Replaces `article` with portfolio focus
  - Fields: slug, title, description, year, blur_color, badges[], cover_images{responsive}, blocks[]
  - Controller, Service and Routes created

- ✅ **`api::about.about`** (singleType) — **restructured**
  - Explicit structure instead of dynamic zone
  - Fields: title, body, clients[], skills[], image{responsive}, email

- ✅ **`api::global.global`** (singleType) — maintained
  - For site metadata, favicon, SEO defaults

### Components

- ✅ **`shared.responsive-image`**
  - Reusable for desktop/mobile pattern
  - Used in: cover_images, about.image, portfolio.images-block

- ✅ **`portfolio.scope-block`**
  - title (string), paragraphs (json/array)

- ✅ **`portfolio.quote-title-block`**
  - text (string)

- ✅ **`portfolio.paragraph-block`**
  - text (json/array)

- ✅ **`portfolio.images-block`**
  - images (repeatable shared.responsive-image)

- ✅ **`portfolio.result-item`**
  - value (string), positive (boolean), label (string)

- ✅ **`portfolio.results-block`**
  - results (repeatable portfolio.result-item)

### Seed Script

- Updated script: [clients/cms/scripts/seed.js](../clients/cms/scripts/seed.js)
  - Function `resolveResponsiveImage()` for desktop/mobile components
  - Function `resolveProjectPayload()` for projects with new components
  - Function `resolveAboutPayload()` with image{responsive}
  - Support for all `portfolio.*` blocks
- Updated data: [clients/cms/data/data.json](../clients/cms/data/data.json)
  - `about` structure with explicit fields
  - `projects` array with badges, year, blur_color, cover_images, portfolio blocks

### TypeScript Types

- Generated automatically: `yarn strapi ts:generate-types`
- Location: `clients/cms/types/generated/`
- Status: ✅ Validated (seed ran successfully)

## 4. How to Run

From the monorepo root:

```bash
# Generate TypeScript types after schema changes
yarn workspace client-cms strapi ts:generate-types

# Run seed with new data
yarn workspace client-cms seed

# Start Strapi
yarn workspace client-cms develop
```

Then validate in Strapi Admin:

- Single Type `Global` (metadata, favicon, SEO)
- Single Type `About` (title, body, clients, skills, image, email)
- Collection Type `Project` (slug, title, badges, year, blur_color, cover_images, blocks)

## 5. Next Steps to Remove All Mocks

### 5.1 Implement Adapter Layer in Web

Follow [docs/dto-domain-mapping.md](./dto-domain-mapping.md) to create:

- `lib/adapters/strapi-image.ts` — media mapping helper functions
- `lib/adapters/project-adapter.ts` — DTO → Project domain
- `lib/adapters/about-adapter.ts` — DTO → AboutResponse domain
- `lib/adapters/global-adapter.ts` — DTO → GlobalConfig domain

### 5.2 Integrate TanStack Query

- Create `features/projects/queries.ts` with `useProjects()` and `useProject(slug)`
- Create `features/about/queries.ts` with `useAbout()`
- Validate DTOs with Zod at adapter entry points

### 5.3 Update Components

- Replace mocks with hooks:
  - [pages/home/index.tsx](../clients/web/src/pages/home/index.tsx) → `useProjects()`
  - [pages/about/index.tsx](../clients/web/src/pages/about/index.tsx) → `useAbout()`
  - [pages/work/index.tsx](../clients/web/src/pages/work/index.tsx) → `useProject(slug)` (detail page)

### 5.4 Create Remaining Single Types

- **`api::navigation.navigation`** (menu/footer hardcoded)
- **`api::homepage.homepage`** (hero content, hero image)

### 5.5 Remove Old Schemas

- Deprecate `api::article.article` if no longer needed
- Deprecate components `shared.quote`, `shared.rich-text`, `shared.slider` if no longer used

## 6. References

- [Engineering Rules](./engineering-rules.md) — architecture baseline and conventions
- [DTO → Domain Mapping](./dto-domain-mapping.md) — detailed adapter implementation guide
- [Strapi 5 Components](https://docs.strapi.io/dev-docs/backend-customization/models#components)
- [Strapi 5 Content-Types](https://docs.strapi.io/dev-docs/backend-customization/models#content-types)
