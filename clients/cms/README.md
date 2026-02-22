# CRIS CMS (Strapi)

Strapi v5 CMS that powers the portfolio content.

## Requirements

- Node 22.x
- Yarn 4.9.2

## Setup

```bash
yarn install
yarn workspace client-cms dev
```

## Docker

Local CMS runs from the terminal. Docker is only for the database.

```bash
cp .env.example ../../.env
docker compose -f ../../docker-compose.dev.yml up -d
```

Copy the CMS env and keep the database host as localhost.

```bash
cp .env.example .env
```

Production runs CMS and Web together.

```bash
cp .env.example ../../.env
docker compose -f ../../docker-compose.yml up -d --build
```

## Seed data

Run once after the first boot or whenever the database is reset.

```bash
yarn workspace cris-cms seed
```

- Loads data from `clients/cms/data/data.json`.
- Resolves uploads from `clients/cms/data/uploads` and `clients/web/public/images`.
- Publishes single types and sets public permissions.

## Useful commands

```bash
yarn workspace client-cms seed
yarn workspace client-cms build
yarn workspace client-cms start
yarn workspace client-cms console
yarn workspace client-cms generate:openapi
```

## Data

Default database is sqlite in `clients/cms/.tmp/data.db`. Configure Postgres or
MySQL with environment variables defined in
`clients/cms/config/database.ts`.
