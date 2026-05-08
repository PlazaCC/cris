---
applyTo: 'clients/web/src/features/**/hooks/*.ts'
---

# Feature Hooks — Copilot Instructions

## TanStack Query Requirements

All hooks using `useQuery()` or `useMutation()` **must include**:

```typescript
useQuery({
  queryKey: ['resourceName'] or ['resourceName', id],
  queryFn: async () => { /* ... */ },
  staleTime: 1000 * 60 * 10,        // 10 minutes
  gcTime: 1000 * 60 * 30,           // 30 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,      // never refetch on focus — prevents churn
})
```

**Why `refetchOnWindowFocus: false`?**

- Returning to the tab after 5 minutes shouldn't trigger a refetch mid-interaction
- Data is fresh enough within the 10-minute staleTime window
- User will see "stale" UI, but that's acceptable — no unnecessary network requests

## Data Processing Flow

1. **Fetch**: Call `apiClient.get(endpoints.resourceName())`
2. **Validate boundary**: Parse with `strapiSingleResponseSchema` or `strapiCollectionResponseSchema` from `lib/api/schemas.ts`
3. **Adapt**: Call adapter function (e.g., `mapStrapiProjectToDomain()`) from `lib/adapters/`
4. **Return**: Return only the typed domain object (e.g., `Project`, `HeroData`)

```typescript
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.projects.list())
      const parsed = strapiCollectionResponseSchema.parse(response.data)
      return parsed.data.map(mapStrapiProjectToDomain)
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
```

## Query Keys

- Single resource: `['resourceName']` (e.g., `['hero']`, `['global']`)
- With ID: `['resourceName', id]` (e.g., `['project', slugOrId]`)
- Never use full objects or serialized data as keys

## Never Leak DTOs

The adapter **must** parse the DTO and return a domain type. Components should never see Strapi response shapes.

```typescript
// ✓ Correct — adapter ensures domain type
const mapStrapiProjectToDomain = (dto: unknown): Project => {
  /* ... */
}

// ✗ Never return raw DTO
const mapStrapiProjectToDomain = (dto: unknown): unknown => dto
```

## Error Handling

Return errors naturally — let components handle `isError` and `error.message`. Don't swallow or transform errors.

```typescript
useQuery({
  queryKey: ['projects'],
  queryFn: async () => {
    /* ... */
  },
  // Error auto-captured in { error }
})
```
