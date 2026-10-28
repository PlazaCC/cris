---
applyTo: 'clients/web/src/features/**/api.ts,clients/web/src/server/**'
---

# Server Functions — Copilot Instructions

## Server Functions (`features/<x>/api.ts`)

All data access goes through `createServerFn` in the feature's `api.ts`. Server-only modules live in `src/server/` (`db/`, `auth.ts`, `auth-middleware.ts`, `mailer.ts`, `sanitize.ts`, `secret-box.ts`) and are imported only from `api.ts`, server routes (`routes/api/*`) and `scripts/`.

### Reads

```typescript
export const getFooter = createServerFn({ method: 'GET' }).handler(async () => {
  const row = await db.query.footer.findFirst()
  return mapFooterRowToDomain(row)
})
```

Admin-only reads also use `.middleware([authMiddleware])`.

### Writes

Every write is `POST` + `authMiddleware` + `.validator()` with the input schema from `features/<x>/schemas.ts` (the admin form uses the same schema with `zodResolver`):

```typescript
export const updateFooter = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(footerInputSchema)
  .handler(async ({ data }) => {
    // ...
    return mapFooterRowToDomain(row)
  })
```

Rules:

1. No write without `authMiddleware`. The only public write is `submitContactMessage`, which has its own honeypot and rate limit.
2. Return domain types through the adapter, never raw rows.
3. Multi-statement writes use `db.batch([...])` (neon-http has no interactive transactions).
4. HTML rendered with `dangerouslySetInnerHTML` on the public site is sanitized on write with `server/sanitize.ts`.
5. Secrets stored in the database are encrypted with `server/secret-box.ts` and never returned.
6. Error messages thrown to the panel are in Portuguese; the public site is in English.
7. Schema changes: edit `server/db/schema.ts` → `yarn workspace client-web db:generate` → commit the SQL in `drizzle/`. Never edit an applied migration.
