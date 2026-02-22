# DTO to Domain Mapping (Strapi to Web)

## Overview

This document defines the mapping between DTOs returned by the Strapi API and the domain types used in the web client.

## Current State (2026-02)

- The CMS uses Strapi v5 with flattened payloads (fields in `data[]`), maintaining fallback to `attributes` when necessary.
- `Project.badges` is now a many-to-many relation with `api::badge.badge`.
- Project blocks use repeatable components (`portfolio.*`) and must be mapped by `__component` discriminator.
- Media URLs must be normalized to absolute URLs via `VITE_STRAPI_API_URL`.

**Responsibility:** The adapter layer (`lib/adapters` or `features/*/adapters`) must implement mapping functions that transform DTOs into domain types.

**Principle:** DTOs should not leak into internal layers. Visual components and business logic should only consume domain types.

---

## 1. Project (Portfolio)

### Strapi DTO (API Response)

```typescript
// GET /api/projects?populate=deep
{
  data: [
    {
      id: number;
      documentId: string;
      attributes: {
        slug: string;
        title: string;
        description: string;
        year: string;
        blur_color: string;
        badges: string[];
        cover_images: {
          desktop: { data: { attributes: { url: string; ... } } };
          mobile: { data: { attributes: { url: string; ... } } };
        };
        blocks: Array<
          | { __component: 'portfolio.scope-block'; title: string; paragraphs: string[] }
          | { __component: 'portfolio.quote-title-block'; text: string }
          | { __component: 'portfolio.paragraph-block'; text: string[] }
          | { __component: 'portfolio.images-block'; images: [...] }
          | { __component: 'portfolio.results-block'; results: [...] }
        >;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
      };
    }
  ];
  meta: { pagination: {...} };
}
```

### Domain Type (Web)

```typescript
// clients/web/src/interfaces.ts
type Project = {
  slug: string
  title: string
  description: string
  badge: string[]
  year: string
  cover_images: { desktop: string; mobile: string }
  blocks: Block[]
  blur_color: string
}

type Block =
  | { type: 'scope'; title: string; paragraphs: string[] }
  | { type: 'quote-title'; text: string }
  | { type: 'paragraph'; text: string[] }
  | { type: 'images'; images: { desktop: string; mobile: string }[] }
  | {
      type: 'results'
      results: { value: string; positive: boolean; label: string }[]
    }
```

### Mapping (Adapter)

```typescript
// clients/web/src/lib/adapters/project-adapter.ts

function mapStrapiImageToUrl(strapiImage: any): string {
  return strapiImage?.data?.attributes?.url || ''
}

function mapStrapiResponsiveImage(component: any): {
  desktop: string
  mobile: string
} {
  return {
    desktop: mapStrapiImageToUrl(component.desktop),
    mobile: mapStrapiImageToUrl(component.mobile),
  }
}

function mapStrapiBlockToDomain(strapiBlock: any): Block {
  switch (strapiBlock.__component) {
    case 'portfolio.scope-block':
      return {
        type: 'scope',
        title: strapiBlock.title,
        paragraphs: strapiBlock.paragraphs,
      }

    case 'portfolio.quote-title-block':
      return {
        type: 'quote-title',
        text: strapiBlock.text,
      }

    case 'portfolio.paragraph-block':
      return {
        type: 'paragraph',
        text: strapiBlock.text,
      }

    case 'portfolio.images-block':
      return {
        type: 'images',
        images: strapiBlock.images.map(mapStrapiResponsiveImage),
      }

    case 'portfolio.results-block':
      return {
        type: 'results',
        results: strapiBlock.results.map((item: any) => ({
          value: item.value,
          positive: item.positive,
          label: item.label,
        })),
      }

    default:
      throw new Error(`Unknown block component: ${strapiBlock.__component}`)
  }
}

export function mapStrapiProjectToDomain(strapiProject: any): Project {
  const attrs = strapiProject.attributes

  return {
    slug: attrs.slug,
    title: attrs.title,
    description: attrs.description,
    badge: attrs.badges,
    year: attrs.year,
    blur_color: attrs.blur_color,
    cover_images: mapStrapiResponsiveImage(attrs.cover_images),
    blocks: attrs.blocks.map(mapStrapiBlockToDomain),
  }
}
```

---

## 2. About

### DTO Strapi (API Response)

