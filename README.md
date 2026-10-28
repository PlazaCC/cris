# CRIS

Portfolio site with its own content panel, in a Yarn monorepo.

## Packages

- `clients/web`: React 19 + TanStack Start (SSR). Serves the public site and the admin panel at `/admin`.

Content lives in Postgres (Neon) through Drizzle, images in Vercel Blob, and the panel login uses Better Auth. There is no separate CMS service.

## Requirements

- Node 22.x
- Yarn 4.9.2
- A Neon database (use a `dev` branch locally) and a Vercel Blob store

## Setup

```bash
yarn install

# Linux/macOS
cp clients/web/.env.example clients/web/.env
# Windows (PowerShell)
Copy-Item clients/web/.env.example clients/web/.env
```

Fill in `clients/web/.env`, then create the tables, load the initial content and create your admin:

```bash
yarn workspace client-web db:migrate
yarn seed
yarn workspace client-web auth:create-admin you@example.com 'a-strong-password' "Your name"
```

## Development

```bash
yarn dev   # http://localhost:4000 — panel at /admin
```

## Deploy

Production is on Vercel (`plazas-cc/cris-web`, root `clients/web`), deployed only by GitHub Actions (`.github/workflows/deploy.yml`); Vercel's own git deploys are off (`clients/web/vercel.json`).

- Pull request: lint + build.
- Push to `main`: lint → `vercel build` → migrations on the production database → `vercel deploy --prebuilt --prod`.
- Manual run (Actions → CI / Deploy → Run workflow) with `seed` checked also runs the seed after the migrations.

Secrets (GitHub environment `Production`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, plus `BLOB_READ_WRITE_TOKEN` for the manual seed (it is a Secret in Vercel, so `vercel pull` does not return it). App env vars live only in Vercel (Production) and are pulled by the workflow: `DATABASE_URL`/`DATABASE_URL_UNPOOLED` (Neon `cris-db` integration), `BLOB_READ_WRITE_TOKEN` (`cris-storage`), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

A Docker image is also available (`docker compose up -d --build`, port 8080). It reads `clients/web/.env` at runtime.

## Docs

Architecture and contribution rules live in `docs/engineering-rules.md`.
