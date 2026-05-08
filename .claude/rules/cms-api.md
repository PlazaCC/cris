---
paths:
  - clients/cms/src/api/**
---

# CMS API — Claude Code Rules

## Strapi Factory Pattern

Standard Strapi v5 flow uses factories for boilerplate reduction.

### Controllers

```typescript
// ✓ Use factory default
export default factories.createCoreController('api::project.project')

// ✗ Only add custom logic if specifically required
export default factories.createCoreController(
  'api::project.project',
  ({ strapi }) => ({
    // custom override method
  })
)
```

**Rule:** Do not add business logic to controllers. Controllers orchestrate request/response; services hold logic.

### Services

```typescript
// ✓ Use factory default
export default factories.createCoreService('api::project.project')

// ✗ Don't add complex logic without a service
```

### Routes

```typescript
// ✓ Use factory default
export default factories.createCoreRouter('api::project.project')

// ✗ Custom routes only for genuinely unique endpoints
```

## Custom Endpoints

If you need a custom endpoint (filters, custom logic), explicitly define:

1. **Route** with custom path and method
2. **Controller** with handler override
3. **Service** with logic

```typescript
// routes/custom-endpoint.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/projects/by-badge/:badgeId',
      handler: 'project.findByBadge',
    },
  ],
}

// controllers/project.ts
export default factories.createCoreController(
  'api::project.project',
  ({ strapi }) => ({
    async findByBadge(ctx) {
      const { badgeId } = ctx.params
      const projects = await strapi.service('api::project.project')
        .findByBadge(badgeId)
      ctx.body = projects
    },
  })
)

// services/project.ts
async findByBadge(badgeId) {
  return strapi.db.query('api::project.project').findMany({
    where: { badges: { id: badgeId } },
  })
}
```

## Validation & Sanitization

**Before persisting or publishing**, validate and sanitize:

```typescript
// In controller or service
const validated = {
  title: (data.title || '').trim(),
  slug: (data.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
  year: parseInt(data.year, 10) || new Date().getFullYear(),
}

// Check for required fields
if (!validated.title) {
  return ctx.badRequest('Title is required')
}

await strapi.entityService.create('api::project.project', {
  data: validated,
  publish: true,
})
```

## Field Naming for Editors

Field names in the Content-type Builder become labels in the CMS admin UI.

**Rules:**

- Keep names **short** (e.g., `cover_images` not `project_cover_images`)
- Use **English** (editor language)
- Use **snake_case** in the database, but label cleanly in the UI
- Avoid abbreviations — editors need clarity

```typescript
// Good field name
{
  name: 'cover_images',
  plugin: 'upload',
  label: 'Cover Images (Desktop & Mobile)', // Clear label for editors
}

// Avoid unclear abbreviations
{
  name: 'proj_imgs',  // ✗ Unclear
  label: 'Proj Imgs', // ✗ Confusing
}
```

## Publishing & Public Access

Ensure content types and fields are:

1. **Publishable** (status: Draft/Published)
2. **Published** when seeded or manually created
3. **Public access** set via role permissions (usually via seed script)

Reference: `clients/cms/scripts/seed.js` — `setPublicPermissions()` function handles public API access.
