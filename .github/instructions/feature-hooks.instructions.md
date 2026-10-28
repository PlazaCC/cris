---
applyTo: 'clients/web/src/features/**/hooks/*.ts'
---

# Feature Hooks — Copilot Instructions

## Data Flow

Components → hooks in `features/<x>/hooks/` → server functions in `features/<x>/api.ts` → Drizzle → adapter → domain type.

Hooks never import `@/server/*`; they only call the server functions.

## Query Hooks

Each query hook exports its `xxxQueryOptions()` so route loaders can prefetch it:

```typescript
import { queryOptions, useQuery } from '@tanstack/react-query'

import { getProjects } from '@/features/projects/api'

export function projectsQueryOptions() {
  return queryOptions({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false, // always
  })
}

export function useProjects() {
  return useQuery(projectsQueryOptions())
}
```

- `refetchOnWindowFocus: false` is mandatory.
- Public content uses minutes of `staleTime`; admin-only data that must be fresh when an editor opens a form uses `0`.

## Mutation Hooks

Mutations live next to the queries (`use-update-x.ts`, `use-x-mutations.ts`), call the POST server function with `{ data }`, and on success update (`setQueryData`) or invalidate every query key the change affects.

```typescript
export function useUpdateFooter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: z.infer<typeof footerInputSchema>) =>
      updateFooter({ data }),
    onSuccess: (footer) => {
      queryClient.setQueryData(footerQueryOptions().queryKey, footer)
    },
  })
}
```

## Query Keys

- Single resource: `['resourceName']` (e.g., `['global']`, `['about']`)
- With ID: `['resourceName', id]` (e.g., `['project', slug]`)
- Never use full objects or serialized data as keys

## Error Handling

Return errors naturally — let components handle `isError` and `error.message`. Don't swallow or transform errors.
