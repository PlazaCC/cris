---
paths:
  - clients/web/src/components/**/*.tsx
---

# React Components — Claude Code Rules

## Core Rules

1. **No direct API calls.** Data must arrive via feature hooks as typed domain objects only.
2. **No business logic.** Components are pure presentation — filters, transforms, and selection belong in hooks or adapters.
3. **No DTO manipulation.** Never parse, validate, or reshape API data inside components. That's the adapter's job.
4. **Error and loading states must preserve section layout.** See canonical patterns in `HeroSection` and `ProjectsSection` (`pages/home/index.tsx`):
   - Maintain same height and DOM structure when loading/erroring
   - Use `LoadingState` and `ErrorState` components inside the existing layout container
   - Never let loading states collapse or shift the page

## Example Pattern (pages/home/index.tsx)

```typescript
function HeroSection() {
  const { data, isLoading, error, refetch } = useHero()

  // Maintain structure: same container whether loading, error, or success
  if (isLoading || error || !data) {
    return (
      <div className="h-dvh w-full px-10 pt-9 pb-[115px]">
        <div className="bg-off-white relative flex h-full w-full flex-col items-center justify-center rounded-4xl p-[53px] shadow-2xl">
          {isLoading && <LoadingState />}
          {error && <ErrorState onRetry={() => void refetch()} />}
          {!data && <ErrorState title="Content not found" />}
        </div>
      </div>
    )
  }

  return <HomeHero {...data} />
}
```

## Domain Types Only

All data reaching a component must be domain types (e.g., `HeroData`, `Project`) from `src/interfaces.ts`. Never accept raw API DTOs or `unknown`.

```typescript
// ✓ Correct
function ProjectCard({ project }: { project: Project }) {}

// ✗ Avoid
function ProjectCard({ project }: { project: any }) {}
function ProjectCard({ project }: { project: StrapiProjectDTO }) {}
```

## Imports

- Use path alias: `@/components`, `@/features`, `@/lib`, `@/interfaces`
- React components are `PascalCase`; import paths match exactly

## Styling

- Tailwind CSS v4 only — all visual rules inline
- No CSS modules or styled-components
- Apply responsive utility classes directly to JSX