```typescript
// GET /api/about?populate=deep
{
  data: {
    id: number;
    documentId: string;
    attributes: {
      title: string;
      body: string;
      clients: string[];
      skills: string[];
      image: {
        desktop: { data: { attributes: { url: string; ... } } };
        mobile: { data: { attributes: { url: string; ... } } };
      };
      email: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  meta: {};
}
```

### Domain Type (Web)

```typescript
// clients/web/src/interfaces.ts
type AboutResponse = {
  title: string
  body: string
  clients: string[]
  skills: string[]
  image: { desktop: string; mobile: string }
  email: string
}
```

### Mapping (Adapter)

```typescript
// clients/web/src/lib/adapters/about-adapter.ts

export function mapStrapiAboutToDomain(strapiAbout: any): AboutResponse {
  const attrs = strapiAbout.attributes

  return {
    title: attrs.title,
    body: attrs.body,
    clients: attrs.clients,
    skills: attrs.skills,
    image: mapStrapiResponsiveImage(attrs.image),
    email: attrs.email,
  }
}
```

---

## 3. Global

### Strapi DTO

```typescript
{
  data: {
    attributes: {
      siteName: string;
      siteDescription: string;
      favicon: { data: { attributes: { url: string; ... } } };
      defaultSeo: {
        metaTitle: string;
        metaDescription: string;
        shareImage: { data: { attributes: { url: string; ... } } };
      };
    };
  };
}
```

### Domain Type

```typescript
type GlobalConfig = {
  siteName: string
  siteDescription: string
  favicon: string
  defaultSeo: {
    metaTitle: string
    metaDescription: string
    shareImage: string
  }
}
```

### Mapping

```typescript
export function mapStrapiGlobalToDomain(strapiGlobal: any): GlobalConfig {
  const attrs = strapiGlobal.attributes

  return {
    siteName: attrs.siteName,
    siteDescription: attrs.siteDescription,
    favicon: mapStrapiImageToUrl(attrs.favicon),
    defaultSeo: {
      metaTitle: attrs.defaultSeo.metaTitle,
      metaDescription: attrs.defaultSeo.metaDescription,
      shareImage: mapStrapiImageToUrl(attrs.defaultSeo.shareImage),
    },
  }
}
```

---

## Implementation Guidelines

### 1. Folder Structure

```
clients/web/src/
  lib/
    adapters/
      about-adapter.ts
      project-adapter.ts
      global-adapter.ts
      strapi-image.ts  # Shared helper functions
```

### 2. Validation with Zod

Always validate DTOs at the adapter layer entry point:

```typescript
import { z } from 'zod'

const StrapiProjectDTOSchema = z.object({
  attributes: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    // ... additional fields
  }),
})

export function mapStrapiProjectToDomain(strapiProject: unknown): Project {
  const validated = StrapiProjectDTOSchema.parse(strapiProject)
  // ... rest of mapping
}
```

### 3. Usage with TanStack Query

```typescript
// clients/web/src/features/projects/queries.ts
import { useQuery } from '@tanstack/react-query'
import { mapStrapiProjectToDomain } from '@/lib/adapters/project-adapter'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:1337/api/projects?populate=deep'
      )
      const data = await response.json()
      return data.data.map(mapStrapiProjectToDomain)
    },
  })
}
```

### 4. Error Boundaries

Always wrap components that consume API data with Error Boundaries to catch validation and mapping errors:

```tsx
// clients/web/src/pages/work/index.tsx
import { ErrorBoundary } from 'react-error-boundary'

export function WorkPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ProjectsList />
    </ErrorBoundary>
  )
}
```

---

## Implementation Checklist

- [ ] Create `lib/adapters/strapi-image.ts` with helper functions
- [ ] Create `lib/adapters/project-adapter.ts` with Project mapping
- [ ] Create `lib/adapters/about-adapter.ts` with About mapping
- [ ] Create `lib/adapters/global-adapter.ts` with Global mapping
- [ ] Add Zod validation to all adapters
- [ ] Create `features/projects/queries.ts` with TanStack Query hooks
- [ ] Create `features/about/queries.ts` with TanStack Query hooks
- [ ] Update pages to consume hooks instead of mocks
- [ ] Add Error Boundaries to main routes
- [ ] Update adapter unit tests
- [ ] Document TanStack Query caching strategy

---

## References

- [Strapi 5 REST API Documentation](https://docs.strapi.io/dev-docs/api/rest)
- [TanStack Query v5](https://tanstack.com/query/v5)
- [Zod Validation](https://zod.dev/)
- [Clean Architecture - Adapters Layer](../engineering-rules.md#adaptadores)
