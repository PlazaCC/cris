---
paths:
  - clients/web/src/lib/adapters/**
---

# Adapters — Claude Code Rules

## Adapter Pattern (Database Row → Domain)

Every database row is adapted before it leaves the server function. Adapters live in `clients/web/src/lib/adapters/`, one per resource (`about-adapter.ts`, `project-adapter.ts`, `contact-adapter.ts`, ...).

### Step 1: Type the input as the Drizzle row

```typescript
import type { projects } from '@/server/db/schema'

type ProjectRow = typeof projects.$inferSelect
```

Row types come in with `import type` from `@/server/db/schema`. The only runtime import from `@/server` allowed here is `server/db/json-types.ts` (plain Zod, no database or secrets).

### Step 2: Parse `jsonb` with the boundary schemas

`jsonb` columns are typed with `$type<...>()`, which is only a compile-time promise. Parse them with the schemas from `server/db/json-types.ts`:

```typescript
import { projectBlocksSchema, responsiveImageSchema } from '@/server/db/json-types'

const blocks = projectBlocksSchema.parse(row.blocks)
```

### Step 3: Return the domain type

Return a type from `src/interfaces.ts`, never the raw row:

```typescript
export function mapProjectRowToDomain(row: ProjectRow): Project {
  return {
    documentId: row.id,
    slug: row.slug,
    title: row.title,
    coverImages: responsiveImageSchema.parse(row.coverImage),
    blocks: projectBlocksSchema.parse(row.blocks),
    // ...
  }
}
```

- Dates become ISO strings (`row.createdAt.toISOString()`).
- Secrets never cross the adapter: expose a flag instead (`MailSettings.hasPassword`, never the password).
- A single type with no row yet (`row | undefined`) maps to defaults, never to an error.

## No `any` in Returns

```typescript
// ✓ Type the return
function mapProjectRowToDomain(row: ProjectRow): Project {}

// ✗ Never return any or the row itself
function mapProjectRowToDomain(row: ProjectRow): any {}
```
