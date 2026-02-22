# CRIS CMS (Strapi)

Strapi v5 CMS that powers the portfolio content.

## Requirements

- Node 22.x
- Yarn 4.9.2

## Setup

```bash
yarn install
yarn workspace cris-cms dev
```

## Seed data

```bash
yarn workspace cris-cms seed
```

- Loads data from `clients/cms/data/data.json`.
- Resolves uploads from `clients/cms/data/uploads` and `clients/web/public/images`.
- Publishes single types and sets public permissions.

## Useful commands

```bash
yarn workspace cris-cms build
yarn workspace cris-cms start
yarn workspace cris-cms console
yarn workspace cris-cms generate:openapi
```

## Data

Default database is sqlite in `clients/cms/.tmp/data.db`. Configure Postgres or
MySQL with environment variables defined in
`clients/cms/config/database.ts`.
