---
paths:
  - clients/web/src/lib/adapters/**
---

# Adapters — Claude Code Rules

## Adapter Pattern (DTO → Domain)

Every API response must be adapted before reaching business logic or components.

### Step 1: Normalize Strapi Payload

Call `getEntityFields()` from `strapi-helpers.ts` to handle Strapi v4/v5 payload differences:

```typescript
import { getEntityFields } from './strapi-helpers'

function mapStrapiProjectToDomain(raw: unknown): Project {
  // Strapi can return: { data: { id, attributes: {...} } } OR
  // { id, attributes: {...} } OR { id, ...fields }
  const fields = getEntityFields<Record<string, unknown>>(raw)
```

This normalizes the payload so you can work with a consistent shape.

### Step 2: Validate with Zod

Parse the normalized fields using the feature's Zod schema:

```typescript
import { projectSchema } from '@/features/projects/schemas'

const parsed = projectSchema.parse(fields)
```

The schema lives in `features/*/schemas.ts`, **not** in the adapter.

### Step 3: Return Domain Type

Transform parsed data into a domain type (from `src/interfaces.ts`). Never return raw DTO or `unknown`:

```typescript
export function mapStrapiProjectToDomain(raw: unknown): Project {
  const fields = getEntityFields<Record<string, unknown>>(raw)
  const parsed = projectSchema.parse(fields)

  return {
    slug: parsed.slug ?? '',
    title: parsed.title ?? '',
    description: parsed.description ?? '',
    year: parsed.year ?? '',
    coverImages: mapResponsiveImage(parsed.cover_images),
    blocks: mapProjectBlocks(parsed.blocks),
    badges: toStringArray(parsed.badges),
    blurColor: parsed.blur_color ?? '#000',
  }
}
```

## Media Handling

### Responsive Images

For Strapi `shared.responsive-image` components:

```typescript
import { mapResponsiveImage } from './strapi-image'

const image = mapResponsiveImage(parsed.heroImage)
// Returns: { desktop: 'https://...', mobile: 'https://...' }
```

### Single Media Fields

For single image/file fields:

```typescript
import { mapStrapiMediaToUrl } from './strapi-image'

const url = mapStrapiMediaToUrl(parsed.singleImage)
// Handles: { data: { attributes: { url } } }, { url }, etc.
```

## Helper Functions

Adapters live in `lib/adapters/`. Common helpers:

- `getEntityFields()` — normalize Strapi payload format
- `toStringArray()` — safely extract string arrays
- `mapResponsiveImage()` — map `{ desktop, mobile }` with URLs
- `mapStrapiMediaToUrl()` — extract single media URL

## No `any` in Returns

```typescript
// ✓ Type the return
function mapStrapiProjectToDomain(raw: unknown): Project {}

// ✗ Never return any
function mapStrapiProjectToDomain(raw: unknown): any {}
```

## Location

All adapters go in `clients/web/src/lib/adapters/`:

```
lib/adapters/
  about-adapter.ts
  hero-adapter.ts
  project-adapter.ts
  strapi-helpers.ts
  strapi-image.ts
```

One adapter per resource. Shared utilities in `strapi-helpers.ts` and `strapi-image.ts`.
